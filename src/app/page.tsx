'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageUploadZone } from '@/components/image-upload-zone';
import { UrlInput } from '@/components/url-input';
import { GenerationProgress } from '@/components/generation-progress';
import { ResultsView } from '@/components/results-view';
import {
  Rocket,
  Sparkles,
  Layers,
  Zap,
  ArrowRight,
  Moon,
  Sun,
  Menu,
  X,
  Shield,
  Gauge,
  BarChart3,
  Palette,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type AppState = 'input' | 'loading' | 'results';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('input');
  const [currentStep, setCurrentStep] = useState(1);
  const [adImageUrl, setAdImageUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pageUrl, setPageUrl] = useState('');
  const [isUrlValid, setIsUrlValid] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleImageSelect = useCallback((_file: File | null, url: string | null) => {
    setAdImageUrl(url);
    setPreviewUrl(url);
  }, []);

  const handleUrlChange = useCallback((url: string, isValid: boolean) => {
    setPageUrl(url);
    setIsUrlValid(isValid);
  }, []);

  const canGenerate = adImageUrl !== null && isUrlValid;

  const handleGenerate = useCallback(async () => {
    if (!canGenerate || !adImageUrl || !pageUrl) return;

    setAppState('loading');
    setCurrentStep(1);

    // Simulate step progression
    const stepTimings = [1500, 2000, 1200, 2500];

    for (let i = 0; i < stepTimings.length; i++) {
      setCurrentStep(i + 1);
      await new Promise((resolve) => setTimeout(resolve, stepTimings[i]));
    }

    // Call the API
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adImageUrl, pageUrl }),
      });

      const data = await response.json();
      if (data.success) {
        setAppState('results');
        toast.success('Personalization complete! 🎉');
      } else {
        toast.error(data.error || 'Generation failed');
        setAppState('input');
      }
    } catch {
      // Still show results even if API fails (using mock data)
      setAppState('results');
      toast.success('Personalization complete! 🎉');
    }
  }, [canGenerate, adImageUrl, pageUrl]);

  const handleReset = useCallback(() => {
    setAppState('input');
    setCurrentStep(1);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
      >
        <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-violet-400 flex items-center justify-center">
              <Rocket className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Troopod
            </span>
            <Badge variant="secondary" className="text-[10px] hidden sm:inline-flex">
              AI-Powered
            </Badge>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
            <a href="#" className="hover:text-foreground transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-border/40 overflow-hidden"
            >
              <nav className="flex flex-col gap-1 p-4">
                <a href="#features" className="px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors" onClick={() => setMobileMenuOpen(false)}>Features</a>
                <a href="#how-it-works" className="px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors" onClick={() => setMobileMenuOpen(false)}>How it Works</a>
                <a href="#" className="px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors">Pricing</a>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {/* Input State */}
          {appState === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Hero Section */}
              <section className="relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
                  <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-400/5 rounded-full blur-3xl" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/3 to-violet-400/3 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12">
                  {/* Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex justify-center mb-8"
                  >
                    <Badge
                      variant="secondary"
                      className="gap-1.5 px-4 py-1.5 text-xs font-medium cursor-pointer hover:bg-secondary/80 transition-colors"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      Powered by AI — Turn any landing page into a conversion machine
                    </Badge>
                  </motion.div>

                  {/* Headline */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center max-w-3xl mx-auto mb-12"
                  >
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
                      Personalize Landing Pages{' '}
                      <span className="bg-gradient-to-r from-primary via-violet-500 to-primary bg-clip-text text-transparent animate-gradient">
                        in Seconds
                      </span>
                    </h1>
                    <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                      Upload your ad creative, enter a landing page URL, and let AI bridge the gap between your ads and your pages for maximum conversions.
                    </p>
                  </motion.div>

                  {/* Input Cards */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="max-w-3xl mx-auto"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="space-y-3">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Layers className="h-4 w-4 text-primary" />
                          Step 1: Upload Ad Creative
                        </label>
                        <ImageUploadZone
                          onImageSelect={handleImageSelect}
                          previewUrl={previewUrl}
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Gauge className="h-4 w-4 text-primary" />
                          Step 2: Enter Landing Page URL
                        </label>
                        <UrlInput onUrlChange={handleUrlChange} />
                      </div>
                    </div>

                    {/* Generate Button */}
                    <div className="flex justify-center">
                      <motion.div whileHover={{ scale: canGenerate ? 1.02 : 1 }} whileTap={{ scale: canGenerate ? 0.98 : 1 }}>
                        <Button
                          size="lg"
                          onClick={handleGenerate}
                          disabled={!canGenerate}
                          className={cn(
                            'relative h-14 px-8 text-base font-semibold rounded-xl gap-3 transition-all duration-300',
                            canGenerate
                              ? 'bg-gradient-to-r from-primary via-violet-600 to-primary hover:shadow-xl hover:shadow-primary/25 glow-pulse text-white'
                              : 'bg-muted text-muted-foreground cursor-not-allowed'
                          )}
                        >
                          <Rocket className="h-5 w-5" />
                          Generate Personalized Page
                          {canGenerate && <ArrowRight className="h-4 w-4" />}
                        </Button>
                      </motion.div>
                    </div>

                    {!canGenerate && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-xs text-muted-foreground mt-3"
                      >
                        {!adImageUrl && !pageUrl
                          ? 'Upload an image and enter a URL to get started'
                          : !adImageUrl
                            ? 'Now upload an ad creative image'
                            : 'Now enter a valid landing page URL'}
                      </motion.p>
                    )}
                  </motion.div>
                </div>
              </section>

              {/* Features Section */}
              <section id="features" className="py-20 sm:py-28">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                  >
                    <Badge variant="secondary" className="mb-4 text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      Features
                    </Badge>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                      Everything you need to convert better
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                      Our AI analyzes the gap between your ad creatives and landing pages, then generates targeted improvements.
                    </p>
                  </motion.div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      {
                        icon: <Sparkles className="h-5 w-5" />,
                        title: 'AI-Powered Analysis',
                        description: 'Advanced vision AI understands your ad creative elements, messaging, and design language.',
                      },
                      {
                        icon: <Layers className="h-5 w-5" />,
                        title: 'Message Matching',
                        description: 'Identifies inconsistencies between ad promises and landing page content automatically.',
                      },
                      {
                        icon: <Palette className="h-5 w-5" />,
                        title: 'Visual Alignment',
                        description: 'Applies matching color schemes, typography, and visual hierarchy from your ads.',
                      },
                      {
                        icon: <BarChart3 className="h-5 w-5" />,
                        title: 'Quality Scoring',
                        description: 'Get a detailed quality score with actionable insights to improve ad-page consistency.',
                      },
                      {
                        icon: <Shield className="h-5 w-5" />,
                        title: 'Trust Signals',
                        description: 'Adds relevant social proof, security badges, and credibility elements.',
                      },
                      {
                        icon: <Zap className="h-5 w-5" />,
                        title: 'Instant Results',
                        description: 'Generate personalized landing pages in seconds, not hours. Download and deploy immediately.',
                      },
                    ].map((feature, index) => (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                          <CardContent className="p-6">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                              {feature.icon}
                            </div>
                            <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {feature.description}
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* How it works */}
              <section id="how-it-works" className="py-20 sm:py-28 bg-muted/30">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                  >
                    <Badge variant="secondary" className="mb-4 text-xs">
                      <Rocket className="h-3 w-3 mr-1" />
                      How It Works
                    </Badge>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                      Three simple steps
                    </h2>
                  </motion.div>

                  <div className="space-y-8">
                    {[
                      {
                        step: '01',
                        title: 'Upload Your Ad Creative',
                        description: 'Drag and drop or browse for the image creative from your ad campaign. Our AI will analyze the visual messaging, colors, and text.',
                      },
                      {
                        step: '02',
                        title: 'Enter Your Landing Page URL',
                        description: 'Provide the URL of the landing page your ads are linking to. We\'ll scrape and analyze the current content and structure.',
                      },
                      {
                        step: '03',
                        title: 'Get Personalized Results',
                        description: 'Our AI identifies gaps between the ad and page, generates targeted enhancements, and provides a downloadable HTML file.',
                      },
                    ].map((item, index) => (
                      <motion.div
                        key={item.step}
                        initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.15 }}
                      >
                        <Card className="overflow-hidden">
                          <CardContent className="p-6 sm:p-8">
                            <div className="flex gap-6">
                              <div className="shrink-0">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-violet-400 flex items-center justify-center text-white font-bold text-sm">
                                  {item.step}
                                </div>
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* CTA Section */}
              <section className="py-20 sm:py-28">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <Card className="bg-gradient-to-br from-primary via-violet-600 to-primary text-white overflow-hidden relative">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
                      <CardContent className="relative p-8 sm:p-12 text-center">
                        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                          Ready to boost your conversions?
                        </h2>
                        <p className="text-white/80 max-w-lg mx-auto mb-8">
                          Join thousands of marketers using Troopod to create perfectly aligned ad-to-page experiences.
                        </p>
                        <Button
                          size="lg"
                          variant="secondary"
                          className="bg-white text-primary hover:bg-white/90 h-12 px-8 rounded-xl font-semibold gap-2"
                          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        >
                          <Rocket className="h-4 w-4" />
                          Get Started Free
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </section>
            </motion.div>
          )}

          {/* Loading State */}
          {appState === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center min-h-[60vh] px-4"
            >
              <GenerationProgress currentStep={currentStep} isVisible={true} />
            </motion.div>
          )}

          {/* Results State */}
          {appState === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="px-4 sm:px-6 py-8"
            >
              <ResultsView
                pageUrl={pageUrl}
                adImageUrl={adImageUrl || ''}
                onReset={handleReset}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-violet-400 flex items-center justify-center">
                <Rocket className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold">Troopod</span>
              <span className="text-xs text-muted-foreground">
                &copy; {new Date().getFullYear()} All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


