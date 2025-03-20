
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number; // 0 to 1
  colorClass?: string;
  thickness?: 'thin' | 'medium' | 'thick';
  animated?: boolean;
}

const ProgressBar = ({
  progress,
  colorClass = 'bg-energon',
  thickness = 'medium',
  animated = true,
}: ProgressBarProps) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  // Thickness classes
  const thicknessClasses = {
    thin: 'h-1',
    medium: 'h-2',
    thick: 'h-3',
  };
  
  // Animate the progress
  useEffect(() => {
    // Smooth animation for progress changes
    const rafId = requestAnimationFrame(() => {
      setAnimatedProgress(progress);
    });
    
    return () => cancelAnimationFrame(rafId);
  }, [progress]);
  
  return (
    <div className="w-full bg-muted rounded-full overflow-hidden">
      <div
        className={cn(
          'transition-all duration-300 ease-out rounded-full',
          thicknessClasses[thickness],
          colorClass,
          animated && 'animate-pulse-glow'
        )}
        style={{ width: `${animatedProgress * 100}%` }}
      />
    </div>
  );
};

export default ProgressBar;
