/**
 * Transformers Timer Application - Main App Component
 * 
 * This component serves as the main container for the entire application.
 * It sets up the necessary providers for state management, routing, theming,
 * and notifications, creating the foundation for the entire application.
 * 
 * Key responsibilities:
 * - Initializes the TimerProvider for global state management
 * - Sets up the ThemeProvider for consistent styling
 * - Configures the NotificationProvider for the notification system
 * - Establishes routing with React Router
 * - Manages faction selection state to control initial navigation
 */

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
  
  /**
   * State to track whether the user has selected a faction
   * This determines whether to show the loading screen or timer
   * 
   * The initial value is determined by checking localStorage for existing
   * faction and character selections from previous sessions
   */
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

  /**
   * Effect hook to listen for faction selection events
   * 
   * This ensures the application responds to faction selection changes
   * even if they happen outside the normal flow (e.g., from another tab)
   * by listening to localStorage changes
   */
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
    /**
     * Application Provider Structure:
     * 
     * TimerProvider - Manages timer state, preferences, and achievements
     * ├── ThemeProvider - Handles theme switching (light/dark/faction-based)
     *     ├── NotificationProvider - Manages notification display and dismissal
     *         └── Router - Handles navigation between different pages
     */
    <TimerProvider>
      <ThemeProvider defaultTheme="dark">
        <NotificationProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Router>
              <Routes>
                {/* 
                  Loading Page - Initial screen with faction selection
                  Passes onFactionSelected callback to update App state when selection is made
                */}
                <Route path="/loading" element={<LoadingPage onFactionSelected={() => setHasSelectedFaction(true)} />} />
                
                {/* Timer Page - Main timer functionality */}
                <Route path="/timer" element={<Timer />} />
                
                {/* Settings Page - User preferences and achievements */}
                <Route path="/settings" element={<Settings />} />
                
                {/* Stats Page - User statistics and progress */}
                <Route path="/stats" element={<Stats />} />
                
                {/* 
                  Root Route - Conditional navigation
                  Redirects to timer if faction is selected, otherwise to loading screen
                  This prevents showing the loading screen again after faction selection
                */}
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
