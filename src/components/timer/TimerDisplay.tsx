
import React, { useEffect, useRef } from 'react';
import { useTimer } from '@/context/TimerContext';
import { cn } from '@/lib/utils';
import ProgressBar from './ProgressBar';

interface TimerDisplayProps {
  className?: string;
}

const TimerDisplay = ({ className }: TimerDisplayProps) => {
  const { state, formatTime } = useTimer();
  const { timeRemaining, duration, isRunning, isComplete, activePreset } = state;
  
  // Calculate progress percentage (1 to 0)
  const progress = timeRemaining / duration;
  
  // Ref for the timer display to apply animations
  const timerRef = useRef<HTMLDivElement>(null);
  
  // Apply animations on state changes
  useEffect(() => {
    const element = timerRef.current;
    if (!element) return;
    
    if (isComplete) {
      element.classList.add('animate-pulse');
    } else {
      element.classList.remove('animate-pulse');
    }
    
    // Add a small bounce animation when starting/pausing
    element.classList.add('scale-105');
    setTimeout(() => {
      element.classList.remove('scale-105');
    }, 200);
    
  }, [isRunning, isComplete]);
  
  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div 
        ref={timerRef}
        className="mb-6 transition-all duration-300 ease-out"
      >
        <h1 className="text-8xl font-light tracking-tighter">
          {formatTime(timeRemaining)}
        </h1>
      </div>
      
      {activePreset && (
        <div className="mb-4 animate-fade-in">
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-muted/80">
            {activePreset.name}
          </span>
        </div>
      )}
      
      <div className="w-full max-w-md mb-8">
        <ProgressBar 
          progress={progress}
          colorClass={activePreset?.color || 'bg-energon'}
          thickness="medium"
          animated={isRunning}
        />
      </div>
      
      <div className="text-sm text-muted-foreground">
        {isRunning ? 'Focus in progress...' : 
         isComplete ? 'Session complete!' : 'Ready to start'}
      </div>
    </div>
  );
};

export default TimerDisplay;
