/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { useColorScheme } from '@/hooks/useColorScheme';

// Muted pastel color palette
export const lightColors = {
  // Primary colors
  primary: '#FFB7C5', // Soft pastel pink
  secondary: '#FFE5B4', // Muted pastel yellow
  tertiary: '#B5EAD7', // Soft pastel green
  
  // Background and surface colors
  background: '#FFF5F7', // Very light pink
  surface: '#FFFFFF', // Pure white
  card: '#FFE5E9', // Light pink
  
  // Text colors
  text: '#2D3748', // Dark gray
  textSecondary: '#718096', // Medium gray
  
  // Accent colors
  accent: '#FFD3B6', // Peach
  highlight: '#B5EAD7', // Pastel green
  
  // Status colors
  success: '#B5EAD7', // Pastel green
  warning: '#FFE5B4', // Pastel yellow
  error: '#FFB7C5', // Pastel pink
  border: '#E0E0E0'
};

export const darkColors = {
  // Primary colors
  primary: '#FF8FA3', // Darker pastel pink
  secondary: '#FFD699', // Darker pastel yellow
  tertiary: '#8CD9B3', // Darker pastel green
  
  // Background and surface colors
  background: '#1A1A1A', // Dark gray
  surface: '#2D2D2D', // Slightly lighter dark gray
  card: '#333333', // Dark card background
  
  // Text colors
  text: '#FFFFFF', // White
  textSecondary: '#A0AEC0', // Light gray
  
  // Accent colors
  accent: '#FFB38A', // Darker peach
  highlight: '#8CD9B3', // Darker pastel green
  
  // Status colors
  success: '#8CD9B3', // Darker pastel green
  warning: '#FFD699', // Darker pastel yellow
  error: '#FF8FA3', // Darker pastel pink
  border: '#333333',
};

export type ThemeColors = typeof lightColors;

export const useColors = (): ThemeColors => {
  const { theme } = useColorScheme();
  return theme === 'dark' ? darkColors : lightColors;
};
