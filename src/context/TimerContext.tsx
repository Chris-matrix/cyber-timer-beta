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
  activePreset: {
    id: string;
    duration: number;
  };
  preferences: {
    faction: 'autobots' | 'decepticons' | 'maximals' | 'predacons' | 'allspark';
    soundEnabled: boolean;
    theme: 'light' | 'dark';
  };
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
  switchPreset: (preset: { id: string; duration: number }) => void;
  updatePreset: (presetId: string, duration: number) => void;
  setFaction: (faction: 'autobots' | 'decepticons' | 'maximals' | 'predacons' | 'allspark') => void;
  toggleSound: () => void;
  toggleTheme: () => void;
  dispatch: React.Dispatch<TimerAction>;
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
  timeRemaining: 25 * 60, // 25 minutes in seconds
  activePreset: {
    id: 'focus',
    duration: 25 * 60, // 25 minutes in seconds
  },
  presets: {
    focus: 25 * 60, // 25 minutes
    shortFocus: 15 * 60, // 15 minutes
    break: 5 * 60, // 5 minutes
    shortBreak: 2 * 60, // 2 minutes
  },
  preferences: {
    faction: 'autobots',
    soundEnabled: true,
    theme: 'dark',
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
export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

/**
 * Action types for the timer reducer
 * Defines all possible actions that can be dispatched to update the timer state
 */
type TimerAction =
  | { type: 'START_TIMER' }
  | { type: 'PAUSE_TIMER' }
  | { type: 'RESET_TIMER' }
  | { type: 'TICK' }
  | { type: 'SWITCH_PRESET'; preset: { id: string; duration: number } }
  | { type: 'UPDATE_PRESET'; presetId: string; duration: number }
  | { type: 'SET_FACTION'; faction: 'autobots' | 'decepticons' | 'maximals' | 'predacons' | 'allspark' }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_THEME'; theme: 'light' | 'dark' };

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
      return {
        ...state,
        isRunning: true,
        isComplete: false,
      };
    case 'PAUSE_TIMER':
      return {
        ...state,
        isRunning: false,
      };
    case 'RESET_TIMER':
      return {
        ...state,
        isRunning: false,
        timeRemaining: state.activePreset.duration,
        isComplete: false,
      };
    case 'TICK':
      if (state.timeRemaining <= 1) {
        return {
          ...state,
          timeRemaining: 0,
          isRunning: false,
          isComplete: true,
        };
      }
      return {
        ...state,
        timeRemaining: state.timeRemaining - 1,
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
          [action.presetId]: action.duration,
        },
        // If the active preset is being updated, also update the time remaining
        ...(state.activePreset.id === action.presetId
          ? {
              activePreset: {
                ...state.activePreset,
                duration: action.duration,
              },
              timeRemaining: action.duration,
            }
          : {}),
      };
    case 'SET_FACTION':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          faction: action.faction,
        },
      };
    case 'TOGGLE_SOUND':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          soundEnabled: !state.preferences.soundEnabled,
        },
      };
    case 'TOGGLE_THEME':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          theme: state.preferences.theme === 'light' ? 'dark' : 'light',
        },
      };
    case 'SET_THEME':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          theme: action.theme,
        },
      };
    default:
      return state;
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
  const [state, dispatch] = useReducer(timerReducer, initialState);

  // Initialize theme based on system preference
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    dispatch({ type: 'SET_THEME', theme: prefersDark ? 'dark' : 'light' });
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.preferences.theme);
  }, [state.preferences.theme]);

  // Timer tick effect - handles countdown when timer is running
  useEffect(() => {
    let intervalId: number | undefined;
    
    if (state.isRunning && state.timeRemaining > 0) {
      intervalId = window.setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);
    }
    
    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [state.isRunning, state.timeRemaining]);

  /**
   * Starts the timer and plays a sound if enabled
   */
  const startTimer = useCallback(() => {
    if (state.preferences.soundEnabled) {
      playNotificationSound('start', state.preferences.faction as any);
    }
    dispatch({ type: 'START_TIMER' });
  }, [state.preferences.soundEnabled, state.preferences.faction]);

  /**
   * Pauses the timer and plays a sound if enabled
   */
  const pauseTimer = useCallback(() => {
    if (state.preferences.soundEnabled) {
      playNotificationSound('pause', state.preferences.faction as any);
    }
    dispatch({ type: 'PAUSE_TIMER' });
  }, [state.preferences.soundEnabled, state.preferences.faction]);

  /**
   * Resets the timer to its initial state and plays a sound if enabled
   */
  const resetTimer = useCallback(() => {
    if (state.preferences.soundEnabled) {
      playNotificationSound('reset', state.preferences.faction as any);
    }
    dispatch({ type: 'RESET_TIMER' });
  }, [state.preferences.soundEnabled, state.preferences.faction]);

  /**
   * Switches to a different timer preset
   * @param {TimerPreset} preset - The preset to switch to
   */
  const switchPreset = useCallback((preset: { id: string; duration: number }) => {
    dispatch({ type: 'SWITCH_PRESET', preset });
  }, []);

  /**
   * Updates a timer preset duration
   * @param {string} presetId - Name of the preset to update
   * @param {number} duration - New duration in seconds
   */
  const updatePreset = useCallback((presetId: string, duration: number) => {
    dispatch({ type: 'UPDATE_PRESET', presetId, duration });
  }, []);

  /**
   * Sets the faction
   * @param {string} faction - Faction to set
   */
  const setFaction = useCallback((faction: 'autobots' | 'decepticons' | 'maximals' | 'predacons' | 'allspark') => {
    dispatch({ type: 'SET_FACTION', faction });
  }, []);

  /**
   * Toggles sound effects
   */
  const toggleSound = useCallback(() => {
    dispatch({ type: 'TOGGLE_SOUND' });
  }, []);

  /**
   * Toggles the theme
   */
  const toggleTheme = useCallback(() => {
    dispatch({ type: 'TOGGLE_THEME' });
  }, []);

  return (
    <TimerContext.Provider
      value={{
        state,
        startTimer,
        pauseTimer,
        resetTimer,
        switchPreset,
        updatePreset,
        setFaction,
        toggleSound,
        toggleTheme,
        dispatch,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}
