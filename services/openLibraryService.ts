import { Book } from '@/types/book';

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

export const searchBooks = async (query: string): Promise<Book[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/search.json?q=${encodeURIComponent(query)}&limit=10`
    );
    const data: OpenLibrarySearchResponse = await response.json();

    if (!data.docs) {
      return [];
    }

    const books = await Promise.all(
      data.docs.map(async (doc) => {
        // Get edition details if available
        let editionDetails: Partial<Book> = {};
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
        let workDetails: Partial<Book> = {};
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

        return {
          id: doc.key.split('/').pop() || '',
          title: doc.title || 'Unknown Title',
          author: doc.author_name?.[0] || 'Unknown Author',
          coverImage: doc.cover_i 
            ? `${COVERS_URL}/id/${doc.cover_i}-L.jpg` 
            : null,
          publishDate: doc.first_publish_year?.toString(),
          editionKey: doc.edition_key?.[0],
          workKey: doc.key,
          ...editionDetails,
          ...workDetails,
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
    const response = await fetch(`${BASE_URL}/works/${bookId}.json`);
    const data: OpenLibraryWorkResponse = await response.json();

    if (!data) {
      return null;
    }

    // Get author details if available
    let author = 'Unknown Author';
    if (data.authors?.[0]?.author?.key) {
      try {
        const authorResponse = await fetch(`${BASE_URL}${data.authors[0].author.key}.json`);
        const authorData = await authorResponse.json();
        author = authorData.name || 'Unknown Author';
      } catch (error) {
        console.error('Error fetching author details:', error);
      }
    }

    return {
      id: bookId,
      title: data.title || 'Unknown Title',
      author,
      coverImage: data.covers?.[0] 
        ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg`
        : null,
      publishDate: undefined,
      publisher: undefined,
      pageCount: undefined,
      description: typeof data.description === 'string' 
        ? data.description 
        : data.description?.value,
      subjects: data.subjects,
      status: 'future' as const,
    };
  } catch (error) {
    console.error('Error fetching book details:', error);
    return null;
  }
}; 