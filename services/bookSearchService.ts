import { Book } from '@/types/book';
import { searchBooks as searchGoogleBooks, getBookDetails as getGoogleBookDetails } from './googleBooksService';
import { searchBooks as searchOpenLibrary, getBookDetails as getOpenLibraryBookDetails } from './openLibraryService';

interface SearchResult {
  book: Book;
  source: 'google' | 'openlibrary';
  matchScore: number;
}

function calculateMatchScore(query: string, book: Book): number {
  const searchTerms = query.toLowerCase().split(' ');
  const title = book.title.toLowerCase();
  const author = book.author.toLowerCase();
  
  let score = 0;
  
  // Exact title match
  if (title === query.toLowerCase()) {
    score += 100;
  }
  
  // Title contains all search terms
  if (searchTerms.every(term => title.includes(term))) {
    score += 50;
  }
  
  // Author match
  if (author.includes(query.toLowerCase())) {
    score += 30;
  }
  
  // Partial title matches
  searchTerms.forEach(term => {
    if (title.includes(term)) {
      score += 10;
    }
  });
  
  return score;
}

export const searchBooks = async (query: string): Promise<Book[]> => {
  try {
    // Search both APIs in parallel
    const [googleResults, openLibraryResults] = await Promise.all([
      searchGoogleBooks(query),
      searchOpenLibrary(query)
    ]);

    // Combine and score results
    const combinedResults: SearchResult[] = [
      ...googleResults.map(book => ({
        book,
        source: 'google' as const,
        matchScore: calculateMatchScore(query, book)
      })),
      ...openLibraryResults.map(book => ({
        book,
        source: 'openlibrary' as const,
        matchScore: calculateMatchScore(query, book)
      }))
    ];

    // Sort by match score (highest first)
    combinedResults.sort((a, b) => b.matchScore - a.matchScore);

    // Remove duplicates (keep the one with higher match score)
    const uniqueResults = combinedResults.reduce((acc, result) => {
      const existingIndex = acc.findIndex(
        item => item.book.title.toLowerCase() === result.book.title.toLowerCase() &&
                item.book.author.toLowerCase() === result.book.author.toLowerCase()
      );

      if (existingIndex === -1) {
        acc.push(result);
      } else if (result.matchScore > acc[existingIndex].matchScore) {
        acc[existingIndex] = result;
      }

      return acc;
    }, [] as SearchResult[]);

    // Return just the books, maintaining the sorted order
    return uniqueResults.map(result => result.book);
  } catch (error) {
    console.error('Error searching books:', error);
    throw error;
  }
};

export const getBookDetails = async (bookId: string): Promise<Book | null> => {
  try {
    // Try Google Books first
    const googleBook = await getGoogleBookDetails(bookId);
    if (googleBook) {
      return googleBook;
    }

    // If not found in Google Books, try OpenLibrary
    const openLibraryBook = await getOpenLibraryBookDetails(bookId);
    return openLibraryBook;
  } catch (error) {
    console.error('Error fetching book details:', error);
    return null;
  }
}; 