import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BookRating } from '@/types/book';
import { useBooks } from '@/hooks/useBooks';

const RATINGS_STORAGE_KEY = '@wildfire_book_ratings';

export function useBookRatings(bookId?: string) {
  const [rating, setRating] = useState<BookRating | null>(null);
  const [allRatings, setAllRatings] = useState<BookRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { books } = useBooks();

  useEffect(() => {
    loadRatings();
  }, [bookId, books]);

  const loadRatings = async () => {
    try {
      const storedRatings = await AsyncStorage.getItem(RATINGS_STORAGE_KEY);
      if (storedRatings) {
        const ratings = JSON.parse(storedRatings);
        setAllRatings(ratings);
        
        if (bookId) {
          const bookRating = ratings.find((r: BookRating) => r.bookId === bookId);
          setRating(bookRating || null);
        }
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateRating = async (newRating: number) => {
    if (!bookId) return;
    
    try {
      const storedRatings = await AsyncStorage.getItem(RATINGS_STORAGE_KEY);
      const allRatings = storedRatings ? JSON.parse(storedRatings) : [];
      
      const existingRatingIndex = allRatings.findIndex((r: BookRating) => r.bookId === bookId);
      const newRatingObj: BookRating = {
        id: Date.now().toString(),
        bookId,
        rating: newRating,
        date: new Date().toISOString().split('T')[0],
      };

      if (existingRatingIndex >= 0) {
        allRatings[existingRatingIndex] = newRatingObj;
      } else {
        allRatings.push(newRatingObj);
      }
      
      await AsyncStorage.setItem(RATINGS_STORAGE_KEY, JSON.stringify(allRatings));
      setRating(newRatingObj);
      setAllRatings(allRatings);
    } catch (error) {
      console.error('Error updating rating:', error);
      throw error;
    }
  };

  const getAverageRating = () => {
    if (allRatings.length === 0) return 0;
    
    const sum = allRatings.reduce((acc, curr) => acc + curr.rating, 0);
    return sum / allRatings.length;
  };

  const resetAllRatings = async () => {
    try {
      await AsyncStorage.removeItem(RATINGS_STORAGE_KEY);
      setAllRatings([]);
      setRating(null);
    } catch (error) {
      console.error('Error resetting all ratings:', error);
      throw error;
    }
  };

  return {
    rating,
    isLoading,
    updateRating,
    getAverageRating,
    resetAllRatings,
    loadRatings,
  };
} 