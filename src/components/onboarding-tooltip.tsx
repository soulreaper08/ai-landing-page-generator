'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X, ChevronRight } from 'lucide-react';

interface OnboardingStep {
  targetId: string;
  title: string;
  description: string;
  position: 'top' | 'bottom';
}

const onboardingSteps: OnboardingStep[] = [
  {
    targetId: 'onboard-upload',
    title: 'Upload Your Ad Creative',
    description: 'Start by uploading your ad creative — our AI will analyze its colors, messaging, and style.',
    position: 'bottom',
  },
  {
    targetId: 'onboard-url',
    title: 'Enter Landing Page URL',
    description: 'Then enter the landing page URL you want to personalize to match your ad.',
    position: 'bottom',
  },
  {
    targetId: 'onboard-generate',
    title: 'Generate Your Page',
    description: 'Click generate to create your personalized landing page in seconds with AI.',
    position: 'top',
  },
];

interface OnboardingTooltipProps {
  onComplete: () => void;
}

export function OnboardingTooltip({ onComplete }: OnboardingTooltipProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = useCallback(() => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete();
    }
  }, [currentStep, onComplete]);

  const handleSkip = useCallback(() => {
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const target = document.getElementById(onboardingSteps[currentStep]?.targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('onboard-highlight');
    }
    return () => {
      if (target) {
        target.classList.remove('onboard-highlight');
      }
    };
  }, [currentStep]);

  const step = onboardingSteps[currentStep];
  if (!step) return null;

  const isTop = step.position === 'top';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: isTop ? -10 : 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: isTop ? 10 : -10 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, duration: 0.2 }}
          className={cn(
            'fixed z-[60] max-w-xs w-[calc(100vw-2rem)] sm:w-80 rounded-xl p-4 shadow-xl',
            'bg-card border border-border/80',
            isTop ? 'top-20' : 'bottom-6',
            'left-1/2 -translate-x-1/2'
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              {onboardingSteps.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    i === currentStep ? 'w-6 bg-primary' : i < currentStep ? 'w-3 bg-primary/40' : 'w-3 bg-muted'
                  )}
                />
              ))}
            </div>
            <button
              onClick={handleSkip}
              className="p-1 rounded-md hover:bg-muted transition-colors"
              aria-label="Skip onboarding"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>

          <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">{step.description}</p>

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              {currentStep + 1} of {onboardingSteps.length}
            </span>
            <Button size="sm" className="h-7 text-xs gap-1 px-3" onClick={handleNext}>
              {currentStep === onboardingSteps.length - 1 ? 'Got it' : 'Next'}
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
