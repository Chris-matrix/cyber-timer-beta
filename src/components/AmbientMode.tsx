import { useState, useEffect } from 'react';
import { useTimer } from '../context/TimerContext';

interface AmbientModeProps {
  isActive: boolean;
}

// Define character data for animations
const characters = [
  { name: 'Optimus Prime', faction: 'autobots', position: 'left', delay: 5000 },
  { name: 'Bumblebee', faction: 'autobots', position: 'right', delay: 12000 },
  { name: 'Megatron', faction: 'decepticons', position: 'bottom', delay: 8000 },
  { name: 'Starscream', faction: 'decepticons', position: 'top', delay: 15000 },
  { name: 'Optimal Primal', faction: 'maximals', position: 'left', delay: 10000 },
  { name: 'Cheetor', faction: 'maximals', position: 'right', delay: 18000 },
  { name: 'Megatron', faction: 'predacons', position: 'bottom', delay: 7000 },
  { name: 'Waspinator', faction: 'predacons', position: 'top', delay: 20000 },
];

export default function AmbientMode({ isActive }: AmbientModeProps) {
  const { state } = useTimer();
  const [visibleCharacters, setVisibleCharacters] = useState<string[]>([]);
  const [background, setBackground] = useState<'cybertron' | 'earth'>('cybertron');
  
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

  // Toggle background between Cybertron and Earth
  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setBackground(prev => prev === 'cybertron' ? 'earth' : 'cybertron');
      }, 30000); // Switch every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [isActive]);

  // Handle character appearances
  useEffect(() => {
    if (isActive) {
      // Set up character appearance timers
      const timers = characters.map(character => {
        return setTimeout(() => {
          setVisibleCharacters(prev => [...prev, character.name]);
          
          // Remove character after 5 seconds
          setTimeout(() => {
            setVisibleCharacters(prev => prev.filter(name => name !== character.name));
          }, 5000);
        }, character.delay);
      });
      
      // Clear all timers on cleanup
      return () => {
        timers.forEach(timer => clearTimeout(timer));
      };
    } else {
      // Clear visible characters when ambient mode is inactive
      setVisibleCharacters([]);
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#000',
      zIndex: 50,
      opacity: isActive ? 1 : 0,
      transition: 'opacity 1s ease',
      overflow: 'hidden'
    }}>
      {/* Background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url('/assets/images/${background === 'cybertron' ? 'cybertron-bg.jpg' : 'earth-bg.jpg'}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.7,
        transition: 'opacity 2s ease'
      }} />
      
      {/* Faction emblem overlay */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '300px',
        height: '300px',
        backgroundImage: `url('/assets/images/${state.preferences.faction}-logo.png')`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity: 0.2,
        filter: `drop-shadow(0 0 20px ${getFactionColor()})`,
        animation: 'pulse 5s infinite ease-in-out'
      }} />
      
      {/* Characters */}
      {characters.map(character => (
        <div
          key={character.name}
          style={{
            position: 'absolute',
            [character.position === 'left' ? 'left' : character.position === 'right' ? 'right' : character.position === 'top' ? 'top' : 'bottom']: '-100px',
            [character.position === 'left' || character.position === 'right' ? 'top' : 'left']: '50%',
            transform: 'translate(-50%, -50%)',
            width: '150px',
            height: '150px',
            backgroundImage: `url('/assets/images/characters/${character.name.toLowerCase().replace(' ', '-')}.png')`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: visibleCharacters.includes(character.name) ? 0.8 : 0,
            transition: 'opacity 1s ease, transform 5s ease',
            animation: visibleCharacters.includes(character.name) 
              ? `character-${character.position} 5s forwards` 
              : 'none',
            filter: `drop-shadow(0 0 10px ${getFactionColor()})`,
            zIndex: 51
          }}
        />
      ))}
      
      {/* Message to exit ambient mode */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'white',
        fontSize: '1rem',
        textAlign: 'center',
        opacity: 0.7,
        textShadow: '0 0 10px rgba(0,0,0,0.8)'
      }}>
        Move your mouse or press any key to exit Ambient Mode
      </div>
      
      {/* CSS Animations */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 0.1; transform: translate(-50%, -50%) scale(0.9); }
            50% { opacity: 0.3; transform: translate(-50%, -50%) scale(1.1); }
            100% { opacity: 0.1; transform: translate(-50%, -50%) scale(0.9); }
          }
          
          @keyframes character-left {
            0% { opacity: 0; left: -100px; }
            20% { opacity: 0.8; left: 20%; }
            80% { opacity: 0.8; left: 20%; }
            100% { opacity: 0; left: -100px; }
          }
          
          @keyframes character-right {
            0% { opacity: 0; right: -100px; }
            20% { opacity: 0.8; right: 20%; }
            80% { opacity: 0.8; right: 20%; }
            100% { opacity: 0; right: -100px; }
          }
          
          @keyframes character-top {
            0% { opacity: 0; top: -100px; }
            20% { opacity: 0.8; top: 20%; }
            80% { opacity: 0.8; top: 20%; }
            100% { opacity: 0; top: -100px; }
          }
          
          @keyframes character-bottom {
            0% { opacity: 0; bottom: -100px; }
            20% { opacity: 0.8; bottom: 20%; }
            80% { opacity: 0.8; bottom: 20%; }
            100% { opacity: 0; bottom: -100px; }
          }
        `}
      </style>
    </div>
  );
}
