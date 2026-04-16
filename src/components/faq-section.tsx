'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle, ChevronDown } from 'lucide-react';

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
        >
          <Card>
            <CardContent className="p-2 sm:p-4">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border-b-0 last:border-b-0"
                  >
                    <AccordionTrigger className="text-left text-sm sm:text-base font-medium hover:no-underline hover:bg-muted/50 px-4 py-4 rounded-lg data-[state=open]:bg-muted/50 transition-colors">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-0 text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
