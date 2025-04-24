import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBooks } from '@/hooks/useBooks';
import { FontAwesome } from '@expo/vector-icons';
import Foundation from '@expo/vector-icons/Foundation';
import { useState, useEffect } from 'react';
import { Picker } from '@react-native-picker/picker';
import genresData from '@/assets/json/genres.json';
import { useColors } from '@/constants/Colors';
import { useMemo } from 'react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useBookRatings } from '@/hooks/useBookRatings';
import { Link, useRouter } from 'expo-router';

const genres: string[] = genresData.genres;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { books, loadBooks } = useBooks();
  const { preferences, updateFavoriteGenre } = useUserPreferences();
  const { getAverageRating, loadRatings } = useBookRatings();
  const [showGenreSelector, setShowGenreSelector] = useState(false);
  const colors = useColors();
  const router = useRouter();
  const [genreSectionShown, setGenreSectionShown] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Refresh data when the screen comes into focus
  useEffect(() => {
    const refreshData = async () => {
      await loadBooks();
      await loadRatings();
    };
    refreshData();
  }, []);

  const totalBooks = useMemo(() => books.filter(book => book.status === 'past').length, [books]);
  const averageRating = getAverageRating();

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadBooks();
      await loadRatings();
    } catch (error) {
      console.error('Error Updating: ', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.highlight]}
          tintColor={colors.highlight}
          progressBackgroundColor={colors.background}
        />
      }
    >
      <SafeAreaView>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
          <TouchableOpacity 
            style={[styles.settingsButton, { backgroundColor: colors.card }]}
            onPress={() => router.push('/settings')}
          >
            <FontAwesome name="cog" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={[styles.statsContainer, { marginTop: 20 }]}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <FontAwesome name="book" size={24} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.text }]}>{totalBooks}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Books Read</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <FontAwesome name="star" size={24} color={colors.accent} />
            <Text style={[styles.statNumber, { color: colors.text }]}>{averageRating.toFixed(1)}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Avg Rating</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.moreStatsCardContainer}>
          <View style={[styles.moreStatsCard, { backgroundColor: colors.card }]}>
            <Foundation name="graph-pie" size={30} color={colors.primary} />
            <Text style={[styles.moreStatsLabel, { color: colors.text }]}>View More Statistics</Text>
          </View>
        </TouchableOpacity>

        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, paddingBottom: 10, }]}>Reading Preferences</Text>
          <View style={{display:'flex', flexDirection: "row", justifyContent: 'space-between'}}>
            <Text style={[styles.preferenceLabel, { color: colors.text }]}>Favorite Genre</Text>
            <TouchableOpacity style={{display: 'flex', flexDirection: 'row', alignItems: 'center',gap: 5}} onPress={() => setGenreSectionShown(!genreSectionShown)}>
              <Text style={[styles.preferenceValue, {color: colors.textSecondary}]}> {preferences.favoriteGenre} </Text>
              <FontAwesome name={genreSectionShown ? 'chevron-up' : 'chevron-down'} size={15} style={{color: colors.highlight}}></FontAwesome>
            </TouchableOpacity>
          </View>
          
          { genreSectionShown ? (
              <View style={[styles.genreList, {paddingTop: 20}]}>
              {genres.map((genre) => (
                <TouchableOpacity
                  key={genre}
                  style={[
                    styles.genreItem,
                    { 
                      backgroundColor: preferences.favoriteGenre === genre ? colors.accent : colors.card,
                      borderColor: colors.border
                    }
                  ]}
                  onPress={() => {
                    updateFavoriteGenre(genre);
                    setGenreSectionShown(true);
                    if (genre) {
                      setShowGenreSelector(false);
                    }
                  }}
                >
                  <Text 
                    style={[
                      styles.genreText, 
                      { color: preferences.favoriteGenre === genre ? colors.background : colors.text }
                    ]}
                  >
                    {genre}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
              <View></View>
          )}
        </View>

        <View style={styles.section}>
          <View style={[styles.preferenceItem, { borderBottomColor: colors.card }]}>
            <Text style={[styles.preferenceLabel, { color: colors.text }]}>Reading Goal</Text>
            <Text style={[styles.preferenceValue, { color: colors.textSecondary }]}>Not set</Text>
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 8,
    borderRadius: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  preferenceLabel: {
    fontSize: 16,
  },
  preferenceValue: {
    fontSize: 16,
  },
  genreList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  genreText: {
    fontSize: 14,
  },
  moreStatsCardContainer: {
    marginBottom: 8,
  },
  moreStatsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  moreStatsLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});