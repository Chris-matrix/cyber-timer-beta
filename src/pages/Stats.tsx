import { useState, useEffect } from 'react';
import { useTimer } from '../context/TimerContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, BarChart2, LineChart } from 'lucide-react';

// Chart types
type ChartType = 'line' | 'bar';
type TimeRange = 'daily' | 'weekly' | 'monthly' | 'yearly';

export default function Stats() {
  const { state } = useTimer();
  const [chartType, setChartType] = useState<ChartType>('line');
  const [timeRange, setTimeRange] = useState<TimeRange>('weekly');
  const [chartData, setChartData] = useState<{ label: string; value: number }[]>([]);
  const [animationActive, setAnimationActive] = useState(false);
  
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

  // Get secondary faction color
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

  // Generate chart data based on time range
  useEffect(() => {
    // Sample data generation - in a real app, this would use actual timer stats
    let data: { label: string; value: number }[] = [];
    
    switch (timeRange) {
      case 'daily':
        // Generate hourly data for today
        for (let i = 0; i < 24; i++) {
          const hour = i < 10 ? `0${i}:00` : `${i}:00`;
          data.push({
            label: hour,
            value: Math.floor(Math.random() * 60) // Random minutes per hour
          });
        }
        break;
      case 'weekly':
        // Generate daily data for the week
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        days.forEach(day => {
          data.push({
            label: day,
            value: Math.floor(Math.random() * 180) // Random minutes per day
          });
        });
        break;
      case 'monthly':
        // Generate weekly data for the month
        for (let i = 1; i <= 4; i++) {
          data.push({
            label: `Week ${i}`,
            value: Math.floor(Math.random() * 600) // Random minutes per week
          });
        }
        break;
      case 'yearly':
        // Generate monthly data for the year
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        months.forEach(month => {
          data.push({
            label: month,
            value: Math.floor(Math.random() * 2400) // Random minutes per month
          });
        });
        break;
    }
    
    setChartData(data);
    
    // Trigger faction animation when time range changes
    setAnimationActive(true);
    setTimeout(() => setAnimationActive(false), 1500);
  }, [timeRange]);

  // Calculate max value for chart scaling
  const maxValue = Math.max(...chartData.map(item => item.value)) * 1.1;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#121212',
      color: 'white',
      padding: '2rem',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <Link to="/timer" style={{
          display: 'flex',
          alignItems: 'center',
          color: 'white',
          textDecoration: 'none',
          fontSize: '1rem'
        }}>
          <ArrowLeft size={20} style={{ marginRight: '0.5rem' }} />
          Back to Timer
        </Link>
        
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          margin: 0,
          color: getFactionColor()
        }}>
          Focus Statistics
        </h1>
        
        <div style={{
          display: 'flex',
          gap: '0.5rem'
        }}>
          <button
            onClick={() => setChartType('line')}
            style={{
              backgroundColor: chartType === 'line' ? getFactionColor() : '#2a2a2a',
              border: 'none',
              borderRadius: '0.375rem',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <LineChart size={20} color="white" />
          </button>
          
          <button
            onClick={() => setChartType('bar')}
            style={{
              backgroundColor: chartType === 'bar' ? getFactionColor() : '#2a2a2a',
              border: 'none',
              borderRadius: '0.375rem',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <BarChart2 size={20} color="white" />
          </button>
        </div>
      </div>
      
      {/* Time range selector */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {(['daily', 'weekly', 'monthly', 'yearly'] as TimeRange[]).map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            style={{
              backgroundColor: timeRange === range ? getFactionColor() : '#2a2a2a',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontWeight: timeRange === range ? 'bold' : 'normal',
              textTransform: 'capitalize'
            }}
          >
            {range}
          </button>
        ))}
      </div>
      
      {/* Faction animation */}
      {animationActive && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          animation: 'transformAnimation 1.5s forwards',
          opacity: 0
        }}>
          <div style={{
            width: '200px',
            height: '200px',
            backgroundColor: getFactionColor(),
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            fontWeight: 'bold',
            color: 'white',
            boxShadow: `0 0 50px ${getFactionColor()}`
          }}>
            {state.preferences.faction?.charAt(0).toUpperCase()}
          </div>
          <style>
            {`
              @keyframes transformAnimation {
                0% { opacity: 0; transform: scale(0.2) rotate(0deg); }
                50% { opacity: 1; transform: scale(1.2) rotate(180deg); }
                100% { opacity: 0; transform: scale(0.2) rotate(360deg); }
              }
            `}
          </style>
        </div>
      )}
      
      {/* Chart */}
      <div style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        height: '400px',
        position: 'relative'
      }}>
        {/* Y-axis labels */}
        <div style={{
          position: 'absolute',
          left: '0',
          top: '0',
          bottom: '0',
          width: '50px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '1.5rem 0',
          fontSize: '0.75rem',
          color: '#888'
        }}>
          <div>{Math.round(maxValue)} min</div>
          <div>{Math.round(maxValue * 0.75)} min</div>
          <div>{Math.round(maxValue * 0.5)} min</div>
          <div>{Math.round(maxValue * 0.25)} min</div>
          <div>0 min</div>
        </div>
        
        {/* Chart grid */}
        <div style={{
          position: 'absolute',
          left: '50px',
          right: '0',
          top: '0',
          bottom: '0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '1.5rem 0'
        }}>
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              style={{
                width: '100%',
                height: '1px',
                backgroundColor: '#333'
              }}
            />
          ))}
        </div>
        
        {/* Chart content */}
        <div style={{
          position: 'absolute',
          left: '50px',
          right: '0',
          top: '0',
          bottom: '0',
          padding: '1.5rem 0 0',
          display: 'flex',
          alignItems: 'flex-end'
        }}>
          {chartType === 'bar' ? (
            // Bar chart
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-around',
              width: '100%',
              height: '100%',
              paddingBottom: '2rem'
            }}>
              {chartData.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    flex: 1
                  }}
                >
                  <div
                    style={{
                      width: '60%',
                      height: `${(item.value / maxValue) * 100}%`,
                      backgroundColor: getFactionColor(),
                      borderRadius: '0.25rem 0.25rem 0 0',
                      transition: 'height 0.5s ease',
                      position: 'relative'
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '-20px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.value} min
                    </div>
                  </div>
                  <div style={{
                    marginTop: '0.5rem',
                    fontSize: '0.75rem',
                    color: '#888'
                  }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Line chart
            <div style={{
              width: '100%',
              height: '100%',
              paddingBottom: '2rem',
              position: 'relative'
            }}>
              {/* Line */}
              <svg
                width="100%"
                height="100%"
                style={{ position: 'absolute', top: 0, left: 0 }}
              >
                <polyline
                  points={chartData.map((item, index) => {
                    const x = (index / (chartData.length - 1)) * 100;
                    const y = 100 - (item.value / maxValue) * 100;
                    return `${x}% ${y}%`;
                  }).join(' ')}
                  fill="none"
                  stroke={getFactionColor()}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* Data points */}
                {chartData.map((item, index) => {
                  const x = (index / (chartData.length - 1)) * 100;
                  const y = 100 - (item.value / maxValue) * 100;
                  return (
                    <g key={index}>
                      <circle
                        cx={`${x}%`}
                        cy={`${y}%`}
                        r="5"
                        fill={getSecondaryFactionColor()}
                        stroke={getFactionColor()}
                        strokeWidth="2"
                      />
                      <text
                        x={`${x}%`}
                        y={`${y - 10}%`}
                        textAnchor="middle"
                        fill="white"
                        fontSize="12"
                      >
                        {item.value} min
                      </text>
                    </g>
                  );
                })}
              </svg>
              
              {/* X-axis labels */}
              <div style={{
                position: 'absolute',
                bottom: '0',
                left: '0',
                right: '0',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: '#888'
              }}>
                {chartData.map((item, index) => (
                  <div key={index} style={{ textAlign: 'center' }}>
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Summary */}
      <div style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        marginTop: '2rem'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          marginBottom: '1rem',
          color: getFactionColor()
        }}>
          Summary
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem'
        }}>
          <div style={{
            backgroundColor: '#2a2a2a',
            borderRadius: '0.375rem',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '0.5rem' }}>
              Total Focus Time
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: getFactionColor() }}>
              {state.stats.totalFocusTime} min
            </div>
          </div>
          
          <div style={{
            backgroundColor: '#2a2a2a',
            borderRadius: '0.375rem',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '0.5rem' }}>
              Sessions Completed
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: getFactionColor() }}>
              {state.stats.sessionsCompleted}
            </div>
          </div>
          
          <div style={{
            backgroundColor: '#2a2a2a',
            borderRadius: '0.375rem',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '0.5rem' }}>
              Average Session
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: getFactionColor() }}>
              {state.stats.sessionsCompleted > 0 
                ? Math.round(state.stats.totalFocusTime / state.stats.sessionsCompleted) 
                : 0} min
            </div>
          </div>
          
          <div style={{
            backgroundColor: '#2a2a2a',
            borderRadius: '0.375rem',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '0.5rem' }}>
              Current Streak
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: getFactionColor() }}>
              {state.stats.currentStreak} days
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
