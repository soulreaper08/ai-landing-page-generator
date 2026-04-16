'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: 'How does Troopod analyze my ad creative?',
    answer: 'Troopod uses advanced AI vision models to analyze your ad creative\'s visual elements, color palette, typography, messaging tone, and brand identity. It extracts key themes and design patterns that define your ad\'s visual language.',
  },
  {
    question: 'What landing page platforms are supported?',
    answer: 'Troopod works with any publicly accessible landing page — whether it\'s built with WordPress, Webflow, Shopify, Next.js, or any other platform. Simply provide the URL and we\'ll handle the rest. No API keys or integrations needed.',
  },
  {
    question: 'Is my data secure and private?',
    answer: 'Absolutely. We take privacy seriously. Your ad creatives and landing page content are processed in real-time and never stored permanently. Analysis results are stored only in your browser\'s local storage. We never share your data with third parties.',
  },
  {
    question: 'What formats can I upload for ad creatives?',
    answer: 'Troopod supports all major image formats including PNG, JPG, JPEG, WebP, GIF, and SVG. For best results, we recommend high-resolution images (at least 1200x628px for display ads) that clearly show your ad\'s messaging and design.',
  },
  {
    question: 'Can I integrate Troopod into my existing workflow?',
    answer: 'Yes! Pro and Enterprise plans include our API access, allowing you to integrate Troopod directly into your CMS, marketing automation tools, or custom applications. We also offer webhook notifications for analysis completion events.',
  },
  {
    question: 'What happens after I download the enhanced HTML?',
    answer: 'The downloaded HTML is a complete, self-contained file that you can deploy directly to your web server, or copy the relevant sections into your existing landing page template. The CSS enhancements export makes it easy to apply changes to your current page structure.',
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="secondary" className="mb-4 text-xs px-3 py-1">
            <HelpCircle className="h-3 w-3 mr-1" />
            FAQ
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Frequently asked questions
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Everything you need to know about Troopod. Can&apos;t find the answer you&apos;re looking for?{' '}
            <a href="#" className="text-primary hover:underline">Contact us</a>.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25 + index * 0.05 }}
              >
                <Card
                  className={cn(
                    'overflow-hidden transition-all duration-300 cursor-pointer group',
                    'hover:shadow-md hover:border-primary/20',
                    isOpen && 'border-primary/30 shadow-md shadow-primary/5'
                  )}
                  onClick={() => toggleFaq(index)}
                >
                  <CardContent className="p-0">
                    {/* Question (always visible) */}
                    <button
                      className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                      aria-expanded={isOpen}
                    >
                      <span className={cn(
                        'text-sm sm:text-base font-medium transition-colors duration-200',
                        isOpen ? 'text-primary' : 'text-foreground group-hover:text-primary/80'
                      )}>
                        {faq.question}
                      </span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className={cn(
                          'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300',
                          isOpen
                            ? 'bg-primary/10 text-primary shadow-sm shadow-primary/10'
                            : 'bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                        )}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </motion.div>
                    </button>

                    {/* Answer (animated open/close with spring physics) */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            height: { type: 'spring', stiffness: 400, damping: 35 },
                            opacity: { duration: 0.2, delay: 0.05 },
                          }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-4 pt-0">
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2, delay: 0.1 }}
                            >
                              <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent mb-3" />
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {faq.answer}
                              </p>
                            </motion.div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
