import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useBooks } from '@/hooks/useBooks';
import { useBookRatings } from '@/hooks/useBookRatings';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const colors = useColors();
  const { theme, toggleColorScheme } = useColorScheme();
  const { deleteAllBooks, loadBooks } = useBooks();
  const { resetAllRatings } = useBookRatings();

  const handleResetAllData = async () => {
    Alert.alert(
      'Reset All Data',
      'Are you sure you want to reset all data? This will remove all books and ratings. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAllBooks();
              await resetAllRatings();
              await loadBooks(); // Refresh the books state
              Alert.alert('Success', 'All data has been reset');
              router.replace('/(tabs)'); // Navigate to library tab
            } catch (error) {
              Alert.alert('Error', 'Failed to reset data');
              console.error('Error resetting data:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: colors.card }]}
          onPress={() => router.back()}
        >
          <FontAwesome name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      </View>

      <View style={[styles.section, { borderBottomColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
        <TouchableOpacity
          style={[styles.settingItem, { borderBottomColor: colors.border }]}
          onPress={toggleColorScheme}
        >
          <View style={styles.settingContent}>
            <FontAwesome name="moon-o" size={20} color={colors.text} />
            <Text style={[styles.settingText, { color: colors.text }]}>Dark Mode</Text>
          </View>
          <FontAwesome 
            name={theme === 'dark' ? "toggle-on" : "toggle-off"} 
            size={24} 
            color={theme === 'dark' ? colors.accent : colors.textSecondary} 
          />
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { borderBottomColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Data Management</Text>
        <TouchableOpacity
          style={[styles.settingItem, { borderBottomColor: colors.border }]}
          onPress={handleResetAllData}
        >
          <View style={styles.settingContent}>
            <FontAwesome name="trash" size={20} color={colors.error} />
            <Text style={[styles.settingText, { color: colors.error }]}>Reset All Data</Text>
          </View>
          <FontAwesome 
            name="chevron-right" 
            size={16} 
            color={colors.textSecondary} 
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    marginBottom: 24,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
  },
}); 