'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useInView, useAnimation, type Variant } from 'framer-motion';

interface UseSectionAnimationOptions {
  threshold?: number;
  once?: boolean;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade';
}

const directionVariants: Record<string, { hidden: Variant; visible: Variant }> = {
  up: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  down: {
    hidden: { opacity: 0, y: -40 },
    visible: { opacity: 1, y: 0 },
  },
  left: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  right: {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
};

export function useSectionAnimation({
  threshold = 0.15,
  once = true,
  delay = 0,
  direction = 'up',
}: UseSectionAnimationOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    } else if (!once) {
      controls.start('hidden');
    }
  }, [isInView, controls, once]);

  const variants = directionVariants[direction];

  return {
    ref,
    controls,
    isInView,
    motionProps: {
      ref,
      initial: 'hidden',
      animate: controls,
      variants,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay,
      },
    },
  };
}

// Section wrapper with automatic entrance animation
interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade';
  delay?: number;
  threshold?: number;
  once?: boolean;
}

export function AnimatedSection({
  children,
  className,
  direction = 'up',
  delay = 0,
  threshold = 0.15,
  once = true,
}: AnimatedSectionProps) {
  const { motionProps } = useSectionAnimation({
    threshold,
    once,
    delay,
    direction,
  });

  return (
    <motion.div {...motionProps} className={className}>
      {children}
    </motion.div>
  );
}
