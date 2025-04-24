import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BookNote } from '@/types/book';

const NOTES_STORAGE_KEY = '@wildfire_book_notes';

export function useBookNotes(bookId: string) {
  const [notes, setNotes] = useState<BookNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, [bookId]);

  const loadNotes = async () => {
    try {
      const storedNotes = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
      if (storedNotes) {
        const allNotes = JSON.parse(storedNotes);
        const bookNotes = allNotes.filter((note: BookNote) => note.bookId === bookId);
        setNotes(bookNotes);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addNote = async (note: Omit<BookNote, 'id' | 'date'>) => {
    try {
      const newNote: BookNote = {
        ...note,
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
      };

      const storedNotes = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
      const allNotes = storedNotes ? JSON.parse(storedNotes) : [];
      const updatedNotes = [...allNotes, newNote];
      
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));
      setNotes(prevNotes => [...prevNotes, newNote]);
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const storedNotes = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
      if (storedNotes) {
        const allNotes = JSON.parse(storedNotes);
        const updatedNotes = allNotes.filter((note: BookNote) => note.id !== noteId);
        
        await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));
        setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  };

  return {
    notes,
    isLoading,
    addNote,
    deleteNote,
  };
} 