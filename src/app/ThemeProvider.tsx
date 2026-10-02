'use client';

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

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

export const themes: Record<ThemeName, ThemeColors> = {
  forest: { name:'forest', label:'Forest', background:'#07140F', backgroundLight:'#0C2118', backgroundLighter:'#123326', primary:'#F4FFF9', primaryDim:'#B7C9C0', primaryFaint:'#6D8177', text:'#F4FFF9', textDim:'#B7C9C0', textFaint:'#6D8177', accent:'#20E48D', gradient:'from-emerald-300 to-emerald-500' },
  ocean: { name:'ocean', label:'Ocean', background:'#06132A', backgroundLight:'#0A2043', backgroundLighter:'#10305B', primary:'#F4FAFF', primaryDim:'#B8C9E4', primaryFaint:'#6E87AA', text:'#F4FAFF', textDim:'#B8C9E4', textFaint:'#6E87AA', accent:'#31C8FF', gradient:'from-cyan-300 to-blue-500' },
  sunset: { name:'sunset', label:'Sunset', background:'#190A0C', backgroundLight:'#2B1218', backgroundLighter:'#421A20', primary:'#FFF7F3', primaryDim:'#E6C2B7', primaryFaint:'#B17E72', text:'#FFF7F3', textDim:'#E6C2B7', textFaint:'#B17E72', accent:'#FF7958', gradient:'from-orange-300 to-rose-500' },
  midnight: { name:'midnight', label:'Midnight', background:'#050511', backgroundLight:'#0B0B25', backgroundLighter:'#15153E', primary:'#F6F4FF', primaryDim:'#C7C4E4', primaryFaint:'#8986AE', text:'#F6F4FF', textDim:'#C7C4E4', textFaint:'#8986AE', accent:'#8D78FF', gradient:'from-violet-300 to-purple-500' },
  amber: { name:'amber', label:'Amber', background:'#181100', backgroundLight:'#2A2004', backgroundLighter:'#40300A', primary:'#FFF9EA', primaryDim:'#E6D1A2', primaryFaint:'#AE9861', text:'#FFF9EA', textDim:'#E6D1A2', textFaint:'#AE9861', accent:'#FFC34D', gradient:'from-yellow-300 to-amber-500' },
  rose: { name:'rose', label:'Rose', background:'#190811', backgroundLight:'#2C0E1D', backgroundLighter:'#42152A', primary:'#FFF4FA', primaryDim:'#E7C1D5', primaryFaint:'#B4819B', text:'#FFF4FA', textDim:'#E7C1D5', textFaint:'#B4819B', accent:'#F05D9C', gradient:'from-pink-300 to-rose-500' },
};

export const themeForLocalHour = (hour: number): ThemeName => {
  if (hour < 5) return 'midnight';
  if (hour < 9) return 'forest';
  if (hour < 13) return 'ocean';
  if (hour < 17) return 'amber';
  if (hour < 20) return 'sunset';
  return 'rose';
};

interface ThemeContextType {
  theme: ThemeName;
  colors: ThemeColors;
  setTheme: (theme: ThemeName) => void;
  availableThemes: ThemeColors[];
  isAuto: boolean;
  setAutoTheme: (enabled: boolean) => void;
  nextChangeLabel: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>('forest');
  const [isAuto, setIsAuto] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('origins-theme-auto');
    const savedTheme = localStorage.getItem('origins-theme') as ThemeName | null;
    const auto = savedMode !== 'false';
    setIsAuto(auto);
    const initial = auto ? themeForLocalHour(new Date().getHours()) : (savedTheme && themes[savedTheme] ? savedTheme : 'forest');
    setThemeState(initial);
    document.documentElement.setAttribute('data-theme', initial);
    document.documentElement.setAttribute('data-theme-mode', auto ? 'auto' : 'manual');
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const apply = () => {
      const next = isAuto ? themeForLocalHour(new Date().getHours()) : theme;
      if (next !== theme) setThemeState(next);
      document.documentElement.setAttribute('data-theme', next);
      document.documentElement.setAttribute('data-theme-mode', isAuto ? 'auto' : 'manual');
      if (isAuto) localStorage.removeItem('origins-theme');
    };
    apply();
    const interval = window.setInterval(apply, 30_000);
    return () => window.clearInterval(interval);
  }, [isAuto, mounted, theme]);

  const setTheme = (next: ThemeName) => {
    setIsAuto(false);
    setThemeState(next);
    localStorage.setItem('origins-theme-auto', 'false');
    localStorage.setItem('origins-theme', next);
    document.documentElement.setAttribute('data-theme', next);
    document.documentElement.setAttribute('data-theme-mode', 'manual');
  };

  const setAutoTheme = (enabled: boolean) => {
    setIsAuto(enabled);
    localStorage.setItem('origins-theme-auto', String(enabled));
    if (enabled) {
      const next = themeForLocalHour(new Date().getHours());
      setThemeState(next);
      localStorage.removeItem('origins-theme');
      document.documentElement.setAttribute('data-theme', next);
      document.documentElement.setAttribute('data-theme-mode', 'auto');
    }
  };

  const nextChangeLabel = useMemo(() => {
    const hour = new Date().getHours();
    const boundaries = [5, 9, 13, 17, 20, 24];
    const next = boundaries.find((h) => h > hour) ?? 5;
    const hours = next > hour ? next - hour : 24 - hour + next;
    return `${hours}h until the next atmosphere`;
  }, [theme]);

  const colors = themes[theme];
  return (
    <ThemeContext.Provider value={{ theme, colors, setTheme, availableThemes: Object.values(themes), isAuto, setAutoTheme, nextChangeLabel }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
