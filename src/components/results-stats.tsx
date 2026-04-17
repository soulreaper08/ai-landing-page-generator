'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedNumberProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}

function AnimatedNumber({ value, suffix = '', prefix = '', duration = 1500, className }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });
  const [display, setDisplay] = useState(0);
  const hasAnimated = useRef(false);

  const animate = useCallback(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const startTime = performance.now();
    function easeOutExpo(t: number): number {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      setDisplay(Math.round(value * eased));
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }, [value, duration]);

  useEffect(() => {
    if (isInView) animate();
  }, [isInView, animate]);

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {prefix}{display.toLocaleString()}{suffix}
    </span>
  );
}

interface ResultsStatsProps {
  htmlCode?: string;
  totalChanges?: number;
}

export function ResultsStats({ htmlCode, totalChanges = 0 }: ResultsStatsProps) {
  const lineCount = htmlCode ? htmlCode.split('\n').length : 0;
  const charCount = htmlCode ? htmlCode.length : 0;

  const statCards = [
    {
      label: 'Code Lines',
      value: lineCount,
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
        </svg>
      ),
      color: 'from-violet-500/15 to-purple-500/15 text-violet-600 dark:text-violet-400',
      borderColor: 'border-violet-500/20',
    },
    {
      label: 'Changes Made',
      value: totalChanges,
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      ),
      color: 'from-emerald-500/15 to-green-500/15 text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-500/20',
    },
    {
      label: 'Time Saved',
      value: 45,
      suffix: 'min',
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      color: 'from-amber-500/15 to-orange-500/15 text-amber-600 dark:text-amber-400',
      borderColor: 'border-amber-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {statCards.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}
        >
          <div className={cn(
            'rounded-xl border p-3 sm:p-4 text-center',
            'bg-gradient-to-br',
            stat.color,
            stat.borderColor,
          )}>
            <div className="flex items-center justify-center gap-1.5 mb-1.5">
              {stat.icon}
              <span className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-bold">
              <AnimatedNumber
                value={stat.value}
                suffix={stat.suffix}
                className="text-foreground"
              />
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
