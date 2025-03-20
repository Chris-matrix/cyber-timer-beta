import React from 'react';
import { useTimer } from '../../context/TimerContext';
import { Card, CardContent, CardHeader } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, Trophy, Flame } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: string;
}

const StatCard = ({ icon, label, value, color = "bg-primary" }: StatCardProps) => (
  <Card className="bg-card text-card-foreground">
    <CardContent className="p-6">
      <div className="flex items-center gap-4">
        <div className={cn("p-2 rounded-full", color)}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const AnalyticsDisplay = () => {
  const { state } = useTimer();

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-background text-foreground">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }
  
  // Format time helper function
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Get the last 7 days of stats
  const weeklyStats = state.stats.weeklyStats
    .slice(-7)
    .map(stat => ({
      day: new Date(stat.date).toLocaleDateString('en-US', { weekday: 'short' }),
      minutes: Math.round(stat.focusTime / 60),
      sessions: stat.sessions
    }));

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={<Trophy className="h-5 w-5 text-primary-foreground" />} 
          label="Sessions Completed" 
          value={state.stats.sessionsCompleted.toString()}
        />
        
        <StatCard 
          icon={<Clock className="h-5 w-5 text-primary-foreground" />} 
          label="Total Focus Time" 
          value={formatTime(state.stats.totalFocusTime)}
        />
        
        <StatCard 
          icon={<Flame className="h-5 w-5 text-primary-foreground" />} 
          label="Current Streak" 
          value={`${state.stats.currentStreak} days`}
        />
      </div>
      
      {/* Chart */}
      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <h3 className="text-lg font-semibold">Weekly Focus Activity</h3>
        </CardHeader>
        <CardContent className="h-[300px]">
          {weeklyStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyStats} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="day" 
                  stroke="hsl(var(--foreground))"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <YAxis 
                  stroke="hsl(var(--foreground))"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    color: 'hsl(var(--foreground))',
                    borderRadius: '0.5rem',
                  }}
                />
                <Bar
                  dataKey="minutes"
                  fill="hsl(var(--primary))"
                  name="Focus Minutes"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">No data available yet. Complete some focus sessions to see your stats!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDisplay;
