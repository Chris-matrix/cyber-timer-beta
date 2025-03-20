
import React from 'react';
import { Button } from '@/components/ui/button';
import { useTimer, TIMER_PRESETS, TimerPreset } from '@/context/TimerContext';
import { cn } from '@/lib/utils';

interface TimerPresetsProps {
  className?: string;
}

const TimerPresets = ({ className }: TimerPresetsProps) => {
  const { state, selectPreset } = useTimer();
  
  return (
    <div className={cn('flex flex-wrap gap-2 justify-center', className)}>
      {TIMER_PRESETS.map((preset) => (
        <Button
          key={preset.id}
          variant={state.activePreset?.id === preset.id ? 'default' : 'outline'} 
          size="sm"
          onClick={() => selectPreset(preset)}
          className={cn(
            'transition-all duration-300 rounded-full px-4',
            state.activePreset?.id === preset.id ? 
              `${getActiveClasses(preset)}` : 
              'hover:bg-muted/80'
          )}
        >
          {preset.name}
        </Button>
      ))}
    </div>
  );
};

// Helper function to get active class based on preset
function getActiveClasses(preset: TimerPreset): string {
  switch(preset.id) {
    case 'pomodoro':
      return 'bg-autobot hover:bg-autobot/90 text-white';
    case 'short-focus':
      return 'bg-energon hover:bg-energon/90 text-white';
    case 'break':
      return 'bg-cybertron hover:bg-cybertron/90 text-white';
    case 'long-break':
      return 'bg-decepticon hover:bg-decepticon/90 text-white';
    default:
      return 'bg-primary hover:bg-primary/90';
  }
}

export default TimerPresets;
