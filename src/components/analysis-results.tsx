'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Palette, Type, MessageSquare, Lightbulb, Sparkles, Image, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AdAnalysisResult } from '@/lib/types';

interface AnalysisResultsProps {
  analysis: AdAnalysisResult;
}

const toneColors: Record<string, string> = {
  professional: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  playful: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  luxury: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  urgent: 'bg-red-500/10 text-red-600 dark:text-red-400',
  technical: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  friendly: 'bg-green-500/10 text-green-600 dark:text-green-400',
};

const styleColors: Record<string, string> = {
  modern: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  classic: 'bg-stone-500/10 text-stone-600 dark:text-stone-400',
  minimal: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
  bold: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  elegant: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  corporate: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
};

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  const { colors, headline, subheadline, ctaText, tone, style, valueProps, emotionalAppeal, imageryType } = analysis;

  const colorEntries = [
    { label: 'Primary', hex: colors.primary },
    { label: 'Secondary', hex: colors.secondary },
    { label: 'Accent', hex: colors.accent },
    { label: 'Background', hex: colors.background },
    { label: 'Text', hex: colors.text },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="border-border/60 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Image className="h-4 w-4 text-primary" />
            Ad Analysis Results
            <Badge variant="secondary" className="text-[10px] ml-auto">
              <Sparkles className="h-3 w-3 mr-1 text-primary" />
              AI-Powered
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Color Palette */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5" />
              Detected Color Palette
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {colorEntries.map((color) => (
                <div key={color.label} className="flex items-center gap-1.5">
                  <div
                    className="w-6 h-6 rounded-full border border-border/40 shadow-sm"
                    style={{ backgroundColor: color.hex }}
                    title={color.hex}
                    role="img"
                    aria-label={color.label}
                  />
                  <span className="text-[10px] font-mono text-muted-foreground hidden sm:inline">{color.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Messaging */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-[10px] font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <Type className="h-3 w-3" /> Headline
              </p>
              <p className="text-sm font-medium truncate">{headline || '—'}</p>
            </div>
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-[10px] font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <MessageSquare className="h-3 w-3" /> CTA Text
              </p>
              <p className="text-sm font-medium truncate">{ctaText || '—'}</p>
            </div>
          </div>

          {/* Subheadline */}
          {subheadline && (
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-[10px] font-medium text-muted-foreground mb-1">Subheadline</p>
              <p className="text-xs text-muted-foreground">{subheadline}</p>
            </div>
          )}

          {/* Tags Row */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={cn('text-[11px] px-2.5 py-0.5', toneColors[tone] || 'bg-muted text-muted-foreground')}>
              {tone}
            </Badge>
            <Badge className={cn('text-[11px] px-2.5 py-0.5', styleColors[style] || 'bg-muted text-muted-foreground')}>
              {style}
            </Badge>
            <Badge variant="outline" className="text-[11px] px-2.5 py-0.5">
              {emotionalAppeal}
            </Badge>
            <Badge variant="outline" className="text-[11px] px-2.5 py-0.5">
              {imageryType}
            </Badge>
          </div>

          {/* Value Props */}
          {valueProps.length > 0 && (
            <div>
              <p className="text-[10px] font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                <Lightbulb className="h-3 w-3" /> Value Propositions
              </p>
              <div className="flex flex-wrap gap-1.5">
                {valueProps.map((vp, i) => (
                  <span key={i} className="inline-flex items-center gap-1 text-[11px] bg-primary/5 text-primary px-2 py-1 rounded-md">
                    <Tag className="h-2.5 w-2.5" />
                    {vp}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
