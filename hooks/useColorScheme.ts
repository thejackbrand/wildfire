import { useColorScheme as _useColorScheme } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const THEME_KEY = '@theme';

export function useColorScheme() {
  const systemColorScheme = _useColorScheme();
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_KEY);
        if (savedTheme) {
          setTheme(savedTheme as 'light' | 'dark');
        } else {
          setTheme(systemColorScheme || 'light');
        }
      } catch (error) {
        console.error('Error loading theme:', error);
        setTheme(systemColorScheme || 'light');
      } finally {
        setIsInitialized(true);
      }
    };

    loadTheme();
  }, [systemColorScheme]);

  const toggleColorScheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    try {
      await AsyncStorage.setItem(THEME_KEY, newTheme);
      setTheme(newTheme);
      // Force a refresh by navigating to the root and then back to the current screen
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return {
    theme,
    toggleColorScheme,
    isInitialized,
  };
}
