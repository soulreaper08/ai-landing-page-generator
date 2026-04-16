'use client';

import { cn } from '@/lib/utils';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Step {
  id: number;
  label: string;
  description: string;
}

const STEPS: Step[] = [
  { id: 1, label: 'Analyzing ad creative...', description: 'Extracting visual elements and messaging' },
  { id: 2, label: 'Scraping page...', description: 'Reading page structure and content' },
  { id: 3, label: 'Finding gaps...', description: 'Comparing ad message with page content' },
  { id: 4, label: 'Generating enhancements...', description: 'Creating personalized modifications' },
];

interface GenerationProgressProps {
  currentStep: number;
  isVisible: boolean;
}

export function GenerationProgress({ currentStep, isVisible }: GenerationProgressProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
        <div className="flex flex-col items-center mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary mb-4"
          />
          <h3 className="text-lg font-semibold mb-1">Personalizing Your Page</h3>
          <p className="text-sm text-muted-foreground">
            Step {Math.min(currentStep, 4)} of 4 — This may take a moment
          </p>
        </div>

        <div className="space-y-1">
          {STEPS.map((step, index) => {
            const isActive = index + 1 === currentStep;
            const isCompleted = index + 1 < currentStep;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start gap-3 py-3 relative">
                  {/* Vertical connector */}
                  {index < STEPS.length - 1 && (
                    <div className="absolute left-[15px] top-[38px] w-[2px] h-[calc(100%-16px)] bg-border">
                      <motion.div
                        className="w-full bg-primary rounded-full"
                        initial={{ height: '0%' }}
                        animate={{ height: isCompleted || isActive ? '100%' : '0%' }}
                        transition={{ duration: 0.6, delay: isCompleted ? 0 : 0.3 }}
                      />
                    </div>
                  )}

                  {/* Step icon */}
                  <div className="relative z-10">
                    {isCompleted ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      >
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                      </motion.div>
                    ) : isActive ? (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                      </motion.div>
                    ) : (
                      <Circle className="h-8 w-8 text-muted-foreground/30" />
                    )}
                  </div>

                  {/* Step content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={`${step.id}-${isActive ? 'active' : 'inactive'}`}
                        className={cn(
                          'text-sm font-medium transition-colors',
                          isCompleted ? 'text-green-600 dark:text-green-400' :
                          isActive ? 'text-foreground' : 'text-muted-foreground'
                        )}
                      >
                        {step.label}
                        {isActive && (
                          <motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                          >
                            ...
                          </motion.span>
                        )}
                      </motion.p>
                    </AnimatePresence>
                    <AnimatePresence>
                      {(isActive || isCompleted) && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-xs text-muted-foreground mt-0.5"
                        >
                          {step.description}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-violet-400 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${(currentStep / 4) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
