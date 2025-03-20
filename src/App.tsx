import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TimerProvider } from './context/TimerContext';
import Timer from './components/Timer';
import Settings from './pages/Settings';
import Stats from './pages/Stats';
import LoadingPage from './pages/LoadingPage';
import { ThemeProvider } from './components/theme-provider';
import { NotificationProvider } from './components/ui/notification';
import { useState, useEffect } from 'react';

function App() {
  console.log('App component rendering');
  const [hasSelectedFaction, setHasSelectedFaction] = useState<boolean>(() => {
    // Check if user has already selected a faction from localStorage
    const timerState = localStorage.getItem('timerState');
    if (timerState) {
      try {
        const parsedState = JSON.parse(timerState);
        return !!(parsedState.preferences && parsedState.preferences.faction && parsedState.preferences.character);
      } catch (e) {
        return false;
      }
    }
    return false;
  });

  // Listen for faction selection events
  useEffect(() => {
    const checkFactionSelection = () => {
      const timerState = localStorage.getItem('timerState');
      if (timerState) {
        try {
          const parsedState = JSON.parse(timerState);
          if (parsedState.preferences && parsedState.preferences.faction && parsedState.preferences.character) {
            setHasSelectedFaction(true);
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    };

    // Check on mount and when localStorage changes
    window.addEventListener('storage', checkFactionSelection);
    return () => {
      window.removeEventListener('storage', checkFactionSelection);
    };
  }, []);
  
  return (
    <TimerProvider>
      <ThemeProvider defaultTheme="dark">
        <NotificationProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Router>
              <Routes>
                <Route path="/loading" element={<LoadingPage onFactionSelected={() => setHasSelectedFaction(true)} />} />
                <Route path="/timer" element={<Timer />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/" element={
                  hasSelectedFaction ? <Navigate to="/timer" /> : <Navigate to="/loading" />
                } />
              </Routes>
            </Router>
          </div>
        </NotificationProvider>
      </ThemeProvider>
    </TimerProvider>
  );
}

export default App;
