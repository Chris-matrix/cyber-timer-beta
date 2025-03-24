/**
 * Timer Component
 * 
 * This is the main timer interface of the application, providing both a classic and
 * transforming timer display. It integrates with the TimerContext to manage timer state
 * and provides controls for starting, pausing, and resetting the timer, as well as
 * switching between different timer presets.
 */

import { useNavigate } from 'react-router-dom';
import { useTimer } from '../context/TimerContext';
import { CircularProgress } from './ui/circular-progress';
import { useState, useEffect } from 'react';
import { playNotificationSound } from '../lib/audio';
import TransformingTimer from './TransformingTimer';
import AmbientMode from './AmbientMode';
import { BarChart2, Settings as SettingsIcon, Sun, Moon } from 'lucide-react';

/**
 * Timer Component
 * 
 * The main timer interface that provides functionality for focus and break sessions
 */
export default function Timer() {
  const navigate = useNavigate();
  const { state, startTimer, pauseTimer, resetTimer, switchPreset, toggleTheme } = useTimer();
  const { activePreset, presets, isRunning, timeRemaining, isComplete, preferences } = state;
  
  // State for visual and interactive elements
  const [battlePower, setBattlePower] = useState(0);
  const [showVictory, setShowVictory] = useState(false);
  const [currentQuote, setCurrentQuote] = useState('Till all are one!');
  const [useNewTimerInterface, setUseNewTimerInterface] = useState(true);
  const [ambientModeActive, setAmbientModeActive] = useState(false);

  /**
   * Effect: Keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle shortcuts when not in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      switch (e.key.toLowerCase()) {
        case ' ': // Space bar
          e.preventDefault();
          isRunning ? pauseTimer() : startTimer();
          break;
        case 'r':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            resetTimer();
          }
          break;
        case 'f':
          e.preventDefault();
          // Create a focus preset object
          const focusPreset = { id: 'focus', duration: presets.focus };
          switchPreset(focusPreset);
          break;
        case 'b':
          e.preventDefault();
          // Create a break preset object
          const breakPreset = { id: 'break', duration: presets.break };
          switchPreset(breakPreset);
          break;
        case 'a':
          e.preventDefault();
          setAmbientModeActive(prev => !prev);
          break;
        case 't':
          e.preventDefault();
          toggleTheme();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isRunning, startTimer, pauseTimer, resetTimer, switchPreset, presets, toggleTheme]);

  /**
   * Effect: Timer completion handler
   */
  useEffect(() => {
    if (isComplete) {
      // Play completion sound
      playNotificationSound('complete', 'autobots');
      
      // Update motivational quote
      const quotes = [
        'Till all are one!',
        'Autobots, roll out!',
        'One shall stand, one shall fall.',
        'Freedom is the right of all sentient beings.',
        'More than meets the eye!'
      ];
      setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
      
      // Show victory celebration
      setShowVictory(true);
      
      // Hide victory after 5 seconds
      setTimeout(() => {
        setShowVictory(false);
      }, 5000);
      
      // Increase battle power
      setBattlePower(prev => Math.min(prev + 20, 100));
    }
  }, [isComplete]);

  /**
   * Effect: Battle power decay
   */
  useEffect(() => {
    if (!isRunning && battlePower > 0) {
      const interval = setInterval(() => {
        setBattlePower(prev => Math.max(prev - 1, 0));
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [isRunning, battlePower]);

  /**
   * Effect: Ambient mode auto-activation
   */
  useEffect(() => {
    if (ambientModeActive) return;

    let idleTimer: number;
    
    const checkIdle = () => {
      idleTimer = window.setTimeout(() => {
        setAmbientModeActive(true);
      }, 120000); // 2 minutes
    };
    
    // Start the idle timer
    checkIdle();
    
    // Reset idle timer on user activity
    const resetIdleTimer = () => {
      window.clearTimeout(idleTimer);
      checkIdle();
    };
    
    // Add event listeners for user activity
    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('keydown', resetIdleTimer);
    window.addEventListener('click', resetIdleTimer);
    document.addEventListener('visibilitychange', resetIdleTimer);
    
    return () => {
      window.clearTimeout(idleTimer);
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('keydown', resetIdleTimer);
      window.removeEventListener('click', resetIdleTimer);
      document.removeEventListener('visibilitychange', resetIdleTimer);
    };
  }, [ambientModeActive]);

  /**
   * Formats time in seconds to MM:SS display format
   */
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  /**
   * Gets the primary color for the timer
   */
  const getTimerColor = (): string => {
    return '#3b82f6'; // Blue (Autobots color)
  };

  /**
   * Calculates the progress percentage for the timer
   */
  const calculateProgress = (): number => {
    const totalTime = activePreset.duration;
    return ((totalTime - timeRemaining) / totalTime) * 100;
  };

  // Main component render
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '2rem',
      position: 'relative',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      transition: 'background-color 0.3s, color 0.3s'
    }}>
      {/* Ambient Mode */}
      {ambientModeActive && (
        <AmbientMode 
          isActive={ambientModeActive} 
          onExit={() => setAmbientModeActive(false)} 
        />
      )}
      
      {/* Header */}
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        width: '100%'
      }}>
        <h1 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold',
          color: getTimerColor()
        }}>
          Transformers Timer
        </h1>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={toggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '0.375rem',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
            title={preferences.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {preferences.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <button
            onClick={() => navigate('/stats')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '0.375rem',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
            title="View Stats"
          >
            <BarChart2 size={20} />
          </button>
          
          <button
            onClick={() => navigate('/settings')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '0.375rem',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
            title="Settings"
          >
            <SettingsIcon size={20} />
          </button>
        </div>
      </div>
      
      {/* Timer Interface Toggle */}
      <div style={{ 
        marginBottom: '1.5rem',
        display: 'flex',
        gap: '1rem',
        zIndex: 10
      }}>
        <button
          onClick={() => setUseNewTimerInterface(false)}
          style={{
            backgroundColor: !useNewTimerInterface ? getTimerColor() : 'transparent',
            color: !useNewTimerInterface ? 'white' : 'var(--text-primary)',
            border: `1px solid ${getTimerColor()}`,
            borderRadius: '0.375rem',
            padding: '0.5rem 1rem',
            cursor: 'pointer'
          }}
        >
          Classic Timer
        </button>
        <button
          onClick={() => setUseNewTimerInterface(true)}
          style={{
            backgroundColor: useNewTimerInterface ? getTimerColor() : 'transparent',
            color: useNewTimerInterface ? 'white' : 'var(--text-primary)',
            border: `1px solid ${getTimerColor()}`,
            borderRadius: '0.375rem',
            padding: '0.5rem 1rem',
            cursor: 'pointer'
          }}
        >
          Transforming Timer
        </button>
      </div>
      
      {/* Timer Display */}
      <div style={{ 
        position: 'relative',
        width: '300px',
        height: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '2rem'
      }}>
        {useNewTimerInterface ? (
          /* Transforming Timer Interface */
          <TransformingTimer
            timeRemaining={timeRemaining}
            totalTime={activePreset.duration}
            isRunning={isRunning}
            isComplete={isComplete}
            activePreset={activePreset.id}
          />
        ) : (
          /* Classic Timer Interface */
          <CircularProgress
            value={calculateProgress()}
            size={300}
            strokeWidth={8}
            color={getTimerColor()}
            bgColor="var(--bg-secondary)"
          >
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ 
                fontSize: '3rem', 
                fontWeight: 'bold',
                color: 'var(--text-primary)'
              }}>
                {formatTime(timeRemaining)}
              </div>
              <div style={{ 
                fontSize: '1rem',
                color: 'var(--text-secondary)',
                marginTop: '0.5rem'
              }}>
                {activePreset.id === 'focus' ? 'Focus Time' : 'Break Time'}
              </div>
            </div>
          </CircularProgress>
        )}
        
        {/* Victory Celebration Overlay */}
        {showVictory && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            borderRadius: '50%',
            zIndex: 20,
            animation: 'fadeIn 0.5s ease'
          }}>
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold',
              color: getTimerColor(),
              marginBottom: '1rem'
            }}>
              Mission Complete!
            </div>
            <div style={{ 
              fontSize: '1rem',
              color: 'white',
              textAlign: 'center',
              padding: '0 1rem'
            }}>
              {currentQuote}
            </div>
          </div>
        )}
      </div>
      
      {/* Timer Controls */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem',
        marginBottom: '2rem',
        zIndex: 10
      }}>
        <button
          onClick={isRunning ? pauseTimer : startTimer}
          style={{
            backgroundColor: getTimerColor(),
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={resetTimer}
          style={{
            backgroundColor: 'transparent',
            color: 'var(--text-primary)',
            border: `1px solid ${getTimerColor()}`,
            borderRadius: '0.375rem',
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
      </div>
      
      {/* Timer Presets */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginBottom: '2rem',
        justifyContent: 'center',
        zIndex: 10
      }}>
        <button
          onClick={() => switchPreset({ id: 'focus', duration: presets.focus })}
          style={{
            backgroundColor: activePreset.id === 'focus' ? getTimerColor() : 'transparent',
            color: activePreset.id === 'focus' ? 'white' : 'var(--text-primary)',
            border: `1px solid ${getTimerColor()}`,
            borderRadius: '0.375rem',
            padding: '0.5rem 1rem',
            cursor: 'pointer'
          }}
        >
          Focus ({Math.floor(presets.focus / 60)} min)
        </button>
        <button
          onClick={() => switchPreset({ id: 'shortFocus', duration: presets.shortFocus })}
          style={{
            backgroundColor: activePreset.id === 'shortFocus' ? getTimerColor() : 'transparent',
            color: activePreset.id === 'shortFocus' ? 'white' : 'var(--text-primary)',
            border: `1px solid ${getTimerColor()}`,
            borderRadius: '0.375rem',
            padding: '0.5rem 1rem',
            cursor: 'pointer'
          }}
        >
          Short Focus ({Math.floor(presets.shortFocus / 60)} min)
        </button>
        <button
          onClick={() => switchPreset({ id: 'break', duration: presets.break })}
          style={{
            backgroundColor: activePreset.id === 'break' ? getTimerColor() : 'transparent',
            color: activePreset.id === 'break' ? 'white' : 'var(--text-primary)',
            border: `1px solid ${getTimerColor()}`,
            borderRadius: '0.375rem',
            padding: '0.5rem 1rem',
            cursor: 'pointer'
          }}
        >
          Break ({Math.floor(presets.break / 60)} min)
        </button>
        <button
          onClick={() => switchPreset({ id: 'shortBreak', duration: presets.shortBreak })}
          style={{
            backgroundColor: activePreset.id === 'shortBreak' ? getTimerColor() : 'transparent',
            color: activePreset.id === 'shortBreak' ? 'white' : 'var(--text-primary)',
            border: `1px solid ${getTimerColor()}`,
            borderRadius: '0.375rem',
            padding: '0.5rem 1rem',
            cursor: 'pointer'
          }}
        >
          Short Break ({Math.floor(presets.shortBreak / 60)} min)
        </button>
      </div>
      
      {/* Battle Power Meter */}
      <div style={{ 
        width: '100%',
        maxWidth: '400px',
        marginBottom: '2rem',
        zIndex: 10
      }}>
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '0.5rem'
        }}>
          <span style={{ color: 'var(--text-secondary)' }}>Battle Power</span>
          <span style={{ color: 'var(--text-secondary)' }}>{battlePower}%</span>
        </div>
        <div style={{ 
          width: '100%',
          height: '8px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            width: `${battlePower}%`,
            height: '100%',
            backgroundColor: getTimerColor(),
            transition: 'width 0.5s ease'
          }} />
        </div>
      </div>
      
      {/* Ambient Mode Toggle */}
      <button
        onClick={() => setAmbientModeActive(prev => !prev)}
        style={{
          backgroundColor: ambientModeActive ? getTimerColor() : 'transparent',
          color: ambientModeActive ? 'white' : 'var(--text-primary)',
          border: `1px solid ${getTimerColor()}`,
          borderRadius: '0.375rem',
          padding: '0.5rem 1rem',
          cursor: 'pointer',
          marginTop: 'auto',
          zIndex: 10
        }}
      >
        {ambientModeActive ? 'Exit Ambient Mode' : 'Ambient Mode'}
      </button>
      
      {/* CSS Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}
