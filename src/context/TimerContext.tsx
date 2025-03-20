import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { playNotificationSound } from '../lib/audio';

export type TimerPreset = {
  id: string;
  duration: number;
};

export type TimerPreferences = {
  soundEnabled: boolean;
  youtubeUrl?: string;
  faction: 'autobots' | 'decepticons';
  character: 'optimus' | 'bumblebee' | 'megatron' | 'starscream';
  analyticsView: 'bar' | 'line';
  theme: 'autobots' | 'decepticons' | 'allspark';
};

export type StatEntry = {
  date: string;
  sessions: number;
  focusTime: number;
};

export type TimerStats = {
  sessionsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  lastSessionDate?: string;
  totalFocusTime: number;
  weeklyStats: StatEntry[];
  monthlyStats: StatEntry[];
  yearlyStats: StatEntry[];
};

export type TimerAchievement = {
  id: string;
  name: string;
  unlocked: boolean;
  date?: string;
};

export interface TimerState {
  isRunning: boolean;
  isComplete: boolean;
  timeRemaining: number;
  presets: {
    focus: number;
    shortFocus: number;
    break: number;
    shortBreak: number;
  };
  activePreset: TimerPreset;
  preferences: TimerPreferences;
  stats: TimerStats;
  achievements: TimerAchievement[];
}

interface TimerContextType {
  state: TimerState;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  switchPreset: (preset: TimerPreset) => void;
  updatePreset: (name: keyof TimerState['presets'], value: number) => void;
  updatePreference: (name: keyof TimerState['preferences'], value: any) => void;
  resetStats: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

const initialState: TimerState = {
  isRunning: false,
  isComplete: false,
  timeRemaining: 25 * 60,
  presets: {
    focus: 25 * 60,
    shortFocus: 15 * 60,
    break: 5 * 60,
    shortBreak: 3 * 60,
  },
  activePreset: {
    id: 'focus',
    duration: 25 * 60,
  },
  preferences: {
    analyticsView: 'bar',
    soundEnabled: true,
    faction: 'autobots',
    character: 'optimus',
    theme: 'autobots',
    youtubeUrl: '',
  },
  stats: {
    sessionsCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastSessionDate: undefined,
    totalFocusTime: 0,
    weeklyStats: [],
    monthlyStats: [],
    yearlyStats: [],
  },
  achievements: [
    {
      id: 'first-session',
      name: 'First Focus Session',
      unlocked: false,
    },
    {
      id: 'three-day-streak',
      name: '3 Day Streak',
      unlocked: false,
    },
    {
      id: 'seven-day-streak',
      name: '7 Day Streak',
      unlocked: false,
    },
  ],
};

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}

type TimerAction =
  | { type: 'START_TIMER' }
  | { type: 'PAUSE_TIMER' }
  | { type: 'RESET_TIMER' }
  | { type: 'TICK' }
  | { type: 'SWITCH_PRESET'; preset: TimerPreset }
  | { type: 'UPDATE_PRESET'; name: keyof TimerState['presets']; value: number }
  | { type: 'UPDATE_PREFERENCE'; name: keyof TimerState['preferences']; value: any }
  | { type: 'RESET_STATS' }
  | { type: 'COMPLETE_TIMER_SESSION' };

function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'START_TIMER':
      return { ...state, isRunning: true };
    case 'PAUSE_TIMER':
      return { ...state, isRunning: false };
    case 'RESET_TIMER':
      return {
        ...state,
        isRunning: false,
        isComplete: false,
        timeRemaining: state.activePreset.duration,
      };
    case 'TICK':
      const newTimeRemaining = state.timeRemaining - 1;
      return {
        ...state,
        timeRemaining: newTimeRemaining,
        isComplete: newTimeRemaining === 0,
        isRunning: newTimeRemaining > 0,
      };
    case 'SWITCH_PRESET':
      return {
        ...state,
        activePreset: action.preset,
        timeRemaining: action.preset.duration,
        isRunning: false,
        isComplete: false,
      };
    case 'UPDATE_PRESET':
      return {
        ...state,
        presets: {
          ...state.presets,
          [action.name]: action.value,
        },
        ...(state.activePreset.id === action.name && {
          activePreset: {
            ...state.activePreset,
            duration: action.value,
          },
          timeRemaining: action.value,
        }),
      };
    case 'UPDATE_PREFERENCE':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          [action.name]: action.value,
        },
      };
    case 'RESET_STATS':
      return {
        ...state,
        stats: {
          sessionsCompleted: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastSessionDate: undefined,
          totalFocusTime: 0,
          weeklyStats: [],
          monthlyStats: [],
          yearlyStats: [],
        },
        achievements: state.achievements.map(achievement => ({
          ...achievement,
          unlocked: false,
          date: undefined,
        })),
      };
    case 'COMPLETE_TIMER_SESSION': {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const lastDate = state.stats.lastSessionDate;
      
      let streak = state.stats.currentStreak;
      if (!lastDate) {
        streak = 1;
      } else {
        const lastSessionDate = new Date(lastDate);
        const dayDiff = Math.floor((now.getTime() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24));
        if (dayDiff === 0) {
          // Same day, keep streak
        } else if (dayDiff === 1) {
          // Next day, increment streak
          streak += 1;
        } else {
          // Break in streak
          streak = 1;
        }
      }

      const weeklyStats = [...state.stats.weeklyStats];
      const todayStats = weeklyStats.find(stat => stat.date === today);
      if (todayStats) {
        todayStats.sessions += 1;
        todayStats.focusTime += state.activePreset.duration;
      } else {
        weeklyStats.push({
          date: today,
          sessions: 1,
          focusTime: state.activePreset.duration,
        });
        // Keep only last 7 days
        if (weeklyStats.length > 7) {
          weeklyStats.shift();
        }
      }

      const monthlyStats = [...state.stats.monthlyStats];
      const month = now.toISOString().split('T')[0].slice(0, 7);
      const monthStats = monthlyStats.find(stat => stat.date === month);
      if (monthStats) {
        monthStats.sessions += 1;
        monthStats.focusTime += state.activePreset.duration;
      } else {
        monthlyStats.push({
          date: month,
          sessions: 1,
          focusTime: state.activePreset.duration,
        });
        // Keep only last 12 months
        if (monthlyStats.length > 12) {
          monthlyStats.shift();
        }
      }

      const yearlyStats = [...state.stats.yearlyStats];
      const year = now.toISOString().split('T')[0].slice(0, 4);
      const yearStats = yearlyStats.find(stat => stat.date === year);
      if (yearStats) {
        yearStats.sessions += 1;
        yearStats.focusTime += state.activePreset.duration;
      } else {
        yearlyStats.push({
          date: year,
          sessions: 1,
          focusTime: state.activePreset.duration,
        });
        // Keep only last 5 years
        if (yearlyStats.length > 5) {
          yearlyStats.shift();
        }
      }

      return {
        ...state,
        stats: {
          ...state.stats,
          sessionsCompleted: state.stats.sessionsCompleted + 1,
          currentStreak: streak,
          longestStreak: Math.max(streak, state.stats.longestStreak),
          lastSessionDate: today,
          totalFocusTime: state.stats.totalFocusTime + state.activePreset.duration,
          weeklyStats,
          monthlyStats,
          yearlyStats,
        },
      };
    }
    default:
      return state;
  }
}

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(timerReducer, initialState, () => {
    const stored = localStorage.getItem('timerState');
    if (stored) {
      try {
        const parsedState = JSON.parse(stored);
        // Ensure stats are initialized
        if (!parsedState.stats) {
          parsedState.stats = initialState.stats;
        }
        // Ensure achievements are initialized
        if (!parsedState.achievements) {
          parsedState.achievements = initialState.achievements;
        }
        // Ensure preferences are initialized
        if (!parsedState.preferences) {
          parsedState.preferences = initialState.preferences;
        } else {
          // Ensure all preference fields exist
          parsedState.preferences = {
            ...initialState.preferences,
            ...parsedState.preferences,
          };
        }
        // Ensure presets are initialized
        if (!parsedState.presets) {
          parsedState.presets = initialState.presets;
        }
        // Initialize weekly stats if needed
        if (!parsedState.stats.weeklyStats) {
          parsedState.stats.weeklyStats = [];
        }
        // Initialize monthly stats if needed
        if (!parsedState.stats.monthlyStats) {
          parsedState.stats.monthlyStats = [];
        }
        // Initialize yearly stats if needed
        if (!parsedState.stats.yearlyStats) {
          parsedState.stats.yearlyStats = [];
        }
        return parsedState;
      } catch (error) {
        console.error('Error parsing stored timer state:', error);
        return initialState;
      }
    }
    return initialState;
  });

  useEffect(() => {
    localStorage.setItem('timerState', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.isRunning) {
      interval = setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [state.isRunning]);

  useEffect(() => {
    if (state.timeRemaining === 0 && !state.isRunning && state.isComplete) {
      dispatch({ type: 'COMPLETE_TIMER_SESSION' });
      if (state.preferences.soundEnabled) {
        playNotificationSound(state.preferences.faction);
      }
    }
  }, [state.timeRemaining, state.isRunning, state.isComplete, state.preferences]);

  const startTimer = useCallback(() => {
    dispatch({ type: 'START_TIMER' });
  }, []);

  const pauseTimer = useCallback(() => {
    dispatch({ type: 'PAUSE_TIMER' });
  }, []);

  const resetTimer = useCallback(() => {
    dispatch({ type: 'RESET_TIMER' });
  }, []);

  const switchPreset = useCallback((preset: TimerPreset) => {
    dispatch({ type: 'SWITCH_PRESET', preset });
  }, []);

  const updatePreset = useCallback((name: keyof TimerState['presets'], value: number) => {
    dispatch({ type: 'UPDATE_PRESET', name, value });
  }, []);

  const updatePreference = useCallback((name: keyof TimerState['preferences'], value: any) => {
    dispatch({ type: 'UPDATE_PREFERENCE', name, value });
  }, []);

  const resetStats = useCallback(() => {
    dispatch({ type: 'RESET_STATS' });
  }, []);

  const value = {
    state,
    startTimer,
    pauseTimer,
    resetTimer,
    switchPreset,
    updatePreset,
    updatePreference,
    resetStats,
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}
