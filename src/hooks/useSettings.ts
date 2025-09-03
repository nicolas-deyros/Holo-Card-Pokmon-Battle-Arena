import { useState, useEffect } from 'react';

export interface Settings {
  soundEnabled: boolean;
  soundVolume: number;
  animationsEnabled: boolean;
  showDamageNumbers: boolean;
  autoSaveTeam: boolean;
  theme: 'light' | 'dark';
}

export const defaultSettings: Settings = {
  soundEnabled: true,
  soundVolume: 0.5,
  animationsEnabled: true,
  showDamageNumbers: true,
  autoSaveTeam: true,
  theme: 'light',
};

// Hook to use settings throughout the app
export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    const savedSettings = localStorage.getItem('pokemon-battle-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.warn('Failed to parse saved settings:', error);
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('pokemon-battle-settings', JSON.stringify(updated));
  };

  return { settings, updateSettings };
};
