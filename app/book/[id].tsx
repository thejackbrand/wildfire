import { View, Text, Image, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useBooks } from '@/hooks/useBooks';
import { useBookRatings } from '@/hooks/useBookRatings';
import { useBookNotes } from '@/hooks/useBookNotes';
import { BookNote } from '@/components/BookNote';
import { useState, useEffect, useRef } from 'react';
import { bookStyles } from '@/styles/book';
import { Book } from '@/types/book';
import { useColors } from '@/constants/Colors';
import { getBookDetails } from '@/services/bookSearchService';

export default function BookDetails() {
  const { id } = useLocalSearchParams();
  const colors = useColors();
  const { books, deleteBook, loadBooks, updateBook, addBook } = useBooks();
  const { rating, updateRating } = useBookRatings(id as string);
  const { notes, addNote, deleteNote } = useBookNotes(id as string);
  const [noteContent, setNoteContent] = useState('');
  const [page, setPage] = useState('');
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'past' | 'future'>('future');
  const [isLoading, setIsLoading] = useState(true);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    const loadBookDetails = async () => {
      setIsLoading(true);
      try {
        // First check if the book is in the library
        const libraryBook = books.find(b => b.id === id);
        if (libraryBook) {
          setBook(libraryBook);
          setSelectedStatus(libraryBook.status || 'future');
          slideAnim.setValue(libraryBook.status === 'past' ? 0 : 1);
        } else {
          // If not in library, fetch from API
          const apiBook = await getBookDetails(id as string);
          if (apiBook) {
            setBook(apiBook);
            setSelectedStatus('future');
            slideAnim.setValue(1);
          }
        }
      } catch (error) {
        console.error('Error loading book details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBookDetails();
  }, [books, id]);

  useEffect(() => {
    if (book) {
      Animated.timing(slideAnim, {
        toValue: selectedStatus === 'past' ? 0 : 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [selectedStatus, book]);

  const sliderPosition = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '50%'],
  });

  const handleRemoveBook = async () => {
    if (book) {
      try {
        await deleteBook(book.id);
        router.back();
      } catch (error) {
        console.error('Error removing book:', error);
      }
    }
  };

  const handleStatusChange = async (newStatus: 'past' | 'future') => {
    if (!book) return;
    try {
      if (books.some(b => b.id === book.id)) {
        // Update existing book
        await updateBook({ ...book, status: newStatus });
        setSelectedStatus(newStatus);
        setBook({ ...book, status: newStatus });
      } else {
        // Add new book to library
        await addBook({ ...book, status: newStatus });
        setSelectedStatus(newStatus);
        setBook({ ...book, status: newStatus });
      }
      router.back();
    } catch (error) {
      console.error('Error updating book status:', error);
    }
  };

  const handleAddNote = async () => {
    if (!book || !noteContent.trim()) {
      Alert.alert('Error', 'Please enter a note');
      return;
    }

    try {
      await addNote({
        bookId: book.id,
        content: noteContent.trim(),
        page: page ? parseInt(page) : undefined,
      });
      setNoteContent('');
      setPage('');
    } catch (error) {
      Alert.alert('Error', 'Failed to add note');
    }
  };

  if (isLoading) {
    return (
      <View style={[bookStyles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!book) {
    return (
      <View style={[bookStyles.container, { backgroundColor: colors.background }]}>
        <Text style={[bookStyles.errorText, { color: colors.text }]}>Book not found</Text>
      </View>
    );
  }

  const isInLibrary = books.some(b => b.id === book.id);

  return (
    <SafeAreaView style={[bookStyles.container, { backgroundColor: colors.background}]}>
      <TouchableOpacity 
        style={[bookStyles.backButton]}
        onPress={() => router.back()}
      >
        <FontAwesome name="arrow-left" size={24} color={colors.text} />
      </TouchableOpacity>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ display: 'flex' , flex: 1}}
      >
      <ScrollView>
        <View style={[bookStyles.header, { borderBottomColor: colors.border }]}>
          <View style={bookStyles.coverContainer}>
            {book.coverImage ? (
              <Image 
                source={{ uri: book.coverImage }} 
                style={bookStyles.cover}
                resizeMode="cover"
              />
            ) : (
              <View style={[bookStyles.placeholderCover, { backgroundColor: colors.tertiary }]}>
                <FontAwesome name="book" size={48} color={colors.textSecondary} />
              </View>
            )}
          </View>
          <View style={bookStyles.info}>
            <Text style={[bookStyles.title, { color: colors.text }]}>{book.title}</Text>
            <Text style={[bookStyles.author, { color: colors.textSecondary }]}>{book.author}</Text>
            
            <View style={[bookStyles.metadataContainer, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
              {book.publishDate && (
                <View style={bookStyles.metadataItem}>
                  <FontAwesome name="calendar" size={14} color={colors.textSecondary} style={bookStyles.metadataIcon} />
                  <Text style={[bookStyles.metadata, { color: colors.textSecondary }]}>{book.publishDate}</Text>
                </View>
              )}
              {book.subjects && book.subjects.length > 0 && (
                <View style={bookStyles.metadataItem}>
                  <FontAwesome name="bookmark" size={14} color={colors.textSecondary} style={bookStyles.metadataIcon} />
                  <Text style={[bookStyles.metadata, { color: colors.textSecondary, paddingRight: 10 }]}>
                    {book.subjects
                      .filter(genre => !genre.match(/[:=_]/) && genre.length < 30)
                      .filter((genre, index, self) => 
                        index === self.findIndex(g => g.toLowerCase() === genre.toLowerCase())
                      )
                      .slice(0, 3)
                      .join(', ')}
                  </Text>
                </View>
              )}
              {book.publisher && (
                <View style={bookStyles.metadataItem}>
                  <FontAwesome name="building" size={14} color={colors.textSecondary} style={bookStyles.metadataIcon} />
                  <Text style={[bookStyles.metadata, { color: colors.textSecondary }]}>{book.publisher}</Text>
                </View>
              )}
              {book.pageCount && (
                <View style={bookStyles.metadataItem}>
                  <FontAwesome name="file-text-o" size={14} color={colors.textSecondary} style={bookStyles.metadataIcon} />
                  <Text style={[bookStyles.metadata, { color: colors.textSecondary }]}>{book.pageCount} pages</Text>
                </View>
              )}
              {book.language && (
                <View style={bookStyles.metadataItem}>
                  <FontAwesome name="language" size={14} color={colors.textSecondary} style={bookStyles.metadataIcon} />
                  <Text style={[bookStyles.metadata, { color: colors.textSecondary }]}>{book.language}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {book.description && (
          <View style={[bookStyles.section, { borderBottomColor: colors.border }]}>
            <Text style={[bookStyles.sectionTitle, { color: colors.text }]}>Description</Text>
            <Text style={[bookStyles.description, { color: colors.textSecondary }]}>{book.description}</Text>
          </View>
        )}

        {isInLibrary && (
          <>
            <View style={[bookStyles.section, { borderBottomColor: colors.border }]}>
              <Text style={[bookStyles.sectionTitle, { color: colors.text }]}>Your Rating</Text>
              <View style={bookStyles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const currentRating = rating?.rating || 0;
                  const isHalfStar = currentRating === star - 0.5;
                  const isFullStar = currentRating >= star;
                  
                  return (
                    <TouchableOpacity
                      key={star}
                      onPress={() => updateRating(star)}
                      onLongPress={() => updateRating(star - 0.5)}
                    >
                      <FontAwesome
                        name={
                          isFullStar ? "star" :
                          isHalfStar ? "star-half-o" :
                          "star-o"
                        }
                        size={24}
                        color={colors.accent}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
              {rating && (
                <Text style={[bookStyles.ratingText, { color: colors.textSecondary }]}>
                  Your rating: {rating.rating.toFixed(1)} stars
                </Text>
              )}
            </View>

            <View style={[bookStyles.section, { borderBottomColor: colors.border }]}>
              <Text style={[bookStyles.sectionTitle, { color: colors.text }]}>Add Note</Text>
              <TextInput
                style={[bookStyles.textInput, { 
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.background
                }]}
                placeholder="Page number (optional)"
                placeholderTextColor={colors.textSecondary}
                value={page}
                onChangeText={setPage}
                keyboardType="numeric"
              />
              <TextInput
                style={[bookStyles.textInput, { 
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.background,
                  minHeight: 100,
                  textAlignVertical: 'top'
                }]}
                placeholder="Write your note..."
                placeholderTextColor={colors.textSecondary}
                value={noteContent}
                onChangeText={setNoteContent}
                multiline
                numberOfLines={4}
              />
              <TouchableOpacity
                style={[bookStyles.addButton, { backgroundColor: colors.accent }]}
                onPress={handleAddNote}
              >
                <Text style={[bookStyles.addButtonText, { color: colors.background }]}>Add Note</Text>
              </TouchableOpacity>
            </View>

            <View style={[bookStyles.section, { borderBottomColor: colors.border, gap: 10 }]}>
              <Text style={[bookStyles.sectionTitle, { color: colors.text }]}>Notes</Text>
              {notes.length === 0 ? (
                <Text style={[bookStyles.emptyState, { color: colors.textSecondary }]}>No notes yet</Text>
              ) : (
                notes.map((note) => (
                  <BookNote
                    key={note.id}
                    note={note}
                    onDelete={deleteNote}
                  />
                ))
              )}
            </View>
          </>
        )}

        <View style={[bookStyles.section, { borderBottomColor: colors.border }]}>
          <Text style={[bookStyles.sectionTitle, { color: colors.text }]}>Reading Status</Text>
          <View style={bookStyles.statusSelector}>
            <Animated.View 
              style={[
                bookStyles.slider,
                { 
                  backgroundColor: colors.accent,
                  left: sliderPosition,
                }
              ]} 
            />
            <TouchableOpacity
              style={bookStyles.statusButton}
              onPress={() => handleStatusChange('past')}
            >
              <Text style={[
                bookStyles.statusButtonText,
                { color: selectedStatus === 'past' ? colors.background : colors.text }
              ]}>
                Past Read
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={bookStyles.statusButton}
              onPress={() => handleStatusChange('future')}
            >
              <Text style={[
                bookStyles.statusButtonText,
                { color: selectedStatus === 'future' ? colors.background : colors.text }
              ]}>
                Future Read
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {isInLibrary && (
          <TouchableOpacity 
            style={[bookStyles.removeButton, { backgroundColor: colors.error }]}
            onPress={handleRemoveBook}
          >
            <FontAwesome name="trash" size={16} color={colors.background} />
            <Text style={[bookStyles.removeButtonText, { color: colors.background }]}>Remove from Library</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 