import React, { createContext, useContext, useState, useEffect } from 'react';
import { getThemePreference, setThemePreference, applyTheme } from '../utils/storageGuard';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setLocalTheme] = useState<Theme>(() => getThemePreference());

  useEffect(() => {
    // Ensure theme is applied on initial mount
    applyTheme(theme);

    // Listen to changes from other tabs or components
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'vc_pref_theme' && (e.newValue === 'light' || e.newValue === 'dark')) {
        setLocalTheme(e.newValue);
        applyTheme(e.newValue);
      }
    };

    const handleCustomChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ theme: Theme }>;
      if (customEvent.detail?.theme) {
        setLocalTheme(customEvent.detail.theme);
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('vc-theme-change', handleCustomChange);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('vc-theme-change', handleCustomChange);
    };
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setLocalTheme(newTheme);
    setThemePreference(newTheme);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
