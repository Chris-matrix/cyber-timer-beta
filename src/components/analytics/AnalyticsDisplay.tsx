
import React from 'react';
import { useTimer } from '@/context/TimerContext';
import { Card } from '@/components/ui/card';
import { BarChart, LineChart, AreaChart, ComposedChart, Bar, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, Trophy, BarChart3, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

const AnalyticsDisplay = () => {
  const { state, getWeeklyStats, formatTime } = useTimer();
  const { completedSessions, totalTimeElapsed } = state;
  
  // Get a formatted version of elapsed time
  const formattedTotalTime = React.useMemo(() => {
    const hours = Math.floor(totalTimeElapsed / 3600);
    const minutes = Math.floor((totalTimeElapsed % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    
    return `${minutes}m`;
  }, [totalTimeElapsed]);
  
  // Get weekly stats for the chart
  const weeklyData = getWeeklyStats();
  
  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          icon={<Trophy className="h-5 w-5" />} 
          label="Sessions Completed" 
          value={completedSessions.toString()}
          color="bg-autobot" 
        />
        
        <StatCard 
          icon={<Clock className="h-5 w-5" />} 
          label="Total Focus Time" 
          value={formattedTotalTime}
          color="bg-energon" 
        />
        
        <StatCard 
          icon={<Flame className="h-5 w-5" />} 
          label="Current Streak" 
          value={`${weeklyData.length > 0 ? weeklyData.length : 0} days`}
          color="bg-cybertron" 
        />
      </div>
      
      {/* Weekly Chart */}
      {weeklyData.length > 0 ? (
        <div className="h-64 pt-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Weekly Focus Activity</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#CE6BFF" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#CE6BFF" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3E8DFF" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3E8DFF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="day" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(24, 24, 27, 0.8)', 
                  borderColor: 'rgba(63, 63, 70, 0.8)',
                  borderRadius: '6px',
                  color: 'white'
                }} 
              />
              <Area
                type="monotone"
                dataKey="minutes"
                stroke="#CE6BFF"
                yAxisId="left"
                fillOpacity={1}
                fill="url(#colorTime)"
                name="Focus Minutes"
              />
              <Area
                type="monotone"
                dataKey="sessions"
                stroke="#3E8DFF"
                yAxisId="right"
                fillOpacity={1}
                fill="url(#colorSessions)"
                name="Sessions"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center bg-muted/30 rounded-lg">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Complete sessions to see your weekly stats</p>
        </div>
      )}
      
      {/* Session Distribution */}
      <div className="pt-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Session Type Distribution</h3>
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          {completedSessions > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[
                { name: 'Pomodoro', value: Math.floor(completedSessions * 0.6) },
                { name: 'Short Focus', value: Math.floor(completedSessions * 0.3) },
                { name: 'Break', value: Math.floor(completedSessions * 0.1) },
              ]}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(24, 24, 27, 0.8)', 
                    borderColor: 'rgba(63, 63, 70, 0.8)',
                    borderRadius: '6px',
                    color: 'white'
                  }} 
                />
                <Bar dataKey="value" fill="#4a4af5" name="Sessions" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 w-full flex flex-col items-center justify-center bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">No data available yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

const StatCard = ({ icon, label, value, color }: StatCardProps) => (
  <Card className="p-4 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
    <div className={cn("p-2 rounded-full mb-2", color)}>
      {icon}
    </div>
    <p className="text-sm text-muted-foreground mb-1">{label}</p>
    <p className="text-2xl font-bold">{value}</p>
  </Card>
);

export default AnalyticsDisplay;
