import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Timer, Flower2, BarChart2, ChevronLeft, Settings as SettingsIcon, Volume2, VolumeX } from '../components/ui/icons';
import { useTimer } from '../context/TimerContext';

type PreferenceKey = 'youtubeUrl' | 'soundEnabled' | 'faction' | 'character';
type PresetKey = 'focus' | 'break';

const themes = [
  { id: 'autobots', name: 'Autobots', description: 'Freedom is the right of all sentient beings' },
  { id: 'decepticons', name: 'Decepticons', description: 'Peace through tyranny' },
  { id: 'allspark', name: 'Allspark', description: 'Ancient power of Cybertron' },
] as const;

const characters = [
  { id: 'optimus', name: 'Optimus Prime', description: 'Leader of the Autobots' },
  { id: 'bumblebee', name: 'Bumblebee', description: 'Loyal scout and warrior' },
  { id: 'megatron', name: 'Megatron', description: 'Leader of the Decepticons' },
  { id: 'starscream', name: 'Starscream', description: 'Decepticon air commander' },
] as const;

const factions = [
  { id: 'autobots', name: 'Autobots', description: 'Defenders of freedom' },
  { id: 'decepticons', name: 'Decepticons', description: 'Conquerors of worlds' },
] as const;

const achievementsData = [
  {
    id: 'first_focus',
    title: 'First Focus',
    description: 'Complete your first focus session',
    icon: '🎯',
    requirement: 1, // Number of focus sessions
    reward: 'Unlock basic customization',
  },
  {
    id: 'focus_streak',
    title: 'Focus Streak',
    description: 'Complete 3 focus sessions in a row',
    icon: '🔥',
    requirement: 3, // Consecutive focus sessions
    reward: 'Unlock advanced timer animations',
  },
  {
    id: 'time_master',
    title: 'Time Master',
    description: 'Complete a total of 10 hours of focus time',
    icon: '⏰',
    requirement: 600, // Minutes of focus
    reward: 'Unlock special faction quotes',
  },
  {
    id: 'energon_collector',
    title: 'Energon Collector',
    description: 'Collect 1000 energon points',
    icon: '💎',
    requirement: 1000, // Energon points
    reward: 'Unlock special character',
  },
  {
    id: 'allspark_finder',
    title: 'Allspark Finder',
    description: 'Find the hidden Allspark by completing 50 focus sessions',
    icon: '✨',
    requirement: 50, // Focus sessions
    reward: 'Unlock Allspark theme',
  },
  {
    id: 'cybertron_elite',
    title: 'Cybertron Elite',
    description: 'Reach a battle power of 100 in a single focus session',
    icon: '🏆',
    requirement: 100, // Battle power
    reward: 'Unlock elite faction emblem',
  },
  {
    id: 'balanced_transformer',
    title: 'Balanced Transformer',
    description: 'Complete 20 focus sessions and 20 break sessions',
    icon: '⚖️',
    requirement: 20, // Both types of sessions
    reward: 'Unlock balanced mode',
  }
];

export default function Settings() {
  const navigate = useNavigate();
  const { state, updatePreset, resetStats, updatePreference } = useTimer();
  const [focusDuration, setFocusDuration] = React.useState(state.presets.focus);
  const [breakDuration, setBreakDuration] = React.useState(state.presets.break);
  const [activeTab, setActiveTab] = React.useState<'general' | 'transformers' | 'achievements'>('general');

  // Get theme color based on faction
  const getThemeColor = () => {
    const colors: Record<string, string> = {
      autobots: '#3b82f6', // Blue
      decepticons: '#9333ea', // Purple
      allspark: '#eab308', // Gold
      dark: '#3b82f6', // Default to blue
    };
    return colors[state.preferences.theme] || colors.dark;
  };

  const handleSave = () => {
    updatePreset('focus', focusDuration);
    updatePreset('break', breakDuration);
    navigate('/');
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
      resetStats();
    }
  };

  const handleToggleSound = () => {
    updatePreference('soundEnabled', !state.preferences.soundEnabled);
  };

  const handleFactionChange = (faction: 'autobots' | 'decepticons') => {
    updatePreference('faction', faction);
    // Update theme to match faction
    updatePreference('theme', faction);
  };

  const handleCharacterChange = (character: 'optimus' | 'bumblebee' | 'megatron' | 'starscream') => {
    updatePreference('character', character);
  };

  const calculateAchievementProgress = (achievementId: string) => {
    const stats = state.stats;
    
    switch (achievementId) {
      case 'first_focus':
        return Math.min(stats.totalFocusSessions, 1);
      case 'focus_streak':
        return Math.min(stats.currentStreak, 3);
      case 'time_master':
        return Math.min(stats.totalFocusMinutes, 600);
      case 'energon_collector':
        return Math.min(stats.energonPoints || 0, 1000);
      case 'allspark_finder':
        return Math.min(stats.totalFocusSessions, 50);
      case 'cybertron_elite':
        return Math.min(stats.highestBattlePower || 0, 100);
      case 'balanced_transformer':
        return Math.min(
          Math.min(stats.totalFocusSessions, 20) + 
          Math.min(stats.totalBreakSessions, 20), 
          40
        ) / 2; // Average of both progress values
      default:
        return 0;
    }
  };
  
  const isAchievementCompleted = (achievementId: string) => {
    const progress = calculateAchievementProgress(achievementId);
    const achievement = achievementsData.find(a => a.id === achievementId);
    
    if (!achievement) return false;
    
    return progress >= achievement.requirement;
  };

  return (
    <div style={{ 
      backgroundColor: '#1a1a1a', 
      color: 'white',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '2rem'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <button 
          onClick={() => navigate('/')}
          style={{
            backgroundColor: 'transparent',
            color: 'white',
            border: 'none',
            borderRadius: '9999px',
            width: '2.5rem',
            height: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '1rem',
            cursor: 'pointer'
          }}
        >
          <ChevronLeft />
        </button>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Settings</h1>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid #333',
        marginBottom: '1.5rem'
      }}>
        <button 
          onClick={() => setActiveTab('general')}
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'transparent',
            color: activeTab === 'general' ? getThemeColor() : 'white',
            border: 'none',
            borderBottom: activeTab === 'general' ? `2px solid ${getThemeColor()}` : 'none',
            marginBottom: activeTab === 'general' ? '-1px' : '0',
            cursor: 'pointer',
            fontWeight: activeTab === 'general' ? 'bold' : 'normal'
          }}
        >
          General
        </button>
        <button 
          onClick={() => setActiveTab('transformers')}
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'transparent',
            color: activeTab === 'transformers' ? getThemeColor() : 'white',
            border: 'none',
            borderBottom: activeTab === 'transformers' ? `2px solid ${getThemeColor()}` : 'none',
            marginBottom: activeTab === 'transformers' ? '-1px' : '0',
            cursor: 'pointer',
            fontWeight: activeTab === 'transformers' ? 'bold' : 'normal'
          }}
        >
          Transformers
        </button>
        <button 
          onClick={() => setActiveTab('achievements')}
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'transparent',
            color: activeTab === 'achievements' ? getThemeColor() : 'white',
            border: 'none',
            borderBottom: activeTab === 'achievements' ? `2px solid ${getThemeColor()}` : 'none',
            marginBottom: activeTab === 'achievements' ? '-1px' : '0',
            cursor: 'pointer',
            fontWeight: activeTab === 'achievements' ? 'bold' : 'normal'
          }}
        >
          Achievements
        </button>
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Timer /> Timer Settings
            </h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Focus Duration (minutes)
              </label>
              <input 
                type="range" 
                min="1" 
                max="120" 
                value={focusDuration}
                onChange={(e) => setFocusDuration(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: getThemeColor() }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>1</span>
                <span>{focusDuration}</span>
                <span>120</span>
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Break Duration (minutes)
              </label>
              <input 
                type="range" 
                min="1" 
                max="30" 
                value={breakDuration}
                onChange={(e) => setBreakDuration(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: getThemeColor() }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>1</span>
                <span>{breakDuration}</span>
                <span>30</span>
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Sound
              </label>
              <Button 
                onClick={handleToggleSound}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: state.preferences.soundEnabled ? getThemeColor() : 'transparent',
                  color: 'white',
                  border: state.preferences.soundEnabled ? 'none' : '1px solid white',
                }}
              >
                {state.preferences.soundEnabled ? <Volume2 /> : <VolumeX />}
                {state.preferences.soundEnabled ? 'Sound On' : 'Sound Off'}
              </Button>
            </div>
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart2 /> Statistics
            </h2>
            
            <div style={{ 
              backgroundColor: '#2a2a2a',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Sessions Completed</span>
                <span>{state.stats.sessionsCompleted}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Current Streak</span>
                <span>{state.stats.currentStreak} days</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Longest Streak</span>
                <span>{state.stats.longestStreak} days</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Focus Time</span>
                <span>{Math.round(state.stats.totalFocusTime / 60)} minutes</span>
              </div>
            </div>
            
            <Button 
              onClick={handleReset}
              variant="destructive"
            >
              Reset Statistics
            </Button>
          </div>
        </div>
      )}

      {/* Transformers Settings */}
      {activeTab === 'transformers' && (
        <div>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
              Choose Your Faction
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              {factions.map(faction => (
                <button
                  key={faction.id}
                  onClick={() => handleFactionChange(faction.id as 'autobots' | 'decepticons')}
                  style={{
                    backgroundColor: state.preferences.faction === faction.id ? 
                      (faction.id === 'autobots' ? '#3b82f6' : '#9333ea') : 
                      'transparent',
                    color: 'white',
                    border: state.preferences.faction === faction.id ? 
                      'none' : 
                      '1px solid white',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {faction.name}
                  </div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                    {faction.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
              Choose Your Character
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              {characters
                .filter(char => {
                  // Filter characters based on faction
                  if (state.preferences.faction === 'autobots') {
                    return ['optimus', 'bumblebee'].includes(char.id);
                  } else {
                    return ['megatron', 'starscream'].includes(char.id);
                  }
                })
                .map(character => (
                  <button
                    key={character.id}
                    onClick={() => handleCharacterChange(character.id as any)}
                    style={{
                      backgroundColor: state.preferences.character === character.id ? 
                        getThemeColor() : 
                        'transparent',
                      color: 'white',
                      border: state.preferences.character === character.id ? 
                        'none' : 
                        '1px solid white',
                      borderRadius: '0.5rem',
                      padding: '1rem',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      {character.name}
                    </div>
                    <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                      {character.description}
                    </div>
                  </button>
                ))}
            </div>
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
              Matrix of Leadership Progress
            </h2>
            
            <div style={{ 
              backgroundColor: '#2a2a2a',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{ marginBottom: '0.5rem' }}>
                Progress: {state.stats.sessionsCompleted % 10} / 10
              </div>
              <div style={{ 
                height: '0.75rem', 
                backgroundColor: '#374151', 
                borderRadius: '9999px', 
                overflow: 'hidden',
                marginBottom: '1rem'
              }}>
                <div style={{ 
                  height: '100%', 
                  width: `${(state.stats.sessionsCompleted % 10) * 10}%`, 
                  backgroundColor: getThemeColor(),
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                Complete 10 focus sessions to earn a piece of the Matrix of Leadership
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Achievements</h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {achievementsData.map(achievement => {
              const progress = calculateAchievementProgress(achievement.id);
              const isCompleted = isAchievementCompleted(achievement.id);
              
              return (
                <div 
                  key={achievement.id}
                  style={{
                    backgroundColor: '#1a1a1a',
                    borderRadius: '0.5rem',
                    padding: '1.5rem',
                    border: isCompleted 
                      ? `2px solid ${getThemeColor()}` 
                      : '2px solid #333',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {isCompleted && (
                    <div style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '0.5rem',
                      backgroundColor: getThemeColor(),
                      color: 'white',
                      borderRadius: '9999px',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      Completed
                    </div>
                  )}
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '1rem',
                    gap: '0.75rem'
                  }}>
                    <div style={{
                      fontSize: '2rem',
                      opacity: isCompleted ? 1 : 0.5
                    }}>
                      {achievement.icon}
                    </div>
                    <div>
                      <h3 style={{ 
                        fontSize: '1.25rem', 
                        marginBottom: '0.25rem',
                        color: isCompleted ? getThemeColor() : 'white'
                      }}>
                        {achievement.title}
                      </h3>
                      <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ 
                      width: '100%',
                      height: '8px',
                      backgroundColor: '#2a2a2a',
                      borderRadius: '9999px',
                      overflow: 'hidden',
                      marginBottom: '0.5rem'
                    }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${(progress / achievement.requirement) * 100}%`,
                          backgroundColor: isCompleted ? getThemeColor() : '#666',
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      fontSize: '0.75rem',
                      opacity: 0.7
                    }}>
                      <span>Progress</span>
                      <span>{progress} / {achievement.requirement}</span>
                    </div>
                  </div>
                  
                  <div style={{
                    backgroundColor: '#2a2a2a',
                    borderRadius: '0.375rem',
                    padding: '0.75rem',
                    fontSize: '0.875rem'
                  }}>
                    <strong>Reward:</strong> {achievement.reward}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ 
        marginTop: 'auto', 
        display: 'flex', 
        justifyContent: 'flex-end',
        gap: '1rem',
        paddingTop: '2rem'
      }}>
        <Button 
          variant="outline"
          onClick={() => navigate('/')}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
