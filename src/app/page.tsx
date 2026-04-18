'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ImageUploadZone } from '@/components/image-upload-zone';
import { UrlInput } from '@/components/url-input';
import { LoadingAnimation } from '@/components/loading-animation';
import { BeforeAfterComparison } from '@/components/before-after-comparison';
import { HistoryDrawer } from '@/components/history-drawer';
import { FaqSection } from '@/components/faq-section';
import { BackToTop } from '@/components/back-to-top';
import { ScrollProgress } from '@/components/scroll-progress';
import { AnimatedCounter } from '@/components/animated-counter';
import { GenerationProgressBar } from '@/components/generation-progress-bar';
import { CodeViewer } from '@/components/code-viewer';
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
  Code2,
  Github,
  Mail,
  Download,
  Eye,
  Target,
  MousePointerClick,
  RotateCcw,
  RefreshCw,
  Maximize,
  Copy,
  ArrowLeftRight,
  ExternalLink,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { AppState, StitchGenerationResult } from '@/lib/types';
import { AnimatedSection } from '@/lib/use-section-animation';

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
    features: ['Unlimited personalizations', 'Advanced quality scoring', 'A/B test comparisons', 'HTML download', 'Analysis history', 'Priority support'],
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
  { title: 'SaaS Product', imageUrl: '/demo/demo-saas-ad.png', url: 'https://linear.app', gradient: 'demo-gradient-saas' },
  { title: 'E-commerce Sale', imageUrl: '/demo/demo-ecommerce-ad.png', url: 'https://shopify.com', gradient: 'demo-gradient-ecommerce' },
  { title: 'Fitness App', imageUrl: '/demo/demo-fitness-ad.png', url: 'https://cal.com', gradient: 'demo-gradient-fitness' },
];

const features = [
  { icon: <Sparkles className="h-5 w-5" />, title: 'AI-Powered Analysis', description: 'Advanced vision AI understands your ad creative elements, messaging, and design language.', iconBg: 'bg-gradient-to-br from-violet-500/20 to-purple-500/20 text-violet-600 dark:text-violet-400' },
  { icon: <Layers className="h-5 w-5" />, title: 'Message Matching', description: 'Identifies inconsistencies between ad promises and landing page content automatically.', iconBg: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-purple-400' },
  { icon: <Palette className="h-5 w-5" />, title: 'Visual Alignment', description: 'Applies matching color schemes, typography, and visual hierarchy from your ads.', iconBg: 'bg-gradient-to-br from-pink-500/20 to-rose-500/20 text-pink-600 dark:text-pink-400' },
  { icon: <BarChart3 className="h-5 w-5" />, title: 'Quality Scoring', description: 'Get a detailed quality score with actionable insights to improve ad-page consistency.', iconBg: 'bg-gradient-to-br from-rose-500/20 to-orange-500/20 text-rose-600 dark:text-rose-400' },
  { icon: <Shield className="h-5 w-5" />, title: 'Trust Signals', description: 'Automatically adds social proof, security badges, and credibility elements.', iconBg: 'bg-gradient-to-br from-orange-500/20 to-amber-500/20 text-orange-600 dark:text-orange-400' },
  { icon: <Zap className="h-5 w-5" />, title: 'Instant Results', description: 'Generate production-ready personalized code in under 10 seconds.', iconBg: 'bg-gradient-to-br from-amber-500/20 to-emerald-500/20 text-amber-600 dark:text-amber-400' },
];

const howItWorks = [
  { step: '01', title: 'Upload Your Ad', description: 'Drag and drop your ad creative image. AI instantly analyzes colors, messaging, tone, and style.', icon: <Eye className="h-6 w-6" /> },
  { step: '02', title: 'Enter Landing Page URL', description: 'Paste your target landing page URL. We analyze its structure, content, and conversion elements.', icon: <Target className="h-6 w-6" /> },
  { step: '03', title: 'Get Your Personalized Page', description: 'AI generates a page matching your ad\'s colors, messaging, and style — ready to use instantly.', icon: <MousePointerClick className="h-6 w-6" /> },
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
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [generationResult, setGenerationResult] = useState<StitchGenerationResult | null>(null);
  const [animatedScore, setAnimatedScore] = useState(0);

  const [viewMode, setViewMode] = useState<'comparison' | 'preview' | 'code'>('preview');
  const { theme, setTheme } = useTheme();
  const generateRef = useRef<HTMLDivElement>(null);
  const uploadRef = useRef<HTMLDivElement>(null);

  // Hydration mount detection
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

  const canGenerate = adImageUrl !== null && isUrlValid;

  const handleImageSelect = useCallback((_file: File | null, url: string | null, base64?: string | null) => {
    setAdImageUrl(url);
    setPreviewUrl(url);
    setImageBase64(base64 || null);
  }, []);

  const handleUrlChange = useCallback((url: string, isValid: boolean) => {
    setPageUrl(url);
    setIsUrlValid(isValid);
  }, []);

  const handleTryDemo = useCallback((imageUrl: string, url: string) => {
    setAdImageUrl(imageUrl);
    setPreviewUrl(imageUrl);
    setPageUrl(url);
    setIsUrlValid(true);
    // Fetch demo image and convert to base64 for VLM analysis
    fetch(imageUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onload = () => setImageBase64(reader.result as string);
        reader.readAsDataURL(blob);
      })
      .catch(() => setImageBase64(null));
    toast.success('Demo loaded! Click Generate to see it in action.');
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!canGenerate || !adImageUrl || !pageUrl) return;

    setAppState('loading');
    setCurrentStep(1);
    setStatusMessage('Initializing AI pipeline...');

    // Use SSE streaming for real-time progress updates
    try {
      const response = await fetch('/api/generate/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adImage: imageBase64 || adImageUrl,
          pageUrl,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Server returned ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let finalData: Record<string, unknown> | null = null;
      let currentEventType = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.trim() === '') {
            // End of an event
            currentEventType = '';
            continue;
          }
          if (line.startsWith('event: ')) {
            currentEventType = line.substring(7).trim();
          } else if (line.startsWith('data: ')) {
            const jsonStr = line.substring(6);
            try {
              const data = JSON.parse(jsonStr);

              if (currentEventType === 'progress' && data.step) {
                setCurrentStep(data.step);
                setStatusMessage(data.detail || data.message || '');
              } else if (currentEventType === 'result') {
                finalData = data;
              } else if (currentEventType === 'error') {
                const errorMsg = data.error || 'Generation failed';
                toast.error(errorMsg, { duration: 8000, description: 'Check the console for more details.' });
                console.error('[Troopod] Generation SSE error:', errorMsg);
                setAppState('input');
                return;
              }
            } catch {
              // Ignore JSON parse errors for partial chunks
            }
          }
        }
      }

      // Process the final result
      if (finalData && finalData.success && finalData.result) {
        const result = finalData.result as StitchGenerationResult;
        setCurrentStep(6);
        setStatusMessage('Done! Rendering your page...');
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (!result.htmlCode || result.htmlCode.length < 50) {
          toast.error('Generated page was empty. Please try again with a different image or URL.');
          setAppState('input');
          return;
        }
        setGenerationResult(result);
        // Save to localStorage
        const localHistory = JSON.parse(localStorage.getItem('troopod-history') || '[]');
        localHistory.unshift({
          id: Date.now(),
          pageUrl,
          timestamp: new Date().toISOString(),
          qualityScore: result.qualityScore || 92,
          totalChanges: result.totalChanges || 6,
          adImagePreview: adImageUrl,
        });
        if (localHistory.length > 20) localHistory.pop();
        localStorage.setItem('troopod-history', JSON.stringify(localHistory));
        // Save to database (fire-and-forget)
        fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pageUrl,
            adImagePreview: adImageUrl || null,
            qualityScore: result.qualityScore || 0,
            totalChanges: result.totalChanges || 0,
            htmlCode: result.htmlCode || '',
            originalHtml: result.originalHtml || null,
            aiExplanation: result.aiExplanation || null,
            changes: result.changes || [],
          }),
        }).catch(() => { /* DB save is non-critical */ });
        setAppState('results');
        toast.success('Landing page generated successfully!');
      } else {
        const errorMsg = (finalData?.error as string) || 'Generation failed';
        toast.error(errorMsg, { duration: 8000, description: 'Check the console for more details.' });
        console.error('[Troopod] Generation error:', errorMsg);
        setAppState('input');
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      toast.error('Generation failed. Please try again.', { duration: 8000, description: errMsg.substring(0, 100) });
      console.error('[Troopod] Generation exception:', err);
      setAppState('input');
    }
  }, [canGenerate, adImageUrl, pageUrl, imageBase64]);

  // Animated score counter - reset when results change
  const prevResultIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (appState !== 'results' || !generationResult) return;
    const resultId = generationResult.projectId || String(generationResult.qualityScore);
    if (resultId !== prevResultIdRef.current) {
      prevResultIdRef.current = resultId;
      const target = generationResult.qualityScore || 0;
      let current = 0;
      const step = Math.max(1, Math.ceil(target / 40));
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setAnimatedScore(current);
      }, 30);
      return () => clearInterval(timer);
    }
    return undefined;
  }, [appState, generationResult]);



  const handleReset = useCallback(() => {
    setAppState('input');
    setCurrentStep(1);
    setGenerationResult(null);
    setViewMode('comparison');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleLoadHistory = useCallback((item: { pageUrl: string }) => {
    setPageUrl(item.pageUrl);
    setIsUrlValid(true);
    setHistoryOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.info('URL loaded from history');
  }, []);

  // Preview a history item by loading the full generation result from DB
  const handlePreviewHistory = useCallback(async (item: { id: number; pageUrl: string }) => {
    setHistoryOpen(false);
    toast.info('Loading generation from history...');
    try {
      const res = await fetch(`/api/history/${item.id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.htmlCode) {
          const dbItem = json.data;
          const result: StitchGenerationResult = {
            success: true,
            projectId: dbItem.id,
            htmlCode: dbItem.htmlCode,
            originalHtml: dbItem.originalHtml || undefined,
            qualityScore: dbItem.qualityScore || 0,
            totalChanges: dbItem.totalChanges || 0,
            changes: typeof dbItem.changes === 'string' ? JSON.parse(dbItem.changes) : (dbItem.changes || []),
            aiExplanation: dbItem.aiExplanation || undefined,
          };
          setPageUrl(dbItem.pageUrl);
          setIsUrlValid(true);
          setGenerationResult(result);
          setAppState('results');
          toast.success('Loaded from history!');
          return;
        }
      }
    } catch {
      // Fall through to URL-only loading
    }
    // Fallback: just load the URL
    setPageUrl(item.pageUrl);
    setIsUrlValid(true);
    toast.info('URL loaded from history');
  }, []);

  const handleDownloadCode = useCallback(() => {
    if (!generationResult?.htmlCode) return;
    const blob = new Blob([generationResult.htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'personalized-landing-page.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('HTML file downloaded!');
  }, [generationResult]);

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
              v2.0 — AI Powered
            </Badge>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="nav-link-animated hover:text-foreground transition-colors font-medium">Features</a>
            <a href="#how-it-works" className="nav-link-animated hover:text-foreground transition-colors font-medium">How it Works</a>
            <a href="#testimonials" className="nav-link-animated hover:text-foreground transition-colors font-medium">Testimonials</a>
            <a href="#pricing" className="nav-link-animated hover:text-foreground transition-colors font-medium">Pricing</a>
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

      <HistoryDrawer open={historyOpen} onOpenChange={setHistoryOpen} onLoadHistory={handleLoadHistory} onPreviewHistory={handlePreviewHistory} />

      {/* Generation Progress Bar */}
      <AnimatePresence>
        {appState === 'loading' && <GenerationProgressBar currentStep={currentStep} statusMessage={statusMessage} />}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {appState === 'loading' && <LoadingAnimation currentStep={currentStep} statusMessage={statusMessage} />}
      </AnimatePresence>

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {/* ═══════════════════ INPUT STATE ═══════════════════ */}
          {appState === 'input' && (
            <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>

              {/* Floating decorative icons around hero */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                <div className="animate-float-gentle absolute top-[15%] left-[8%] text-primary/10 sm:text-primary/15"><Sparkles className="h-6 w-6 sm:h-8 sm:w-8" /></div>
                <div className="animate-float-gentle absolute top-[25%] right-[10%] text-primary/10 sm:text-primary/15" style={{ animationDelay: '1s' }}><Code2 className="h-5 w-5 sm:h-7 sm:w-7" /></div>
                <div className="animate-float-gentle absolute bottom-[20%] left-[12%] text-primary/8 sm:text-primary/12" style={{ animationDelay: '2s' }}><Sparkles className="h-4 w-4 sm:h-6 sm:w-6" /></div>
                <div className="animate-float-gentle absolute bottom-[30%] right-[8%] text-primary/8 sm:text-primary/12" style={{ animationDelay: '0.5s' }}><Sparkles className="h-5 w-5 sm:h-7 sm:w-7" /></div>
              </div>

              {/* Hero Section */}
              <section className="relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none noise-overlay gradient-mesh">
                  <div className="mesh-orb absolute -top-32 -right-32 w-[500px] h-[500px] bg-violet-500 opacity-[0.12]" style={{ animation: 'mesh-orb-1 12s ease-in-out infinite' }} />
                  <div className="mesh-orb absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-purple-500 opacity-[0.10]" style={{ animation: 'mesh-orb-2 16s ease-in-out 2s infinite' }} />
                  <div className="mesh-orb absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary opacity-[0.08]" style={{ animation: 'mesh-orb-3 20s ease-in-out 4s infinite' }} />
                  <div className="mesh-orb absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-pink-500 opacity-[0.06]" style={{ animation: 'mesh-orb-1 14s ease-in-out 6s infinite' }} />
                  <div className="mesh-orb absolute bottom-1/4 left-1/3 w-[350px] h-[350px] bg-violet-400 opacity-[0.07]" style={{ animation: 'mesh-orb-2 18s ease-in-out 1s infinite' }} />
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="particle absolute w-2 h-2 rounded-full bg-primary/25"
                      style={{
                        left: `${10 + i * 11}%`,
                        top: `${15 + (i % 4) * 20}%`,
                        '--drift-x': `${(i % 2 === 0 ? 1 : -1) * (30 + i * 18)}px`,
                        '--drift-y': `${-40 - i * 22}px`,
                        '--duration': `${10 + i * 2.5}s`,
                        '--delay': `${i * 1.5}s`,
                      } as React.CSSProperties}
                    />
                  ))}
                  <div className="absolute inset-0 dot-pattern opacity-25" />
                </div>

                <motion.div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-12">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex justify-center mb-8">
                    <Badge variant="secondary" className="hero-badge-vivid gap-1.5 px-4 py-1.5 text-xs font-semibold cursor-pointer hover:bg-secondary/80 transition-colors text-primary">
                      <Sparkles className="h-3.5 w-3.5" />
                      Powered by AI — Turn ads into landing pages
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
                      Upload your ad creative, enter a landing page URL, and let <span className="text-primary font-semibold">AI bridge the gap</span> between your ads and your pages for <span className="text-primary font-semibold">maximum conversions</span>.
                    </p>
                  </motion.div>

                  {/* Input Cards — Simplified 2-Step Flow */}
                  <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="max-w-2xl mx-auto space-y-6 input-area-glow p-4 sm:p-6" ref={generateRef}>
                    {/* Step 1: Image Upload */}
                    <div className="space-y-3 relative" ref={uploadRef}>
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

                    {/* Generate Button */}
                    <div className="flex justify-center pt-4">
                      <motion.div whileHover={{ scale: canGenerate ? 1.02 : 1 }} whileTap={{ scale: canGenerate ? 0.98 : 1 }} className="generate-btn-mesh">
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
                          <span className={cn(canGenerate && 'cta-text-pulse')}>Generate Personalized Page</span>
                          {canGenerate && <ArrowRight className="h-4 w-4" />}
                        </Button>
                      </motion.div>
                    </div>

                    {!canGenerate && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-xs text-muted-foreground">
                        {!adImageUrl && !pageUrl ? 'Upload an image and enter a URL to get started' : !adImageUrl ? 'Now upload an ad creative image' : 'Now enter a valid landing page URL'}
                      </motion.p>
                    )}

                    {/* Demo Samples */}
                    {!adImageUrl && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="pt-4">
                        <p className="text-center text-xs font-medium text-muted-foreground mb-4">Or try a demo sample</p>
                        <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
                          {demoSamples.map((demo) => (
                            <Card
                              key={demo.title}
                              className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group overflow-hidden border border-border/60"
                              onClick={() => handleTryDemo(demo.imageUrl, demo.url)}
                              onMouseMove={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = (e.clientX - rect.left) / rect.width - 0.5;
                                const y = (e.clientY - rect.top) / rect.height - 0.5;
                                e.currentTarget.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = '';
                              }}
                            >
                              <CardContent className="p-0">
                                <div className="relative aspect-[4/3] overflow-hidden">
                                  <img src={demo.imageUrl} alt={demo.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                  <div className={`absolute inset-0 ${demo.gradient} opacity-0 group-hover:opacity-60 transition-opacity duration-300`} />
                                  <div className="absolute inset-0 demo-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <span className="text-white font-semibold text-xs bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">Click to try</span>
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

              {/* Gradient Line Separator */}
              <div className="gradient-line-separator" aria-hidden="true" />

              {/* Brand Logo Marquee */}
              <AnimatedSection direction="fade" delay={0.1}>
              <section className="py-10 border-y border-border/30 bg-muted/5 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <p className="text-center text-xs font-medium text-muted-foreground uppercase tracking-widest mb-6">Trusted by 2,500+ teams worldwide</p>
                  <div className="relative overflow-hidden">
                    <div className="flex animate-marquee">
                      {[...brandLogos, ...brandLogos].map((logo, i) => (
                        <div key={`${logo}-${i}`} className="glass-card mx-3 px-5 py-2.5 rounded-xl flex-shrink-0 flex items-center justify-center min-w-[120px]">
                          <span className="text-sm font-semibold text-muted-foreground/70 whitespace-nowrap select-none">{logo}</span>
                        </div>
                      ))}
                    </div>
                    <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
                    <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
                  </div>
                </div>
              </section>
              </AnimatedSection>

              {/* Gradient Line Separator */}
              <div className="gradient-line-separator" aria-hidden="true" />

              {/* Stats Section */}
              <AnimatedSection direction="fade">
              <section className="py-16 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-10 stats-decorator">
                    <p className="text-sm font-medium uppercase tracking-wider stats-header-shimmer">Trusted by growth-focused teams worldwide</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat) => (
                      <AnimatedCounter key={stat.label} value={stat.value} label={stat.label} icon={stat.icon} />
                    ))}
                  </div>
                </div>
              </section>
              </AnimatedSection>

              {/* Gradient Line Separator */}
              <div className="gradient-line-separator" aria-hidden="true" />

              {/* Features Section */}
              <AnimatedSection direction="up" delay={0.1}>
              <section id="features" className="py-20 sm:py-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
                    <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs font-medium mb-4">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      Powerful Features
                    </Badge>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Everything you need to convert better</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">From AI analysis to production-ready code, Troopod handles the entire personalization pipeline automatically.</p>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, i) => (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Card className="feature-card glass-card feature-card-enhanced h-full border-border/60 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                          <span className="feature-card-number">0{i + 1}</span>
                          <CardContent className="p-6">
                            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-4', feature.iconBg)}>
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
              </AnimatedSection>

              {/* Gradient Line Separator */}
              <div className="gradient-line-separator" aria-hidden="true" />

              {/* How It Works */}
              <AnimatedSection direction="up" delay={0.1}>
              <section id="how-it-works" className="py-20 sm:py-28 bg-muted/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
                    <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs font-medium mb-4">
                      <Zap className="h-3.5 w-3.5 text-primary" />
                      Simple Workflow
                    </Badge>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Three steps to a better landing page</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">No design skills required. Upload your ad, paste a URL, and get a personalized page in seconds.</p>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {howItWorks.map((item, i) => (
                      <motion.div
                        key={item.step}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.15 }}
                        className="relative"
                      >
                        <Card className="gradient-border-hover p-6 text-center h-full">
                          <CardContent className="pt-6">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary glow-step">
                              {item.icon}
                            </div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{item.step}</p>
                            <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </CardContent>
                        </Card>
                        {/* Step connector for desktop */}
                        {i < howItWorks.length - 1 && (
                          <div className="hidden md:flex absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                            <div className="step-connector-enhanced">
                              <ArrowRight className="h-5 w-5 connector-arrow" />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>
              </AnimatedSection>

              {/* Gradient Line Separator */}
              <div className="gradient-line-separator" aria-hidden="true" />

              {/* Testimonials */}
              <AnimatedSection direction="up" delay={0.1}>
              <section id="testimonials" className="py-20 sm:py-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
                    <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs font-medium mb-4">
                      <Star className="h-3.5 w-3.5 text-primary" />
                      Customer Stories
                    </Badge>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Loved by marketers worldwide</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">See how teams are using Troopod to improve their ad-to-landing page experience.</p>
                  </motion.div>

                  <div className="max-w-2xl mx-auto">
                    <Card className="frosted-glass-card overflow-hidden">
                      <CardContent className="p-8 sm:p-10">
                        <div className="quote-mark mb-4">&ldquo;</div>
                        <p className="text-lg leading-relaxed mb-8">
                          {testimonials[testimonialIndex].content}
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-violet-400 flex items-center justify-center text-white font-bold text-sm">
                            {testimonials[testimonialIndex].avatar}
                          </div>
                          <div>
                            <p className="font-semibold">{testimonials[testimonialIndex].name}</p>
                            <p className="text-sm text-muted-foreground">{testimonials[testimonialIndex].role}</p>
                          </div>
                          <div className="ml-auto flex gap-0.5">
                            {[...Array(testimonials[testimonialIndex].rating)].map((_, i) => (
                              <motion.span
                                key={i}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                              >
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                              </motion.span>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex items-center justify-center gap-2 mt-6">
                      {testimonials.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setTestimonialIndex(i)}
                          className={cn(
                            'w-2.5 h-2.5 rounded-full transition-all duration-300',
                            i === testimonialIndex ? 'bg-primary w-8' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                          )}
                          aria-label={`View testimonial ${i + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </section>
              </AnimatedSection>

              {/* Gradient Line Separator */}
              <div className="gradient-line-separator" aria-hidden="true" />

              {/* Pricing */}
              <AnimatedSection direction="up" delay={0.1}>
              <section id="pricing" className="py-20 sm:py-28 bg-muted/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
                    <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs font-medium mb-4">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      Pricing
                    </Badge>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Simple, transparent pricing</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">Start free. Upgrade when you need more power.</p>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {pricingPlans.map((plan, i) => (
                      <motion.div
                        key={plan.name}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Card className={cn('pricing-card h-full relative overflow-hidden', plan.popular && 'popular-card border-primary/40 shadow-lg shadow-primary/10')}>
                          {plan.popular && (
                            <div className="pricing-ribbon">
                              <div className="pricing-ribbon-inner relative shimmer-badge text-white">Most Popular</div>
                            </div>
                          )}
                          <CardContent className="p-6">
                            <h3 className="font-semibold text-lg mb-1">{plan.name}</h3>
                            <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                            <div className="mb-6">
                              <span className="text-3xl font-bold">{plan.price}</span>
                              <span className="text-muted-foreground">{plan.period}</span>
                            </div>
                            <Button
                              className={cn(
                                'w-full mb-6',
                                plan.popular
                                  ? 'bg-gradient-to-r from-primary to-violet-500 text-white hover:shadow-lg hover:shadow-primary/20'
                                  : 'bg-muted hover:bg-muted/80'
                              )}
                            >
                              {plan.cta}
                            </Button>
                            <ul className="space-y-3">
                              {plan.features.map((feature) => (
                                <li key={feature} className="flex items-center gap-2 text-sm">
                                  <Check className="h-4 w-4 text-green-500 flex-shrink-0 check-animate" />
                                  <span>{feature}</span>
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
              </AnimatedSection>

              {/* Gradient Line Separator */}
              <div className="gradient-line-separator" aria-hidden="true" />

              {/* FAQ */}
              <AnimatedSection direction="up" delay={0.1}>
              <FaqSection />
              </AnimatedSection>

            </motion.div>
          )}

          {/* ═══════════════════ RESULTS STATE ═══════════════════ */}
          {appState === 'results' && generationResult && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="w-full">
              {/* Top bar with back + score badge */}
              <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40 result-toolbar-shine">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
                  <Button variant="ghost" onClick={handleReset} className="gap-2 text-sm">
                    <ArrowLeftRight className="h-4 w-4 rotate-180" />
                    New Project
                  </Button>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="relative w-7 h-7">
                        <svg className="w-7 h-7 -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
                          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="251" strokeDashoffset={251 - (251 * (generationResult.qualityScore || 0)) / 100} strokeLinecap="round" className={cn('score-ring-animated', generationResult.qualityScore && generationResult.qualityScore >= 90 ? 'text-green-500' : generationResult.qualityScore && generationResult.qualityScore >= 70 ? 'text-amber-500' : 'text-red-500')} />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={cn('text-[10px] font-bold tabular-nums', getScoreColor(animatedScore))}>
                            {animatedScore}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground hidden sm:inline">Quality Score</span>
                    </div>
                    <Badge variant="secondary" className="text-[10px] px-2.5 py-0.5 gap-1">
                      <Check className="h-3 w-3 text-green-500" />
                      {generationResult.totalChanges || 0} changes applied
                    </Badge>
                    <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
                      <Button variant="ghost" size="icon" className={cn('h-7 w-7 rounded-md', viewMode === 'preview' && 'bg-primary text-primary-foreground')} onClick={() => setViewMode('preview')} title="Full Preview">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className={cn('h-7 w-7 rounded-md', viewMode === 'comparison' && 'bg-primary text-primary-foreground')} onClick={() => setViewMode('comparison')} title="Before/After">
                        <ArrowLeftRight className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className={cn('h-7 w-7 rounded-md', viewMode === 'code' && 'bg-primary text-primary-foreground')} onClick={() => setViewMode('code')} title="View Code">
                        <Code2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ═══════════ MAIN PREVIEW (Full Width) ═══════════ */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="w-full bg-muted/20">
                {viewMode === 'preview' && generationResult.htmlCode ? (
                  <div className="w-full">
                    {/* Browser chrome bar */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-muted/60 border-b border-border/40">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <div className="bg-background/90 rounded-md px-3 py-1 text-[10px] text-muted-foreground border border-border/30 w-64 text-center font-mono truncate">
                          {pageUrl || 'troopod.app/preview'}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            if (!generationResult?.htmlCode) return;
                            const blob = new Blob([generationResult.htmlCode], { type: 'text/html' });
                            window.open(URL.createObjectURL(blob), '_blank');
                          }}
                          title="Open in new tab"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    {/* Full-width iframe */}
                    <iframe
                      srcDoc={generationResult.htmlCode}
                      className="w-full border-0 bg-white"
                      style={{ height: '75vh', minHeight: '500px' }}
                      title="Generated Landing Page"
                      sandbox="allow-scripts"
                    />
                  </div>
                ) : viewMode === 'comparison' && generationResult.originalHtml && generationResult.htmlCode ? (
                  <BeforeAfterComparison
                    originalHtml={generationResult.originalHtml}
                    generatedHtml={generationResult.htmlCode}
                    className="border-0 rounded-none"
                  />
                ) : viewMode === 'code' && generationResult.htmlCode ? (
                  <div className="max-w-6xl mx-auto p-4 sm:p-6">
                    <CodeViewer code={generationResult.htmlCode} fileName="landing-page.html" />
                  </div>
                ) : null}
              </motion.div>

              {/* ═══════════ DETAILS PANEL ═══════════ */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* AI Explanation + Source Ad */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  {/* AI Explanation */}
                  {generationResult.aiExplanation && (
                    <div className="lg:col-span-2">
                      <Card className="border-primary/20 bg-primary/[0.03] h-full">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Sparkles className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold mb-1">What AI Did</p>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {generationResult.aiExplanation}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Source Ad + Score */}
                  <div className="space-y-4">
                    {previewUrl && (
                      <Card className="border-border/60">
                        <CardContent className="p-4">
                          <p className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Eye className="h-3.5 w-3.5 text-primary" /> Source Ad</p>
                          <img src={previewUrl} alt="Source ad creative" className="w-full rounded-lg object-cover border border-border/40" style={{ maxHeight: '120px' }} />
                        </CardContent>
                      </Card>
                    )}
                    <Card className="score-card-gradient">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
                            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="251" strokeDashoffset={251 - (251 * (generationResult.qualityScore || 0)) / 100} strokeLinecap="round" className={cn('score-ring-animated', generationResult.qualityScore && generationResult.qualityScore >= 90 ? 'text-green-500' : generationResult.qualityScore && generationResult.qualityScore >= 70 ? 'text-amber-500' : 'text-red-500')} />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className={cn('text-lg font-bold tabular-nums', getScoreColor(animatedScore))}>
                              {animatedScore}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-semibold">Quality Score</p>
                          <p className="text-xs text-muted-foreground">{generationResult.totalChanges || 0} optimizations applied</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">{(generationResult.changes || []).filter(c => c.type === 'addition').length} added</span>
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">{(generationResult.changes || []).filter(c => c.type === 'modification').length} modified</span>
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">{(generationResult.changes || []).filter(c => c.type === 'optimization').length} optimized</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Changes List - compact */}
                {(generationResult.changes && generationResult.changes.length > 0) && (
                  <Card className="border-border/60 mb-8">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Layers className="h-4 w-4 text-primary" />
                        Changes Applied
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {(generationResult.changes || []).map((change) => (
                          <div key={change.id} className={cn('flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors', change.impact === 'high' && 'high-impact-glow')}>
                            <Badge variant={change.impact === 'high' ? 'default' : change.impact === 'medium' ? 'secondary' : 'outline'} className={cn('text-[10px] mt-0.5 flex-shrink-0', change.impact === 'high' && 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20', change.impact === 'medium' && 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20')}>
                              {change.impact}
                            </Badge>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-medium text-muted-foreground">{change.section}</p>
                              <p className="text-xs">{change.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 pb-4">
                  <Button
                    size="lg"
                    onClick={handleDownloadCode}
                    className="gap-2 bg-gradient-to-r from-primary to-violet-500 text-white hover:shadow-lg hover:shadow-primary/20"
                  >
                    <Download className="h-4 w-4" />
                    Download HTML
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2"
                    onClick={async () => {
                      if (!generationResult?.htmlCode) return;
                      try {
                        await navigator.clipboard.writeText(generationResult.htmlCode);
                        toast.success('HTML code copied!');
                      } catch {
                        toast.error('Failed to copy');
                      }
                    }}
                  >
                    <Copy className="h-4 w-4" />
                    Copy Code
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2"
                    onClick={() => {
                      if (!generationResult?.htmlCode) return;
                      const blob = new Blob([generationResult.htmlCode], { type: 'text/html' });
                      window.open(URL.createObjectURL(blob), '_blank');
                      toast.success('Opened fullscreen!');
                    }}
                  >
                    <Maximize className="h-4 w-4" />
                    Fullscreen
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2 border-primary/30 text-primary hover:bg-primary/5"
                    onClick={() => {
                      if (!adImageUrl || !pageUrl) return;
                      toast.info('Regenerating...');
                      handleGenerate();
                    }}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Regenerate
                  </Button>
                  <Button variant="ghost" size="lg" onClick={handleReset} className="gap-2 text-muted-foreground">
                    <RotateCcw className="h-4 w-4" />
                    Create Another
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer separator with animated gradient */}
      <div className="footer-gradient-sep relative">
        <div className="footer-separator-glow" aria-hidden="true" />
      </div>

      {/* Footer */}
      <footer className="footer-dark-gradient mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
          {/* Newsletter section */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 pb-8 border-b border-border/30">
            <div>
              <h3 className="font-semibold text-sm mb-1">Stay Updated</h3>
              <p className="text-xs text-muted-foreground">Get the latest AI personalization tips and feature updates.</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="newsletter-input h-9 pl-9 pr-3 text-sm rounded-lg w-full outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <Button size="sm" className="btn-glow-anim bg-gradient-to-r from-primary to-violet-500 text-white h-9 px-4 text-sm font-medium rounded-lg">
                Subscribe
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-violet-400 flex items-center justify-center">
                  <Rocket className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold">Troopod</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                AI-powered landing page personalization. Turn any ad creative into a high-converting landing page.
              </p>
              {/* Social links with hover gradient glow */}
              <div className="flex items-center gap-2.5">
                <a href="https://github.com/troopod" target="_blank" rel="noopener noreferrer" className="footer-social-link w-9 h-9 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center transition-all duration-300 hover:shadow-sm hover:-translate-y-0.5 group" aria-label="GitHub">
                  <Github className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </a>
                <a href="https://twitter.com/troopod" target="_blank" rel="noopener noreferrer" className="footer-social-link w-9 h-9 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center transition-all duration-300 hover:shadow-sm hover:-translate-y-0.5 group" aria-label="Twitter/X">
                  <svg className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                </a>
                <a href="https://linkedin.com/company/troopod" target="_blank" rel="noopener noreferrer" className="footer-social-link w-9 h-9 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center transition-all duration-300 hover:shadow-sm hover:-translate-y-0.5 group" aria-label="LinkedIn">
                  <svg className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
                <a href="https://youtube.com/@troopod" target="_blank" rel="noopener noreferrer" className="footer-social-link w-9 h-9 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center transition-all duration-300 hover:shadow-sm hover:-translate-y-0.5 group" aria-label="YouTube">
                  <svg className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
                </a>
              </div>
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
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Troopod. All rights reserved. Built with ❤️ for marketers.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://github.com/troopod" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-md bg-muted/50 hover:bg-muted flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5" aria-label="GitHub">
                <Github className="h-3.5 w-3.5 text-muted-foreground" />
              </a>
              <a href="https://twitter.com/troopod" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-md bg-muted/50 hover:bg-muted flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5" aria-label="Twitter">
                <svg className="h-3.5 w-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a href="https://linkedin.com/company/troopod" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-md bg-muted/50 hover:bg-muted flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5" aria-label="LinkedIn">
                <svg className="h-3.5 w-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      <BackToTop />
    </div>
  );
}
