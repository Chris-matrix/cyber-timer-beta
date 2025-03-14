
import React, { useEffect } from 'react';
import Header from '@/components/layout/Header';
import TimerDisplay from '@/components/timer/TimerDisplay';
import TimerControls from '@/components/timer/TimerControls';
import TimerPresets from '@/components/timer/TimerPresets';
import AnalyticsLink from '@/components/analytics/AnalyticsLink';
import { useTimer } from '@/context/TimerContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Timer, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { state } = useTimer();
  const { completedSessions } = state;
  
  // Set document title with timer
  useEffect(() => {
    const formatTitle = () => {
      if (state.isRunning && state.timeRemaining > 0) {
        const minutes = Math.floor(state.timeRemaining / 60);
        const seconds = state.timeRemaining % 60;
        const time = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        return `${time} - Transformers Timer`;
      }
      return 'Transformers Timer';
    };
    
    document.title = formatTitle();
    
    const interval = state.isRunning ? setInterval(() => {
      document.title = formatTitle();
    }, 1000) : null;
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.isRunning, state.timeRemaining]);
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/50">
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-3xl mx-auto">
          {/* Chip above title */}
          <div className="flex justify-between mb-4 animate-slide-up stagger-1">
            <Badge variant="outline" className="px-3 py-1 bg-muted/50 backdrop-blur-sm">
              <Sparkles className="h-3 w-3 mr-1" />
              <span>Rise of Productivity</span>
            </Badge>
            
            {/* Analytics link */}
            <AnalyticsLink className="animate-pulse" />
          </div>
          
          {/* Main Timer Card */}
          <Card className="timer-card p-8 mb-8 animate-slide-up stagger-2">
            <TimerDisplay className="mb-10" />
            <TimerControls className="mb-8" />
            <TimerPresets />
          </Card>
          
          {/* Stats Card - Only show if sessions > 0 */}
          {completedSessions > 0 && (
            <Card className="timer-card p-6 animate-slide-up stagger-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Today's Progress</h3>
                <Timer className="h-4 w-4 text-muted-foreground" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-semibold">{completedSessions} sessions</p>
                </div>
                
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">Focus Time</p>
                  <p className="text-2xl font-semibold">
                    {Math.floor(state.totalTimeElapsed / 60)} mins
                  </p>
                </div>
              </div>
              
              {/* Link to Analytics - enhanced with a clearer button */}
              <Link 
                to="/analytics" 
                className="w-full flex items-center justify-between p-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
              >
                <span className="font-medium">View detailed analytics</span>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Card>
          )}

          {/* Show analytics link even if no sessions yet */}
          {completedSessions === 0 && (
            <div className="mt-4 text-center">
              <p className="text-muted-foreground mb-2">Complete a session to see your stats</p>
              <Link to="/analytics">
                <Button variant="outline" className="mt-2">
                  <Timer className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>Transformers Timer &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default Index;
