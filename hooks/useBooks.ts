import { useState, useEffect, useCallback } from 'react';
import { Book } from '@/types/book';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LIBRARY_STORAGE_KEY = '@wildfire_library';

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBooks = useCallback(async () => {
    try {
      const storedBooks = await AsyncStorage.getItem(LIBRARY_STORAGE_KEY);
      if (storedBooks) {
        setBooks(JSON.parse(storedBooks));
      }
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const addBook = async (book: Book) => {
    try {
      const updatedBooks = [...books, book];
      setBooks(updatedBooks);
      await AsyncStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(updatedBooks));
    } catch (error) {
      console.error('Error adding book:', error);
      throw error;
    }
  };

  const updateBook = async (updatedBook: Book) => {
    try {
      const updatedBooks = books.map(book => 
        book.id === updatedBook.id ? updatedBook : book
      );
      await AsyncStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(updatedBooks));
      setBooks(updatedBooks);
    } catch (error) {
      console.error('Error updating book:', error);
      throw error;
    }
  };

  const deleteBook = async (bookId: string) => {
    try {
      const updatedBooks = books.filter(book => book.id !== bookId);
      await AsyncStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(updatedBooks));
      setBooks(updatedBooks);
    } catch (error) {
      console.error('Error deleting book:', error);
      throw error;
    }
  };

  const deleteAllBooks = async () => {
    try {
      await AsyncStorage.removeItem(LIBRARY_STORAGE_KEY);
      setBooks([]);
    } catch (error) {
      console.error('Error deleting all books:', error);
      throw error;
    }
  };

  return {
    books,
    loading,
    addBook,
    updateBook,
    deleteBook,
    loadBooks,
    deleteAllBooks,
  };
} 