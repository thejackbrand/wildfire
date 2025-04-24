export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string | null;
  description?: string;
  rating?: number;
  publisher?: string;
  publishDate?: string;
  pageCount?: number;
  language?: string;
  subjects?: string[];
  isbn?: string;
  editionKey?: string;
  workKey?: string;
  status: 'past' | 'future';
}

export interface BookRating {
  id: string;
  bookId: string;
  rating: number; // 0.5 to 5 in 0.5 increments
  date: string;
}

export interface BookNote {
  id: string;
  bookId: string;
  content: string;
  page?: number;
  date: string;
}

export interface BookReview {
  id: string;
  bookId: string;
  rating: number;
  review: string;
  date: string;
  page?: number;
} 