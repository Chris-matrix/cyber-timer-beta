import { useNavigate } from 'react-router-dom';
import { useTimer } from '../context/TimerContext';
import { CircularProgress } from './ui/circular-progress';
import { useState, useEffect } from 'react';
import { playNotificationSound } from '../lib/audio';
import TransformingTimer from './TransformingTimer';
import AmbientMode from './AmbientMode';
import { BarChart2, Settings as SettingsIcon } from 'lucide-react';

export default function Timer() {
  const navigate = useNavigate();
  const { state, startTimer, pauseTimer, resetTimer, switchPreset } = useTimer();
  const { activePreset, presets, isRunning, timeRemaining, isComplete, preferences } = state;
  const [transformState, setTransformState] = useState<'robot' | 'vehicle'>('robot');
  const [battlePower, setBattlePower] = useState(0);
  const [showVictory, setShowVictory] = useState(false);
  // Using currentQuote for displaying quotes during timer sessions
  const [currentQuote, setCurrentQuote] = useState('Till all are one!');
  const [useNewTimerInterface, setUseNewTimerInterface] = useState(true);
  const [ambientModeActive, setAmbientModeActive] = useState(false);
  const [idleTime, setIdleTime] = useState(0);

  // Transform every 30 seconds while running
  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      setTransformState(prev => prev === 'robot' ? 'vehicle' : 'robot');
      // Play transformation sound
      playNotificationSound('transform', preferences.faction);
    }, 30000);

    return () => clearInterval(interval);
  }, [isRunning, preferences.faction]);

  // Update battle power while timer is running
  useEffect(() => {
    if (isRunning && activePreset.id === 'focus') {
      const interval = setInterval(() => {
        setBattlePower(prev => Math.min(100, prev + 5));
      }, 60000); // Increase every minute
      
      return () => clearInterval(interval);
    }
  }, [isRunning, activePreset.id]);

  // Handle timer completion
  useEffect(() => {
    if (timeRemaining === 0 && !isRunning) {
      // Show victory celebration
      setShowVictory(true);
      setTimeout(() => setShowVictory(false), 3000);
      
      // Reset battle power if focus session completed
      if (activePreset.id === 'focus') {
        setBattlePower(0);
      }
      
      // Update quote when timer completes
      const quotes = [
        'Till all are one!',
        'Autobots, roll out!',
        'One shall stand, one shall fall.',
        'Freedom is the right of all sentient beings.',
        'More than meets the eye!'
      ];
      setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }
  }, [timeRemaining, isRunning, activePreset.id]);

  // Track idle time for ambient mode
  useEffect(() => {
    if (ambientModeActive) return;

    const idleInterval = setInterval(() => {
      setIdleTime(prev => prev + 1);
      
      // Activate ambient mode after 2 minutes of inactivity
      if (idleTime >= 120) {
        setAmbientModeActive(true);
        setIdleTime(0);
      }
    }, 1000);
    
    // Reset idle time on user activity
    const resetIdleTime = () => setIdleTime(0);
    
    // Add event listeners for user activity
    window.addEventListener('mousemove', resetIdleTime);
    window.addEventListener('keydown', resetIdleTime);
    window.addEventListener('click', resetIdleTime);
    
    return () => {
      clearInterval(idleInterval);
      window.removeEventListener('mousemove', resetIdleTime);
      window.removeEventListener('keydown', resetIdleTime);
      window.removeEventListener('click', resetIdleTime);
    };
  }, [idleTime, ambientModeActive]);

  // Exit ambient mode on user activity
  useEffect(() => {
    if (!ambientModeActive) return;
    
    const exitAmbientMode = () => setAmbientModeActive(false);
    
    window.addEventListener('mousemove', exitAmbientMode);
    window.addEventListener('keydown', exitAmbientMode);
    window.addEventListener('click', exitAmbientMode);
    
    return () => {
      window.removeEventListener('mousemove', exitAmbientMode);
      window.removeEventListener('keydown', exitAmbientMode);
      window.removeEventListener('click', exitAmbientMode);
    };
  }, [ambientModeActive]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progress = activePreset.duration > 0 
    ? ((activePreset.duration * 60) - timeRemaining) / (activePreset.duration * 60) * 100
    : 0;

  // Get progress color based on faction
  const getFactionColor = () => {
    switch (preferences.faction) {
      case 'autobots':
        return '#3b82f6'; // Blue
      case 'decepticons':
        return '#9333ea'; // Purple
      case 'maximals':
        return '#16a34a'; // Green
      case 'predacons':
        return '#b91c1c'; // Red
      default:
        return '#3b82f6'; // Default to Autobots blue
    }
  };

  // Create preset objects for switchPreset calls
  const handleSwitchPreset = (presetId: string) => {
    const presetDurations = {
      focus: presets.focus,
      shortFocus: presets.shortFocus,
      break: presets.break,
      shortBreak: presets.shortBreak
    };
    
    switchPreset({
      id: presetId,
      duration: presetDurations[presetId as keyof typeof presetDurations]
    });
  };

  return (
    <div style={{ 
      backgroundColor: '#121212', 
      color: 'white',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative'
    }}>
      {/* Ambient Mode */}
      <AmbientMode isActive={ambientModeActive} />
      
      {/* Header */}
      <div style={{ 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '2rem',
        zIndex: 10
      }}>
        <h1 style={{ 
          fontSize: '2rem',
          color: getFactionColor()
        }}>
          Transformers Timer
        </h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => navigate('/stats')}
            style={{
              backgroundColor: 'transparent',
              color: 'white',
              border: `1px solid ${getFactionColor()}`,
              borderRadius: '0.375rem',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <BarChart2 size={18} />
            Stats
          </button>
          <button 
            onClick={() => navigate('/settings')}
            style={{
              backgroundColor: 'transparent',
              color: 'white',
              border: `1px solid ${getFactionColor()}`,
              borderRadius: '0.375rem',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <SettingsIcon size={18} />
            Settings
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
            backgroundColor: !useNewTimerInterface ? getFactionColor() : 'transparent',
            color: 'white',
            border: `1px solid ${getFactionColor()}`,
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
            backgroundColor: useNewTimerInterface ? getFactionColor() : 'transparent',
            color: 'white',
            border: `1px solid ${getFactionColor()}`,
            borderRadius: '0.375rem',
            padding: '0.5rem 1rem',
            cursor: 'pointer'
          }}
        >
          Transforming Timer
        </button>
      </div>
      
      {/* Timer Display */}
      {useNewTimerInterface ? (
        <TransformingTimer
          timeRemaining={timeRemaining}
          totalTime={activePreset.duration * 60}
          isRunning={isRunning}
          isComplete={isComplete}
          activePreset={activePreset.id}
        />
      ) : (
        <div style={{ 
          backgroundColor: '#2a2a2a',
          borderRadius: '1rem',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: `0 0 20px ${getFactionColor()}40`,
          border: `2px solid ${getFactionColor()}80`,
          marginBottom: '2rem',
          position: 'relative',
          transform: showVictory ? 'scale(1.1)' : 'scale(1)',
          transition: 'all 0.3s ease',
          zIndex: 10
        }}>
          {/* Transforming display */}
          <div style={{ 
            position: 'absolute',
            inset: 0,
            opacity: 0.2,
            transform: transformState === 'vehicle' ? 'rotate(180deg) scale(0.75)' : 'none',
            transition: 'all 1s ease'
          }}></div>
          
          {/* Victory celebration */}
          {showVictory && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'bounce 1s infinite'
            }}>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold',
                color: getFactionColor()
              }}>
                Mission Accomplished! 
              </div>
            </div>
          )}
          
          {/* Timer display with circular progress */}
          <div style={{ position: 'relative', width: '256px', height: '256px' }}>
            <CircularProgress 
              value={progress} 
              size={256}
              strokeWidth={12}
              color={getFactionColor()}
              bgColor="#333333"
            />
            <div style={{ 
              position: 'absolute', 
              inset: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>
                {formatTime(timeRemaining)}
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '1rem', fontSize: '1.5rem' }}>
            {activePreset.id === 'focus' ? 'Energon Charge' : 
             activePreset.id === 'shortFocus' ? 'Quick Scout' : 
             activePreset.id === 'break' ? 'Recharge Break' : 'Short Break'}
          </div>
          <div style={{ marginTop: '0.5rem', fontStyle: 'italic', opacity: 0.8 }}>
            {currentQuote}
          </div>
        </div>
      )}
      
      {/* Battle power meter (only shown during focus) */}
      {activePreset.id.includes('focus') && (
        <div style={{ 
          width: '100%', 
          maxWidth: '28rem', 
          backgroundColor: '#1f2937', 
          borderRadius: '0.5rem', 
          padding: '0.75rem',
          marginBottom: '1.5rem',
          zIndex: 10
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '0.25rem' 
          }}>
            <span>Battle Power</span>
            <span>{battlePower}%</span>
          </div>
          <div style={{ 
            width: '100%', 
            height: '0.5rem', 
            backgroundColor: '#374151', 
            borderRadius: '0.25rem', 
            overflow: 'hidden' 
          }}>
            <div 
              style={{ 
                height: '100%', 
                width: `${battlePower}%`, 
                backgroundColor: getFactionColor(),
                transition: 'width 0.5s ease'
              }}
            />
          </div>
        </div>
      )}
      
      {/* Timer controls */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem',
        zIndex: 10
      }}>
        {!isRunning ? (
          <button 
            onClick={startTimer}
            style={{
              backgroundColor: getFactionColor(),
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Start
          </button>
        ) : (
          <button 
            onClick={pauseTimer}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Pause
          </button>
        )}
        
        <button 
          onClick={resetTimer}
          style={{
            backgroundColor: 'transparent',
            color: 'white',
            border: `1px solid ${getFactionColor()}`,
            borderRadius: '0.375rem',
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
      </div>
      
      {/* Timer presets */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem',
        marginTop: '2rem',
        zIndex: 10
      }}>
        <button 
          onClick={() => handleSwitchPreset('focus')}
          style={{
            backgroundColor: activePreset.id === 'focus' ? getFactionColor() : 'transparent',
            color: 'white',
            border: `1px solid ${getFactionColor()}`,
            borderRadius: '0.375rem',
            padding: '0.5rem 1rem',
            cursor: 'pointer'
          }}
        >
          Focus ({presets.focus} min)
        </button>
        
        <button 
          onClick={() => handleSwitchPreset('shortFocus')}
          style={{
            backgroundColor: activePreset.id === 'shortFocus' ? getFactionColor() : 'transparent',
            color: 'white',
            border: `1px solid ${getFactionColor()}`,
            borderRadius: '0.375rem',
            padding: '0.5rem 1rem',
            cursor: 'pointer'
          }}
        >
          Short Focus ({presets.shortFocus} min)
        </button>
        
        <button 
          onClick={() => handleSwitchPreset('break')}
          style={{
            backgroundColor: activePreset.id === 'break' ? getFactionColor() : 'transparent',
            color: 'white',
            border: `1px solid ${getFactionColor()}`,
            borderRadius: '0.375rem',
            padding: '0.5rem 1rem',
            cursor: 'pointer'
          }}
        >
          Break ({presets.break} min)
        </button>
        
        <button 
          onClick={() => handleSwitchPreset('shortBreak')}
          style={{
            backgroundColor: activePreset.id === 'shortBreak' ? getFactionColor() : 'transparent',
            color: 'white',
            border: `1px solid ${getFactionColor()}`,
            borderRadius: '0.375rem',
            padding: '0.5rem 1rem',
            cursor: 'pointer'
          }}
        >
          Short Break ({presets.shortBreak} min)
        </button>
      </div>
      
      {/* Ambient Mode Button */}
      <button
        onClick={() => setAmbientModeActive(true)}
        style={{
          marginTop: '2rem',
          backgroundColor: 'transparent',
          color: 'white',
          border: `1px solid ${getFactionColor()}`,
          borderRadius: '0.375rem',
          padding: '0.5rem 1rem',
          cursor: 'pointer',
          zIndex: 10
        }}
      >
        Enter Ambient Mode
      </button>
      
      {/* CSS Animations */}
      <style>
        {`
          @keyframes bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
          }
        `}
      </style>
    </div>
  );
}
