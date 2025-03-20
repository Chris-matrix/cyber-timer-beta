import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { playNotificationSound } from '../lib/audio';

export type TimerPreset = {
  id: string;
  duration: number;
};

export type TimerPreferences = {
  soundEnabled: boolean;
  youtubeUrl?: string;
  faction: 'autobots' | 'decepticons' | 'maximals' | 'predacons';
  character: string;
  analyticsView: 'bar' | 'line';
  theme: 'autobots' | 'decepticons' | 'maximals' | 'predacons' | 'allspark';
  quote: string;
  randomQuotes: boolean;
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
  description: string;
  unlocked: boolean;
  date?: string;
  icon: string;
};

export type TimerQuote = {
  id: string;
  text: string;
  character: string;
  faction: string;
  unlocked: boolean;
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
  quotes: TimerQuote[];
  notifications: {
    show: boolean;
    autoDismiss: boolean;
    duration: number;
  };
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
  showNotification: (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
  unlockQuote: (quoteId: string) => void;
  unlockAchievement: (achievementId: string) => void;
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
    quote: 'Freedom is the right of all sentient beings.',
    randomQuotes: true,
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
      description: 'Complete your first focus session',
      unlocked: false,
      icon: '🔥',
    },
    {
      id: 'three-day-streak',
      name: '3 Day Streak',
      description: 'Use the timer for 3 consecutive days',
      unlocked: false,
      icon: '📆',
    },
    {
      id: 'seven-day-streak',
      name: '7 Day Streak',
      description: 'Use the timer for 7 consecutive days',
      unlocked: false,
      icon: '🏆',
    },
    {
      id: 'faction-loyalty',
      name: 'Faction Loyalty',
      description: 'Complete 10 sessions with the same faction',
      unlocked: false,
      icon: '🛡️',
    },
    {
      id: 'transformer',
      name: 'Transformer',
      description: 'Switch between all factions',
      unlocked: false,
      icon: '🤖',
    },
  ],
  quotes: [
    {
      id: 'optimus_1',
      text: 'Freedom is the right of all sentient beings.',
      character: 'Optimus Prime',
      faction: 'autobots',
      unlocked: true,
    },
    {
      id: 'megatron_1',
      text: 'Peace through tyranny!',
      character: 'Megatron',
      faction: 'decepticons',
      unlocked: true,
    },
    {
      id: 'bumblebee_1',
      text: 'I may be small, but I\'m mighty!',
      character: 'Bumblebee',
      faction: 'autobots',
      unlocked: true,
    },
    {
      id: 'starscream_1',
      text: 'Decepticons, transform and rise up!',
      character: 'Starscream',
      faction: 'decepticons',
      unlocked: true,
    },
    {
      id: 'optimalprimal_1',
      text: 'Sometimes crazy works.',
      character: 'Optimal Primal',
      faction: 'maximals',
      unlocked: false,
    },
    {
      id: 'megatron2_1',
      text: 'Yesss...',
      character: 'Megatron',
      faction: 'predacons',
      unlocked: false,
    },
  ],
  notifications: {
    show: true,
    autoDismiss: true,
    duration: 60000, // 1 minute in milliseconds
  },
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
  | { type: 'COMPLETE_TIMER_SESSION' }
  | { type: 'UNLOCK_QUOTE'; quoteId: string }
  | { type: 'UNLOCK_ACHIEVEMENT'; achievementId: string };

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
        quotes: state.quotes.map((quote, index) => ({
          ...quote,
          unlocked: index < 4, // Keep the first 4 quotes unlocked
        })),
      };
    case 'COMPLETE_TIMER_SESSION':
      const today = new Date().toISOString().split('T')[0];
      const isNewDay = state.stats.lastSessionDate !== today;
      const isContinuingStreak =
        state.stats.lastSessionDate &&
        new Date(state.stats.lastSessionDate).getTime() >=
          new Date(Date.now() - 24 * 60 * 60 * 1000).getTime();
      
      const newStreak = isNewDay
        ? isContinuingStreak
          ? state.stats.currentStreak + 1
          : 1
        : state.stats.currentStreak;
      
      const newLongestStreak = Math.max(state.stats.longestStreak, newStreak);
      
      // Check for achievements to unlock
      let updatedAchievements = [...state.achievements];
      
      // First session achievement
      if (state.stats.sessionsCompleted === 0) {
        updatedAchievements = updatedAchievements.map(achievement => 
          achievement.id === 'first-session' 
            ? { ...achievement, unlocked: true, date: today } 
            : achievement
        );
      }
      
      // Streak achievements
      if (newStreak >= 3) {
        updatedAchievements = updatedAchievements.map(achievement => 
          achievement.id === 'three-day-streak' 
            ? { ...achievement, unlocked: true, date: today } 
            : achievement
        );
      }
      
      if (newStreak >= 7) {
        updatedAchievements = updatedAchievements.map(achievement => 
          achievement.id === 'seven-day-streak' 
            ? { ...achievement, unlocked: true, date: today } 
            : achievement
        );
      }
      
      return {
        ...state,
        stats: {
          ...state.stats,
          sessionsCompleted: state.stats.sessionsCompleted + 1,
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          lastSessionDate: today,
          totalFocusTime: state.stats.totalFocusTime + state.activePreset.duration,
          // Update stats entries...
          weeklyStats: updateStatsEntry(state.stats.weeklyStats, today, state.activePreset.duration),
          monthlyStats: updateStatsEntry(state.stats.monthlyStats, today, state.activePreset.duration),
          yearlyStats: updateStatsEntry(state.stats.yearlyStats, today, state.activePreset.duration),
        },
        achievements: updatedAchievements,
      };
    
    case 'UNLOCK_QUOTE':
      return {
        ...state,
        quotes: state.quotes.map(quote => 
          quote.id === action.quoteId 
            ? { ...quote, unlocked: true } 
            : quote
        ),
      };
    
    case 'UNLOCK_ACHIEVEMENT':
      const achievementDate = new Date().toISOString().split('T')[0];
      return {
        ...state,
        achievements: state.achievements.map(achievement => 
          achievement.id === action.achievementId 
            ? { ...achievement, unlocked: true, date: achievementDate } 
            : achievement
        ),
      };
      
    default:
      return state;
  }
}

// Helper function to update stats entries
function updateStatsEntry(entries: StatEntry[], date: string, duration: number): StatEntry[] {
  const existingEntryIndex = entries.findIndex(entry => entry.date === date);
  
  if (existingEntryIndex >= 0) {
    return entries.map((entry, index) => 
      index === existingEntryIndex
        ? { ...entry, sessions: entry.sessions + 1, focusTime: entry.focusTime + duration }
        : entry
    );
  } else {
    return [...entries, { date, sessions: 1, focusTime: duration }];
  }
}

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(timerReducer, initialState, () => {
    // Load state from localStorage if available
    const savedState = localStorage.getItem('timerState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        // Ensure preferences exist with default values if missing
        if (!parsedState.preferences) {
          parsedState.preferences = initialState.preferences;
        } else {
          // Ensure all preference properties exist
          parsedState.preferences = {
            ...initialState.preferences,
            ...parsedState.preferences
          };
        }
        
        // Make sure all required state properties exist
        return {
          ...initialState,
          ...parsedState,
          preferences: parsedState.preferences
        };
      } catch (error) {
        console.error('Failed to parse saved timer state:', error);
        return initialState;
      }
    }
    return initialState;
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('timerState', JSON.stringify(state));
  }, [state]);

  // Timer tick effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (state.isRunning) {
      interval = setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.isRunning]);

  // Handle timer completion
  useEffect(() => {
    if (state.isComplete) {
      if (state.preferences?.soundEnabled) {
        playNotificationSound('complete', state.preferences.faction as any);
      }
      
      // Only dispatch COMPLETE_TIMER_SESSION if this was a focus session
      if (state.activePreset.id === 'focus' || state.activePreset.id === 'shortFocus') {
        dispatch({ type: 'COMPLETE_TIMER_SESSION' });
        
        // Show notification
        showNotification(
          'Focus Session Complete!', 
          `Great job! You've completed a ${state.activePreset.duration / 60} minute focus session.`,
          'success'
        );
        
        // Maybe unlock a random quote if randomQuotes is enabled
        if (state.preferences?.randomQuotes) {
          const lockedQuotes = state.quotes.filter(quote => !quote.unlocked);
          if (lockedQuotes.length > 0) {
            const randomIndex = Math.floor(Math.random() * lockedQuotes.length);
            unlockQuote(lockedQuotes[randomIndex].id);
          }
        }
      }
    }
  }, [state.isComplete]);

  const startTimer = useCallback(() => {
    if (state.preferences?.soundEnabled) {
      playNotificationSound('start', state.preferences.faction as any);
    }
    dispatch({ type: 'START_TIMER' });
  }, [state.preferences?.soundEnabled, state.preferences?.faction]);

  const pauseTimer = useCallback(() => {
    if (state.preferences?.soundEnabled) {
      playNotificationSound('pause', state.preferences.faction as any);
    }
    dispatch({ type: 'PAUSE_TIMER' });
  }, [state.preferences?.soundEnabled, state.preferences?.faction]);

  const resetTimer = useCallback(() => {
    if (state.preferences?.soundEnabled) {
      playNotificationSound('reset', state.preferences.faction as any);
    }
    dispatch({ type: 'RESET_TIMER' });
  }, [state.preferences?.soundEnabled, state.preferences?.faction]);

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
  
  const showNotification = useCallback((title: string, message: string, type: 'success' | 'info' | 'warning' | 'error') => {
    // This function will be implemented with the notification system
    console.log(`Notification: ${title} - ${message} (${type})`);
    // In a real implementation, this would dispatch an action to show a notification
  }, []);
  
  const unlockQuote = useCallback((quoteId: string) => {
    dispatch({ type: 'UNLOCK_QUOTE', quoteId });
    
    // Find the quote to show notification
    const quote = state.quotes.find(q => q.id === quoteId);
    if (quote) {
      showNotification(
        'New Quote Unlocked!',
        `"${quote.text}" - ${quote.character}`,
        'info'
      );
    }
  }, [state.quotes]);
  
  const unlockAchievement = useCallback((achievementId: string) => {
    dispatch({ type: 'UNLOCK_ACHIEVEMENT', achievementId });
    
    // Find the achievement to show notification
    const achievement = state.achievements.find(a => a.id === achievementId);
    if (achievement) {
      showNotification(
        'Achievement Unlocked!',
        `${achievement.name}: ${achievement.description}`,
        'success'
      );
    }
  }, [state.achievements]);

  return (
    <TimerContext.Provider
      value={{
        state,
        startTimer,
        pauseTimer,
        resetTimer,
        switchPreset,
        updatePreset,
        updatePreference,
        resetStats,
        showNotification,
        unlockQuote,
        unlockAchievement,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}
