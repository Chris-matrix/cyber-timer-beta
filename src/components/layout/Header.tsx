import React from 'react';
import { cn } from '@/lib/utils';
import { useTimer } from '@/context/TimerContext';
import { BarChart3, Settings2 } from 'lucide-react';
import ThemeToggle from '@/components/theme/ThemeToggle';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  className?: string;
}

const Header = ({ className }: HeaderProps) => {
  const { state } = useTimer();
  const { completedSessions, totalTimeElapsed } = state;
  
  // Format total time elapsed to hours and minutes
  const formatTotalTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };
  
  return (
    <header className={cn('w-full py-6 px-4', className)}>
      <div className="container max-w-5xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-energon to-cybertron flex items-center justify-center text-white">
            <span className="font-bold">T</span>
          </div>
          <h1 className="text-xl font-semibold">Transformers Timer</h1>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="hidden sm:flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-energon"></div>
              <span className="text-muted-foreground">
                {completedSessions} sessions
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-autobot"></div>
              <span className="text-muted-foreground">
                {formatTotalTime(totalTimeElapsed)} total
              </span>
            </div>
          </div>
          
          <ThemeToggle />
          
          <Link to="/analytics">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <span className="sr-only">Statistics</span>
            </Button>
          </Link>

          <Link to="/settings">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Settings2 className="h-5 w-5 text-muted-foreground" />
              <span className="sr-only">Settings</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
