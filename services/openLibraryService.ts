import { Book } from '@/types/book';
import { BookApiResponse } from '@/types/bookApi';

const BASE_URL = 'https://openlibrary.org';
const COVERS_URL = 'https://covers.openlibrary.org/b';

interface OpenLibrarySearchResponse {
  docs: Array<{
    key: string;
    title: string;
    author_name?: string[];
    cover_i?: number;
    first_publish_year?: number;
    edition_key?: string[];
    language?: string[];
    publisher?: string[];
    publish_date?: string[];
    number_of_pages?: number;
    subject?: string[];
    isbn?: string[];
  }>;
}

interface OpenLibraryEditionResponse {
  publishers?: string[];
  publish_date?: string;
  number_of_pages?: number;
  languages?: Array<{ key: string }>;
  subjects?: string[];
  isbn_13?: string[];
  isbn_10?: string[];
}

interface OpenLibraryWorkResponse {
  title?: string;
  authors?: Array<{ author: { key: string } }>;
  description?: string | { value: string };
  subjects?: string[];
  covers?: number[];
}

function getCoverImageUrl(coverId?: number): string | null {
  if (!coverId) return null;
  return `${COVERS_URL}/id/${coverId}-L.jpg`;
}

function mapToBookApiResponse(
  id: string,
  title: string,
  author: string,
  coverImage: string | null,
  additionalData: Partial<BookApiResponse> = {}
): BookApiResponse {
  return {
    id,
    title,
    author,
    coverImage,
    ...additionalData,
  };
}

export const searchBooks = async (query: string): Promise<Book[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/search.json?q=${encodeURIComponent(query)}&limit=10`
    );
    const data: OpenLibrarySearchResponse = await response.json();

    if (!data.docs || data.docs.length === 0) {
      return [];
    }

    const books = await Promise.all(
      data.docs.map(async (doc) => {
        // Get edition details if available
        let editionDetails: Partial<BookApiResponse> = {};
        if (doc.edition_key?.[0]) {
          try {
            const editionResponse = await fetch(
              `${BASE_URL}/books/${doc.edition_key[0]}.json`
            );
            const editionData: OpenLibraryEditionResponse = await editionResponse.json();
            
            editionDetails = {
              publisher: editionData.publishers?.[0],
              publishDate: editionData.publish_date,
              pageCount: editionData.number_of_pages,
              language: editionData.languages?.[0]?.key?.split('/').pop(),
              subjects: editionData.subjects,
              isbn: editionData.isbn_13?.[0] || editionData.isbn_10?.[0],
            };
          } catch (error) {
            console.error('Error fetching edition details:', error);
          }
        }

        // Get work details if available
        let workDetails: Partial<BookApiResponse> = {};
        if (doc.key) {
          try {
            const workResponse = await fetch(
              `${BASE_URL}${doc.key}.json`
            );
            const workData: OpenLibraryWorkResponse = await workResponse.json();
            
            workDetails = {
              description: typeof workData.description === 'string' 
                ? workData.description 
                : workData.description?.value,
              subjects: workData.subjects,
            };
          } catch (error) {
            console.error('Error fetching work details:', error);
          }
        }

        // Extract the work ID from the key (e.g., "/works/OL12345W" -> "OL12345W")
        const workId = doc.key.split('/').pop() || '';
        
        const bookApiResponse = mapToBookApiResponse(
          workId,
          doc.title || 'Unknown Title',
          doc.author_name?.[0] || 'Unknown Author',
          getCoverImageUrl(doc.cover_i),
          {
            ...editionDetails,
            ...workDetails,
          }
        );

        return {
          ...bookApiResponse,
          status: 'future' as const,
        };
      })
    );

    return books;
  } catch (error) {
    console.error('Error searching books:', error);
    throw error;
  }
};

export const getBookDetails = async (bookId: string): Promise<Book | null> => {
  try {
    // First try to get the work details
    const workResponse = await fetch(`${BASE_URL}/works/${bookId}.json`);
    if (!workResponse.ok) {
      console.error('Error fetching work details:', workResponse.statusText);
      return null;
    }
    const workData: OpenLibraryWorkResponse = await workResponse.json();
    console.log('Work data:', workData); // Debug log

    if (!workData || typeof workData !== 'object') {
      console.error('Invalid work data received');
      return null;
    }

    // Get author details if available
    let author = 'Unknown Author';
    if (workData.authors?.[0]?.author?.key) {
      try {
        const authorResponse = await fetch(`${BASE_URL}${workData.authors[0].author.key}.json`);
        if (authorResponse.ok) {
          const authorData = await authorResponse.json();
          console.log('Author data:', authorData); // Debug log
          author = authorData.name || 'Unknown Author';
        }
      } catch (error) {
        console.error('Error fetching author details:', error);
      }
    }

    // Try to get edition details if available
    let editionDetails: Partial<BookApiResponse> = {};
    let coverId: number | undefined;
    try {
      const editionResponse = await fetch(`${BASE_URL}/works/${bookId}/editions.json`);
      if (editionResponse.ok) {
        const editionData = await editionResponse.json();
        console.log('Edition data:', editionData); // Debug log
        if (editionData.entries?.[0]) {
          const firstEdition = editionData.entries[0];
          editionDetails = {
            publisher: firstEdition.publishers?.[0]?.name,
            publishDate: firstEdition.publish_date,
            pageCount: firstEdition.number_of_pages,
            language: firstEdition.languages?.[0]?.key?.split('/').pop(),
            isbn: firstEdition.isbn_13?.[0] || firstEdition.isbn_10?.[0],
          };
          // Try to get cover from edition first
          if (firstEdition.covers?.[0]) {
            coverId = firstEdition.covers[0];
          }
        }
      }
    } catch (error) {
      console.error('Error fetching edition details:', error);
    }

    // If no cover from edition, try work covers
    if (!coverId && workData.covers?.[0]) {
      coverId = workData.covers[0];
    }

    // Get description from work data
    let description: string | undefined;
    if (workData.description) {
      if (typeof workData.description === 'string') {
        description = workData.description;
      } else if (typeof workData.description === 'object' && 'value' in workData.description) {
        description = workData.description.value;
      }
    }

    // Debug log the final data
    console.log('Final book data:', {
      id: bookId,
      title: workData.title,
      author,
      description,
      coverId,
      editionDetails,
    });

    // Ensure we have the minimum required data
    if (!workData.title) {
      console.error('Missing required title in work data');
      return null;
    }

    const bookApiResponse = mapToBookApiResponse(
      bookId,
      workData.title,
      author,
      getCoverImageUrl(coverId),
      {
        description,
        subjects: workData.subjects,
        ...editionDetails,
      }
    );

    return {
      ...bookApiResponse,
      status: 'future' as const,
    };
  } catch (error) {
    console.error('Error fetching book details:', error);
    return null;
  }
}; 