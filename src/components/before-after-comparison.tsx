'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftRight, GripVertical } from 'lucide-react';

interface BeforeAfterComparisonProps {
  originalHtml: string;
  generatedHtml: string;
  className?: string;
}

export function BeforeAfterComparison({ originalHtml, generatedHtml, className }: BeforeAfterComparisonProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState(1000);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updatePosition(e.clientX);
  }, [updatePosition]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    updatePosition(e.touches[0].clientX);
  }, [updatePosition]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      updatePosition(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      updatePosition(e.touches[0].clientX);
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, updatePosition]);

  // Track container width for the iframe
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    setContainerWidth(container.offsetWidth);
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <Card className={`overflow-hidden border-border/60 ${className || ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <ArrowLeftRight className="h-4 w-4 text-primary" />
          Before / After Comparison
          <Badge variant="secondary" className="text-[10px] ml-auto">Drag slider to compare</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div
          ref={containerRef}
          className="ba-comparison-container relative w-full"
          style={{ height: '75vh', minHeight: '500px' }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* After (Generated) - Full width, behind */}
          <div className="absolute inset-0">
            <iframe
              srcDoc={generatedHtml}
              className="w-full h-full border-0"
              title="Personalized Page"
              sandbox="allow-scripts"
            />
          </div>

          {/* Before (Original) - Clipped by slider position */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${sliderPosition}%` }}
          >
            <iframe
              srcDoc={originalHtml}
              className="absolute inset-0 border-0"
              style={{ width: `${containerWidth}px` }}
              title="Original Page"
              sandbox="allow-scripts"
            />
          </div>

          {/* Labels */}
          <div className="ba-label ba-label-before absolute top-3 left-3 z-20">
            <Badge variant="secondary" className="text-[10px] bg-background/80 backdrop-blur-sm border-border/40">
              Original
            </Badge>
          </div>
          <div className="ba-label ba-label-after absolute top-3 right-3 z-20">
            <Badge variant="secondary" className="text-[10px] bg-background/80 backdrop-blur-sm border-primary/40 text-primary">
              Personalized
            </Badge>
          </div>

          {/* Slider Line */}
          <div
            className="ba-slider-line absolute top-0 bottom-0 z-10"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="ba-slider-line-inner" />
          </div>

          {/* Slider Handle */}
          <div
            className="ba-slider-handle absolute top-1/2 z-20"
            style={{ left: `${sliderPosition}%`, transform: 'translate(-50%, -50%)' }}
          >
            <div className="ba-slider-handle-inner">
              <GripVertical className="h-4 w-4 text-white" />
            </div>
          </div>

          {/* Drag overlay for better UX */}
          {isDragging && (
            <div className="absolute inset-0 z-30 cursor-col-resize" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
