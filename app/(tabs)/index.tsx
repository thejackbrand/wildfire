import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, RefreshControl, Animated } from 'react-native';
import { useBooks } from '@/hooks/useBooks';
import { router, useFocusEffect } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@/constants/Colors';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LibraryScreen() {
  const { books, loadBooks } = useBooks();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'past' | 'future'>('past');
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Add focus effect to refresh books when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadBooks();
    }, [])
  );

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: activeTab === 'past' ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [activeTab]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadBooks();
    } catch (error) {
      console.error('Error refreshing books:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredBooks = books.filter(book => book.status === activeTab);

  const sliderPosition = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '50%'],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={[styles.title, { color: colors.text }]}>Your Library</Text>
      </View>
      
      <View style={styles.tabContainer}>
        <Animated.View 
          style={[
            styles.slider,
            { 
              backgroundColor: colors.accent,
              left: sliderPosition,
            }
          ]} 
        />
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'past' ? colors.background : colors.text }
          ]}>
            Past Reads
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab('future')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'future' ? colors.background : colors.text }
          ]}>
            Future Reads
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredBooks}
        keyExtractor={(item) => item.id}
        numColumns={3}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.highlight]}
            tintColor={colors.highlight}
            progressBackgroundColor={colors.background}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.bookItem}
            onPress={() => router.push(`/book/${item.id}`)}
          >
            <View style={styles.bookCoverContainer}>
              {item.coverImage ? (
                <Image 
                  source={{ uri: item.coverImage }} 
                  style={styles.bookCover}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.placeholderCover, { backgroundColor: colors.tertiary }]}>
                  <FontAwesome name="book" size={24} color={colors.textSecondary} />
                </View>
              )}
            </View>
            <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={2}>
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No books in your {activeTab === 'past' ? 'past reads' : 'future reads'} yet
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  slider: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    borderRadius: 8,
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    zIndex: 1,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  list: {
    padding: 8,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  bookItem: {
    width: '31%',
    marginBottom: 8,
  },
  bookCoverContainer: {
    aspectRatio: 2/3,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  bookCover: {
    width: '100%',
    height: '100%',
  },
  placeholderCover: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookTitle: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

