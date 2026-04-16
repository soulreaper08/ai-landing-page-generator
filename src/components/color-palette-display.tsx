'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColorSwatch {
  name: string;
  hex: string;
  usage: string;
}

interface ColorPaletteDisplayProps {
  colors?: ColorSwatch[];
}

const defaultColors: ColorSwatch[] = [
  { name: 'Primary', hex: '#7C3AED', usage: 'Headlines, CTA' },
  { name: 'Secondary', hex: '#4F46E5', usage: 'Accents, borders' },
  { name: 'Background', hex: '#0F172A', usage: 'Page background' },
  { name: 'Text', hex: '#F8FAFC', usage: 'Body text' },
  { name: 'Accent', hex: '#F59E0B', usage: 'Highlights, badges' },
  { name: 'Muted', hex: '#64748B', usage: 'Secondary text' },
];

export function ColorPaletteDisplay({ colors }: ColorPaletteDisplayProps) {
  const palette = colors && colors.length > 0 ? colors : defaultColors;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="border-border/60 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            Detected Color Palette
            <Badge variant="secondary" className="text-[10px] ml-auto">
              {palette.length} colors
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Color swatches row */}
          <div className="flex gap-2 mb-4">
            {palette.map((color, i) => (
              <motion.div
                key={color.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.55 + i * 0.06 }}
                className="group flex-1 relative"
              >
                {/* Tooltip */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 bg-foreground text-background text-[10px] px-2 py-1 rounded-md whitespace-nowrap font-mono pointer-events-none">
                  {color.hex}
                </div>
                <div
                  className="aspect-[3/2] rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ring-1 ring-border/40 hover:ring-2 hover:ring-primary/30"
                  style={{ backgroundColor: color.hex }}
                  title={`${color.name}: ${color.hex}`}
                />
              </motion.div>
            ))}
          </div>
          {/* Color names */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {palette.map((color, i) => (
              <motion.div
                key={color.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 + i * 0.05 }}
                className="text-center"
              >
                <p className="text-[10px] font-semibold truncate">{color.name}</p>
                <p className="text-[9px] text-muted-foreground font-mono">{color.hex}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
