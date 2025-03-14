import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from "sonner";

// Preset types
export type TimerPreset = {
  id: string;
  name: string;
  duration: number;
  color: string;
};

// Define types for analytics
type DailyStats = {
  date: string;
  sessions: number;
  minutes: number;
};

// Chart data interface
type ChartData = {
  day: string;
  sessions: number;
  minutes: number;
};

// Define types
type TimerState = {
  duration: number;
  timeRemaining: number;
  isRunning: boolean;
  isComplete: boolean;
  activePreset: TimerPreset | null;
  completedSessions: number;
  totalTimeElapsed: number;
  dailyStats: DailyStats[];
};

type TimerAction =
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'START_TIMER' }
  | { type: 'PAUSE_TIMER' }
  | { type: 'RESET_TIMER' }
  | { type: 'TICK' }
  | { type: 'COMPLETE_TIMER' }
  | { type: 'SET_PRESET'; payload: TimerPreset }
  | { type: 'INCREMENT_SESSIONS' }
  | { type: 'ADD_ELAPSED_TIME'; payload: number }
  | { type: 'UPDATE_DAILY_STATS'; payload: DailyStats };

type TimerContextType = {
  state: TimerState;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  setDuration: (minutes: number) => void;
  selectPreset: (preset: TimerPreset) => void;
  formatTime: (seconds: number) => string;
  getWeeklyStats: () => ChartData[];
};

// Predefined presets
export const TIMER_PRESETS: TimerPreset[] = [
  { id: 'pomodoro', name: 'Pomodoro', duration: 25 * 60, color: 'bg-autobot' },
  { id: 'short-focus', name: 'Short Focus', duration: 10 * 60, color: 'bg-energon' },
  { id: 'break', name: 'Break', duration: 5 * 60, color: 'bg-cybertron' },
  { id: 'long-break', name: 'Long Break', duration: 15 * 60, color: 'bg-decepticon' },
];

// Get stored stats from local storage
const getStoredStats = (): DailyStats[] => {
  const storedStats = localStorage.getItem('timerDailyStats');
  return storedStats ? JSON.parse(storedStats) : [];
};

// Initial state
const initialState: TimerState = {
  duration: 25 * 60, // 25 minutes in seconds
  timeRemaining: 25 * 60,
  isRunning: false,
  isComplete: false,
  activePreset: TIMER_PRESETS[0], // Default to Pomodoro
  completedSessions: 0,
  totalTimeElapsed: 0,
  dailyStats: getStoredStats(),
};

// Create context
const TimerContext = createContext<TimerContextType | undefined>(undefined);

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDateString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Reducer function
function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'SET_DURATION':
      return {
        ...state,
        duration: action.payload,
        timeRemaining: action.payload,
        isComplete: false,
      };
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
        timeRemaining: state.duration,
        isRunning: false,
        isComplete: false,
      };
    case 'TICK':
      const newTimeRemaining = Math.max(0, state.timeRemaining - 1);
      const isComplete = newTimeRemaining === 0;
      
      return {
        ...state,
        timeRemaining: newTimeRemaining,
        isComplete,
        isRunning: !isComplete && state.isRunning,
      };
    case 'COMPLETE_TIMER':
      return {
        ...state,
        isComplete: true,
        isRunning: false,
      };
    case 'SET_PRESET':
      return {
        ...state,
        activePreset: action.payload,
        duration: action.payload.duration,
        timeRemaining: action.payload.duration,
        isComplete: false,
        isRunning: false,
      };
    case 'INCREMENT_SESSIONS':
      return {
        ...state,
        completedSessions: state.completedSessions + 1,
      };
    case 'ADD_ELAPSED_TIME':
      return {
        ...state,
        totalTimeElapsed: state.totalTimeElapsed + action.payload,
      };
    case 'UPDATE_DAILY_STATS':
      const existingStatIndex = state.dailyStats.findIndex(
        stat => stat.date === action.payload.date
      );
      
      let updatedStats;
      
      if (existingStatIndex >= 0) {
        // Update existing entry
        updatedStats = [...state.dailyStats];
        updatedStats[existingStatIndex] = {
          ...updatedStats[existingStatIndex],
          sessions: updatedStats[existingStatIndex].sessions + action.payload.sessions,
          minutes: updatedStats[existingStatIndex].minutes + action.payload.minutes,
        };
      } else {
        // Add new entry
        updatedStats = [...state.dailyStats, action.payload];
      }
      
      // Save to localStorage
      localStorage.setItem('timerDailyStats', JSON.stringify(updatedStats));
      
      return {
        ...state,
        dailyStats: updatedStats,
      };
    default:
      return state;
  }
}

// Provider component
export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(timerReducer, initialState);
  
  // For the timer tick
  useEffect(() => {
    let interval: number | undefined;
    
    if (state.isRunning) {
      interval = window.setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.isRunning]);
  
  // Handle timer completion
  useEffect(() => {
    if (state.isComplete && state.timeRemaining === 0) {
      // Play a notification or sound
      const audio = new Audio('/alarm.mp3');
      audio.play().catch(err => console.error('Error playing sound:', err));
      
      // Show notification
      toast("Timer Complete!", {
        description: `Your ${state.activePreset?.name || 'timer'} session is complete!`,
        duration: 5000,
      });
      
      // Increment completed sessions
      dispatch({ type: 'INCREMENT_SESSIONS' });
      
      // Add elapsed time to total
      dispatch({ type: 'ADD_ELAPSED_TIME', payload: state.duration });
      
      // Update daily stats
      const today = getTodayDateString();
      const minutesCompleted = Math.floor(state.duration / 60);
      
      dispatch({
        type: 'UPDATE_DAILY_STATS',
        payload: {
          date: today,
          sessions: 1,
          minutes: minutesCompleted
        }
      });
    }
  }, [state.isComplete, state.timeRemaining, state.activePreset, state.duration]);
  
  // Action functions
  const startTimer = () => dispatch({ type: 'START_TIMER' });
  const pauseTimer = () => dispatch({ type: 'PAUSE_TIMER' });
  const resetTimer = () => dispatch({ type: 'RESET_TIMER' });
  const setDuration = (minutes: number) => dispatch({ type: 'SET_DURATION', payload: minutes * 60 });
  const selectPreset = (preset: TimerPreset) => dispatch({ type: 'SET_PRESET', payload: preset });
  
  // Helper function to format time
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Function to get weekly stats for charts
  const getWeeklyStats = (): ChartData[] => {
    const weeklyData: ChartData[] = [];
    const today = new Date();
    
    // Get data for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      // Format the day for display (e.g., "Mon", "Tue")
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      // Find the stats for this day if they exist
      const dayStats = state.dailyStats.find(stat => stat.date === dateString);
      
      weeklyData.push({
        day: dayName,
        sessions: dayStats ? dayStats.sessions : 0,
        minutes: dayStats ? dayStats.minutes : 0
      });
    }
    
    return weeklyData;
  };
  
  return (
    <TimerContext.Provider
      value={{
        state,
        startTimer,
        pauseTimer,
        resetTimer,
        setDuration,
        selectPreset,
        formatTime,
        getWeeklyStats,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

// Custom hook for using the timer context
export function useTimer() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}
