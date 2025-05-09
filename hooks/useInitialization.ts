import { useEffect, useState, useCallback } from 'react';
import { useColorScheme } from './useColorScheme';
import { useFonts } from 'expo-font';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as SplashScreen from 'expo-splash-screen';

export function useInitialization() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { isInitialized: isThemeInitialized } = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const initialize = useCallback(async () => {
    try {
      if (fontsLoaded && isThemeInitialized) {
        // Add a small delay to ensure everything is properly initialized
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsInitialized(true);
      }
    } catch (error) {
      console.error('Error during initialization:', error);
      // Still set initialized to true to prevent app from being stuck
      setIsInitialized(true);
    }
  }, [fontsLoaded, isThemeInitialized]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Log any font loading errors
  useEffect(() => {
    if (fontError) {
      console.error('Error loading fonts:', fontError);
    }
  }, [fontError]);

  return { isInitialized };
} 