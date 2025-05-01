import { Book } from '@/types/book';
import { BookApiResponse } from '@/types/bookApi';
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

function cleanDescription(description: string | undefined): string | undefined {
  if (!description) return undefined;

  // First, remove content between <b> tags (including the tags themselves)
  let cleaned = description.replace(/<b>[\s\S]*?<\/b>/g, '');

  // Remove all remaining HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, '');

  // Fix spacing issues
  cleaned = cleaned
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\s+([.,!?])/g, '$1') // Remove spaces before punctuation
    .replace(/([.,!?])\s+/g, '$1 ') // Ensure single space after punctuation
    .replace(/([.!?])\s*([A-Z])/g, '$1\n\n$2') // Add double newline after sentences
    .replace(/\n\s*\n/g, '\n\n') // Remove extra newlines
    .trim(); // Remove leading/trailing spaces

  return cleaned;
}

function getCoverImageUrl(thumbnail?: string): string | null {
  if (!thumbnail) return null;
  return thumbnail.replace('http://', 'https://');
}

function mapToBookApiResponse(item: GoogleBooksSearchResponse['items'][0]): BookApiResponse | null {
  try {
    if (!item || !item.volumeInfo || !item.volumeInfo.title) {
      console.error('Invalid book data received:', item);
      return null;
    }

    const { volumeInfo } = item;
    console.log('Processing volume info:', volumeInfo); // Debug log

    return {
      id: item.id,
      title: volumeInfo.title,
      author: volumeInfo.authors?.[0] || 'Unknown Author',
      coverImage: getCoverImageUrl(volumeInfo.imageLinks?.thumbnail),
      description: cleanDescription(volumeInfo.description),
      publisher: volumeInfo.publisher,
      publishDate: volumeInfo.publishedDate,
      pageCount: volumeInfo.pageCount,
      language: volumeInfo.language,
      subjects: volumeInfo.categories,
      isbn: volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier,
    };
  } catch (error) {
    console.error('Error mapping book data:', error);
    return null;
  }
}

export const searchBooks = async (query: string): Promise<Book[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/volumes?q=${encodeURIComponent(query)}&maxResults=10&key=${API_KEY}`
    );
    
    if (!response.ok) {
      console.error('Error fetching books:', response.statusText);
      return [];
    }

    const data: GoogleBooksSearchResponse = await response.json();
    console.log('Search response:', data); // Debug log

    if (!data.items || data.items.length === 0) {
      return [];
    }

    const books = data.items
      .map(item => {
        const bookApiResponse = mapToBookApiResponse(item);
        if (!bookApiResponse) return null;
        
        return {
          ...bookApiResponse,
          status: 'future' as const,
        };
      })
      .filter((book): book is Book => book !== null);

    console.log('Processed books:', books); // Debug log
    return books;
  } catch (error) {
    console.error('Error searching books:', error);
    throw error;
  }
};

export const getBookDetails = async (bookId: string): Promise<Book | null> => {
  try {
    const response = await fetch(`${BASE_URL}/volumes/${bookId}?key=${API_KEY}`);
    
    if (!response.ok) {
      console.error('Error fetching book details:', response.statusText);
      return null;
    }

    const data = await response.json();
    console.log('Book details response:', data); // Debug log

    if (!data || !data.volumeInfo) {
      console.error('Invalid book data received');
      return null;
    }

    const bookApiResponse = mapToBookApiResponse({ id: data.id, volumeInfo: data.volumeInfo });
    if (!bookApiResponse) {
      console.error('Failed to map book data');
      return null;
    }

    return {
      ...bookApiResponse,
      status: 'future' as const,
    };
  } catch (error) {
    console.error('Error fetching book details:', error);
    return null;
  }
}; 