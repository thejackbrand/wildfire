import { View, Text, StyleSheet, TextInput, Keyboard, ActivityIndicator, FlatList, TouchableOpacity, Image } from 'react-native';
import { useState, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookCard } from '@/components/BookCard';
import { FontAwesome } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import { Book } from '@/types/book';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ScrollView } from 'react-native-gesture-handler';
import { searchBooks } from '@/services/bookSearchService';
import { useDebounce } from '@/hooks/useDebounce';
import { useBooks } from '@/hooks/useBooks';
import { useRouter } from 'expo-router';
import { useColors } from '@/constants/Colors';

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { books, addBook, loadBooks } = useBooks();
  const router = useRouter();

  const debouncedSearch = useDebounce(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const results = await searchBooks(query);
      setSearchResults(results);
    } catch (err) {
      setError('Failed to search for books. Please try again.');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, 500);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    debouncedSearch(query);
  }, [debouncedSearch]);

  const handleScroll = () => {
    Keyboard.dismiss();
  };

  const isBookInLibrary = (bookId: string) => {
    return books.some(book => book.id === bookId);
  };

  const handleAddBook = async (book: Book, status: 'past' | 'future') => {
    try {
      await addBook({ ...book, status });
      // Wait for the library to update
      await new Promise(resolve => setTimeout(resolve, 100));
      // Navigate back to the library
      router.push('/(tabs)');
    } catch (error) {
      console.error('Error adding book:', error);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView 
        style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}
        onScrollBeginDrag={handleScroll}
        scrollEventThrottle={16}
      >
        <Text style={[styles.title, { color: colors.text }]}>Discover Books</Text>
        
        <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
          <Text>
            <FontAwesome name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          </Text>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search for books..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => {
              setSearchQuery('');
              setSearchResults([]);
            }}>
              <Text>
                <Feather name="x-circle" size={24} color={colors.accent} />
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          </View>
        ) : searchQuery ? (
          <View style={styles.list}>
            {searchResults.map((book) => (
              <BookCard 
                key={book.id} 
                book={book} 
                showAddButton={!isBookInLibrary(book.id)}
                showStatusSelector={true}
                onAdd={(book) => handleAddBook(book, book.status)}
              />
            ))}
            {searchResults.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No books found</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Search for books to discover</Text>
          </View>
        )}
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  list: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  emptyText: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
}); 