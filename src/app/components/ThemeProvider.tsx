'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ThemeName = 'forest' | 'ocean' | 'sunset' | 'midnight' | 'amber' | 'rose';

interface ThemeColors {
  name: ThemeName;
  label: string;
  background: string;
  backgroundLight: string;
  backgroundLighter: string;
  primary: string;
  primaryDim: string;
  primaryFaint: string;
  text: string;
  textDim: string;
  textFaint: string;
  accent: string;
  gradient: string;
}

const themes: Record<ThemeName, ThemeColors> = {
  forest: {
    name: 'forest',
    label: 'Forest',
    background: '#081711',
    backgroundLight: '#0D231A',
    backgroundLighter: '#143026',
    primary: '#FFFFFF',
    primaryDim: '#B8C5BD',
    primaryFaint: '#6B7A73',
    text: '#FFFFFF',
    textDim: '#B8C5BD',
    textFaint: '#6B7A73',
    accent: '#00D47E',
    gradient: 'from-emerald to-emerald-dim',
  },
  ocean: {
    name: 'ocean',
    label: 'Ocean',
    background: '#06142E',
    backgroundLight: '#0A1F44',
    backgroundLighter: '#0F2A5A',
    primary: '#FFFFFF',
    primaryDim: '#B0C4E8',
    primaryFaint: '#6B8CB8',
    text: '#FFFFFF',
    textDim: '#B0C4E8',
    textFaint: '#6B8CB8',
    accent: '#00B4D8',
    gradient: 'from-cyan-400 to-blue-500',
  },
  sunset: {
    name: 'sunset',
    label: 'Sunset',
    background: '#1A0A0A',
    backgroundLight: '#2D1414',
    backgroundLighter: '#3D1E1E',
    primary: '#FFF5F0',
    primaryDim: '#E8C8B8',
    primaryFaint: '#B88C78',
    text: '#FFF5F0',
    textDim: '#E8C8B8',
    textFaint: '#B88C78',
    accent: '#FF6B35',
    gradient: 'from-orange-400 to-red-500',
  },
  midnight: {
    name: 'midnight',
    label: 'Midnight',
    background: '#050515',
    backgroundLight: '#0A0A2A',
    backgroundLighter: '#121240',
    primary: '#F0F0FF',
    primaryDim: '#C8C8E8',
    primaryFaint: '#8C8CB8',
    text: '#F0F0FF',
    textDim: '#C8C8E8',
    textFaint: '#8C8CB8',
    accent: '#7C5CFF',
    gradient: 'from-violet-400 to-purple-600',
  },
  amber: {
    name: 'amber',
    label: 'Amber',
    background: '#1A1200',
    backgroundLight: '#2D2200',
    backgroundLighter: '#3D3000',
    primary: '#FFF8E8',
    primaryDim: '#E8D0A8',
    primaryFaint: '#B8A068',
    text: '#FFF8E8',
    textDim: '#E8D0A8',
    textFaint: '#B8A068',
    accent: '#FFB800',
    gradient: 'from-yellow-400 to-amber-500',
  },
  rose: {
    name: 'rose',
    label: 'Rose',
    background: '#1A0812',
    backgroundLight: '#2D0F20',
    backgroundLighter: '#3D1528',
    primary: '#FFF0F8',
    primaryDim: '#E8C0D8',
    primaryFaint: '#B880A0',
    text: '#FFF0F8',
    textDim: '#E8C0D8',
    textFaint: '#B880A0',
    accent: '#E84D8A',
    gradient: 'from-pink-400 to-rose-500',
  },
};

interface ThemeContextType {
  theme: ThemeName;
  colors: ThemeColors;
  setTheme: (theme: ThemeName) => void;
  availableThemes: ThemeColors[];
  isAuto: boolean;
  setAutoTheme: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'origins-theme';
const AUTO_STORAGE_KEY = 'origins-theme-auto';

function themeForLocalHour(hour: number): ThemeName {
  // The palette changes gently through the day:
  // 00–05 Midnight, 05–09 Forest, 09–13 Ocean,
  // 13–17 Amber, 17–20 Sunset, 20–24 Rose.
  if (hour < 5) return 'midnight';
  if (hour < 9) return 'forest';
  if (hour < 13) return 'ocean';
  if (hour < 17) return 'amber';
  if (hour < 20) return 'sunset';
  return 'rose';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>('forest');
  const [isAuto, setIsAuto] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem(AUTO_STORAGE_KEY);
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeName | null;
    const auto = savedMode !== 'false';

    setIsAuto(auto);
    setMounted(true);

    if (auto) {
      const current = themeForLocalHour(new Date().getHours());
      setThemeState(current);
      document.documentElement.setAttribute('data-theme', current);
      document.documentElement.setAttribute('data-theme-mode', 'auto');
    } else if (savedTheme && themes[savedTheme]) {
      setThemeState(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
      document.documentElement.setAttribute('data-theme-mode', 'manual');
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const applyTheme = (nextTheme: ThemeName, mode: 'auto' | 'manual') => {
      document.documentElement.setAttribute('data-theme', nextTheme);
      document.documentElement.setAttribute('data-theme-mode', mode);
      setThemeState(nextTheme);
    };

    if (!isAuto) {
      localStorage.setItem(AUTO_STORAGE_KEY, 'false');
      localStorage.setItem(THEME_STORAGE_KEY, theme);
      return;
    }

    localStorage.setItem(AUTO_STORAGE_KEY, 'true');
    localStorage.removeItem(THEME_STORAGE_KEY);

    const syncToLocalTime = () => {
      const nextTheme = themeForLocalHour(new Date().getHours());
      applyTheme(nextTheme, 'auto');
    };

    syncToLocalTime();

    // Re-check once a minute so the palette changes without requiring a reload.
    const interval = window.setInterval(syncToLocalTime, 60_000);
    return () => window.clearInterval(interval);
  }, [isAuto, mounted]);

  const setTheme = (nextTheme: ThemeName) => {
    setIsAuto(false);
    setThemeState(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    document.documentElement.setAttribute('data-theme-mode', 'manual');
    localStorage.setItem(AUTO_STORAGE_KEY, 'false');
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  };

  const setAutoTheme = (enabled: boolean) => {
    setIsAuto(enabled);

    if (enabled) {
      const nextTheme = themeForLocalHour(new Date().getHours());
      setThemeState(nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
      document.documentElement.setAttribute('data-theme-mode', 'auto');
      localStorage.setItem(AUTO_STORAGE_KEY, 'true');
      localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      localStorage.setItem(AUTO_STORAGE_KEY, 'false');
    }
  };

  const colors = themes[theme];
  const availableThemes = Object.values(themes);

  return (
    <ThemeContext.Provider value={{ theme, colors, setTheme, availableThemes, isAuto, setAutoTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
