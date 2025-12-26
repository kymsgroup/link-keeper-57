import { useState } from 'react';
import { Link } from '@/types/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { MoreVertical, ExternalLink, Pencil, Trash2, Check, Circle } from 'lucide-react';
import { format } from 'date-fns';

interface LinkCardProps {
  link: Link;
  isSelected: boolean;
  isSelectMode: boolean;
  onSelect: (id: string) => void;
  onEdit: (link: Link) => void;
  onDelete: (id: string) => void;
  onToggleRead: (id: string) => void;
}

export function LinkCard({
  link,
  isSelected,
  isSelectMode,
  onSelect,
  onEdit,
  onDelete,
  onToggleRead,
}: LinkCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  const getDisplayUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname + (urlObj.pathname !== '/' ? urlObj.pathname : '');
    } catch {
      return url;
    }
  };

  const isYouTube = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const favicon = getFaviconUrl(link.url);

  return (
    <Card
      className={`group relative transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 ${
        isSelected ? 'ring-2 ring-primary' : ''
      } ${link.isRead ? 'opacity-70' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {isSelectMode && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect(link.id)}
              className="mt-1"
            />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <HoverCard openDelay={300}>
                <HoverCardTrigger asChild>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    {favicon && (
                      <img
                        src={favicon}
                        alt=""
                        className="w-4 h-4 flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <h3 className="font-medium text-foreground line-clamp-2 group-hover/link:underline">
                      {link.title}
                    </h3>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity flex-shrink-0" />
                  </a>
                </HoverCardTrigger>
                <HoverCardContent className="w-80" align="start">
                  <div className="space-y-2">
                    <h4 className="font-semibold">{link.title}</h4>
                    <p className="text-sm text-muted-foreground break-all">
                      {link.url}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Added: {format(new Date(link.createdAt), 'MMM d, yyyy')}</span>
                      {isYouTube(link.url) && (
                        <Badge variant="secondary" className="text-xs">
                          YouTube
                        </Badge>
                      )}
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 flex-shrink-0 ${
                      isHovered ? 'opacity-100' : 'opacity-0'
                    } transition-opacity`}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onToggleRead(link.id)}>
                    {link.isRead ? (
                      <>
                        <Circle className="mr-2 h-4 w-4" />
                        Mark as Unread
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Mark as Read
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(link)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(link.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <p className="text-sm text-muted-foreground mt-1 truncate">
              {getDisplayUrl(link.url)}
            </p>

            <div className="flex items-center gap-2 mt-3">
              <Badge variant="secondary" className="text-xs">
                {link.category}
              </Badge>
              {link.isRead && (
                <Badge variant="outline" className="text-xs text-success border-success">
                  <Check className="w-3 h-3 mr-1" />
                  Read
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
