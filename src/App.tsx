import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Timer from './components/Timer';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import Meditation from './pages/Meditation';
import { TimerProvider, useTimer } from './context/TimerContext';
import FactionSelect from './pages/FactionSelect';
import { ThemeProvider } from './components/theme-provider';

function AppContent() {
  const { state } = useTimer();

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Router>
        <Routes>
          <Route path="/" element={<Timer />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/meditation" element={<Meditation />} />
          <Route path="/faction-select" element={<FactionSelect />} />
        </Routes>
        <Toaster 
          position="bottom-right" 
          toastOptions={{
            style: {
              background: 'hsl(var(--card))',
              color: 'hsl(var(--card-foreground))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
            }
          }}
        />
      </Router>
    </div>
  );
}

export default function App() {
  return (
    <TimerProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </TimerProvider>
  );
}
