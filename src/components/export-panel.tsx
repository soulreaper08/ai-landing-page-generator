'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Copy, Check, Share2, FileCode, Globe, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ExportPanelProps {
  reactCode?: string;
  htmlCode?: string;
  resultId?: string;
}

const exportOptions = [
  {
    id: 'react',
    label: 'Download React Component',
    format: '.tsx',
    icon: FileCode,
    description: 'TypeScript React component with inline styles',
  },
  {
    id: 'html',
    label: 'Download HTML/CSS Bundle',
    format: '.html',
    icon: Globe,
    description: 'Self-contained HTML with embedded styles',
  },
];

export function ExportPanel({ reactCode, htmlCode, resultId }: ExportPanelProps) {
  const [copiedAll, setCopiedAll] = useState(false);

  const handleDownload = (code: string, filename: string) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  const handleCopyAll = () => {
    const code = reactCode || htmlCode || '';
    navigator.clipboard.writeText(code).then(() => {
      setCopiedAll(true);
      toast.success('Full code copied to clipboard!');
      setTimeout(() => setCopiedAll(false), 2000);
    }).catch(() => {
      toast.error('Failed to copy');
    });
  };

  const handleShare = () => {
    const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://troopod.app'}/generate/${resultId || 'demo'}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success('Share link copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Download className="h-4 w-4 text-primary" />
            Export Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {exportOptions.map((option) => {
            const code = option.id === 'react' ? reactCode : htmlCode;
            if (!code) return null;
            const Icon = option.icon;

            return (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleDownload(code, `personalized-hero${option.format}`)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-background hover:bg-muted/50 hover:border-primary/20 transition-all duration-200 text-left group cursor-pointer"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{option.label}</p>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
                <Badge variant="secondary" className="text-[10px] flex-shrink-0">
                  {option.format}
                </Badge>
              </motion.button>
            );
          })}

          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyAll}
              className="flex-1 text-xs gap-1.5"
            >
              {copiedAll ? (
                <>
                  <Check className="h-3 w-3 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy Full Code
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="flex-1 text-xs gap-1.5"
            >
              <Share2 className="h-3 w-3" />
              Share Link
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
