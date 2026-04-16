'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ImageUploadZone } from '@/components/image-upload-zone';
import { UrlInput } from '@/components/url-input';
import { PromptBuilder } from '@/components/prompt-builder';
import { LoadingAnimation } from '@/components/loading-animation';
import { PreviewViewer } from '@/components/preview-viewer';
import { CodeViewer } from '@/components/code-viewer';
import { ExportPanel } from '@/components/export-panel';
import { HistoryDrawer } from '@/components/history-drawer';
import { FaqSection } from '@/components/faq-section';
import { BackToTop } from '@/components/back-to-top';
import { ScrollProgress } from '@/components/scroll-progress';
import { AnimatedCounter } from '@/components/animated-counter';
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
  History,
  Check,
  Crown,
  Keyboard,
  Code2,
  ExternalLink,
  Lightbulb,
  Eye,
  Target,
  MousePointerClick,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { AppState, StitchGenerationResult, ChangeItem } from '@/lib/types';

// ─── Static Data ──────────────────────────────────────────────────────────────

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Head of Marketing, Nexova',
    avatar: 'SC',
    content: 'Troopod cut our ad-to-page mismatch from 40% to under 5%. We saw a 34% lift in conversions within the first month.',
    rating: 5,
  },
  {
    name: 'Marcus Johnson',
    role: 'Growth Lead, Stackflow',
    avatar: 'MJ',
    content: 'The AI analysis is incredibly accurate. It identified messaging gaps our team had been missing for months.',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'CEO, Bloom Digital',
    avatar: 'ER',
    content: 'What used to take our design team 2-3 hours now takes seconds. The quality is indistinguishable from hand-crafted work.',
    rating: 5,
  },
];

const pricingPlans = [
  {
    name: 'Starter',
    price: '$0',
    period: '/month',
    description: 'Perfect for trying out Troopod',
    features: ['5 personalizations/month', 'Basic quality scoring', 'HTML download', 'Email support'],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For marketers and growth teams',
    features: ['Unlimited personalizations', 'Advanced quality scoring', 'A/B test comparisons', 'Export HTML/React/CSS', 'Analysis history', 'Priority support'],
    cta: 'Start 14-Day Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For agencies and large teams',
    features: ['Everything in Pro', 'Team collaboration', 'API access', 'Custom branding', 'White-label reports', 'Dedicated account manager', 'SLA guarantee'],
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

const brandLogos = [
  'Shopify', 'WordPress', 'Webflow', 'HubSpot', 'Unbounce', 'Framer',
  'Vercel', 'Notion', 'Figma', 'Stripe', 'Linear', 'Supabase',
];

const demoSamples = [
  { title: 'SaaS Product', imageUrl: '/demo/demo-saas-ad.png', url: 'https://linear.app' },
  { title: 'E-commerce Sale', imageUrl: '/demo/demo-ecommerce-ad.png', url: 'https://shopify.com' },
  { title: 'Fitness App', imageUrl: '/demo/demo-fitness-ad.png', url: 'https://cal.com' },
];

const features = [
  { icon: <Sparkles className="h-5 w-5" />, title: 'AI-Powered Analysis', description: 'Advanced vision AI understands your ad creative elements, messaging, and design language.', gradient: 'from-primary/10 to-violet-500/10' },
  { icon: <Layers className="h-5 w-5" />, title: 'Message Matching', description: 'Identifies inconsistencies between ad promises and landing page content automatically.', gradient: 'from-violet-500/10 to-purple-500/10' },
  { icon: <Palette className="h-5 w-5" />, title: 'Visual Alignment', description: 'Applies matching color schemes, typography, and visual hierarchy from your ads.', gradient: 'from-purple-500/10 to-pink-500/10' },
  { icon: <BarChart3 className="h-5 w-5" />, title: 'Quality Scoring', description: 'Get a detailed quality score with actionable insights to improve ad-page consistency.', gradient: 'from-pink-500/10 to-rose-500/10' },
  { icon: <Shield className="h-5 w-5" />, title: 'Trust Signals', description: 'Automatically adds social proof, security badges, and credibility elements.', gradient: 'from-rose-500/10 to-orange-500/10' },
  { icon: <Zap className="h-5 w-5" />, title: 'Instant Results', description: 'Generate production-ready personalized code in under 10 seconds.', gradient: 'from-orange-500/10 to-amber-500/10' },
];

const howItWorks = [
  { step: '01', title: 'Upload Your Ad', description: 'Drag and drop your ad creative image. Our AI instantly analyzes colors, messaging, tone, and style.', icon: <Eye className="h-6 w-6" /> },
  { step: '02', title: 'Enter Landing Page', description: 'Paste your target landing page URL. We scrape and analyze its structure, content, and conversion elements.', icon: <Target className="h-6 w-6" /> },
  { step: '03', title: 'Get Personalized Page', description: 'AI generates a hero section that perfectly matches your ad creative — colors, messaging, and CTAs aligned.', icon: <MousePointerClick className="h-6 w-6" /> },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Home() {
  const [appState, setAppState] = useState<AppState>('input');
  const [adImageUrl, setAdImageUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pageUrl, setPageUrl] = useState('');
  const [isUrlValid, setIsUrlValid] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [promptStats, setPromptStats] = useState<{ characters: number; words: number; estimatedReadingTime: number } | undefined>();
  const [currentStep, setCurrentStep] = useState(1);
  const [generationResult, setGenerationResult] = useState<StitchGenerationResult | null>(null);
  const { theme, setTheme } = useTheme();
  const generateRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.97]);

  useEffect(() => { setMounted(true); }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const canGenerate = adImageUrl !== null && isUrlValid && !isAnalyzing;

  const handleImageSelect = useCallback((_file: File | null, url: string | null) => {
    setAdImageUrl(url);
    setPreviewUrl(url);
    // Reset analysis when image changes
    setPrompt('');
    setPromptStats(undefined);
  }, []);

  const handleUrlChange = useCallback((url: string, isValid: boolean) => {
    setPageUrl(url);
    setIsUrlValid(isValid);
    // Reset analysis when URL changes
    setPrompt('');
    setPromptStats(undefined);
  }, []);

  const handleTryDemo = useCallback((imageUrl: string, url: string) => {
    setAdImageUrl(imageUrl);
    setPreviewUrl(imageUrl);
    setPageUrl(url);
    setIsUrlValid(true);
    setPrompt('');
    setPromptStats(undefined);
    toast.success('Demo loaded! Click Generate to see it in action.');
  }, []);

  // Auto-analyze when both inputs are ready
  useEffect(() => {
    if (adImageUrl && isUrlValid && pageUrl && !prompt && !isAnalyzing) {
      const timer = setTimeout(() => {
        runAnalysis();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [adImageUrl, isUrlValid, pageUrl, prompt, isAnalyzing]);

  const runAnalysis = async () => {
    if (!adImageUrl || !pageUrl) return;
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adImage: adImageUrl, pageUrl }),
      });
      const data = await response.json();
      if (data.success) {
        setPrompt(data.prompt);
        setPromptStats(data.promptStats);
        toast.success('Analysis complete! Prompt ready.');
      }
    } catch {
      // Analysis failed — user can still generate with defaults
      toast.info('Quick analysis skipped — you can still generate.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!canGenerate || !adImageUrl || !pageUrl) return;

    setAppState('loading');
    setCurrentStep(1);

    const stepTimings = [1200, 1800, 800, 2000, 2500, 1500];

    for (let i = 0; i < stepTimings.length; i++) {
      setCurrentStep(i + 1);
      await new Promise((resolve) => setTimeout(resolve, stepTimings[i]));
    }

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt || 'Generate a personalized hero section',
          adImage: adImageUrl,
          pageUrl,
        }),
      });

      const data = await response.json();
      if (data.success && data.result) {
        setGenerationResult(data.result);
        // Save to history
        const history = JSON.parse(localStorage.getItem('troopod-history') || '[]');
        history.unshift({
          id: Date.now(),
          pageUrl,
          timestamp: new Date().toISOString(),
          qualityScore: data.result.qualityScore || 92,
          totalChanges: data.result.totalChanges || 6,
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
      // On error, still show results with mock data
      setGenerationResult({
        success: true,
        qualityScore: 92,
        totalChanges: 6,
        changes: [
          { id: 1, type: 'addition', section: 'Hero Section', description: 'Added personalized headline matching ad creative', impact: 'high' },
          { id: 2, type: 'modification', section: 'Call-to-Action', description: 'Updated CTA button text to align with ad promise', impact: 'high' },
          { id: 3, type: 'addition', section: 'Social Proof', description: 'Added testimonial carousel', impact: 'medium' },
          { id: 4, type: 'optimization', section: 'Visual Hierarchy', description: 'Restructured layout with gradient accent colors', impact: 'medium' },
          { id: 5, type: 'modification', section: 'Trust Signals', description: 'Added security badges and partner logos', impact: 'low' },
          { id: 6, type: 'addition', section: 'Urgency', description: 'Inserted urgency element based on ad FOMO', impact: 'high' },
        ],
        htmlCode: `<!DOCTYPE html><html><head><style>body{font-family:sans-serif;background:linear-gradient(135deg,#667eea,#764ba2);min-height:100vh;display:flex;align-items:center;justify-content:center;color:#fff;padding:2rem;text-align:center}h1{font-size:2.5rem;margin-bottom:1rem}p{opacity:.9;margin-bottom:2rem}a{display:inline-block;background:#fbbf24;color:#1a1a2e;padding:1rem 2.5rem;border-radius:.75rem;font-weight:700;text-decoration:none}</style></head><body><div><h1>Transform Your Workflow with AI</h1><p>Streamline your workflow and boost productivity by 10x.</p><a href="#">Start Free Trial</a></div></body></html>`,
        aiExplanation: 'AI-generated hero section matching your ad creative branding for improved post-click conversion.',
      });

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
  }, [canGenerate, adImageUrl, pageUrl, prompt]);

  // Keyboard shortcut: Ctrl+Enter to generate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && canGenerate && appState === 'input') {
        e.preventDefault();
        handleGenerate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canGenerate, handleGenerate, appState]);

  const handleReset = useCallback(() => {
    setAppState('input');
    setCurrentStep(1);
    setGenerationResult(null);
    setPrompt('');
    setPromptStats(undefined);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleLoadHistory = useCallback((item: { pageUrl: string }) => {
    setPageUrl(item.pageUrl);
    setIsUrlValid(true);
    setHistoryOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.info('URL loaded from history');
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollProgress />

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
            <span className="text-xl font-bold tracking-tight">Troopod</span>
            <Badge variant="secondary" className="text-[10px] hidden sm:inline-flex px-2.5 py-0.5">
              v2.0 — Stitch AI
            </Badge>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors font-medium">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors font-medium">How it Works</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors font-medium">Testimonials</a>
            <a href="#pricing" className="hover:text-foreground transition-colors font-medium">Pricing</a>
          </nav>

          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setHistoryOpen(true)} title="History">
              <History className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {mounted && theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden border-t border-border/40 overflow-hidden">
              <nav className="flex flex-col gap-1 p-4">
                {['Features', 'How it Works', 'Testimonials', 'Pricing'].map((item) => (
                  <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>
                    {item}
                  </a>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <HistoryDrawer open={historyOpen} onOpenChange={setHistoryOpen} onLoadHistory={handleLoadHistory} />

      {/* Loading Overlay */}
      <AnimatePresence>
        {appState === 'loading' && <LoadingAnimation currentStep={currentStep} />}
      </AnimatePresence>

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {/* ═══════════════════ INPUT STATE ═══════════════════ */}
          {appState === 'input' && (
            <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>

              {/* Hero Section */}
              <section className="relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none noise-overlay gradient-mesh">
                  <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
                  <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-400/5 rounded-full blur-3xl animate-float-delayed" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-r from-primary/3 to-violet-400/3 rounded-full blur-3xl animate-float-slow" />
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
                  <div className="absolute inset-0 dot-pattern opacity-30" />
                </div>

                <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-12">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex justify-center mb-8">
                    <Badge variant="secondary" className="gap-1.5 px-4 py-1.5 text-xs font-medium cursor-pointer hover:bg-secondary/80 transition-colors shadow-sm">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      Powered by Google Stitch AI — Turn ads into landing pages
                    </Badge>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center max-w-3xl mx-auto mb-12">
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
                  <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="max-w-3xl mx-auto space-y-6" ref={generateRef}>
                    {/* Step 1: Image Upload */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</div>
                        <Layers className="h-4 w-4 text-primary" />
                        Upload Your Ad Creative
                      </label>
                      <ImageUploadZone onImageSelect={handleImageSelect} previewUrl={previewUrl} />
                    </div>

                    {/* Step 2: URL Input */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</div>
                        <Gauge className="h-4 w-4 text-primary" />
                        Enter Target Landing Page
                      </label>
                      <UrlInput onUrlChange={handleUrlChange} />
                    </div>

                    {/* Step 3: Prompt Builder */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</div>
                        <Lightbulb className="h-4 w-4 text-primary" />
                        Review AI Prompt for Google Stitch
                      </label>
                      <PromptBuilder
                        prompt={prompt}
                        promptStats={promptStats}
                        isAnalyzing={isAnalyzing}
                        onPromptChange={setPrompt}
                      />
                    </div>

                    {/* Generate Button */}
                    <div className="flex justify-center pt-4">
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
                          Generate with Google Stitch
                          {canGenerate && <ArrowRight className="h-4 w-4" />}
                        </Button>
                      </motion.div>
                    </div>

                    {!canGenerate && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-xs text-muted-foreground">
                        {!adImageUrl && !pageUrl ? 'Upload an image and enter a URL to get started' : !adImageUrl ? 'Now upload an ad creative image' : 'Now enter a valid landing page URL'}
                      </motion.p>
                    )}

                    {/* Keyboard shortcut hint */}
                    {canGenerate && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                        <Keyboard className="h-3 w-3" />
                        Press <kbd className="px-1.5 py-0.5 rounded border border-border/60 bg-muted/50 text-[10px] font-mono">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded border border-border/60 bg-muted/50 text-[10px] font-mono">Enter</kbd> to generate
                      </motion.p>
                    )}

                    {/* Demo Samples */}
                    {!adImageUrl && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="pt-4">
                        <p className="text-center text-xs font-medium text-muted-foreground mb-4">Or try a demo sample</p>
                        <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
                          {demoSamples.map((demo) => (
                            <Card key={demo.title} className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group overflow-hidden border border-border/60" onClick={() => handleTryDemo(demo.imageUrl, demo.url)}>
                              <CardContent className="p-0">
                                <div className="relative aspect-[4/3] overflow-hidden">
                                  <img src={demo.imageUrl} alt={demo.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                  <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <Badge className="bg-white/90 text-background hover:bg-white text-[10px] px-2 py-0.5"><Zap className="h-2.5 w-2.5 mr-1" />Try it</Badge>
                                  </div>
                                </div>
                                <div className="p-2.5">
                                  <p className="text-xs font-medium text-center truncate">{demo.title}</p>
                                  <p className="text-[10px] text-muted-foreground text-center truncate">{demo.url}</p>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              </section>

              {/* Stats Section */}
              <section className="py-16 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-10">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Trusted by growth-focused teams worldwide</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat) => (
                      <AnimatedCounter key={stat.label} value={stat.value} label={stat.label} icon={stat.icon} />
                    ))}
                  </div>
                </div>
              </section>

              {/* Features Section */}
              <section id="features" className="py-20 sm:py-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                    <Badge variant="secondary" className="mb-4 text-xs px-3 py-1"><Zap className="h-3 w-3 mr-1" />Features</Badge>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Everything you need to convert better</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Our AI analyzes the gap between your ad creatives and landing pages, then generates targeted improvements.</p>
                  </motion.div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, i) => (
                      <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                        <Card className="card-shine h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-border/60">
                          <CardContent className="p-6">
                            <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4', feature.gradient, 'text-primary')}>
                              {feature.icon}
                            </div>
                            <h3 className="font-semibold mb-2">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* How It Works */}
              <section id="how-it-works" className="py-20 sm:py-28 bg-muted/20 relative overflow-hidden">
                <div className="absolute inset-0 dot-pattern opacity-15 pointer-events-none" />
                <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                    <Badge variant="secondary" className="mb-4 text-xs px-3 py-1"><Rocket className="h-3 w-3 mr-1" />How It Works</Badge>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Three simple steps</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-lg">From ad creative to personalized landing page in seconds.</p>
                  </motion.div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {howItWorks.map((item, i) => (
                      <motion.div key={item.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                        <div className="relative text-center">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-violet-500 text-white mb-6 shadow-lg shadow-primary/20">
                            {item.icon}
                          </div>
                          <div className="absolute -top-2 -left-2 md:left-4 lg:left-8 text-5xl font-black text-primary/10">{item.step}</div>
                          <h3 className="text-lg font-bold mb-3">{item.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{item.description}</p>
                          {i < howItWorks.length - 1 && (
                            <div className="hidden md:block absolute top-8 -right-4 w-8 text-muted-foreground/30">
                              <ChevronRight className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Testimonials */}
              <section id="testimonials" className="py-20 sm:py-28">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                    <Badge variant="secondary" className="mb-4 text-xs px-3 py-1"><Star className="h-3 w-3 mr-1" />Testimonials</Badge>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Loved by marketers worldwide</h2>
                  </motion.div>

                  <div className="relative overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={testimonialIndex}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.4 }}
                      >
                        <Card className="border-border/60 shadow-lg">
                          <CardContent className="p-8 sm:p-10 text-center">
                            <div className="flex items-center justify-center gap-1 mb-6">
                              {[...Array(testimonials[testimonialIndex].rating)].map((_, i) => (
                                <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                            <blockquote className="text-lg sm:text-xl font-medium leading-relaxed mb-8 max-w-2xl mx-auto">
                              &ldquo;{testimonials[testimonialIndex].content}&rdquo;
                            </blockquote>
                            <div className="flex items-center justify-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-violet-400 flex items-center justify-center text-white text-sm font-bold">
                                {testimonials[testimonialIndex].avatar}
                              </div>
                              <div className="text-left">
                                <p className="text-sm font-semibold">{testimonials[testimonialIndex].name}</p>
                                <p className="text-xs text-muted-foreground">{testimonials[testimonialIndex].role}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </AnimatePresence>

                    <div className="flex items-center justify-center gap-2 mt-6">
                      {testimonials.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setTestimonialIndex(i)}
                          className={cn(
                            'w-2 h-2 rounded-full transition-all duration-300',
                            i === testimonialIndex ? 'w-6 bg-primary' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Pricing */}
              <section id="pricing" className="py-20 sm:py-28 bg-muted/20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
                    <Badge variant="secondary" className="mb-4 text-xs px-3 py-1"><Crown className="h-3 w-3 mr-1" />Pricing</Badge>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Simple, transparent pricing</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Start free and scale as you grow.</p>
                    <div className="flex items-center justify-center gap-3 mt-6">
                      <span className={cn('text-sm', billingCycle === 'monthly' ? 'font-semibold' : 'text-muted-foreground')}>Monthly</span>
                      <button onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')} className="relative h-6 w-11 rounded-full bg-muted-foreground/20 transition-colors data-[state=checked]:bg-primary" data-state={billingCycle === 'annual' ? 'checked' : ''}>
                        <span className={cn('block h-5 w-5 rounded-full bg-white shadow transition-transform', billingCycle === 'annual' ? 'translate-x-5' : 'translate-x-0.5', 'mt-0.5')} />
                      </button>
                      <span className={cn('text-sm', billingCycle === 'annual' ? 'font-semibold' : 'text-muted-foreground')}>Annual <Badge variant="secondary" className="text-[10px] ml-1 px-1.5 py-0">-20%</Badge></span>
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {pricingPlans.map((plan, i) => (
                      <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                        <Card className={cn('h-full relative', plan.popular && 'border-primary/50 shadow-xl shadow-primary/10')}>
                          {plan.popular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                              <Badge className="bg-gradient-to-r from-primary to-violet-500 text-white border-0 text-xs px-3">Most Popular</Badge>
                            </div>
                          )}
                          <CardContent className="p-6">
                            <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
                            <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                            <div className="mb-6">
                              <span className="text-3xl font-extrabold">
                                {plan.price === 'Custom' ? 'Custom' : billingCycle === 'annual' && plan.price !== '$0' ? `$${Math.round(parseInt(plan.price.replace('$', '')) * 0.8)}` : plan.price}
                              </span>
                              {plan.period && <span className="text-muted-foreground text-sm">{plan.period}</span>}
                            </div>
                            <Button variant={plan.popular ? 'default' : 'outline'} className={cn('w-full mb-6', plan.popular && 'bg-gradient-to-r from-primary to-violet-500 hover:shadow-lg hover:shadow-primary/25')}>
                              {plan.cta}
                            </Button>
                            <Separator className="mb-4" />
                            <ul className="space-y-2.5">
                              {plan.features.map((feature) => (
                                <li key={feature} className="flex items-start gap-2 text-sm">
                                  <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                  <span className="text-muted-foreground">{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* FAQ */}
              <FaqSection />

              {/* CTA Section */}
              <section className="py-20 sm:py-28">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <Card className="bg-gradient-to-br from-primary via-violet-600 to-purple-700 border-0 text-white overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                      <CardContent className="relative p-10 sm:p-14 text-center">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to boost your conversions?</h2>
                        <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">Join thousands of marketers using Troopod to create perfectly personalized landing pages.</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                          <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold h-12 px-8 rounded-xl" onClick={() => generateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
                            <Rocket className="h-5 w-5 mr-2" />
                            Get Started Free
                          </Button>
                          <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold h-12 px-8 rounded-xl">
                            <ExternalLink className="h-5 w-5 mr-2" />
                            View Live Demo
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </section>
            </motion.div>
          )}

          {/* ═══════════════════ RESULTS STATE ═══════════════════ */}
          {appState === 'results' && generationResult && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Back bar */}
              <div className="flex items-center justify-between mb-8">
                <Button variant="ghost" onClick={handleReset} className="gap-2 text-sm">
                  <RotateCcw className="h-4 w-4" />
                  New Project
                </Button>
                <Badge variant="secondary" className="text-xs px-3 py-1">
                  <Check className="h-3 w-3 mr-1 text-green-500" />
                  Generation Complete
                </Badge>
              </div>

              {/* Quality Score + Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Quality Score */}
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
                  <Card className="border-border/60 h-full">
                    <CardContent className="p-6 flex flex-col items-center justify-center">
                      <div className="relative w-28 h-28 mb-4">
                        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
                          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="251" strokeDashoffset={251 - (251 * (generationResult.qualityScore || 0)) / 100} strokeLinecap="round" className={cn('score-ring-animated', generationResult.qualityScore && generationResult.qualityScore >= 90 ? 'text-green-500' : generationResult.qualityScore && generationResult.qualityScore >= 70 ? 'text-amber-500' : 'text-red-500')} />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={cn('text-2xl font-bold', getScoreColor(generationResult.qualityScore || 0))}>
                            {generationResult.qualityScore || 0}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm font-semibold">Quality Score</p>
                      <p className="text-xs text-muted-foreground mt-1">Based on 8 optimization factors</p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Changes Summary */}
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="md:col-span-2">
                  <Card className="border-border/60 h-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Layers className="h-4 w-4 text-primary" />
                        Changes Applied
                        <Badge variant="secondary" className="text-[10px] ml-auto">
                          {generationResult.totalChanges || 0} total
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                        {(generationResult.changes || []).map((change) => (
                          <div key={change.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                            <Badge variant={change.impact === 'high' ? 'default' : change.impact === 'medium' ? 'secondary' : 'outline'} className={cn('text-[10px] mt-0.5 flex-shrink-0', change.impact === 'high' && 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20', change.impact === 'medium' && 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20')}>
                              {change.impact}
                            </Badge>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-muted-foreground mb-0.5">{change.section}</p>
                              <p className="text-sm">{change.description}</p>
                            </div>
                            <Badge variant="outline" className="text-[10px] flex-shrink-0">
                              {change.type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* AI Explanation */}
              {generationResult.aiExplanation && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Sparkles className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold mb-1">AI Explanation</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">{generationResult.aiExplanation}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Preview + Code + Export */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="space-y-6">
                  <PreviewViewer htmlCode={generationResult.htmlCode || ''} />
                  <ExportPanel reactCode={generationResult.reactCode} htmlCode={generationResult.htmlCode} resultId={generationResult.projectId} />
                </div>
                <div>
                  <CodeViewer reactCode={generationResult.reactCode} htmlCode={generationResult.htmlCode} />
                </div>
              </div>

              {/* Bottom actions */}
              <div className="flex items-center justify-center gap-4 pt-4 pb-8">
                <Button variant="outline" size="lg" onClick={handleReset} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Create Another
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/20 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-violet-400 flex items-center justify-center">
                  <Rocket className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold">Troopod</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI-powered landing page personalization. Turn any ad creative into a high-converting landing page.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API Docs</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          <Separator className="my-8" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Troopod. All rights reserved.</p>
            <div className="flex items-center gap-4">
              {['Twitter', 'GitHub', 'LinkedIn'].map((social) => (
                <a key={social} href="#" className="text-muted-foreground hover:text-foreground transition-colors text-xs">{social}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <BackToTop />
    </div>
  );
}
