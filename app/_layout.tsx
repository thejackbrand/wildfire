import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useInitialization } from '@/hooks/useInitialization';
import LoadingScreen from './loading';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme, isInitialized: isThemeInitialized } = useColorScheme();
  const { isInitialized: isAppInitialized } = useInitialization();

  useEffect(() => {
    if (isAppInitialized && isThemeInitialized) {
      SplashScreen.hideAsync();
    }
  }, [isAppInitialized, isThemeInitialized]);

  if (!isAppInitialized || !isThemeInitialized) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="book/[id]" options={{ presentation: 'card', headerShown: false }} />
        <Stack.Screen name="settings" options={{ presentation: 'card' , headerShown: false, }} />
      </Stack>
    </ThemeProvider>
  );
}
