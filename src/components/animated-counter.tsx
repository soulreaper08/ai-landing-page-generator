'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, useInView } from 'framer-motion'

interface AnimatedCounterProps {
  value: string
  label: string
  icon: React.ElementType
}

function formatNumber(num: number): string {
  return num.toLocaleString('en-US')
}

function parseValue(value: string): {
  prefix: string
  targetNumber: number
  suffix: string
} | null {
  const match = value.match(/^(.*?)([\d,]+)(.*)$/)
  if (!match) return null

  const [, prefix, numericStr, suffix] = match
  const targetNumber = parseInt(numericStr.replace(/,/g, ''), 10)

  if (isNaN(targetNumber)) return null

  return { prefix, targetNumber, suffix }
}

export function AnimatedCounter({ value, label, icon: Icon }: AnimatedCounterProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const [displayValue, setDisplayValue] = useState('0')
  const hasAnimated = useRef(false)

  const parsed = parseValue(value)

  const animate = useCallback(() => {
    if (!parsed || hasAnimated.current) return
    hasAnimated.current = true

    const { prefix, targetNumber, suffix } = parsed
    const duration = 2000
    const startTime = performance.now()

    function easeOutExpo(t: number): number {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
    }

    function step(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOutExpo(progress)
      const currentNumber = Math.round(targetNumber * easedProgress)

      setDisplayValue(`${prefix}${formatNumber(currentNumber)}${suffix}`)

      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }

    requestAnimationFrame(step)
  }, [parsed])

  useEffect(() => {
    if (isInView) {
      animate()
    }
  }, [isInView, animate])

  return (
    <div ref={ref} className="flex flex-col items-center gap-3">
      <Icon className="h-5 w-5 text-primary" />
      <motion.span
        className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent text-3xl sm:text-4xl font-extrabold"
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        {parsed ? displayValue : value}
      </motion.span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  )
}
