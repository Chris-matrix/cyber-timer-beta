/**
 * Transformers Timer - Animated Timer Component
 * 
 * This component is the visual centerpiece of the application, displaying an animated
 * timer that transforms between different shapes based on timer progress. It creates
 * a visually engaging experience inspired by the Transformers universe.
 * 
 * Key features:
 * - Shape transformation at key progress points (25%, 50%, 75%, 100%)
 * - Faction-specific colors and styling
 * - Dynamic animations during transformations
 * - Rotation and pulse effects
 * - Character quotes during transformations
 */

import { useState, useEffect, useRef } from 'react';
import { useTimer } from '../context/TimerContext';
import { playNotificationSound } from '../lib/audio';

/**
 * Props for the TransformingTimer component
 * @property {number} timeRemaining - Seconds remaining in the current timer
 * @property {number} totalTime - Total seconds for the timer
 * @property {boolean} isRunning - Whether the timer is currently running
 * @property {boolean} isComplete - Whether the timer has completed
 * @property {string} activePreset - Current timer preset (e.g., 'focus', 'break')
 */
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
  
  /**
   * State for the current shape of the timer
   * Transforms between: circle → square → diamond → shield → star
   */
  const [shape, setShape] = useState<'circle' | 'square' | 'diamond' | 'shield' | 'star'>('circle');
  
  /** State to track if the timer is currently transforming between shapes */
  const [isTransforming, setIsTransforming] = useState(false);
  
  /** State for the current rotation angle of the timer (0-360 degrees) */
  const [rotation, setRotation] = useState(0);
  
  /** Reference to store the rotation interval ID */
  const rotationIntervalRef = useRef<number | null>(null);
  
  /** State to track if the energy pulse effect should be shown */
  const [pulseEffect, setPulseEffect] = useState(false);
  
  /**
   * Gets the primary color based on the selected faction
   * This color is used for the progress ring and other primary UI elements
   * @returns {string} Hex color code for the faction
   */
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

  /**
   * Gets the secondary color based on the selected faction
   * This color is used for borders, highlights, and accents
   * @returns {string} Hex color code for the faction's secondary color
   */
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

  /**
   * Calculate the progress percentage for the timer
   * Used for the progress ring and to trigger transformations
   */
  const progress = Math.max(0, Math.min(100, (1 - timeRemaining / totalTime) * 100));
  
  /**
   * Effect: Handle shape transformations based on timer progress
   * 
   * This effect monitors the timer progress and triggers shape transformations
   * at specific milestones (25%, 50%, 75%, 100%)
   */
  useEffect(() => {
    // If timer is complete, transform to star shape
    if (isComplete && shape !== 'star') {
      setIsTransforming(true);
      setShape('star');
      playNotificationSound('complete', state.preferences.faction);
      setTimeout(() => setIsTransforming(false), 1000);
      return;
    }
    
    if (!isRunning) return;
    
    // Calculate progress percentage
    const progress = ((totalTime - timeRemaining) / totalTime) * 100;
    
    // Determine shape based on progress
    if (progress >= 0 && progress < 25) {
      setShape('circle');
    } else if (progress >= 25 && progress < 50) {
      if (shape !== 'square') {
        setIsTransforming(true);
        setShape('square');
        playNotificationSound('transform', state.preferences.faction);
        
        // Reset transforming state after animation completes
        setTimeout(() => setIsTransforming(false), 1000);
      }
    } else if (progress >= 50 && progress < 75) {
      if (shape !== 'diamond') {
        setIsTransforming(true);
        setShape('diamond');
        playNotificationSound('transform', state.preferences.faction);
        
        // Reset transforming state after animation completes
        setTimeout(() => setIsTransforming(false), 1000);
      }
    } else if (progress >= 75 && progress < 100) {
      if (shape !== 'shield') {
        setIsTransforming(true);
        setShape('shield');
        playNotificationSound('transform', state.preferences.faction);
        
        // Reset transforming state after animation completes
        setTimeout(() => setIsTransforming(false), 1000);
      }
    }
  }, [isRunning, isComplete, timeRemaining, totalTime, shape, state.preferences.faction]);
  
  /**
   * Effect hook to handle timer rotation animation
   * 
   * This effect creates a smooth rotation animation while the timer is running
   */
  useEffect(() => {
    // Disable rotation animation
    setRotation(0);
    
    // Clear any existing rotation interval
    if (rotationIntervalRef.current) {
      clearInterval(rotationIntervalRef.current);
      rotationIntervalRef.current = null;
    }
  }, [isRunning]);
  
  /**
   * Effect hook to create energy pulse animations
   * 
   * Adds visual interest with periodic pulse effects
   */
  useEffect(() => {
    if (!isRunning) return;
    
    const pulseInterval = setInterval(() => {
      setPulseEffect(true);
      setTimeout(() => setPulseEffect(false), 500);
    }, 3000);
    
    return () => clearInterval(pulseInterval);
  }, [isRunning]);
  
  /**
   * Formats the time remaining as MM:SS
   * 
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time string (MM:SS)
   */
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  /**
   * Generates the CSS styles for the current shape
   * Each shape has specific border radius, transform, and other style properties
   * 
   * @returns {Object} Style object for the current shape
   */
  const getShapeStyles = () => {
    const baseStyles = {
      width: '300px',
      height: '300px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative' as const,
      transition: 'all 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55)',
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
      {/* Transforming container - Main timer shape that changes based on progress */}
      <div
        style={{
          ...getShapeStyles(),
          animation: isTransforming 
            ? `transform-pulse 1s cubic-bezier(0.68, -0.55, 0.27, 1.55)` 
            : pulseEffect 
              ? 'energy-pulse 2s ease' 
              : 'none'
        }}
      >
        {/* Progress ring - Visual indicator of timer progress using conic gradient */}
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
        
        {/* Inner circle - Contains timer display and preset name */}
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
          {/* Time display - Shows remaining time in MM:SS format */}
          <div style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '0.5rem',
            transform: shape === 'diamond' ? `rotate(-${45 + rotation}deg)` : `rotate(-${rotation}deg)`
          }}>
            {formatTime(timeRemaining)}
          </div>
          
          {/* Preset name - Shows the current timer preset (focus, break, etc.) */}
          <div style={{
            fontSize: '1.25rem',
            color: getFactionColor(),
            textTransform: 'capitalize' as const,
            transform: shape === 'diamond' ? `rotate(-${45 + rotation}deg)` : `rotate(-${rotation}deg)`
          }}>
            {activePreset}
          </div>
          
          {/* Faction emblem - Background watermark of the selected faction logo */}
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
      
      {/* Character quote - Displays faction-specific quote during transformations */}
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
      
      {/* CSS Animations - Keyframe animations for transformations and effects */}
      <style>
        {`
          /* Rotation and scale animation - Variation 1 */
          @keyframes transform-pulse {
            0% { transform: scale(1) rotate(${rotation}deg); }
            50% { transform: scale(1.2) rotate(${rotation + 180}deg); }
            100% { transform: scale(1) rotate(${rotation + 360}deg); }
          }
          
          /* Glow pulse animation for energy effect */
          @keyframes energy-pulse {
            0% { box-shadow: 0 0 30px ${getFactionColor()}80; }
            50% { box-shadow: 0 0 50px ${getFactionColor()}; }
            100% { box-shadow: 0 0 30px ${getFactionColor()}80; }
          }
          
          /* Fade in and out animation for quotes */
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
