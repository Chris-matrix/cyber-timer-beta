import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Timer, Flower2, BarChart2 } from 'lucide-react';
import { useTimer } from '../context/TimerContext';

type PreferenceKey = 'youtubeUrl' | 'soundEnabled' | 'faction' | 'character';
type PresetKey = 'focus' | 'break';

const themes = [
  { id: 'autobots', name: 'Autobots', description: 'Freedom is the right of all sentient beings' },
  { id: 'decepticons', name: 'Decepticons', description: 'Peace through tyranny' },
  { id: 'allspark', name: 'Allspark', description: 'Ancient power of Cybertron' },
] as const;

const characters = [
  { id: 'optimus', name: 'Optimus Prime', description: 'Leader of the Autobots' },
  { id: 'bumblebee', name: 'Bumblebee', description: 'Loyal scout and warrior' },
  { id: 'megatron', name: 'Megatron', description: 'Leader of the Decepticons' },
  { id: 'starscream', name: 'Starscream', description: 'Decepticon air commander' },
] as const;

const factions = [
  { id: 'autobots', name: 'Autobots', description: 'Defenders of freedom' },
  { id: 'decepticons', name: 'Decepticons', description: 'Conquerors of worlds' },
] as const;

export default function Settings() {
  const navigate = useNavigate();
  const { state, updatePreset, resetStats, updatePreference } = useTimer();
  const [focusDuration, setFocusDuration] = React.useState(state.presets.focus / 60);
  const [breakDuration, setBreakDuration] = React.useState(state.presets.break / 60);
  const [youtubeUrl, setYoutubeUrl] = React.useState(state.preferences.youtubeUrl || '');

  const handleFocusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value > 0) {
      setFocusDuration(value);
      updatePreset('focus', value * 60);
    }
  };

  const handleBreakChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value > 0) {
      setBreakDuration(value);
      updatePreset('break', value * 60);
    }
  };

  const handleSoundToggle = () => {
    updatePreference('soundEnabled', !state.preferences.soundEnabled);
  };

  const handleYoutubeUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    setYoutubeUrl(url);
    updatePreference('youtubeUrl', url);
  };

  const handlePreferenceChange = (key: PreferenceKey, value: any) => {
    updatePreference(key, value);
  };

  const handlePresetChange = (key: PresetKey, value: number) => {
    updatePreset(key, value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
      <nav className="fixed top-0 left-0 right-0 border-b border-white/10 bg-black/40 backdrop-blur-lg z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-lg font-semibold">
              {state.preferences.faction === 'autobots' ? 'Autobots' : 'Decepticons'} Timer
            </h1>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-white/80 hover:text-white hover:bg-white/10"
                onClick={() => navigate('/')}
              >
                <Timer className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white/80 hover:text-white hover:bg-white/10"
                onClick={() => navigate('/meditation')}
              >
                <Flower2 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white/80 hover:text-white hover:bg-white/10"
                onClick={() => navigate('/analytics')}
              >
                <BarChart2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4">
        <div className="min-h-screen pt-24 pb-8">
          <h1 className="text-3xl font-bold mb-8">Settings</h1>
          
          <div className="space-y-8 max-w-2xl">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold mb-4">Faction</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handlePreferenceChange('faction', 'autobots')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    state.preferences.faction === 'autobots'
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-white/10 hover:border-blue-500/50'
                  }`}
                >
                  <h3 className="text-xl font-bold mb-2">Autobots</h3>
                  <p className="text-sm text-white/60">Freedom is the right of all sentient beings</p>
                </button>
                <button
                  onClick={() => handlePreferenceChange('faction', 'decepticons')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    state.preferences.faction === 'decepticons'
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-white/10 hover:border-purple-500/50'
                  }`}
                >
                  <h3 className="text-xl font-bold mb-2">Decepticons</h3>
                  <p className="text-sm text-white/60">Peace through tyranny</p>
                </button>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold mb-4">Character</h2>
              <div className="grid grid-cols-2 gap-4">
                {state.preferences.faction === 'autobots' ? (
                  <>
                    <button
                      onClick={() => handlePreferenceChange('character', 'optimus')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        state.preferences.character === 'optimus'
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-white/10 hover:border-blue-500/50'
                      }`}
                    >
                      <h3 className="text-xl font-bold mb-2">Optimus Prime</h3>
                      <p className="text-sm text-white/60">Leader of the Autobots</p>
                    </button>
                    <button
                      onClick={() => handlePreferenceChange('character', 'bumblebee')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        state.preferences.character === 'bumblebee'
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-white/10 hover:border-blue-500/50'
                      }`}
                    >
                      <h3 className="text-xl font-bold mb-2">Bumblebee</h3>
                      <p className="text-sm text-white/60">Scout and warrior</p>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handlePreferenceChange('character', 'megatron')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        state.preferences.character === 'megatron'
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-white/10 hover:border-purple-500/50'
                      }`}
                    >
                      <h3 className="text-xl font-bold mb-2">Megatron</h3>
                      <p className="text-sm text-white/60">Leader of the Decepticons</p>
                    </button>
                    <button
                      onClick={() => handlePreferenceChange('character', 'starscream')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        state.preferences.character === 'starscream'
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-white/10 hover:border-purple-500/50'
                      }`}
                    >
                      <h3 className="text-xl font-bold mb-2">Starscream</h3>
                      <p className="text-sm text-white/60">Air Commander</p>
                    </button>
                  </>
                )}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold mb-4">Timer Settings</h2>
              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Focus Duration (minutes)</label>
                  <input
                    type="number"
                    value={state.presets.focus / 60}
                    onChange={(e) => handlePresetChange('focus', Math.max(1, parseInt(e.target.value)) * 60)}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Break Duration (minutes)</label>
                  <input
                    type="number"
                    value={state.presets.break / 60}
                    onChange={(e) => handlePresetChange('break', Math.max(1, parseInt(e.target.value)) * 60)}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Background Music (YouTube URL)</label>
                  <input
                    type="text"
                    value={state.preferences.youtubeUrl || ''}
                    onChange={(e) => handlePreferenceChange('youtubeUrl', e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="soundEnabled"
                    checked={state.preferences.soundEnabled}
                    onChange={(e) => handlePreferenceChange('soundEnabled', e.target.checked)}
                    className="w-4 h-4 rounded border-white/10 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 bg-black/20"
                  />
                  <label htmlFor="soundEnabled" className="text-sm font-medium">
                    Enable Sound Notifications
                  </label>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Data Management</h2>
              <div className="grid gap-4">
                <div className="p-4 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Reset Statistics</h3>
                      <p className="text-sm text-white/60">Clear all progress and achievements</p>
                    </div>
                    <Button
                      variant="destructive"
                      className="text-white bg-red-500/20 hover:bg-red-500/30 border-red-500/30"
                      onClick={() => {
                        if (confirm('Are you sure? This action cannot be undone.')) {
                          resetStats();
                        }
                      }}
                    >
                      Reset Stats
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
