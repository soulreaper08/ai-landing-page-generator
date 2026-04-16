'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NotificationBanner() {
  const [isVisible, setIsVisible] = useState(true)

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="bg-gradient-to-r from-primary/10 via-violet-500/10 to-primary/10 border-b border-border/40"
        >
          <div className="mx-auto max-w-7xl flex items-center justify-center gap-2 sm:gap-3 px-4 py-2.5 sm:py-3 text-sm sm:text-base">
            <Sparkles className="h-4 w-4 shrink-0 text-primary" />
            <p className="font-medium text-center">
              Launch Special: Get 50% off Pro plan — Use code{' '}
              <span className="font-bold text-primary">TROOPOD50</span> at
              checkout
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full shrink-0"
              onClick={() => setIsVisible(false)}
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
