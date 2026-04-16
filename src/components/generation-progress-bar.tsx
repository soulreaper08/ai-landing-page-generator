'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GenerationProgressBarProps {
  currentStep: number;
  totalSteps?: number;
}

const stepLabels = [
  'Analyzing ad creative...',
  'Scanning landing page...',
  'Extracting branding...',
  'Building design...',
  'Generating HTML...',
  'Finalizing...',
];

export function GenerationProgressBar({ currentStep, totalSteps = 6 }: GenerationProgressBarProps) {
  // Smooth sub-step interpolation for fluid progress
  const [smoothProgress, setSmoothProgress] = useState(0);
  const targetProgress = Math.min((currentStep / totalSteps) * 100, 100);

  useEffect(() => {
    const duration = 800;
    const startTime = performance.now();
    const startVal = smoothProgress;

    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setSmoothProgress(startVal + (targetProgress - startVal) * eased);
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }, [targetProgress, smoothProgress]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.3 }}
      className="fixed top-16 left-0 right-0 z-40"
    >
      {/* Main progress bar */}
      <div className="h-[3px] bg-border/20 relative overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary via-violet-500 to-purple-500 relative"
          style={{ width: `${smoothProgress}%` }}
        >
          {/* Animated shimmer sweep */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              animate={{ left: ['-96px', '100%'] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            />
          </div>
          {/* Glowing head */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-[0_0_8px_2px_rgba(124,58,237,0.6),0_0_20px_4px_rgba(124,58,237,0.3)]" />
        </motion.div>
        {/* Subtle pulse background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      {/* Step label bar */}
      <div className="bg-background/95 backdrop-blur-md border-b border-border/20 px-4 py-1.5 flex items-center justify-center gap-2">
        <Loader2 className="h-3 w-3 text-primary animate-spin" />
        <span className={cn(
          'text-[11px] font-medium transition-all duration-300',
          currentStep <= totalSteps ? 'text-foreground' : 'text-green-600 dark:text-green-400'
        )}>
          {stepLabels[Math.min(currentStep - 1, stepLabels.length - 1)]}
        </span>
        <span className="text-[10px] text-muted-foreground/70 font-mono tabular-nums">
          {Math.round(smoothProgress)}%
        </span>
        {/* Step dots */}
        <div className="flex items-center gap-1 ml-2">
          {Array.from({ length: totalSteps }).map((_, i) => {
            const stepNum = i + 1;
            const isActive = stepNum === currentStep;
            const isComplete = stepNum < currentStep;
            return (
              <motion.div
                key={i}
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-all duration-300',
                  isComplete && 'bg-primary',
                  isActive && 'bg-primary scale-125 shadow-[0_0_6px_rgba(124,58,237,0.5)]',
                  !isActive && !isComplete && 'bg-muted-foreground/20'
                )}
                animate={isActive ? { scale: [1, 1.4, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
              />
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
