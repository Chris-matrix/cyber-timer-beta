import React, { useState } from 'react';
import { useTimer } from '../context/TimerContext';
import { Button } from './ui/button';

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
  unlockedAt?: Date;
}

interface Quote {
  id: string;
  text: string;
  character: string;
  faction: string;
  unlocked: boolean;
}

export default function AchievementsAndQuotes() {
  const { state, updatePreference } = useTimer();
  const [activeTab, setActiveTab] = useState<'achievements' | 'quotes'>('achievements');
  
  // Get achievements and quotes from state or use defaults
  const achievements: Achievement[] = state.achievements?.map(achievement => ({
    id: achievement.id,
    title: achievement.name,
    description: achievement.description,
    unlocked: achievement.unlocked,
    icon: achievement.icon,
    unlockedAt: achievement.date ? new Date(achievement.date) : undefined
  })) || [
    {
      id: 'first_focus',
      title: 'First Focus',
      description: 'Complete your first focus session',
      unlocked: false,
      icon: '🔥'
    },
    {
      id: 'three_in_a_row',
      title: 'Triple Threat',
      description: 'Complete 3 focus sessions in a row',
      unlocked: false,
      icon: '🔄'
    },
    {
      id: 'daily_five',
      title: 'Daily Five',
      description: 'Complete 5 focus sessions in a day',
      unlocked: false,
      icon: '📅'
    },
    {
      id: 'week_streak',
      title: 'Weekly Warrior',
      description: 'Use the timer every day for a week',
      unlocked: false,
      icon: '📊'
    },
    {
      id: 'faction_loyal',
      title: 'Faction Loyalty',
      description: 'Use the same faction for 10 sessions',
      unlocked: false,
      icon: '🛡️'
    }
  ];
  
  const quotes: Quote[] = state.quotes || [
    {
      id: 'optimus_1',
      text: 'Freedom is the right of all sentient beings.',
      character: 'Optimus Prime',
      faction: 'autobots',
      unlocked: true
    },
    {
      id: 'megatron_1',
      text: 'Peace through tyranny!',
      character: 'Megatron',
      faction: 'decepticons',
      unlocked: true
    },
    {
      id: 'bumblebee_1',
      text: "I may be small, but I'm mighty!",
      character: 'Bumblebee',
      faction: 'autobots',
      unlocked: true
    },
    {
      id: 'starscream_1',
      text: 'Decepticons, transform and rise up!',
      character: 'Starscream',
      faction: 'decepticons',
      unlocked: true
    },
    {
      id: 'optimalprimal_1',
      text: 'Sometimes crazy works.',
      character: 'Optimal Primal',
      faction: 'maximals',
      unlocked: false
    },
    {
      id: 'megatron2_1',
      text: 'Yesss...',
      character: 'Megatron',
      faction: 'predacons',
      unlocked: false
    },
    {
      id: 'jazz_1',
      text: "Do it with style or don't do it at all.",
      character: 'Jazz',
      faction: 'autobots',
      unlocked: false
    },
    {
      id: 'soundwave_1',
      text: 'Soundwave superior, Autobots inferior.',
      character: 'Soundwave',
      faction: 'decepticons',
      unlocked: false
    },
    {
      id: 'cheetor_1',
      text: 'Time for this cat to pounce!',
      character: 'Cheetor',
      faction: 'maximals',
      unlocked: false
    },
    {
      id: 'waspinator_1',
      text: 'Why universe hate Waspinator?',
      character: 'Waspinator',
      faction: 'predacons',
      unlocked: false
    }
  ];
  
  // Toggle random quote display
  const toggleRandomQuotes = () => {
    updatePreference('randomQuotes', !state.preferences.randomQuotes);
  };
  
  // Get faction color
  const getFactionColor = (faction: string) => {
    switch (faction) {
      case 'autobots':
        return '#3b82f6'; // Blue
      case 'decepticons':
        return '#9333ea'; // Purple
      case 'maximals':
        return '#16a34a'; // Green
      case 'predacons':
        return '#b91c1c'; // Red
      default:
        return '#3b82f6';
    }
  };
  
  return (
    <div style={{ 
      backgroundColor: '#1a1a1a', 
      borderRadius: '0.5rem',
      overflow: 'hidden',
      border: '1px solid #333'
    }}>
      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #333'
      }}>
        <button
          onClick={() => setActiveTab('achievements')}
          style={{
            flex: 1,
            padding: '0.75rem',
            backgroundColor: activeTab === 'achievements' ? '#2a2a2a' : 'transparent',
            borderBottom: activeTab === 'achievements' ? `2px solid ${getFactionColor(state.preferences.faction || 'autobots')}` : 'none',
            color: 'white',
            fontWeight: activeTab === 'achievements' ? 'bold' : 'normal',
            cursor: 'pointer',
            border: 'none'
          }}
        >
          Achievements
        </button>
        <button
          onClick={() => setActiveTab('quotes')}
          style={{
            flex: 1,
            padding: '0.75rem',
            backgroundColor: activeTab === 'quotes' ? '#2a2a2a' : 'transparent',
            borderBottom: activeTab === 'quotes' ? `2px solid ${getFactionColor(state.preferences.faction || 'autobots')}` : 'none',
            color: 'white',
            fontWeight: activeTab === 'quotes' ? 'bold' : 'normal',
            cursor: 'pointer',
            border: 'none'
          }}
        >
          Quotes
        </button>
      </div>
      
      {/* Content */}
      <div style={{ padding: '1rem' }}>
        {activeTab === 'achievements' ? (
          <div>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              Your Achievements
            </h3>
            
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              {achievements.map(achievement => (
                <div
                  key={achievement.id}
                  style={{
                    backgroundColor: achievement.unlocked ? '#2a2a2a' : '#222',
                    borderRadius: '0.375rem',
                    padding: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    opacity: achievement.unlocked ? 1 : 0.6,
                    border: achievement.unlocked ? `1px solid ${getFactionColor(state.preferences.faction || 'autobots')}` : '1px solid #333'
                  }}
                >
                  <div style={{ 
                    fontSize: '1.5rem',
                    marginRight: '0.75rem',
                    width: '2.5rem',
                    height: '2.5rem',
                    backgroundColor: achievement.unlocked ? getFactionColor(state.preferences.faction || 'autobots') : '#333',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {achievement.icon}
                  </div>
                  <div>
                    <div style={{ 
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      marginBottom: '0.25rem'
                    }}>
                      {achievement.title}
                    </div>
                    <div style={{ 
                      fontSize: '0.875rem',
                      opacity: 0.8
                    }}>
                      {achievement.description}
                    </div>
                    {achievement.unlocked && achievement.unlockedAt && (
                      <div style={{ 
                        fontSize: '0.75rem',
                        opacity: 0.6,
                        marginTop: '0.25rem'
                      }}>
                        Unlocked on {achievement.unlockedAt.toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: 'bold'
              }}>
                Quotes Collection
              </h3>
              
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ fontSize: '0.875rem' }}>Random Quotes</span>
                <button
                  onClick={toggleRandomQuotes}
                  style={{
                    width: '2.5rem',
                    height: '1.25rem',
                    backgroundColor: state.preferences.randomQuotes ? getFactionColor(state.preferences.faction || 'autobots') : '#333',
                    borderRadius: '9999px',
                    position: 'relative',
                    transition: 'background-color 0.2s',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: '0.125rem',
                      left: state.preferences.randomQuotes ? 'calc(100% - 1rem)' : '0.125rem',
                      width: '1rem',
                      height: '1rem',
                      backgroundColor: 'white',
                      borderRadius: '9999px',
                      transition: 'left 0.2s'
                    }}
                  />
                </button>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              {quotes.map(quote => (
                <div
                  key={quote.id}
                  style={{
                    backgroundColor: quote.unlocked ? '#2a2a2a' : '#222',
                    borderRadius: '0.375rem',
                    padding: '0.75rem',
                    opacity: quote.unlocked ? 1 : 0.6,
                    border: quote.unlocked ? `1px solid ${getFactionColor(quote.faction)}` : '1px solid #333'
                  }}
                >
                  {quote.unlocked ? (
                    <>
                      <div style={{ 
                        fontSize: '1rem',
                        fontStyle: 'italic',
                        marginBottom: '0.5rem',
                        position: 'relative',
                        paddingLeft: '1.5rem'
                      }}>
                        <span style={{ 
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          fontSize: '1.5rem',
                          color: getFactionColor(quote.faction),
                          lineHeight: 1
                        }}>"</span>
                        {quote.text}
                      </div>
                      <div style={{ 
                        fontSize: '0.875rem',
                        textAlign: 'right',
                        color: getFactionColor(quote.faction),
                        fontWeight: 'bold'
                      }}>
                        — {quote.character}
                      </div>
                    </>
                  ) : (
                    <div style={{ 
                      padding: '1rem 0.5rem',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>🔒</div>
                      <div>Quote locked</div>
                      <div style={{ 
                        fontSize: '0.75rem',
                        opacity: 0.6,
                        marginTop: '0.25rem'
                      }}>
                        Keep using the timer to unlock more quotes
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
