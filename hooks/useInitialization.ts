import { useEffect, useState } from 'react';
import { useColorScheme } from './useColorScheme';
import { useFonts } from 'expo-font';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export function useInitialization() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { isInitialized: isThemeInitialized } = useColorScheme();
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (fontsLoaded && isThemeInitialized) {
      // Add a small delay to ensure everything is properly initialized
      const timer = setTimeout(() => {
        setIsInitialized(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [fontsLoaded, isThemeInitialized]);

  return { isInitialized };
} 