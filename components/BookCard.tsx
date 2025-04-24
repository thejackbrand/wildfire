import { View, Text, Image, StyleSheet, TouchableOpacity, Pressable, Animated } from 'react-native';
import { Book } from '@/types/book';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useBooks } from '@/hooks/useBooks';
import { useColors } from '@/constants/Colors';
import { useState, useRef, useEffect } from 'react';

interface BookCardProps {
  book: Book;
  showAddButton?: boolean;
  onAdd?: (book: Book) => Promise<void>;
  showRemoveButton?: boolean;
  onRemove?: (book: Book) => Promise<void>;
  showStatusSelector?: boolean;
  onStatusChange?: (book: Book, newStatus: 'past' | 'future') => Promise<void>;
}

export function BookCard({ 
  book, 
  showAddButton = false, 
  onAdd, 
  showRemoveButton = false, 
  onRemove, 
  showStatusSelector = false,
  onStatusChange 
}: BookCardProps) {
  const { books } = useBooks();
  const colors = useColors();
  const [selectedStatus, setSelectedStatus] = useState<'past' | 'future'>(book.status || 'future');
  const slideAnim = useRef(new Animated.Value(selectedStatus === 'past' ? 0 : 1)).current;
  const isInLibrary = books.some(b => b.id === book.id);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: selectedStatus === 'past' ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [selectedStatus]);

  const sliderPosition = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '50%'],
  });

  const handleAddToLibrary = async () => {
    if (onAdd) {
      await onAdd({ ...book, status: selectedStatus });
    }
  };

  const handleRemoveFromLibrary = async () => {
    if (onRemove) {
      await onRemove(book);
    }
  };

  const handleStatusChange = async (newStatus: 'past' | 'future') => {
    setSelectedStatus(newStatus);
    if (onStatusChange) {
      await onStatusChange(book, newStatus);
    }
  };

  return (
    <Pressable
      style={[styles.container, { backgroundColor: colors.surface }]}
      onPress={() => router.push({
        pathname: '/book/[id]',
        params: { id: book.id }
      })}
    >
      <View style={styles.imageContainer}>
        {book.coverImage ? (
          <Image 
            source={{ uri: book.coverImage }} 
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: colors.tertiary }]}>
            <Text>
              <FontAwesome name="book" size={40} color={colors.textSecondary} />
            </Text>
          </View>
        )}
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.details}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {book.title}
          </Text>
          <Text style={[styles.author, { color: colors.textSecondary }]} numberOfLines={1}>
            {book.author}
          </Text>
          <View style={styles.metadata}>
            {book.publishDate && (
              <Text style={[styles.metadataText, { color: colors.textSecondary }]}>{book.publishDate}</Text>
            )}
            {book.pageCount && (
              <Text style={[styles.metadataText, { color: colors.textSecondary }]}>{book.pageCount} pages</Text>
            )}
            {book.language && (
              <Text style={[styles.metadataText, { color: colors.textSecondary }]}>{book.language}</Text>
            )}
          </View>
        </View>
        <View style={styles.rightSection}>
          {book.rating && (
            <View style={styles.ratingContainer}>
              <Text>
                <FontAwesome name="star" size={16} color="#FFD700" />
              </Text>
              <Text style={[styles.rating, { color: colors.textSecondary }]}>{book.rating.toFixed(1)}</Text>
            </View>
          )}
          {!isInLibrary && showAddButton && (
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.highlight }]}
              onPress={handleAddToLibrary}
            >
              <View style={styles.actionButtonContent}>
                <Text>
                  <FontAwesome name="bookmark" size={16} color={colors.background} />
                </Text>
                <Text style={[styles.actionButtonText, { color: colors.background }]}>Add to Library</Text>
              </View>
            </TouchableOpacity>
          )}
          {!isInLibrary && showStatusSelector && (
            <View style={styles.statusSelector}>
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
                style={styles.statusButton}
                onPress={() => handleStatusChange('past')}
              >
                <Text style={[
                  styles.statusButtonText,
                  { color: selectedStatus === 'past' ? colors.background : colors.text }
                ]}>
                  Past
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.statusButton}
                onPress={() => handleStatusChange('future')}
              >
                <Text style={[
                  styles.statusButtonText,
                  { color: selectedStatus === 'future' ? colors.background : colors.text }
                ]}>
                  Future
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {showRemoveButton && (
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.error }]}
              onPress={handleRemoveFromLibrary}
            >
              <View style={styles.actionButtonContent}>
                <Text>
                  <FontAwesome name="trash" size={16} color={colors.background} />
                </Text>
                <Text style={[styles.actionButtonText, { color: colors.background }]}>Remove</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 12,
  },
  imageContainer: {
    width: 80,
    height: 120,
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  details: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
    alignItems: 'center',
  },
  metadataText: {
    fontSize: 12,
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minWidth: 100,
    gap: 8,
  },
  actionButton: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  statusSelector: {
    flexDirection: 'row',
    gap: 4,
    height: 28,
    alignItems: 'center',
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  slider: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    borderRadius: 12,
  },
  statusButton: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    zIndex: 1,
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
}); 