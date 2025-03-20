/**
 * Timer Context - Core State Management
 * 
 * This file implements the central state management system for the Transformers Timer application
 * using React Context and useReducer. It handles all timer functionality, user preferences,
 * statistics tracking, achievements, and quotes collection.
 * 
 * The state is automatically persisted to localStorage and restored on application startup,
 * ensuring user data is preserved between sessions.
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { playNotificationSound } from '../lib/audio';

/**
 * Timer preset configuration
 * @property {string} id - Unique identifier for the preset (e.g., 'focus', 'break')
 * @property {number} duration - Duration in seconds for this timer preset
 */
export type TimerPreset = {
  id: string;
  duration: number;
};

/**
 * User preferences for the timer application
 * @property {boolean} soundEnabled - Whether sound effects are enabled
 * @property {string} [youtubeUrl] - Optional YouTube URL for background music/video
 * @property {string} faction - Selected Transformers faction
 * @property {string} character - Selected character within the faction
 * @property {string} analyticsView - Preferred chart type for statistics
 * @property {string} theme - Visual theme based on faction or special themes
 * @property {string} quote - Currently displayed quote
 * @property {boolean} randomQuotes - Whether to unlock random quotes after sessions
 */
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

/**
 * Single statistics entry for a specific date
 * @property {string} date - ISO format date string (YYYY-MM-DD)
 * @property {number} sessions - Number of completed sessions on this date
 * @property {number} focusTime - Total focus time in seconds on this date
 */
export type StatEntry = {
  date: string;
  sessions: number;
  focusTime: number;
};

/**
 * User statistics tracking
 * @property {number} sessionsCompleted - Total number of completed focus sessions
 * @property {number} currentStreak - Current consecutive days streak
 * @property {number} longestStreak - Longest consecutive days streak achieved
 * @property {string} [lastSessionDate] - ISO date of the last completed session
 * @property {number} totalFocusTime - Total focus time in seconds across all sessions
 * @property {StatEntry[]} weeklyStats - Statistics grouped by week
 * @property {StatEntry[]} monthlyStats - Statistics grouped by month
 * @property {StatEntry[]} yearlyStats - Statistics grouped by year
 */
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

/**
 * Achievement definition and tracking
 * @property {string} id - Unique identifier for the achievement
 * @property {string} name - Display name of the achievement
 * @property {string} description - Description of how to earn the achievement
 * @property {boolean} unlocked - Whether the achievement has been unlocked
 * @property {string} [date] - ISO date when the achievement was unlocked
 * @property {string} icon - Emoji or icon representing the achievement
 */
export type TimerAchievement = {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  date?: string;
  icon: string;
};

/**
 * Transformers quote collection
 * @property {string} id - Unique identifier for the quote
 * @property {string} text - The quote text
 * @property {string} character - Character who said the quote
 * @property {string} faction - Faction the character belongs to
 * @property {boolean} unlocked - Whether the quote has been unlocked by the user
 */
export type TimerQuote = {
  id: string;
  text: string;
  character: string;
  faction: string;
  unlocked: boolean;
};

/**
 * Complete timer state interface
 * Contains all data related to the timer, preferences, and user progress
 */
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

/**
 * Timer context interface defining available actions and state
 * Provides methods for interacting with the timer state
 */
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

// Create context with undefined default value (will be provided by TimerProvider)
const TimerContext = createContext<TimerContextType | undefined>(undefined);

/**
 * Initial state for the timer
 * Defines default values for all state properties
 */
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

/**
 * Custom hook to access the timer context
 * @returns {TimerContextType} The timer context with state and methods
 * @throws {Error} If used outside of a TimerProvider
 */
export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}

/**
 * Action types for the timer reducer
 * Defines all possible actions that can be dispatched to update the timer state
 */
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

/**
 * Timer reducer function
 * Handles all state updates based on dispatched actions
 * 
 * @param {TimerState} state - Current timer state
 * @param {TimerAction} action - Action to perform
 * @returns {TimerState} New timer state
 */
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

/**
 * Helper function to update statistics entries
 * Either updates an existing entry for the given date or creates a new one
 * 
 * @param {StatEntry[]} entries - Current statistics entries
 * @param {string} date - ISO date string (YYYY-MM-DD)
 * @param {number} duration - Duration in seconds to add to the entry
 * @returns {StatEntry[]} Updated statistics entries
 */
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

/**
 * TimerProvider Component
 * 
 * Provides the timer context to the application, managing state with useReducer
 * and implementing all timer-related functionality.
 * 
 * Key features:
 * - Persists state to localStorage
 * - Handles timer ticks and completion
 * - Manages achievements and quotes
 * - Provides methods for timer control
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
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

  /**
   * Effect to persist state to localStorage whenever it changes
   * This ensures user data is saved between sessions
   */
  useEffect(() => {
    localStorage.setItem('timerState', JSON.stringify(state));
  }, [state]);

  /**
   * Effect to handle timer ticks when the timer is running
   * Sets up an interval that dispatches TICK actions every second
   */
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

  /**
   * Effect to handle timer completion
   * Plays sounds, updates statistics, and potentially unlocks achievements/quotes
   */
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

  /**
   * Starts the timer and plays a sound if enabled
   */
  const startTimer = useCallback(() => {
    if (state.preferences?.soundEnabled) {
      playNotificationSound('start', state.preferences.faction as any);
    }
    dispatch({ type: 'START_TIMER' });
  }, [state.preferences?.soundEnabled, state.preferences?.faction]);

  /**
   * Pauses the timer and plays a sound if enabled
   */
  const pauseTimer = useCallback(() => {
    if (state.preferences?.soundEnabled) {
      playNotificationSound('pause', state.preferences.faction as any);
    }
    dispatch({ type: 'PAUSE_TIMER' });
  }, [state.preferences?.soundEnabled, state.preferences?.faction]);

  /**
   * Resets the timer to its initial state and plays a sound if enabled
   */
  const resetTimer = useCallback(() => {
    if (state.preferences?.soundEnabled) {
      playNotificationSound('reset', state.preferences.faction as any);
    }
    dispatch({ type: 'RESET_TIMER' });
  }, [state.preferences?.soundEnabled, state.preferences?.faction]);

  /**
   * Switches to a different timer preset
   * @param {TimerPreset} preset - The preset to switch to
   */
  const switchPreset = useCallback((preset: TimerPreset) => {
    dispatch({ type: 'SWITCH_PRESET', preset });
  }, []);

  /**
   * Updates a timer preset duration
   * @param {string} name - Name of the preset to update
   * @param {number} value - New duration in seconds
   */
  const updatePreset = useCallback((name: keyof TimerState['presets'], value: number) => {
    dispatch({ type: 'UPDATE_PRESET', name, value });
  }, []);

  /**
   * Updates a user preference
   * @param {string} name - Name of the preference to update
   * @param {any} value - New preference value
   */
  const updatePreference = useCallback((name: keyof TimerState['preferences'], value: any) => {
    dispatch({ type: 'UPDATE_PREFERENCE', name, value });
  }, []);

  /**
   * Resets all user statistics, achievements, and quotes
   */
  const resetStats = useCallback(() => {
    dispatch({ type: 'RESET_STATS' });
  }, []);
  
  /**
   * Shows a notification to the user
   * This is a placeholder that would integrate with a notification system
   * 
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {string} type - Notification type (success, info, warning, error)
   */
  const showNotification = useCallback((title: string, message: string, type: 'success' | 'info' | 'warning' | 'error') => {
    // This function will be implemented with the notification system
    console.log(`Notification: ${title} - ${message} (${type})`);
    // In a real implementation, this would dispatch an action to show a notification
  }, []);
  
  /**
   * Unlocks a quote and shows a notification
   * @param {string} quoteId - ID of the quote to unlock
   */
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
  
  /**
   * Unlocks an achievement and shows a notification
   * @param {string} achievementId - ID of the achievement to unlock
   */
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
