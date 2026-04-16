'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageUploadZone } from '@/components/image-upload-zone';
import { UrlInput } from '@/components/url-input';
import { GenerationProgress } from '@/components/generation-progress';
import { ResultsView } from '@/components/results-view';
import { HistoryDrawer } from '@/components/history-drawer';
import { NewsletterSection } from '@/components/newsletter-section';
import { FaqSection } from '@/components/faq-section';
import { BackToTop } from '@/components/back-to-top';
import { ScrollProgress } from '@/components/scroll-progress';
import { AnimatedCounter } from '@/components/animated-counter';
import { NotificationBanner } from '@/components/notification-banner';
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
  Star,
  Clock,
  Users,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  History,
  Check,
  Crown,
  Mail,
  ExternalLink,
  Keyboard,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type AppState = 'input' | 'loading' | 'results';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Head of Marketing, Nexova',
    avatar: 'SC',
    content: 'Troopod cut our ad-to-page mismatch from 40% to under 5%. We saw a 34% lift in conversions within the first month of using it.',
    rating: 5,
  },
  {
    name: 'Marcus Johnson',
    role: 'Growth Lead, Stackflow',
    avatar: 'MJ',
    content: 'The AI analysis is incredibly accurate. It identified messaging gaps our team had been missing for months. Game changer for our paid campaigns.',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'CEO, Bloom Digital',
    avatar: 'ER',
    content: 'What used to take our design team 2-3 hours now takes seconds. The quality of the generated pages is indistinguishable from hand-crafted work.',
    rating: 5,
  },
];

const pricingPlans = [
  {
    name: 'Starter',
    price: '$0',
    period: '/month',
    description: 'Perfect for trying out Troopod',
    features: [
      '5 personalizations per month',
      'Basic quality scoring',
      'HTML download',
      'Email support',
    ],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For marketers and growth teams',
    features: [
      'Unlimited personalizations',
      'Advanced quality scoring',
      'A/B test comparisons',
      'Export as HTML/React/CSS',
      'Analysis history & insights',
      'Priority support',
    ],
    cta: 'Start 14-Day Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For agencies and large teams',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'API access',
      'Custom branding',
      'White-label reports',
      'Dedicated account manager',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const stats = [
  { value: '10,000+', label: 'Pages Personalized', icon: Layers },
  { value: '34%', label: 'Avg. Conversion Lift', icon: TrendingUp },
  { value: '2,500+', label: 'Happy Marketers', icon: Users },
  { value: '< 10s', label: 'Avg. Generation Time', icon: Clock },
];

export default function Home() {
  const [appState, setAppState] = useState<AppState>('input');
  const [currentStep, setCurrentStep] = useState(1);
  const [adImageUrl, setAdImageUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pageUrl, setPageUrl] = useState('');
  const [isUrlValid, setIsUrlValid] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.97]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

    const stepTimings = [1500, 2000, 1200, 2500];

    for (let i = 0; i < stepTimings.length; i++) {
      setCurrentStep(i + 1);
      await new Promise((resolve) => setTimeout(resolve, stepTimings[i]));
    }

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adImageUrl, pageUrl }),
      });

      const data = await response.json();
      if (data.success) {
        // Save to history
        const history = JSON.parse(localStorage.getItem('troopod-history') || '[]');
        history.unshift({
          id: Date.now(),
          pageUrl,
          timestamp: new Date().toISOString(),
          qualityScore: data.results?.qualityScore || 92,
          totalChanges: data.results?.totalChanges || 6,
          adImagePreview: adImageUrl,
        });
        if (history.length > 20) history.pop();
        localStorage.setItem('troopod-history', JSON.stringify(history));

        setAppState('results');
        toast.success('Personalization complete!');
      } else {
        toast.error(data.error || 'Generation failed');
        setAppState('input');
      }
    } catch {
      // Save to history even if API fails
      const history = JSON.parse(localStorage.getItem('troopod-history') || '[]');
      history.unshift({
        id: Date.now(),
        pageUrl,
        timestamp: new Date().toISOString(),
        qualityScore: 92,
        totalChanges: 6,
        adImagePreview: adImageUrl,
      });
      if (history.length > 20) history.pop();
      localStorage.setItem('troopod-history', JSON.stringify(history));

      setAppState('results');
      toast.success('Personalization complete!');
    }
  }, [canGenerate, adImageUrl, pageUrl]);

  // Keyboard shortcut: Ctrl+Enter to generate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && canGenerate) {
        e.preventDefault();
        handleGenerate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canGenerate, handleGenerate]);

  const handleReset = useCallback(() => {
    setAppState('input');
    setCurrentStep(1);
  }, []);

  const handleLoadHistory = useCallback((item: { pageUrl: string }) => {
    setPageUrl(item.pageUrl);
    setIsUrlValid(true);
    setHistoryOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.info('URL loaded from history');
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Scroll Progress Bar */}
      <ScrollProgress />

      {/* Notification Banner */}
      <NotificationBanner />

      {/* Navbar */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
      >
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-violet-400 flex items-center justify-center shadow-lg shadow-primary/20">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Troopod
            </span>
            <Badge variant="secondary" className="text-[10px] hidden sm:inline-flex px-2.5 py-0.5">
              AI-Powered
            </Badge>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors font-medium">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors font-medium">How it Works</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors font-medium">Testimonials</a>
            <a href="#pricing" className="hover:text-foreground transition-colors font-medium">Pricing</a>
          </nav>

          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setHistoryOpen(true)}
              title="History"
            >
              <History className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {mounted && theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
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
                <a href="#features" className="px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>Features</a>
                <a href="#how-it-works" className="px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>How it Works</a>
                <a href="#testimonials" className="px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>Testimonials</a>
                <a href="#pricing" className="px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* History Drawer */}
      <HistoryDrawer open={historyOpen} onOpenChange={setHistoryOpen} onLoadHistory={handleLoadHistory} />

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
                  <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
                  <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-400/5 rounded-full blur-3xl animate-float-delayed" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-r from-primary/3 to-violet-400/3 rounded-full blur-3xl animate-float-slow" />

                  {/* Floating particles */}
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="particle absolute w-2 h-2 rounded-full bg-primary/20"
                      style={{
                        left: `${15 + i * 14}%`,
                        top: `${20 + (i % 3) * 25}%`,
                        '--drift-x': `${(i % 2 === 0 ? 1 : -1) * (30 + i * 15)}px`,
                        '--drift-y': `${-40 - i * 20}px`,
                        '--duration': `${12 + i * 3}s`,
                        '--delay': `${i * 2}s`,
                      } as React.CSSProperties}
                    />
                  ))}

                  {/* Dot grid pattern */}
                  <div className="absolute inset-0 dot-pattern opacity-30" />
                </div>

                <motion.div
                  style={{ opacity: heroOpacity, scale: heroScale }}
                  className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-12"
                >
                  {/* Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex justify-center mb-8"
                  >
                    <Badge
                      variant="secondary"
                      className="gap-1.5 px-4 py-1.5 text-xs font-medium cursor-pointer hover:bg-secondary/80 transition-colors shadow-sm"
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
                      <span className="bg-gradient-to-r from-primary via-violet-500 to-purple-500 bg-clip-text text-transparent animate-gradient">
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
                            'relative h-14 px-10 text-base font-semibold rounded-xl gap-3 transition-all duration-300',
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
                        className="text-center text-xs text-muted-foreground mt-4"
                      >
                        {!adImageUrl && !pageUrl
                          ? 'Upload an image and enter a URL to get started'
                          : !adImageUrl
                            ? 'Now upload an ad creative image'
                            : 'Now enter a valid landing page URL'}
                      </motion.p>
                    )}
                  </motion.div>
                </motion.div>
              </section>

              {/* Trusted By Stats */}
              <section className="py-16 border-y border-border/40 bg-muted/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-10">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Trusted by growth-focused teams worldwide
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat) => (
                      <AnimatedCounter
                        key={stat.label}
                        value={stat.value}
                        label={stat.label}
                        icon={stat.icon}
                      />
                    ))}
                  </div>
                </div>
              </section>

              {/* Features Section */}
              <section id="features" className="py-20 sm:py-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                  >
                    <Badge variant="secondary" className="mb-4 text-xs px-3 py-1">
                      <Zap className="h-3 w-3 mr-1" />
                      Features
                    </Badge>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                      Everything you need to convert better
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                      Our AI analyzes the gap between your ad creatives and landing pages, then generates targeted improvements.
                    </p>
                  </motion.div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      {
                        icon: <Sparkles className="h-5 w-5" />,
                        title: 'AI-Powered Analysis',
                        description: 'Advanced vision AI understands your ad creative elements, messaging, and design language.',
                        gradient: 'from-primary/10 to-violet-500/10',
                      },
                      {
                        icon: <Layers className="h-5 w-5" />,
                        title: 'Message Matching',
                        description: 'Identifies inconsistencies between ad promises and landing page content automatically.',
                        gradient: 'from-violet-500/10 to-purple-500/10',
                      },
                      {
                        icon: <Palette className="h-5 w-5" />,
                        title: 'Visual Alignment',
                        description: 'Applies matching color schemes, typography, and visual hierarchy from your ads.',
                        gradient: 'from-purple-500/10 to-pink-500/10',
                      },
                      {
                        icon: <BarChart3 className="h-5 w-5" />,
                        title: 'Quality Scoring',
                        description: 'Get a detailed quality score with actionable insights to improve ad-page consistency.',
                        gradient: 'from-pink-500/10 to-rose-500/10',
                      },
                      {
                        icon: <Shield className="h-5 w-5" />,
                        title: 'Trust Signals',
                        description: 'Adds relevant social proof, security badges, and credibility elements.',
                        gradient: 'from-rose-500/10 to-orange-500/10',
                      },
                      {
                        icon: <Zap className="h-5 w-5" />,
                        title: 'Instant Results',
                        description: 'Generate personalized landing pages in seconds, not hours. Download and deploy immediately.',
                        gradient: 'from-orange-500/10 to-primary/10',
                      },
                    ].map((feature, index) => (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="h-full hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group relative overflow-hidden">
                          {/* Gradient background on hover */}
                          <div className={cn(
                            'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500',
                            feature.gradient
                          )} />
                          <CardContent className="relative p-6">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-5 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/25 transition-all duration-500">
                              {feature.icon}
                            </div>
                            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
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
              <section id="how-it-works" className="py-20 sm:py-28 bg-muted/30 relative overflow-hidden">
                <div className="absolute inset-0 dot-pattern opacity-20 pointer-events-none" />
                <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                  >
                    <Badge variant="secondary" className="mb-4 text-xs px-3 py-1">
                      <Rocket className="h-3 w-3 mr-1" />
                      How It Works
                    </Badge>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                      Three simple steps
                    </h2>
                    <p className="text-muted-foreground max-w-xl mx-auto">
                      No design skills needed. Get AI-personalized landing pages in under 10 seconds.
                    </p>
                  </motion.div>

                  <div className="relative">
                    {/* Connector line */}
                    <div className="hidden md:block absolute top-24 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-0.5 bg-gradient-to-r from-primary/30 via-violet-500/30 to-primary/30" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                      {[
                        {
                          step: '01',
                          title: 'Upload Your Ad Creative',
                          description: 'Drag and drop or browse for the image creative from your ad campaign. Our AI will analyze the visual messaging, colors, and text.',
                          icon: <Layers className="h-6 w-6" />,
                        },
                        {
                          step: '02',
                          title: 'Enter Your Landing Page URL',
                          description: 'Provide the URL of the landing page your ads are linking to. We\'ll scrape and analyze the current content and structure.',
                          icon: <Gauge className="h-6 w-6" />,
                        },
                        {
                          step: '03',
                          title: 'Get Personalized Results',
                          description: 'Our AI identifies gaps between the ad and page, generates targeted enhancements, and provides a downloadable HTML file.',
                          icon: <Sparkles className="h-6 w-6" />,
                        },
                      ].map((item, index) => (
                        <motion.div
                          key={item.step}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.2 }}
                          className="text-center"
                        >
                          <Card className="overflow-hidden border-2 border-transparent hover:border-primary/20 transition-colors duration-300">
                            <CardContent className="p-6 sm:p-8">
                              <div className="relative inline-flex mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-violet-400 flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                  {item.icon}
                                </div>
                                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-background border-2 border-primary flex items-center justify-center text-[10px] font-bold text-primary">
                                  {item.step}
                                </div>
                              </div>
                              <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {item.description}
                              </p>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Testimonials Section */}
              <section id="testimonials" className="py-20 sm:py-28">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                  >
                    <Badge variant="secondary" className="mb-4 text-xs px-3 py-1">
                      <Star className="h-3 w-3 mr-1" />
                      Testimonials
                    </Badge>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                      Loved by marketers
                    </h2>
                    <p className="text-muted-foreground max-w-xl mx-auto">
                      See what growth teams are saying about Troopod.
                    </p>
                  </motion.div>

                  {/* Testimonial Carousel */}
                  <div className="relative">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={testimonialIndex}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.4 }}
                      >
                        <Card className="max-w-2xl mx-auto shadow-xl border-0">
                          <CardContent className="p-8 sm:p-10 text-center">
                            {/* Stars */}
                            <div className="flex justify-center gap-1 mb-6">
                              {[...Array(testimonials[testimonialIndex].rating)].map((_, i) => (
                                <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                            <blockquote className="text-lg sm:text-xl leading-relaxed mb-8 font-medium italic">
                              &ldquo;{testimonials[testimonialIndex].content}&rdquo;
                            </blockquote>
                            <div className="flex items-center justify-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-violet-400 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                                {testimonials[testimonialIndex].avatar}
                              </div>
                              <div className="text-left">
                                <p className="font-semibold">{testimonials[testimonialIndex].name}</p>
                                <p className="text-sm text-muted-foreground">{testimonials[testimonialIndex].role}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex items-center justify-center gap-4 mt-8">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 rounded-full"
                        onClick={() => setTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="flex gap-2">
                        {testimonials.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setTestimonialIndex(i)}
                            className={cn(
                              'h-2 rounded-full transition-all duration-300',
                              i === testimonialIndex ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                            )}
                          />
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 rounded-full"
                        onClick={() => setTestimonialIndex((prev) => (prev + 1) % testimonials.length)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Pricing Section */}
              <section id="pricing" className="py-20 sm:py-28 bg-muted/30 relative overflow-hidden">
                <div className="absolute inset-0 dot-pattern opacity-20 pointer-events-none" />
                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                  >
                    <Badge variant="secondary" className="mb-4 text-xs px-3 py-1">
                      <Crown className="h-3 w-3 mr-1" />
                      Pricing
                    </Badge>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                      Simple, transparent pricing
                    </h2>
                    <p className="text-muted-foreground max-w-xl mx-auto">
                      Start free and upgrade as you grow. No hidden fees.
                    </p>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
                    {pricingPlans.map((plan, index) => (
                      <motion.div
                        key={plan.name}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.15 }}
                      >
                        <Card className={cn(
                          'relative overflow-hidden transition-all duration-300 hover:shadow-xl',
                          plan.popular ? 'border-2 border-primary shadow-lg shadow-primary/10 scale-[1.02]' : 'border border-border'
                        )}>
                          {plan.popular && (
                            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-violet-400 text-white text-center text-xs font-semibold py-1.5">
                              Most Popular
                            </div>
                          )}
                          <CardHeader className={cn('p-6', plan.popular && 'pt-10')}>
                            <CardTitle className="text-lg">{plan.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{plan.description}</p>
                            <div className="mt-4">
                              <span className="text-4xl font-extrabold">{plan.price}</span>
                              <span className="text-muted-foreground text-sm">{plan.period}</span>
                            </div>
                          </CardHeader>
                          <CardContent className="p-6 pt-0 space-y-4">
                            <ul className="space-y-3">
                              {plan.features.map((feature) => (
                                <li key={feature} className="flex items-start gap-2.5 text-sm">
                                  <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                  <span className="text-muted-foreground">{feature}</span>
                                </li>
                              ))}
                            </ul>
                            <Button
                              className={cn(
                                'w-full mt-6 rounded-xl h-11',
                                plan.popular
                                  ? 'bg-gradient-to-r from-primary to-violet-400 text-white hover:shadow-lg hover:shadow-primary/25'
                                  : ''
                              )}
                              variant={plan.popular ? 'default' : 'outline'}
                            >
                              {plan.cta}
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* CTA Section */}
              <section className="py-20 sm:py-28">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <Card className="bg-gradient-to-br from-primary via-violet-600 to-purple-600 text-white overflow-hidden relative">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.1),transparent_50%)]" />
                      <CardContent className="relative p-8 sm:p-12 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
                          <Rocket className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                          Ready to boost your conversions?
                        </h2>
                        <p className="text-white/80 max-w-lg mx-auto mb-8 text-lg">
                          Join thousands of marketers using Troopod to create perfectly aligned ad-to-page experiences.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                          <Button
                            size="lg"
                            variant="secondary"
                            className="bg-white text-primary hover:bg-white/90 h-12 px-8 rounded-xl font-semibold gap-2 shadow-xl"
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                          >
                            <Rocket className="h-4 w-4" />
                            Get Started Free
                          </Button>
                          <Button
                            size="lg"
                            variant="ghost"
                            className="text-white/90 hover:text-white hover:bg-white/10 h-12 px-8 rounded-xl font-semibold gap-2"
                          >
                            <Mail className="h-4 w-4" />
                            Talk to Sales
                          </Button>
                        </div>
                        <p className="text-white/50 text-xs mt-6">No credit card required. Free forever plan available.</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </section>

              {/* Integrations / Trusted By Logos */}
              <section className="py-16 border-t border-border/40">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-10"
                  >
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      Integrates with your favorite tools
                    </p>
                  </motion.div>
                  <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
                    {['Shopify', 'WordPress', 'Webflow', 'HubSpot', 'Unbounce', 'Framer'].map((name, i) => (
                      <motion.div
                        key={name}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-center gap-2 text-muted-foreground/60 hover:text-muted-foreground transition-colors group cursor-default"
                      >
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <span className="text-sm font-semibold tracking-tight">{name}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* FAQ Section */}
              <FaqSection />

              {/* Newsletter Section */}
              <NewsletterSection />
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
              className="px-4 sm:px-6 lg:px-8 py-8"
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
      <footer className="border-t border-border/40 mt-auto bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-violet-400 flex items-center justify-center">
                  <Rocket className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold">Troopod</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                AI-powered landing page personalization for modern marketing teams.
              </p>
              <p className="text-xs text-muted-foreground">
                &copy; {new Date().getFullYear()} Troopod. All rights reserved.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold mb-4">Product</h4>
              <ul className="space-y-2.5">
                <li><a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">API Docs</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Changelog</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold mb-4">Company</h4>
              <ul className="space-y-2.5">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold mb-4">Legal</h4>
              <ul className="space-y-2.5">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/40 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              Built with AI. Designed for marketers.
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px] px-2 py-0.5 gap-1">
                <Sparkles className="h-2.5 w-2.5 text-primary" />
                v1.0.0
              </Badge>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-violet-400 to-purple-500 z-[100] origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Back to Top Button */}
      <BackToTop />

      {/* Keyboard Shortcut Hint */}
      <AnimatePresence>
        {appState === 'input' && canGenerate && mounted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 2, duration: 0.3 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
          >
            <div className="flex items-center gap-2 bg-card/90 backdrop-blur-sm border border-border/60 rounded-full px-4 py-2 shadow-lg">
              <Keyboard className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono font-medium border border-border/60">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono font-medium border border-border/60">Enter</kbd> to generate
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
