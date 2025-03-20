import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Timer, BarChart2, Settings, Play, Pause, RefreshCw } from 'lucide-react';
import { useTimer } from '../context/TimerContext';
import { toast } from 'sonner';

const meditations = [
  {
    id: 'mindful-breathing',
    title: 'Mindful Breathing',
    description: 'Focus on your breath to calm your mind and reduce stress.',
    duration: 300, // 5 minutes in seconds
    instructions: [
      'Find a comfortable position',
      'Close your eyes',
      'Focus on your natural breath',
      'When your mind wanders, gently return to the breath'
    ]
  },
  {
    id: 'body-scan',
    title: 'Body Scan',
    description: 'Progressively relax your body from head to toe.',
    duration: 600, // 10 minutes in seconds
    instructions: [
      'Lie down comfortably',
      'Start focusing on your toes',
      'Gradually move attention up through your body',
      'Release tension in each area'
    ]
  },
  {
    id: 'guided-visualization',
    title: 'Guided Visualization',
    description: 'Journey through a peaceful mental landscape.',
    duration: 900, // 15 minutes in seconds
    instructions: [
      'Close your eyes and relax',
      'Imagine a peaceful place',
      'Engage all your senses',
      'Stay present in this space'
    ]
  }
];

export default function Meditation() {
  const navigate = useNavigate();
  const { state } = useTimer();
  const [selectedMeditation, setSelectedMeditation] = useState<typeof meditations[0] | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            toast.success('Meditation session complete');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeRemaining]);

  const startMeditation = (meditation: typeof meditations[0]) => {
    setSelectedMeditation(meditation);
    setTimeRemaining(meditation.duration);
    setIsRunning(true);
    toast.info(`Starting ${meditation.title}`);
  };

  const togglePause = () => {
    setIsRunning(prev => !prev);
    toast.info(isRunning ? 'Meditation paused' : 'Meditation resumed');
  };

  const resetMeditation = () => {
    if (selectedMeditation) {
      setTimeRemaining(selectedMeditation.duration);
      setIsRunning(false);
      toast.info('Meditation reset');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Meditation</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate('/analytics')}>
            <BarChart2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => navigate('/settings')}>
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => navigate('/')}>
            <Timer className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {selectedMeditation ? (
        <Card>
          <CardHeader>
            <CardTitle>{selectedMeditation.title}</CardTitle>
            <p className="text-lg font-mono">{formatTime(timeRemaining)}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                {selectedMeditation.instructions.map((instruction, index) => (
                  <p key={index} className="text-muted-foreground">
                    {index + 1}. {instruction}
                  </p>
                ))}
              </div>
              <div className="flex justify-center gap-4">
                <Button onClick={togglePause}>
                  {isRunning ? <Pause className="mr-2" /> : <Play className="mr-2" />}
                  {isRunning ? 'Pause' : 'Resume'}
                </Button>
                <Button variant="outline" onClick={resetMeditation}>
                  <RefreshCw className="mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {meditations.map(meditation => (
            <Card key={meditation.id} className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => startMeditation(meditation)}>
              <CardHeader>
                <CardTitle>{meditation.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{meditation.description}</p>
                <p className="mt-2 text-sm">Duration: {formatTime(meditation.duration)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
