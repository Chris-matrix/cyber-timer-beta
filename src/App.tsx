import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TimerProvider } from './context/TimerContext';
import Timer from './components/Timer';
import Settings from './pages/Settings';
import Stats from './pages/Stats';
import LoadingPage from './pages/LoadingPage';
import { ThemeProvider } from './components/theme-provider';

function App() {
  console.log('App component rendering');
  
  return (
    <TimerProvider>
      <ThemeProvider defaultTheme="dark">
        <div className="min-h-screen bg-background text-foreground">
          <Router>
            <Routes>
              <Route path="/loading" element={<LoadingPage />} />
              <Route path="/timer" element={<Timer />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/" element={<Navigate to="/loading" />} />
            </Routes>
          </Router>
        </div>
      </ThemeProvider>
    </TimerProvider>
  );
}

export default App;
