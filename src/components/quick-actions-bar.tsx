'use client';

import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowUp, Maximize, Copy, Download } from 'lucide-react';
import { toast } from 'sonner';

interface QuickActionsBarProps {
  htmlCode: string;
}

export function QuickActionsBar({ htmlCode }: QuickActionsBarProps) {
  const handleBackToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleFullscreenPreview = useCallback(() => {
    const blob = new Blob([htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    toast.success('Opened fullscreen preview!');
  }, [htmlCode]);

  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(htmlCode);
      toast.success('HTML code copied to clipboard!');
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = htmlCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      toast.success('HTML code copied to clipboard!');
    }
  }, [htmlCode]);

  const handleDownloadHtml = useCallback(() => {
    const blob = new Blob([htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'troopod-landing-page.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('HTML file downloaded!');
  }, [htmlCode]);

  const actions = [
    { icon: ArrowUp, label: 'Back to Top', onClick: handleBackToTop },
    { icon: Maximize, label: 'Fullscreen Preview', onClick: handleFullscreenPreview },
    { icon: Copy, label: 'Copy Code', onClick: handleCopyCode },
    { icon: Download, label: 'Download HTML', onClick: handleDownloadHtml },
  ];

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 quick-actions-bar rounded-full bg-card/90 border border-border/60 px-2 py-1.5 flex items-center gap-1"
    >
      {actions.map((action) => (
        <Button
          key={action.label}
          variant="ghost"
          size="sm"
          className="h-8 px-2.5 text-xs gap-1.5 rounded-full hover:bg-muted/80"
          onClick={action.onClick}
          title={action.label}
        >
          <action.icon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{action.label}</span>
        </Button>
      ))}
    </motion.div>
  );
}
