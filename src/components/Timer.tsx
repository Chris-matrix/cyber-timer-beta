import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimer } from '../context/TimerContext';
import { Button } from './ui/button';
import { CircularProgress } from './ui/circular-progress';
import { Settings, BarChart2, Flower2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { playNotificationSound } from '../lib/audio';
import type { TimerPreset } from '../context/TimerContext';

const QUOTES = {
  optimus: [
    "Till all are one!",
    "Freedom is the right of all sentient beings!",
    "Transform and focus!",
  ],
  bumblebee: [
    "*Energetic beeping*",
    "*Determined whirring*",
    "*Encouraging radio sounds*",
  ],
  megatron: [
    "Peace through tyranny!",
    "Victory will be mine!",
    "Decepticons forever!",
  ],
  starscream: [
    "Glory to the Decepticons!",
    "Victory is within grasp!",
    "For Cybertron!",
  ],
} as const;

export default function Timer() {
  const navigate = useNavigate();
  const { state, startTimer, pauseTimer, resetTimer, switchPreset } = useTimer();
  const { activePreset, preferences, isRunning, timeRemaining } = state;

  const getRandomQuote = (character: keyof typeof QUOTES) => {
    const quotes = QUOTES[character];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  const getProgressColor = () => {
    switch (preferences.theme) {
      case 'decepticons':
        return activePreset.id === 'focus' ? 'rgb(147, 51, 234)' : 'rgb(192, 132, 252)';
      case 'allspark':
        return activePreset.id === 'focus' ? 'rgb(234, 179, 8)' : 'rgb(250, 204, 21)';
      default: // autobots
        return activePreset.id === 'focus' ? 'rgb(59, 130, 246)' : 'rgb(147, 197, 253)';
    }
  };

  const handleStart = () => {
    startTimer();
    toast.success(`Starting ${activePreset.id} session. ${getRandomQuote(preferences.character)}`);
  };

  const handlePause = () => {
    pauseTimer();
    toast.info('Timer paused');
  };

  const handleReset = () => {
    resetTimer();
    toast.info('Timer reset');
  };

  const handleSwitchMode = () => {
    const newPreset: TimerPreset = {
      id: activePreset.id === 'focus' ? 'break' : 'focus',
      duration: activePreset.id === 'focus' ? state.presets.break : state.presets.focus
    };
    switchPreset(newPreset);
    toast.info(`Switched to ${newPreset.id} mode`);
  };

  useEffect(() => {
    if (timeRemaining === 0 && !isRunning) {
      if (preferences.soundEnabled) {
        playNotificationSound();
      }
      toast.success(`${activePreset.id.charAt(0).toUpperCase() + activePreset.id.slice(1)} session completed! ${getRandomQuote(preferences.character)}`);
    }
  }, [timeRemaining, isRunning, preferences, activePreset.id]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
      <div className="relative">
        <CircularProgress
          value={(timeRemaining / (activePreset.duration * 60)) * 100}
          size={300}
          strokeWidth={12}
          showValue={false}
          color={getProgressColor()}
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-4xl font-bold">
            {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
          </div>
          <div className="text-sm text-white/60 mt-2">
            {activePreset.id.charAt(0).toUpperCase() + activePreset.id.slice(1)} Session
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        {!isRunning ? (
          <Button onClick={handleStart} size="lg">
            Start
          </Button>
        ) : (
          <Button onClick={handlePause} size="lg" variant="secondary">
            Pause
          </Button>
        )}
        <Button onClick={handleSwitchMode} size="lg" variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Switch Mode
        </Button>
        <Button onClick={handleReset} size="lg" variant="outline">
          Reset
        </Button>
      </div>

      <div className="fixed bottom-8 right-8 flex gap-4">
        <Button onClick={() => navigate('/analytics')} variant="ghost" size="icon">
          <BarChart2 className="h-6 w-6" />
        </Button>
        <Button onClick={() => navigate('/meditation')} variant="ghost" size="icon">
          <Flower2 className="h-6 w-6" />
        </Button>
        <Button onClick={() => navigate('/settings')} variant="ghost" size="icon">
          <Settings className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
