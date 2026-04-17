'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Monitor, Tablet, Smartphone, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PreviewViewerProps {
  htmlCode: string;
}

const viewports = [
  { id: 'desktop', label: 'Desktop', icon: Monitor, width: '100%' },
  { id: 'tablet', label: 'Tablet', icon: Tablet, width: '768px' },
  { id: 'mobile', label: 'Mobile', icon: Smartphone, width: '375px' },
];

export function PreviewViewer({ htmlCode }: PreviewViewerProps) {
  const [viewport, setViewport] = useState('desktop');

  const currentViewport = viewports.find((v) => v.id === viewport) ?? viewports[0];

  return (
    <Card className="overflow-hidden border-border/60">
      <CardContent className="p-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/30">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px] font-semibold gap-1.5 px-2.5 py-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live Preview
            </Badge>
          </div>
          <div className="flex items-center gap-1 bg-background/80 rounded-lg p-1 border border-border/40">
            {viewports.map((v) => {
              const Icon = v.icon;
              return (
                <Button
                  key={v.id}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-7 w-7 rounded-md transition-all',
                    viewport === v.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                  onClick={() => setViewport(v.id)}
                  title={v.label}
                >
                  <Icon className="h-3.5 w-3.5" />
                </Button>
              );
            })}
          </div>
        </div>

        {/* Browser Chrome */}
        <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b border-border/40">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-background/90 rounded-md px-3 py-1 text-[10px] text-muted-foreground border border-border/30 w-56 text-center font-mono">
              troopod.app/preview
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex justify-center bg-muted/20 p-4 min-h-[400px] max-h-[600px] overflow-auto">
          <motion.div
            layout
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ width: currentViewport.width, maxWidth: '100%' }}
            className="rounded-lg overflow-hidden border border-border/40 shadow-xl"
          >
            <iframe
              srcDoc={htmlCode}
              className="w-full border-0 bg-white"
              style={{ minHeight: '400px', height: '500px' }}
              title="Preview"
              sandbox="allow-scripts"
            />
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}
