'use client';

import { motion } from 'framer-motion';
import { Rocket, Check, Loader2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingAnimationProps {
  currentStep: number; // 1-6
}

const steps = [
  { label: 'Analyzing ad creative', icon: 'image' },
  { label: 'Scraping landing page', icon: 'globe' },
  { label: 'Building AI prompt', icon: 'file' },
  { label: 'Sending to Google Stitch', icon: 'send' },
  { label: 'Generating personalized UI', icon: 'sparkles' },
  { label: 'Fetching final code', icon: 'code' },
];

const tips = [
  'Google Stitch uses Gemini 2.5 to generate production-ready UI code from natural language.',
  'Matching your landing page to your ad creative can boost conversions by up to 34%.',
  'Color consistency between ads and landing pages builds trust and reduces bounce rates.',
  'A strong headline match between ad and page increases conversion by 20-30%.',
  'Social proof elements on landing pages can increase conversions by 15-25%.',
  'Urgency indicators like countdown timers can boost click-through by 8-12%.',
];

export function LoadingAnimation({ currentStep }: LoadingAnimationProps) {
  const tip = tips[Math.floor(Date.now() / 8000) % tips.length];

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4 text-center">
        {/* Animated Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="mb-8"
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-violet-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/30 animate-bounce">
            <Rocket className="h-10 w-10 text-white" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-foreground mb-2"
        >
          Creating Your Personalized Page
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground mb-8"
        >
          Google Stitch is generating your custom UI...
        </motion.p>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3 text-left bg-card/50 rounded-xl p-5 border border-border/60"
        >
          {steps.map((step, i) => {
            const stepNum = i + 1;
            const status = stepNum < currentStep ? 'complete' : stepNum === currentStep ? 'current' : 'pending';

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                className={cn(
                  'flex items-center gap-3 py-1.5 transition-colors duration-300',
                  status === 'complete' && 'text-green-600 dark:text-green-400',
                  status === 'current' && 'text-primary font-semibold',
                  status === 'pending' && 'text-muted-foreground/50'
                )}
              >
                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                  {status === 'complete' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Check className="h-4 w-4" />
                    </motion.div>
                  )}
                  {status === 'current' && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {status === 'pending' && (
                    <Circle className="h-3 w-3 opacity-30" />
                  )}
                </div>
                <span className={cn(
                  'text-sm transition-all duration-300',
                  status === 'pending' && 'opacity-50'
                )}>
                  {step.label}
                </span>
                {status === 'current' && (
                  <motion.div
                    className="ml-auto flex gap-0.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {[0, 1, 2].map((dot) => (
                      <motion.div
                        key={dot}
                        className="w-1 h-1 rounded-full bg-primary"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: dot * 0.2 }}
                      />
                    ))}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Estimated Time */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 text-sm text-muted-foreground"
        >
          Estimated time: ~15-30 seconds
        </motion.p>

        {/* Fun Fact Tip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-5 p-4 bg-primary/5 dark:bg-primary/10 rounded-lg text-sm text-primary/80 dark:text-primary/90 border border-primary/10"
        >
          <span className="font-semibold">💡 Did you know?</span> {tip}
        </motion.div>
      </div>
    </div>
  );
}
