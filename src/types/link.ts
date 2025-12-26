export interface Link {
  id: string;
  title: string;
  url: string;
  category: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SortOption = 'title' | 'date' | 'category';
export type SortDirection = 'asc' | 'desc';
export type ReadFilter = 'all' | 'read' | 'unread';
