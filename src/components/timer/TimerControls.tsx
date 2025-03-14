
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { useTimer } from '@/context/TimerContext';
import { cn } from '@/lib/utils';

interface TimerControlsProps {
  className?: string;
}

const TimerControls = ({ className }: TimerControlsProps) => {
  const { state, startTimer, pauseTimer, resetTimer } = useTimer();
  const { isRunning, isComplete } = state;
  
  return (
    <div className={cn('flex items-center justify-center gap-4', className)}>
      {isRunning ? (
        <Button 
          onClick={pauseTimer}
          size="lg" 
          variant="outline"
          className="h-14 w-14 rounded-full border-2 hover:bg-muted/80 transition-all duration-300"
        >
          <Pause className="h-6 w-6" />
          <span className="sr-only">Pause</span>
        </Button>
      ) : (
        <Button 
          onClick={startTimer}
          size="lg" 
          className="h-14 w-14 rounded-full bg-energon hover:bg-energon/90 text-white transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <Play className="h-6 w-6 ml-0.5" />
          <span className="sr-only">Start</span>
        </Button>
      )}
      
      <Button 
        onClick={resetTimer}
        size="lg" 
        variant="outline"
        className="h-12 w-12 rounded-full border-2 hover:bg-muted/80 transition-all duration-300"
      >
        <RotateCcw className="h-5 w-5" />
        <span className="sr-only">Reset</span>
      </Button>
      
      {isComplete && (
        <Button
          onClick={() => {
            resetTimer();
            startTimer();
          }}
          size="lg"
          variant="outline"
          className="h-12 w-12 rounded-full border-2 border-autobot text-autobot hover:bg-autobot/10 transition-all duration-300 animate-pulse"
        >
          <SkipForward className="h-5 w-5" />
          <span className="sr-only">Start Next Session</span>
        </Button>
      )}
    </div>
  );
};

export default TimerControls;
