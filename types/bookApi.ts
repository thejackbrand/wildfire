export interface BookApiResponse {
  id: string;
  title: string;
  author: string;
  coverImage: string | null;
  description?: string;
  publisher?: string;
  publishDate?: string;
  pageCount?: number;
  language?: string;
  subjects?: string[];
  isbn?: string;
  editionKey?: string;
  workKey?: string;
} 