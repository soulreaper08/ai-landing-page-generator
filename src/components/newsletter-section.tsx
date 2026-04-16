'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setSubmitted(true);
    toast.success('Thanks for subscribing! Check your inbox for a welcome email.');
  };

  return (
    <section className="py-20 sm:py-28 bg-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 dot-pattern opacity-20 pointer-events-none" />
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-violet-500/5 to-purple-500/5" />
            <CardContent className="relative p-8 sm:p-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-violet-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
                <Mail className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                Stay ahead of the curve
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                Get weekly tips on landing page optimization, ad-page consistency, and conversion rate improvements. No spam, unsubscribe anytime.
              </p>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-3 p-4 bg-green-500/10 rounded-xl border border-green-500/20"
                >
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    You&apos;re on the list! Check your inbox.
                  </span>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-xl bg-background border-border/60"
                    required
                  />
                  <Button
                    type="submit"
                    className="h-12 px-6 rounded-xl bg-gradient-to-r from-primary to-violet-400 text-white hover:shadow-lg hover:shadow-primary/25 gap-2 whitespace-nowrap"
                  >
                    Subscribe
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              )}

              <p className="text-xs text-muted-foreground/60 mt-4">
                Join 2,500+ marketers. Unsubscribe anytime.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
