import { Book } from '@/types/book';
import { GOOGLE_BOOKS_API_KEY } from '@env';

const BASE_URL = 'https://www.googleapis.com/books/v1';
const API_KEY = GOOGLE_BOOKS_API_KEY;

interface GoogleBooksSearchResponse {
  items?: Array<{
    id: string;
    volumeInfo: {
      title: string;
      authors?: string[];
      description?: string;
      imageLinks?: {
        thumbnail?: string;
      };
      publishedDate?: string;
      publisher?: string;
      pageCount?: number;
      language?: string;
      categories?: string[];
      industryIdentifiers?: Array<{
        type: string;
        identifier: string;
      }>;
    };
  }>;
}

export const searchBooks = async (query: string): Promise<Book[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/volumes?q=${encodeURIComponent(query)}&maxResults=10&key=${API_KEY}`
    );
    const data: GoogleBooksSearchResponse = await response.json();

    if (!data.items) {
      return [];
    }

    return data.items.map(item => ({
      id: item.id,
      title: item.volumeInfo.title,
      author: item.volumeInfo.authors?.[0] || 'Unknown Author',
      coverImage: item.volumeInfo.imageLinks?.thumbnail?.replace('http://', 'https://') || null,
      description: item.volumeInfo.description,
      publisher: item.volumeInfo.publisher,
      publishDate: item.volumeInfo.publishedDate,
      pageCount: item.volumeInfo.pageCount,
      language: item.volumeInfo.language,
      subjects: item.volumeInfo.categories,
      isbn: item.volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier,
      status: 'future' as const,
    }));
  } catch (error) {
    console.error('Error searching books:', error);
    throw error;
  }
};

export const getBookDetails = async (bookId: string): Promise<Book | null> => {
  try {
    const response = await fetch(`${BASE_URL}/volumes/${bookId}?key=${API_KEY}`);
    const data = await response.json();

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      title: data.volumeInfo.title,
      author: data.volumeInfo.authors?.[0] || 'Unknown Author',
      coverImage: data.volumeInfo.imageLinks?.thumbnail?.replace('http://', 'https://') || null,
      description: data.volumeInfo.description,
      publisher: data.volumeInfo.publisher,
      publishDate: data.volumeInfo.publishedDate,
      pageCount: data.volumeInfo.pageCount,
      language: data.volumeInfo.language,
      subjects: data.volumeInfo.categories,
      isbn: data.volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier,
      status: 'future' as const,
    };
  } catch (error) {
    console.error('Error fetching book details:', error);
    return null;
  }
}; 