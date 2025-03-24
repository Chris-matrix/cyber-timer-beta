import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimer } from '../context/TimerContext';
import { playNotificationSound } from '../lib/audio';
import { useNotification } from '../components/ui/notification';

// Define faction data
const factionData = {
  autobots: {
    name: 'Autobots',
    description: 'Freedom is the right of all sentient beings.',
    color: '#3b82f6', // Blue
    logo: '/assets/images/autobots-logo.png',
    characters: [
      { id: 'optimus', name: 'Optimus Prime', icon: '🚛', quote: 'Freedom is the right of all sentient beings.' },
      { id: 'bumblebee', name: 'Bumblebee', icon: '🐝', quote: "I may be small, but I'm mighty!" },
      { id: 'jazz', name: 'Jazz', icon: '🎷', quote: "Do it with style or don't do it at all." },
      { id: 'ironhide', name: 'Ironhide', icon: '💪', quote: "I'm just itching to unleash some firepower." }
    ]
  },
  decepticons: {
    name: 'Decepticons',
    description: 'Peace through tyranny!',
    color: '#9333ea', // Purple
    logo: '/assets/images/decepticons-logo.png',
    characters: [
      { id: 'megatron', name: 'Megatron', icon: '🔫', quote: 'Peace through tyranny!' },
      { id: 'starscream', name: 'Starscream', icon: '✈️', quote: 'Decepticons, transform and rise up!' },
      { id: 'soundwave', name: 'Soundwave', icon: '📻', quote: 'Soundwave superior, Autobots inferior.' },
      { id: 'shockwave', name: 'Shockwave', icon: '🔬', quote: 'The logical conclusion is your destruction.' }
    ]
  },
  maximals: {
    name: 'Maximals',
    description: 'Maximize!',
    color: '#16a34a', // Green
    logo: '/assets/images/maximals-logo.png',
    characters: [
      { id: 'optimalprimal', name: 'Optimal Primal', icon: '🦍', quote: 'Sometimes crazy works.' },
      { id: 'cheetor', name: 'Cheetor', icon: '🐆', quote: 'Time for this cat to pounce!' },
      { id: 'rattrap', name: 'Rattrap', icon: '🐀', quote: "We're all gonna die." },
      { id: 'rhinox', name: 'Rhinox', icon: '🦏', quote: 'Let the power of the Matrix light our darkest hour.' }
    ]
  },
  predacons: {
    name: 'Predacons',
    description: 'Terrorize!',
    color: '#b91c1c', // Red
    logo: '/assets/images/predacons-logo.png',
    characters: [
      { id: 'megatron2', name: 'Megatron', icon: '🦖', quote: 'Yesss...' },
      { id: 'waspinator', name: 'Waspinator', icon: '🐝', quote: 'Why universe hate Waspinator?' },
      { id: 'tarantulas', name: 'Tarantulas', icon: '🕷️', quote: 'Mwahaha! The spider spins his web!' },
      { id: 'blackarachnia', name: 'Blackarachnia', icon: '🕸️', quote: 'I have a little sting for you, my dear.' }
    ]
  }
};

// Define faction types
type FactionType = 'autobots' | 'decepticons' | 'maximals' | 'predacons';

interface LoadingPageProps {
  onFactionSelected?: () => void;
}

export default function LoadingPage({ onFactionSelected }: LoadingPageProps) {
  const navigate = useNavigate();
  const { state, updatePreference } = useTimer();
  const { showNotification } = useNotification();
  const [selectedFaction, setSelectedFaction] = useState<FactionType>(state.preferences.faction as FactionType || 'autobots');
  const [selectedCharacter, setSelectedCharacter] = useState<string>(state.preferences.character || 'optimus');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuote, setCurrentQuote] = useState('');

  // Check if user has already selected a faction and should skip loading screen
  useEffect(() => {
    if (state.preferences.faction && state.preferences.character) {
      setSelectedFaction(state.preferences.faction as FactionType);
      setSelectedCharacter(state.preferences.character);
      
      // If user is returning to the loading page but already has a faction, redirect to timer
      if (window.location.pathname === '/loading' && !isLoading) {
        navigate('/timer');
      }
    }
  }, [state.preferences.faction, state.preferences.character, navigate, isLoading]);

  // Set initial character quote when faction changes
  useEffect(() => {
    if (selectedFaction && selectedCharacter) {
      const character = factionData[selectedFaction].characters.find(c => c.id === selectedCharacter);
      if (character) {
        setCurrentQuote(character.quote);
      }
    }
  }, [selectedFaction, selectedCharacter]);

  // Handle faction selection
  const handleFactionSelect = (faction: FactionType) => {
    setSelectedFaction(faction);
    // Default to first character of the faction
    const defaultCharacter = factionData[faction].characters[0].id;
    setSelectedCharacter(defaultCharacter);
    
    // Play transform sound
    if (state.preferences.soundEnabled) {
      playNotificationSound('transform', faction);
    }
  };

  // Handle character selection
  const handleCharacterSelect = (characterId: string) => {
    setSelectedCharacter(characterId);
    
    // Find character quote
    const character = factionData[selectedFaction].characters.find(c => c.id === characterId);
    if (character) {
      setCurrentQuote(character.quote);
    }
  };

  // Start loading process
  const startLoading = () => {
    setIsLoading(true);
    
    // Save preferences
    updatePreference('faction', selectedFaction);
    updatePreference('character', selectedCharacter);
    
    // Simulate loading process with more realistic progression
    let progress = 0;
    const interval = setInterval(() => {
      // Create a more realistic loading progression
      const increment = Math.max(1, Math.floor((100 - progress) / 10));
      progress += increment;
      
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Show welcome notification
        showNotification({
          title: 'Welcome to Transformers Timer',
          message: `You've joined the ${factionData[selectedFaction].name}. Ready to focus!`,
          type: 'success',
          duration: 5000 // 5 seconds
        });
        
        // Notify parent component that faction has been selected
        if (onFactionSelected) {
          onFactionSelected();
        }
        
        // Navigate to timer after a short delay
        setTimeout(() => {
          navigate('/timer');
        }, 1000);
      }
      setLoadingProgress(progress);
    }, 200); // Faster updates for smoother animation
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#121212',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      color: 'white'
    }}>
      {!isLoading ? (
        <>
          <h1 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '2rem',
            textAlign: 'center',
            color: factionData[selectedFaction].color
          }}>
            Choose Your Faction
          </h1>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            width: '100%',
            maxWidth: '1000px',
            marginBottom: '3rem'
          }}>
            {Object.entries(factionData).map(([factionId, faction]) => (
              <div
                key={factionId}
                onClick={() => handleFactionSelect(factionId as FactionType)}
                style={{
                  backgroundColor: selectedFaction === factionId ? '#2a2a2a' : '#1a1a1a',
                  borderRadius: '0.5rem',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: selectedFaction === factionId 
                    ? `2px solid ${faction.color}` 
                    : '2px solid transparent',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center'
                }}
              >
                <div style={{
                  width: '100px',
                  height: '100px',
                  backgroundColor: faction.color,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  fontSize: '3rem',
                  backgroundImage: faction.logo ? `url(${faction.logo})` : 'none',
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  boxShadow: `0 0 15px ${faction.color}80`
                }}>
                  {!faction.logo && faction.name.charAt(0)}
                </div>
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  marginBottom: '0.5rem',
                  color: faction.color
                }}>
                  {faction.name}
                </h3>
                <p style={{ opacity: 0.8 }}>{faction.description}</p>
              </div>
            ))}
          </div>
          
          <h2 style={{ 
            fontSize: '2rem', 
            marginBottom: '1.5rem',
            textAlign: 'center',
            color: factionData[selectedFaction].color
          }}>
            Choose Your Character
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            width: '100%',
            maxWidth: '800px',
            marginBottom: '3rem'
          }}>
            {factionData[selectedFaction].characters.map(character => (
              <div
                key={character.id}
                onClick={() => handleCharacterSelect(character.id)}
                style={{
                  backgroundColor: selectedCharacter === character.id ? '#2a2a2a' : '#1a1a1a',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: selectedCharacter === character.id 
                    ? `2px solid ${factionData[selectedFaction].color}` 
                    : '2px solid transparent',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center'
                }}
              >
                <div style={{
                  fontSize: '2.5rem',
                  marginBottom: '0.5rem'
                }}>
                  {character.icon}
                </div>
                <h4 style={{ 
                  fontSize: '1.25rem',
                  marginBottom: '0.25rem',
                  color: factionData[selectedFaction].color
                }}>
                  {character.name}
                </h4>
              </div>
            ))}
          </div>
          
          <button
            onClick={startLoading}
            style={{
              backgroundColor: factionData[selectedFaction].color,
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              padding: '0.75rem 1.5rem',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            Transform and Roll Out!
          </button>
        </>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '600px'
        }}>
          <h2 style={{ 
            fontSize: '2rem', 
            marginBottom: '1rem',
            color: factionData[selectedFaction].color
          }}>
            Transforming...
          </h2>
          
          <div style={{
            width: '100%',
            height: '20px',
            backgroundColor: '#2a2a2a',
            borderRadius: '9999px',
            overflow: 'hidden',
            marginBottom: '2rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
          }}>
            <div
              style={{
                height: '100%',
                width: `${loadingProgress}%`,
                backgroundColor: factionData[selectedFaction].color,
                transition: 'width 0.3s ease',
                backgroundImage: `linear-gradient(90deg, ${factionData[selectedFaction].color} 0%, ${factionData[selectedFaction].color}99 50%, ${factionData[selectedFaction].color} 100%)`,
                backgroundSize: '200% 100%',
                animation: 'pulse 1.5s infinite linear'
              }}
            />
          </div>
          
          <style>
            {`
            @keyframes pulse {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
            `}
          </style>
          
          <div style={{
            fontSize: '1.5rem',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            {Math.round(loadingProgress)}%
          </div>
          
          {currentQuote && (
            <div style={{
              backgroundColor: '#2a2a2a',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              marginTop: '2rem',
              position: 'relative',
              maxWidth: '500px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '1.25rem',
                fontStyle: 'italic',
                marginBottom: '1rem',
                position: 'relative',
                paddingLeft: '1.5rem',
                paddingRight: '1.5rem'
              }}>
                <span style={{ 
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  fontSize: '2rem',
                  color: factionData[selectedFaction].color,
                  lineHeight: 1
                }}>"</span>
                {currentQuote}
                <span style={{ 
                  position: 'absolute',
                  right: 0,
                  bottom: 0,
                  fontSize: '2rem',
                  color: factionData[selectedFaction].color,
                  lineHeight: 1
                }}>"</span>
              </div>
              
              <div style={{
                fontSize: '1rem',
                color: factionData[selectedFaction].color,
                fontWeight: 'bold'
              }}>
                — {factionData[selectedFaction].characters.find(c => c.id === selectedCharacter)?.name}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
