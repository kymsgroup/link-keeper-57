import { useState, useMemo } from 'react';
import { Link, SortOption, SortDirection, ReadFilter } from '@/types/link';
import { useLinks } from '@/hooks/useLinks';
import { LinkCard } from '@/components/links/LinkCard';
import { LinkFormDialog } from '@/components/links/LinkFormDialog';
import { DeleteConfirmDialog } from '@/components/links/DeleteConfirmDialog';
import { SearchBar } from '@/components/links/SearchBar';
import { CategoryFilter } from '@/components/links/CategoryFilter';
import { SortControls } from '@/components/links/SortControls';
import { ReadFilterTabs } from '@/components/links/ReadFilterTabs';
import { DataManagementMenu } from '@/components/links/DataManagementMenu';
import { Button } from '@/components/ui/button';
import { Plus, CheckSquare, X, Trash2, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { toast } = useToast();
  const {
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
  } = useLinks();

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Selection State
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Dialog State
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null);
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);
  const [deleteSelectedDialogOpen, setDeleteSelectedDialogOpen] = useState(false);

  // Filtered and sorted links
  const filteredLinks = useMemo(() => {
    return getFilteredAndSortedLinks(
      searchQuery,
      categoryFilter === 'all' ? '' : categoryFilter,
      readFilter,
      sortBy,
      sortDirection
    );
  }, [getFilteredAndSortedLinks, searchQuery, categoryFilter, readFilter, sortBy, sortDirection]);

  // Counts for tabs
  const counts = useMemo(() => {
    const filtered = getFilteredAndSortedLinks(
      searchQuery,
      categoryFilter === 'all' ? '' : categoryFilter,
      'all',
      sortBy,
      sortDirection
    );
    return {
      all: filtered.length,
      read: filtered.filter(l => l.isRead).length,
      unread: filtered.filter(l => !l.isRead).length,
    };
  }, [getFilteredAndSortedLinks, searchQuery, categoryFilter, sortBy, sortDirection]);

  // Handlers
  const handleAddLink = () => {
    setEditingLink(null);
    setFormDialogOpen(true);
  };

  const handleEditLink = (link: Link) => {
    setEditingLink(link);
    setFormDialogOpen(true);
  };

  const handleSaveLink = (data: { title: string; url: string; category: string }) => {
    if (editingLink) {
      updateLink(editingLink.id, data);
      toast({ title: 'Link updated', description: 'Your link has been updated successfully.' });
    } else {
      addLink(data);
      toast({ title: 'Link added', description: 'Your link has been saved.' });
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeletingLinkId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingLinkId) {
      deleteLink(deletingLinkId);
      toast({ title: 'Link deleted', description: 'The link has been removed.' });
      setDeletingLinkId(null);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredLinks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredLinks.map(l => l.id)));
    }
  };

  const handleCancelSelect = () => {
    setIsSelectMode(false);
    setSelectedIds(new Set());
  };

  const handleDeleteSelected = () => {
    deleteMultipleLinks(Array.from(selectedIds));
    toast({
      title: 'Links deleted',
      description: `${selectedIds.size} links have been removed.`,
    });
    setSelectedIds(new Set());
    setIsSelectMode(false);
  };

  const handleImport = (data: string) => {
    const result = importLinks(data);
    if (result.success) {
      toast({ title: 'Import successful', description: result.message });
    } else {
      toast({ title: 'Import failed', description: result.message, variant: 'destructive' });
    }
  };

  const handleClearAll = () => {
    clearAllLinks();
    toast({ title: 'All links cleared', description: 'Your link directory has been emptied.' });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <LinkIcon className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Link Organizer</h1>
            </div>
            <div className="flex items-center gap-2">
              <DataManagementMenu
                onExport={exportLinks}
                onImport={handleImport}
                onClearAll={() => setClearAllDialogOpen(true)}
              />
              <Button onClick={handleAddLink}>
                <Plus className="h-4 w-4 mr-2" />
                Add Link
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Filters Bar */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>
            <div className="flex gap-2">
              <CategoryFilter
                value={categoryFilter}
                categories={categories}
                onChange={setCategoryFilter}
              />
              <SortControls
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSortByChange={setSortBy}
                onSortDirectionChange={() =>
                  setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <ReadFilterTabs value={readFilter} onChange={setReadFilter} counts={counts} />
            
            <div className="flex items-center gap-2">
              {isSelectMode ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    {selectedIds.size === filteredLinks.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={selectedIds.size === 0}
                    onClick={() => setDeleteSelectedDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete ({selectedIds.size})
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleCancelSelect}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsSelectMode(true)}>
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Select
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Links Grid */}
        {filteredLinks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLinks.map(link => (
              <LinkCard
                key={link.id}
                link={link}
                isSelected={selectedIds.has(link.id)}
                isSelectMode={isSelectMode}
                onSelect={handleSelect}
                onEdit={handleEditLink}
                onDelete={handleDeleteClick}
                onToggleRead={toggleReadStatus}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <LinkIcon className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {links.length === 0 ? 'No links yet' : 'No links found'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {links.length === 0
                ? 'Start by adding your first link to organize.'
                : 'Try adjusting your search or filters.'}
            </p>
            {links.length === 0 && (
              <Button onClick={handleAddLink}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Link
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Dialogs */}
      <LinkFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        link={editingLink}
        categories={categories}
        onSave={handleSaveLink}
        onAddCategory={addCategory}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Link"
        description="Are you sure you want to delete this link? This action cannot be undone."
        onConfirm={handleConfirmDelete}
      />

      <DeleteConfirmDialog
        open={deleteSelectedDialogOpen}
        onOpenChange={setDeleteSelectedDialogOpen}
        title="Delete Selected Links"
        description={`Are you sure you want to delete ${selectedIds.size} selected links? This action cannot be undone.`}
        onConfirm={handleDeleteSelected}
      />

      <DeleteConfirmDialog
        open={clearAllDialogOpen}
        onOpenChange={setClearAllDialogOpen}
        title="Clear All Links"
        description="Are you sure you want to delete ALL your saved links? This action cannot be undone."
        onConfirm={handleClearAll}
      />
    </div>
  );
};

export default Index;
