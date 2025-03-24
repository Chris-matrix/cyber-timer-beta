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

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TimerProvider, useTimer } from './context/TimerContext';
import Timer from './components/Timer';
import Stats from './pages/Stats';
import Settings from './pages/Settings';
import { preloadSounds } from './lib/audio';

// CSS variables for light and dark themes
const GlobalStyles: React.FC = () => {
  const { state } = useTimer();
  const isDarkMode = state.preferences.theme === 'dark';

  useEffect(() => {
    // Apply theme variables to root element
    document.documentElement.style.setProperty('--bg-primary', isDarkMode ? '#121212' : '#f8f9fa');
    document.documentElement.style.setProperty('--bg-secondary', isDarkMode ? '#1e1e1e' : '#ffffff');
    document.documentElement.style.setProperty('--text-primary', isDarkMode ? '#ffffff' : '#212529');
    document.documentElement.style.setProperty('--text-secondary', isDarkMode ? '#a0a0a0' : '#6c757d');
    document.documentElement.style.setProperty('--border-color', isDarkMode ? '#333333' : '#dee2e6');
    
    // Set body background color
    document.body.style.backgroundColor = isDarkMode ? '#121212' : '#f8f9fa';
    document.body.style.color = isDarkMode ? '#ffffff' : '#212529';
  }, [isDarkMode]);

  return null;
};

// Main App Component
function App() {
  // Preload sounds when app starts
  useEffect(() => {
    preloadSounds();
  }, []);

  return (
    <TimerProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <GlobalStyles />
        <AppRoutes />
      </Router>
    </TimerProvider>
  );
}

// Routes Component
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Timer />} />
      <Route path="/stats" element={<Stats />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
