import { useState, useEffect, useCallback } from 'react';
import { Link, SortOption, SortDirection, ReadFilter } from '@/types/link';

const STORAGE_KEY = 'link-organizer-links';
const CATEGORIES_KEY = 'link-organizer-categories';

export function useLinks() {
  const [links, setLinks] = useState<Link[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const storedLinks = localStorage.getItem(STORAGE_KEY);
    const storedCategories = localStorage.getItem(CATEGORIES_KEY);
    
    if (storedLinks) {
      try {
        setLinks(JSON.parse(storedLinks));
      } catch (e) {
        console.error('Failed to parse stored links:', e);
      }
    }
    
    if (storedCategories) {
      try {
        setCategories(JSON.parse(storedCategories));
      } catch (e) {
        console.error('Failed to parse stored categories:', e);
      }
    }
    
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever links or categories change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
    }
  }, [links, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    }
  }, [categories, isLoaded]);

  const addLink = useCallback((link: Omit<Link, 'id' | 'createdAt' | 'updatedAt' | 'isRead'>) => {
    const newLink: Link = {
      ...link,
      id: crypto.randomUUID(),
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLinks(prev => [newLink, ...prev]);
    
    // Add category if new
    if (link.category && !categories.includes(link.category)) {
      setCategories(prev => [...prev, link.category]);
    }
  }, [categories]);

  const updateLink = useCallback((id: string, updates: Partial<Omit<Link, 'id' | 'createdAt'>>) => {
    setLinks(prev => prev.map(link => 
      link.id === id 
        ? { ...link, ...updates, updatedAt: new Date().toISOString() }
        : link
    ));
    
    // Add category if new
    if (updates.category && !categories.includes(updates.category)) {
      setCategories(prev => [...prev, updates.category!]);
    }
  }, [categories]);

  const deleteLink = useCallback((id: string) => {
    setLinks(prev => prev.filter(link => link.id !== id));
  }, []);

  const deleteMultipleLinks = useCallback((ids: string[]) => {
    setLinks(prev => prev.filter(link => !ids.includes(link.id)));
  }, []);

  const toggleReadStatus = useCallback((id: string) => {
    setLinks(prev => prev.map(link =>
      link.id === id
        ? { ...link, isRead: !link.isRead, updatedAt: new Date().toISOString() }
        : link
    ));
  }, []);

  const clearAllLinks = useCallback(() => {
    setLinks([]);
    setCategories([]);
  }, []);

  const addCategory = useCallback((category: string) => {
    if (!categories.includes(category)) {
      setCategories(prev => [...prev, category]);
    }
  }, [categories]);

  const exportLinks = useCallback(() => {
    const data = {
      links,
      categories,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `links-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [links, categories]);

  const importLinks = useCallback((jsonData: string): { success: boolean; message: string } => {
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.links || !Array.isArray(data.links)) {
        return { success: false, message: 'Invalid format: missing links array' };
      }
      
      // Validate each link
      for (const link of data.links) {
        if (!link.id || !link.title || !link.url || !link.category) {
          return { success: false, message: 'Invalid format: links missing required fields' };
        }
      }
      
      // Merge with existing links (avoid duplicates by id)
      const existingIds = new Set(links.map(l => l.id));
      const newLinks = data.links.filter((l: Link) => !existingIds.has(l.id));
      
      setLinks(prev => [...newLinks, ...prev]);
      
      // Merge categories
      if (data.categories && Array.isArray(data.categories)) {
        const newCategories = data.categories.filter((c: string) => !categories.includes(c));
        setCategories(prev => [...prev, ...newCategories]);
      }
      
      return { success: true, message: `Imported ${newLinks.length} new links` };
    } catch (e) {
      return { success: false, message: 'Failed to parse JSON file' };
    }
  }, [links, categories]);

  const getFilteredAndSortedLinks = useCallback((
    searchQuery: string,
    categoryFilter: string,
    readFilter: ReadFilter,
    sortBy: SortOption,
    sortDirection: SortDirection
  ) => {
    let filtered = [...links];
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(link =>
        link.title.toLowerCase().includes(query) ||
        link.url.toLowerCase().includes(query)
      );
    }
    
    // Filter by category
    if (categoryFilter) {
      filtered = filtered.filter(link => link.category === categoryFilter);
    }
    
    // Filter by read status
    if (readFilter === 'read') {
      filtered = filtered.filter(link => link.isRead);
    } else if (readFilter === 'unread') {
      filtered = filtered.filter(link => !link.isRead);
    }
    
    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'date':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }
      
      return sortDirection === 'desc' ? -comparison : comparison;
    });
    
    return filtered;
  }, [links]);

  return {
    links,
    categories,
    isLoaded,
    addLink,
    updateLink,
    deleteLink,
    deleteMultipleLinks,
    toggleReadStatus,
    clearAllLinks,
    addCategory,
    exportLinks,
    importLinks,
    getFilteredAndSortedLinks,
  };
}
