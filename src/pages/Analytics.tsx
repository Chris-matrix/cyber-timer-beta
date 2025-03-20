import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Timer, Flower2, Settings } from 'lucide-react';
import { useTimer } from '../context/TimerContext';
import { formatTime } from '../lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { StatEntry } from '../context/TimerContext';

export default function Analytics() {
  const navigate = useNavigate();
  const { state } = useTimer();

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Format data for the chart - show last 7 days
  const chartData = state.stats.weeklyStats
    .slice(-7)
    .map((stat: StatEntry) => ({
      name: new Date(stat.date).toLocaleDateString('en-US', { weekday: 'short' }),
      sessions: stat.sessions,
      minutes: Math.round(stat.focusTime / 60),
    }));

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold">Analytics</h1>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => navigate('/meditation')}>
                <Flower2 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <Timer className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 container mx-auto py-6 px-4">
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg border border-border bg-card text-card-foreground shadow-sm">
              <h3 className="text-sm font-medium text-muted-foreground">Total Sessions</h3>
              <p className="text-3xl font-bold mt-2">{state.stats.sessionsCompleted}</p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card text-card-foreground shadow-sm">
              <h3 className="text-sm font-medium text-muted-foreground">Total Focus Time</h3>
              <p className="text-3xl font-bold mt-2">{formatTime(state.stats.totalFocusTime)}</p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card text-card-foreground shadow-sm">
              <h3 className="text-sm font-medium text-muted-foreground">Current Streak</h3>
              <p className="text-3xl font-bold mt-2">{state.stats.currentStreak} days</p>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card text-card-foreground p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-6">Weekly Activity</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
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
                      border: '1px solid hsl(var(--border))',
                      color: 'hsl(var(--foreground))',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Bar 
                    dataKey="minutes" 
                    fill="hsl(var(--primary))" 
                    name="Minutes" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
