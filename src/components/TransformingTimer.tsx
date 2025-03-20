import { useState, useEffect } from 'react';
import { useTimer } from '../context/TimerContext';
import { playNotificationSound } from '../lib/audio';

interface TransformingTimerProps {
  timeRemaining: number;
  totalTime: number;
  isRunning: boolean;
  isComplete: boolean;
  activePreset: string;
}

export default function TransformingTimer({
  timeRemaining,
  totalTime,
  isRunning,
  isComplete,
  activePreset
}: TransformingTimerProps) {
  const { state } = useTimer();
  const [shape, setShape] = useState<'circle' | 'square' | 'diamond' | 'shield' | 'star'>('circle');
  const [isTransforming, setIsTransforming] = useState(false);
  const [rotation, setRotation] = useState(0);
  
  // Get faction color
  const getFactionColor = () => {
    switch (state.preferences.faction) {
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

  // Get secondary faction color for highlights and accents
  const getSecondaryFactionColor = () => {
    switch (state.preferences.faction) {
      case 'autobots':
        return '#1d4ed8'; // Darker blue
      case 'decepticons':
        return '#7e22ce'; // Darker purple
      case 'maximals':
        return '#15803d'; // Darker green
      case 'predacons':
        return '#991b1b'; // Darker red
      default:
        return '#1d4ed8'; // Default to darker Autobots blue
    }
  };

  // Calculate progress percentage
  const progress = Math.max(0, Math.min(100, (1 - timeRemaining / totalTime) * 100));
  
  // Transform shape based on timer state and progress
  useEffect(() => {
    // Transform shape at specific progress points
    if (isRunning && !isComplete) {
      if (progress >= 25 && progress < 25.5) {
        transformShape('square');
      } else if (progress >= 50 && progress < 50.5) {
        transformShape('diamond');
      } else if (progress >= 75 && progress < 75.5) {
        transformShape('shield');
      } else if (progress >= 99.5) {
        transformShape('star');
      }
    }
    
    // Reset to circle when timer is reset or completed
    if (!isRunning && progress === 0) {
      setShape('circle');
    }
    
    // Handle completion
    if (isComplete && shape !== 'star') {
      transformShape('star');
    }
    
    // Handle break timer
    if (activePreset === 'break' || activePreset === 'shortBreak') {
      if (shape !== 'shield') {
        transformShape('shield');
      }
    }
  }, [progress, isRunning, isComplete, activePreset, shape]);
  
  // Rotate timer slightly when running
  useEffect(() => {
    if (isRunning && !isComplete) {
      const interval = setInterval(() => {
        setRotation(prev => (prev + 1) % 360);
      }, 1000);
      
      return () => clearInterval(interval);
    } else {
      setRotation(0);
    }
  }, [isRunning, isComplete]);
  
  // Function to handle shape transformation with animation
  const transformShape = (newShape: 'circle' | 'square' | 'diamond' | 'shield' | 'star') => {
    if (shape === newShape) return;
    
    setIsTransforming(true);
    
    // Play transformation sound
    if (state.preferences.soundEnabled) {
      playNotificationSound('transform', state.preferences.faction as any);
    }
    
    // Set new shape after a short delay
    setTimeout(() => {
      setShape(newShape);
      
      // End transformation animation
      setTimeout(() => {
        setIsTransforming(false);
      }, 500);
    }, 500);
  };
  
  // Format time remaining as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Get shape styles based on current shape
  const getShapeStyles = () => {
    const baseStyles = {
      width: '300px',
      height: '300px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative' as const,
      transition: 'all 0.5s ease',
      transform: `rotate(${rotation}deg)`,
      backgroundColor: '#1a1a1a',
      boxShadow: `0 0 30px ${getFactionColor()}80`
    };
    
    switch (shape) {
      case 'circle':
        return {
          ...baseStyles,
          borderRadius: '50%'
        };
      case 'square':
        return {
          ...baseStyles,
          borderRadius: '15%'
        };
      case 'diamond':
        return {
          ...baseStyles,
          borderRadius: '15%',
          transform: `rotate(${45 + rotation}deg)`
        };
      case 'shield':
        return {
          ...baseStyles,
          borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%'
        };
      case 'star':
        return {
          ...baseStyles,
          borderRadius: '50%',
          clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
        };
      default:
        return {
          ...baseStyles,
          borderRadius: '50%'
        };
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      {/* Transforming container */}
      <div
        style={{
          ...getShapeStyles(),
          animation: isTransforming ? 'transform-pulse 1s ease' : 'none'
        }}
      >
        {/* Progress ring */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          right: '10px',
          bottom: '10px',
          borderRadius: shape === 'circle' ? '50%' : 
                       shape === 'square' ? '12%' : 
                       shape === 'diamond' ? '12%' : 
                       shape === 'shield' ? '50% 50% 50% 50% / 60% 60% 40% 40%' : 
                       '50%',
          background: `conic-gradient(
            ${getFactionColor()} ${progress}%, 
            #333 ${progress}%
          )`,
          clipPath: shape === 'star' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' : 'none',
          transform: shape === 'diamond' ? 'rotate(0deg)' : 'none'
        }} />
        
        {/* Inner circle */}
        <div style={{
          position: 'absolute',
          top: '30px',
          left: '30px',
          right: '30px',
          bottom: '30px',
          borderRadius: shape === 'circle' ? '50%' : 
                       shape === 'square' ? '8%' : 
                       shape === 'diamond' ? '8%' : 
                       shape === 'shield' ? '50% 50% 50% 50% / 60% 60% 40% 40%' : 
                       '50%',
          backgroundColor: '#121212',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column' as const,
          clipPath: shape === 'star' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' : 'none',
          transform: shape === 'diamond' ? 'rotate(0deg)' : 'none',
          border: `2px solid ${getSecondaryFactionColor()}`
        }}>
          {/* Time display */}
          <div style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '0.5rem',
            transform: shape === 'diamond' ? `rotate(-${45 + rotation}deg)` : `rotate(-${rotation}deg)`
          }}>
            {formatTime(timeRemaining)}
          </div>
          
          {/* Preset name */}
          <div style={{
            fontSize: '1.25rem',
            color: getFactionColor(),
            textTransform: 'capitalize' as const,
            transform: shape === 'diamond' ? `rotate(-${45 + rotation}deg)` : `rotate(-${rotation}deg)`
          }}>
            {activePreset}
          </div>
          
          {/* Faction emblem */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '100px',
            height: '100px',
            transform: `translate(-50%, -50%) ${shape === 'diamond' ? `rotate(-${45 + rotation}deg)` : `rotate(-${rotation}deg)`}`,
            backgroundImage: `url('/assets/images/${state.preferences.faction}-logo.png')`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.1,
            zIndex: 0
          }} />
        </div>
      </div>
      
      {/* Character quote during transformation */}
      {isTransforming && (
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#1a1a1a',
          borderRadius: '0.5rem',
          maxWidth: '400px',
          textAlign: 'center',
          animation: 'fade-in-out 2s forwards',
          border: `1px solid ${getSecondaryFactionColor()}`
        }}>
          <p style={{
            fontSize: '1.25rem',
            fontStyle: 'italic',
            color: getFactionColor()
          }}>
            {state.preferences.faction === 'autobots' ? 'Autobots, transform and roll out!' :
             state.preferences.faction === 'decepticons' ? 'Decepticons, transform and rise up!' :
             state.preferences.faction === 'maximals' ? 'Maximals, maximize!' :
             'Predacons, terrorize!'}
          </p>
        </div>
      )}
      
      {/* CSS Animations */}
      <style>
        {`
          @keyframes transform-pulse {
            0% { transform: scale(1) rotate(${rotation}deg); }
            50% { transform: scale(1.2) rotate(${rotation + 180}deg); }
            100% { transform: scale(1) rotate(${rotation + 360}deg); }
          }
          
          @keyframes fade-in-out {
            0% { opacity: 0; transform: translateY(20px); }
            20% { opacity: 1; transform: translateY(0); }
            80% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-20px); }
          }
        `}
      </style>
    </div>
  );
}
