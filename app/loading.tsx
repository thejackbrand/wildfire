import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { lightColors } from '@/constants/Colors';

export default function LoadingScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <FontAwesome name="book" size={60} color={lightColors.primary} style={styles.icon} />
        <Text style={styles.title}>Filling your Bookshelf</Text>
        <Text style={styles.subtitle}>Getting everything ready for you...</Text>
        <ActivityIndicator size="large" color={lightColors.primary} style={styles.spinner} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: lightColors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: lightColors.textSecondary,
    marginBottom: 30,
    textAlign: 'center',
  },
  spinner: {
    marginTop: 20,
  },
});
