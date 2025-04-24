import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BookReview } from '@/types/book';

const REVIEWS_STORAGE_KEY = '@wildfire_book_reviews';

export function useBookReviews(bookId: string) {
  const [reviews, setReviews] = useState<BookReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, [bookId]);

  const loadReviews = async () => {
    try {
      const storedReviews = await AsyncStorage.getItem(REVIEWS_STORAGE_KEY);
      if (storedReviews) {
        const allReviews = JSON.parse(storedReviews);
        const bookReviews = allReviews.filter((review: BookReview) => review.bookId === bookId);
        setReviews(bookReviews);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addReview = async (review: Omit<BookReview, 'id' | 'date'>) => {
    try {
      const newReview: BookReview = {
        ...review,
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
      };

      const storedReviews = await AsyncStorage.getItem(REVIEWS_STORAGE_KEY);
      const allReviews = storedReviews ? JSON.parse(storedReviews) : [];
      const updatedReviews = [...allReviews, newReview];
      
      await AsyncStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(updatedReviews));
      setReviews(prevReviews => [...prevReviews, newReview]);
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  };

  const deleteReview = async (reviewId: string) => {
    try {
      const storedReviews = await AsyncStorage.getItem(REVIEWS_STORAGE_KEY);
      if (storedReviews) {
        const allReviews = JSON.parse(storedReviews);
        const updatedReviews = allReviews.filter((review: BookReview) => review.id !== reviewId);
        
        await AsyncStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(updatedReviews));
        setReviews(prevReviews => prevReviews.filter(review => review.id !== reviewId));
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  };

  return {
    reviews,
    isLoading,
    addReview,
    deleteReview,
  };
} 