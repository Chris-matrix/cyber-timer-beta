import { useNavigate } from 'react-router-dom';
import { useTimer } from '../context/TimerContext';
import { Sun, Moon, Volume2, VolumeX, ChevronLeft, Timer, BarChart2 } from 'lucide-react';

/**
 * Settings Component
 * 
 * Provides user configuration options for the timer application
 */
export default function Settings() {
  const navigate = useNavigate();
  const { state, updatePreset, toggleSound, toggleTheme } = useTimer();
  const { presets, preferences } = state;
  
  // Convert minutes to seconds for preset inputs
  const focusMinutes = Math.floor(presets.focus / 60);
  const shortFocusMinutes = Math.floor(presets.shortFocus / 60);
  const breakMinutes = Math.floor(presets.break / 60);
  const shortBreakMinutes = Math.floor(presets.shortBreak / 60);
  
  /**
   * Handles changes to timer preset durations
   */
  const handlePresetChange = (presetId: string, minutes: number) => {
    const seconds = Math.max(1, minutes) * 60; // Ensure at least 1 minute
    updatePreset(presetId, seconds);
  };
  
  return (
    <div style={{
      minHeight: '100vh',
      padding: '2rem',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      transition: 'background-color 0.3s, color 0.3s'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => navigate('/')}
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
          >
            <ChevronLeft size={20} />
          </button>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Settings</h1>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => navigate('/')}
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
            title="Timer"
          >
            <Timer size={20} />
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
            title="Stats"
          >
            <BarChart2 size={20} />
          </button>
        </div>
      </div>
      
      {/* Timer Presets Section */}
      <div style={{ 
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{ 
          fontSize: '1.25rem', 
          fontWeight: 'bold',
          marginBottom: '1rem'
        }}>
          Timer Presets
        </h2>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label 
              htmlFor="focus-time" 
              style={{ 
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--text-secondary)'
              }}
            >
              Focus Time (minutes)
            </label>
            <input
              id="focus-time"
              type="number"
              min="1"
              value={focusMinutes}
              onChange={(e) => handlePresetChange('focus', parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '0.5rem',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '0.375rem'
              }}
            />
          </div>
          
          <div>
            <label 
              htmlFor="short-focus-time" 
              style={{ 
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--text-secondary)'
              }}
            >
              Short Focus Time (minutes)
            </label>
            <input
              id="short-focus-time"
              type="number"
              min="1"
              value={shortFocusMinutes}
              onChange={(e) => handlePresetChange('shortFocus', parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '0.5rem',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '0.375rem'
              }}
            />
          </div>
          
          <div>
            <label 
              htmlFor="break-time" 
              style={{ 
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--text-secondary)'
              }}
            >
              Break Time (minutes)
            </label>
            <input
              id="break-time"
              type="number"
              min="1"
              value={breakMinutes}
              onChange={(e) => handlePresetChange('break', parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '0.5rem',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '0.375rem'
              }}
            />
          </div>
          
          <div>
            <label 
              htmlFor="short-break-time" 
              style={{ 
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--text-secondary)'
              }}
            >
              Short Break Time (minutes)
            </label>
            <input
              id="short-break-time"
              type="number"
              min="1"
              value={shortBreakMinutes}
              onChange={(e) => handlePresetChange('shortBreak', parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '0.5rem',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '0.375rem'
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Appearance Section */}
      <div style={{ 
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{ 
          fontSize: '1.25rem', 
          fontWeight: 'bold',
          marginBottom: '1rem'
        }}>
          Appearance
        </h2>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontWeight: 'medium' }}>Theme</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Switch between light and dark mode
            </p>
          </div>
          
          <button
            onClick={toggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.75rem',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '0.375rem',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
            title={preferences.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {preferences.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
      
      {/* Sound Settings */}
      <div style={{ 
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{ 
          fontSize: '1.25rem', 
          fontWeight: 'bold',
          marginBottom: '1rem'
        }}>
          Sound
        </h2>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontWeight: 'medium' }}>Sound Effects</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Enable or disable timer sound effects
            </p>
          </div>
          
          <button
            onClick={toggleSound}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.75rem',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '0.375rem',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
            title={preferences.soundEnabled ? 'Disable Sound' : 'Enable Sound'}
          >
            {preferences.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </div>
      
      {/* About Section */}
      <div style={{ 
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '0.5rem',
        padding: '1.5rem'
      }}>
        <h2 style={{ 
          fontSize: '1.25rem', 
          fontWeight: 'bold',
          marginBottom: '1rem'
        }}>
          About
        </h2>
        
        <p style={{ marginBottom: '0.5rem' }}>
          <strong>Transformers Timer</strong> - v1.0.0
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          A productivity timer with a Transformers theme. Built with React.
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
          Keyboard shortcuts:
        </p>
        <ul style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem', paddingLeft: '1rem' }}>
          <li>Space - Start/Pause timer</li>
          <li>R - Reset timer</li>
          <li>F - Switch to Focus preset</li>
          <li>B - Switch to Break preset</li>
          <li>A - Toggle ambient mode</li>
          <li>T - Toggle theme (light/dark)</li>
        </ul>
      </div>
    </div>
  );
}
