'use client';

import { useState, useCallback } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  History,
  Trash2,
  Clock,
  Globe,
  BarChart3,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface HistoryItem {
  id: number;
  pageUrl: string;
  timestamp: string;
  qualityScore: number;
  totalChanges: number;
  adImagePreview?: string;
}

interface HistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoadHistory: (item: HistoryItem) => void;
}

function readHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('troopod-history') || '[]');
  } catch {
    return [];
  }
}

export function HistoryDrawer({ open, onOpenChange, onLoadHistory }: HistoryDrawerProps) {
  // Using a refresh counter to force re-read from localStorage
  const [refreshKey, setRefreshKey] = useState(0);
  const history = open ? readHistory() : [];

  // Increment refreshKey to re-render when needed
  const forceRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const handleClearHistory = () => {
    localStorage.removeItem('troopod-history');
    forceRefresh();
    toast.success('History cleared');
  };

  const handleDeleteItem = (id: number) => {
    const current = readHistory();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem('troopod-history', JSON.stringify(updated));
    forceRefresh();
    toast.success('Item removed');
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-500/10 border-green-500/20';
    if (score >= 70) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[440px] p-0">
        <SheetHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-lg">
              <History className="h-5 w-5 text-primary" />
              Analysis History
            </SheetTitle>
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-destructive h-8 px-2"
                onClick={handleClearHistory}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Clear All
              </Button>
            )}
          </div>
        </SheetHeader>

        <Separator />

        <div className="px-6 py-3">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <History className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No analysis history yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1 max-w-[200px]">
                Complete an analysis to see it saved here
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-180px)] -mx-6 px-6" key={refreshKey}>
              <div className="space-y-3 pb-6">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="history-item group rounded-xl border border-border/60 bg-card hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => onLoadHistory(item)}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <p className="text-sm font-medium truncate">
                              {(() => { try { return new URL(item.pageUrl).hostname; } catch { return item.pageUrl; } })()}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mb-3">
                            {item.pageUrl}
                          </p>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-[11px] text-muted-foreground">
                                {formatTimeAgo(item.timestamp)}
                              </span>
                            </div>
                            <div className={cn(
                              'flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium',
                              getScoreBg(item.qualityScore)
                            )}>
                              <BarChart3 className={cn('h-3 w-3', getScoreColor(item.qualityScore))} />
                              <span className={getScoreColor(item.qualityScore)}>
                                {item.qualityScore}/100
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Layers className="h-3 w-3 text-muted-foreground" />
                              <span className="text-[11px] text-muted-foreground">
                                {item.totalChanges} changes
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteItem(item.id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
