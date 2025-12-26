import { ReadFilter } from '@/types/link';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ReadFilterTabsProps {
  value: ReadFilter;
  onChange: (value: ReadFilter) => void;
  counts: {
    all: number;
    read: number;
    unread: number;
  };
}

export function ReadFilterTabs({ value, onChange, counts }: ReadFilterTabsProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as ReadFilter)}>
      <TabsList>
        <TabsTrigger value="all">
          All ({counts.all})
        </TabsTrigger>
        <TabsTrigger value="unread">
          Unread ({counts.unread})
        </TabsTrigger>
        <TabsTrigger value="read">
          Read ({counts.read})
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
