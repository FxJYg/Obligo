import React, { createContext, useContext, useEffect, useState } from 'react';
import { Season, ThemeMode } from '../types';

interface ThemeContextType {
  mode: ThemeMode;
  season: Season;
  toggleMode: () => void;
  toggleSeason: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [season, setSeason] = useState<Season>('winter');

  useEffect(() => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [mode]);

  const toggleMode = () => setMode(prev => prev === 'light' ? 'dark' : 'light');
  const toggleSeason = () => setSeason(prev => prev === 'none' ? 'winter' : 'none');

  return (
    <ThemeContext.Provider value={{ mode, season, toggleMode, toggleSeason }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};