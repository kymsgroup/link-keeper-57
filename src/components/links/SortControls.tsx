import { SortOption, SortDirection } from '@/types/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface SortControlsProps {
  sortBy: SortOption;
  sortDirection: SortDirection;
  onSortByChange: (value: SortOption) => void;
  onSortDirectionChange: () => void;
}

export function SortControls({
  sortBy,
  sortDirection,
  onSortByChange,
  onSortDirectionChange,
}: SortControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <Select value={sortBy} onValueChange={(v) => onSortByChange(v as SortOption)}>
        <SelectTrigger className="w-[130px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date">Date Added</SelectItem>
          <SelectItem value="title">Title</SelectItem>
          <SelectItem value="category">Category</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" size="icon" onClick={onSortDirectionChange}>
        {sortDirection === 'asc' ? (
          <ArrowUp className="h-4 w-4" />
        ) : (
          <ArrowDown className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
