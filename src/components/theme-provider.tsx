import React from 'react';
import { useTimer } from '../context/TimerContext';

const themeMap = {
  autobots: {
    background: '0 0% 100%',
    foreground: '222.2 84% 4.9%',
    card: '0 0% 100%',
    'card-foreground': '222.2 84% 4.9%',
    popover: '0 0% 100%',
    'popover-foreground': '222.2 84% 4.9%',
    primary: '346 77% 50%',
    'primary-foreground': '0 0% 100%',
    secondary: '210 40% 96.1%',
    'secondary-foreground': '222.2 47.4% 11.2%',
    muted: '210 40% 96.1%',
    'muted-foreground': '215.4 16.3% 46.9%',
    accent: '210 40% 96.1%',
    'accent-foreground': '222.2 47.4% 11.2%',
    border: '214.3 31.8% 91.4%',
  },
  decepticons: {
    background: '222.2 84% 4.9%',
    foreground: '210 40% 98%',
    card: '222.2 84% 4.9%',
    'card-foreground': '210 40% 98%',
    popover: '222.2 84% 4.9%',
    'popover-foreground': '210 40% 98%',
    primary: '217.2 91.2% 59.8%',
    'primary-foreground': '222.2 47.4% 11.2%',
    secondary: '217.2 32.6% 17.5%',
    'secondary-foreground': '210 40% 98%',
    muted: '217.2 32.6% 17.5%',
    'muted-foreground': '215 20.2% 65.1%',
    accent: '217.2 32.6% 17.5%',
    'accent-foreground': '210 40% 98%',
    border: '217.2 32.6% 17.5%',
  },
  allspark: {
    background: '0 0% 0%',
    foreground: '0 0% 100%',
    card: '0 0% 3%',
    'card-foreground': '0 0% 100%',
    popover: '0 0% 3%',
    'popover-foreground': '0 0% 100%',
    primary: '346 77% 50%',
    'primary-foreground': '0 0% 100%',
    secondary: '0 0% 10%',
    'secondary-foreground': '0 0% 100%',
    muted: '0 0% 10%',
    'muted-foreground': '0 0% 63.9%',
    accent: '0 0% 10%',
    'accent-foreground': '0 0% 100%',
    border: '0 0% 14.9%',
  },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { state } = useTimer();
  const theme = state?.preferences?.theme || 'allspark';

  React.useEffect(() => {
    const root = document.documentElement;
    const themeColors = themeMap[theme];
    root.className = theme; // Add theme class for potential CSS overrides

    // Apply theme colors as CSS variables
    for (const [key, value] of Object.entries(themeColors)) {
      root.style.setProperty(`--${key}`, value);
    }

    // Set base styles
    root.style.setProperty('--radius', '0.5rem');
    root.style.backgroundColor = `hsl(var(--background))`;
    root.style.color = `hsl(var(--foreground))`;
  }, [theme]);

  return <>{children}</>;
}
