import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_PREFERENCES_KEY = '@wildfire_user_preferences';

interface UserPreferences {
  favoriteGenre?: string;
}

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const storedPreferences = await AsyncStorage.getItem(USER_PREFERENCES_KEY);
      if (storedPreferences) {
        setPreferences(JSON.parse(storedPreferences));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFavoriteGenre = async (genre: string) => {
    try {
      const updatedPreferences = { ...preferences, favoriteGenre: genre };
      await AsyncStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(updatedPreferences));
      setPreferences(updatedPreferences);
    } catch (error) {
      console.error('Error updating favorite genre:', error);
      throw error;
    }
  };

  return {
    preferences,
    isLoading,
    updateFavoriteGenre,
  };
} 