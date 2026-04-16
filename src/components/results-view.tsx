'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Download,
  ArrowLeft,
  Copy,
  CheckCircle2,
  Sparkles,
  Target,
  Zap,
  Eye,
  Code2,
  FileText,
  ArrowRight,
  RefreshCw,
  FileDown,
  Share2,
  GripVertical,
  TrendingUp,
  Layers,
  Shield,
  Palette,
  Globe,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ChangeLog {
  id: number;
  type: 'addition' | 'modification' | 'optimization';
  section: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

interface QualityMetric {
  label: string;
  score: number;
  icon: React.ReactNode;
  description: string;
}

interface ResultsViewProps {
  pageUrl: string;
  adImageUrl: string;
  onReset: () => void;
}

const MOCK_CHANGES: ChangeLog[] = [
  {
    id: 1,
    type: 'addition',
    section: 'Hero Section',
    description: 'Added personalized headline matching ad creative messaging with dynamic keyword insertion',
    impact: 'high',
  },
  {
    id: 2,
    type: 'modification',
    section: 'Call-to-Action',
    description: 'Updated CTA button text to align with ad promise ("Start Free Trial" → "Get Your Free 14-Day Trial")',
    impact: 'high',
  },
  {
    id: 3,
    type: 'addition',
    section: 'Social Proof',
    description: 'Added testimonial carousel featuring results aligned with target audience demographics',
    impact: 'medium',
  },
  {
    id: 4,
    type: 'optimization',
    section: 'Visual Hierarchy',
    description: "Restructured layout to follow ad creative's visual flow — gradient accent colors applied",
    impact: 'medium',
  },
  {
    id: 5,
    type: 'modification',
    section: 'Trust Signals',
    description: 'Added security badges and partner logos matching those referenced in the ad creative',
    impact: 'low',
  },
  {
    id: 6,
    type: 'addition',
    section: 'Above the Fold',
    description: 'Inserted urgency element ("Limited: Join 2,847 professionals this week") based on ad FOMO',
    impact: 'high',
  },
  {
    id: 7,
    type: 'optimization',
    section: 'Color Scheme',
    description: 'Adjusted primary color palette to match ad creative brand colors for visual consistency',
    impact: 'high',
  },
  {
    id: 8,
    type: 'addition',
    section: 'Footer',
    description: 'Added personalized footer with contact information matching ad campaign details',
    impact: 'low',
  },
];

const QUALITY_METRICS: QualityMetric[] = [
  {
    label: 'Message Match',
    score: 95,
    icon: <Target className="h-4 w-4" />,
    description: 'Ad-to-page messaging consistency',
  },
  {
    label: 'Visual Alignment',
    score: 88,
    icon: <Palette className="h-4 w-4" />,
    description: 'Color, typography & design consistency',
  },
  {
    label: 'Trust Signals',
    score: 90,
    icon: <Shield className="h-4 w-4" />,
    description: 'Social proof & credibility elements',
  },
  {
    label: 'Content Quality',
    score: 93,
    icon: <Layers className="h-4 w-4" />,
    description: 'Relevance & quality of content',
  },
  {
    label: 'Conversion Elements',
    score: 91,
    icon: <TrendingUp className="h-4 w-4" />,
    description: 'CTAs, urgency & persuasion tactics',
  },
];

const MOCK_ENHANCED_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Enhanced Landing Page — Powered by Troopod</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    .container {
      max-width: 800px;
      padding: 3rem 2rem;
      text-align: center;
    }
    .badge {
      display: inline-block;
      background: rgba(255,255,255,0.2);
      padding: 0.5rem 1.5rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
      backdrop-filter: blur(10px);
    }
    h1 {
      font-size: 3.5rem;
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 1.5rem;
    }
    .highlight { color: #fbbf24; }
    p.subtitle {
      font-size: 1.25rem;
      opacity: 0.9;
      margin-bottom: 2.5rem;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }
    .cta-button {
      display: inline-block;
      background: white;
      color: #667eea;
      padding: 1rem 2.5rem;
      border-radius: 0.75rem;
      font-weight: 700;
      font-size: 1.125rem;
      text-decoration: none;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }
    .urgency {
      margin-top: 1rem;
      font-size: 0.875rem;
      opacity: 0.8;
    }
    .trust-logos {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-top: 3rem;
      opacity: 0.6;
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">🔥 Limited: Join 2,847 professionals this week</div>
    <h1>Transform Your Workflow with <span class="highlight">AI-Powered</span> Automation</h1>
    <p class="subtitle">Get Your Free 14-Day Trial — No credit card required. Join thousands of teams already boosting productivity by 10x.</p>
    <a href="#" class="cta-button">Start Free Trial →</a>
    <p class="urgency">⏰ Offer ends in 23:59:42</p>
    <div class="trust-logos">
      <span>🔒 SSL Secured</span>
      <span>⭐ 4.9/5 Rating</span>
      <span>👥 10K+ Users</span>
    </div>
  </div>
</body>
</html>`;

function getImpactBadgeVariant(impact: string) {
  switch (impact) {
    case 'high':
      return 'default';
    case 'medium':
      return 'secondary';
    case 'low':
      return 'outline';
    default:
      return 'secondary';
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'addition':
      return <Sparkles className="h-4 w-4 text-green-500" />;
    case 'modification':
      return <Target className="h-4 w-4 text-amber-500" />;
    case 'optimization':
      return <Zap className="h-4 w-4 text-blue-500" />;
    default:
      return null;
  }
}

function QualityScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const getColor = (s: number) => {
    if (s >= 90) return 'stroke-green-500';
    if (s >= 70) return 'stroke-amber-500';
    return 'stroke-red-500';
  };

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth="8"
          className="stroke-muted"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className={cn('drop-shadow-lg', getColor(score))}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          strokeDasharray={circumference}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn(
          'text-2xl font-extrabold',
          score >= 90 ? 'text-green-600 dark:text-green-400' :
          score >= 70 ? 'text-amber-600 dark:text-amber-400' :
          'text-red-600 dark:text-red-400'
        )}>
          {score}
        </span>
        <span className="text-[10px] font-medium text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

function MetricBar({ metric, index }: { metric: QualityMetric; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 + index * 0.1 }}
      className="group"
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <div className="text-primary">{metric.icon}</div>
          <span className="text-sm font-medium">{metric.label}</span>
        </div>
        <span className={cn(
          'text-sm font-semibold',
          metric.score >= 90 ? 'text-green-600 dark:text-green-400' :
          metric.score >= 70 ? 'text-amber-600 dark:text-amber-400' :
          'text-red-600 dark:text-red-400'
        )}>
          {metric.score}%
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: `${metric.score}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.5 + index * 0.1 }}
          className={cn(
            'h-full rounded-full',
            metric.score >= 90 ? 'bg-gradient-to-r from-green-400 to-green-500' :
            metric.score >= 70 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
            'bg-gradient-to-r from-red-400 to-red-500'
          )}
        />
      </div>
      <p className="text-[11px] text-muted-foreground mt-1">{metric.description}</p>
    </motion.div>
  );
}

function ComparisonSlider() {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.max(5, Math.min(95, x)));
  }, []);

  const handleMouseDown = useCallback(() => {
    isDragging.current = true;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging.current) {
      handleMove(e.clientX);
    }
  }, [handleMove]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isDragging.current) {
      handleMove(e.touches[0].clientX);
    }
  }, [handleMove]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            Before / After Comparison
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[11px]">Drag to compare</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div
          ref={containerRef}
          className="comparison-slider relative h-[400px] bg-muted/10"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        >
          {/* After (Enhanced) - full width */}
          <div className="absolute inset-0">
            <iframe
              srcDoc={MOCK_ENHANCED_HTML}
              title="Enhanced landing page"
              sandbox="allow-scripts"
              className="w-full h-full"
            />
          </div>

          {/* Before (Original) - clipped */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${position}%` }}
          >
            <iframe
              src="https://stripe.com"
              title="Original landing page"
              sandbox="allow-scripts"
              className="w-full h-full"
              style={{ width: `${(100 / position) * 100}%`, maxWidth: 'none' }}
            />
          </div>

          {/* Slider handle */}
          <div
            className="absolute top-0 bottom-0 z-10"
            style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
          >
            <div className="h-full w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.3)]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing">
              <GripVertical className="h-5 w-5 text-gray-600" />
            </div>
          </div>

          {/* Labels */}
          <div className="absolute top-3 left-3 z-10">
            <Badge variant="secondary" className="text-[10px] bg-black/50 text-white backdrop-blur-sm border-0">
              BEFORE
            </Badge>
          </div>
          <div className="absolute top-3 right-3 z-10">
            <Badge className="text-[10px] bg-green-500 text-white border-0">
              <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
              AFTER
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ResultsView({ pageUrl, adImageUrl, onReset }: ResultsViewProps) {
  const [activeTab, setActiveTab] = useState('split');
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState('html');
  const [showExportDialog, setShowExportDialog] = useState(false);

  const qualityScore = 92;
  const totalChanges = MOCK_CHANGES.length;
  const highImpactCount = MOCK_CHANGES.filter((c) => c.impact === 'high').length;
  const mediumImpactCount = MOCK_CHANGES.filter((c) => c.impact === 'medium').length;

  const handleDownload = () => {
    const blob = new Blob([MOCK_ENHANCED_HTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'enhanced-landing-page.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Enhanced page downloaded successfully!');
  };

  const handleExport = () => {
    if (exportFormat === 'html') {
      handleDownload();
    } else if (exportFormat === 'json') {
      const data = {
        qualityScore,
        totalChanges,
        highImpactCount,
        changes: MOCK_CHANGES,
        enhancedHtml: MOCK_ENHANCED_HTML,
        sourceUrl: pageUrl,
        generatedAt: new Date().toISOString(),
        tool: 'Troopod AI',
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'troopod-analysis.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Analysis exported as JSON!');
    } else if (exportFormat === 'css') {
      const css = `/* Troopod AI - Generated CSS Enhancements */
/* Source: ${pageUrl} */
/* Generated: ${new Date().toISOString()} */

:root {
  --tp-primary: #667eea;
  --tp-secondary: #764ba2;
  --tp-accent: #fbbf24;
  --tp-text: #1a1a2e;
  --tp-bg: #ffffff;
}

.hero-section {
  background: linear-gradient(135deg, var(--tp-primary) 0%, var(--tp-secondary) 100%);
}

.cta-button {
  background: white;
  color: var(--tp-primary);
  padding: 1rem 2.5rem;
  border-radius: 0.75rem;
  font-weight: 700;
  font-size: 1.125rem;
}

.urgency-badge {
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(10px);
  padding: 0.5rem 1.5rem;
  border-radius: 9999px;
}`;
      const blob = new Blob([css], { type: 'text/css' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'troopod-enhancements.css';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('CSS enhancements exported!');
    }
    setShowExportDialog(false);
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(MOCK_ENHANCED_HTML);
    setCopied(true);
    toast.success('HTML copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const shareData = {
      title: 'Troopod - AI Landing Page Personalization',
      text: `I personalized a landing page with Troopod AI and got a ${qualityScore}/100 quality score with ${totalChanges} improvements!`,
      url: window.location.href,
    };
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
      toast.success('Share link copied to clipboard!');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-6xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onReset} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            New Analysis
          </Button>
          <Separator orientation="vertical" className="h-6 hidden sm:block" />
          <div>
            <h2 className="text-lg font-semibold">Personalization Results</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Globe className="h-3 w-3" />
              {pageUrl}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <FileDown className="h-4 w-4" />
                Export
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileDown className="h-5 w-5 text-primary" />
                  Export Results
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Export Format</label>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="html">
                        <div className="flex items-center gap-2">
                          <Code2 className="h-3.5 w-3.5" />
                          HTML File
                        </div>
                      </SelectItem>
                      <SelectItem value="json">
                        <div className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5" />
                          Analysis JSON
                        </div>
                      </SelectItem>
                      <SelectItem value="css">
                        <div className="flex items-center gap-2">
                          <Palette className="h-3.5 w-3.5" />
                          CSS Enhancements
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-xs text-muted-foreground bg-muted rounded-lg p-3">
                  {exportFormat === 'html' && 'Download the complete enhanced HTML file ready to deploy.'}
                  {exportFormat === 'json' && 'Export the full analysis data including changes, scores, and metadata.'}
                  {exportFormat === 'css' && 'Export just the CSS enhancement rules to apply to your existing page.'}
                </div>
                <Button onClick={handleExport} className="w-full gap-2">
                  <Download className="h-4 w-4" />
                  Download {exportFormat.toUpperCase()}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      {/* Stats Bar + Quality Score */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Quality Score */}
        <Card className="lg:row-span-1 flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3">
            <QualityScoreRing score={qualityScore} size={100} />
            <div>
              <p className="text-xs text-muted-foreground text-center">Overall Quality</p>
              <p className="text-sm font-semibold text-center mt-0.5">
                {qualityScore >= 90 ? 'Excellent' : qualityScore >= 70 ? 'Good' : 'Needs Work'}
              </p>
            </div>
          </div>
        </Card>

        {/* Stat Cards */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4 text-center flex flex-col justify-center">
            <p className="text-2xl font-bold text-primary">{totalChanges}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Changes</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
          <CardContent className="p-4 text-center flex flex-col justify-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{highImpactCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">High Impact</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
          <CardContent className="p-4 text-center flex flex-col justify-center">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">+34%</p>
            <p className="text-xs text-muted-foreground mt-0.5">Est. Conversion Lift</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:inline-flex">
          <TabsTrigger value="split" className="gap-2 text-xs sm:text-sm">
            <Eye className="h-3.5 w-3.5 hidden sm:block" />
            Compare
          </TabsTrigger>
          <TabsTrigger value="quality" className="gap-2 text-xs sm:text-sm">
            <BarChart3 className="h-3.5 w-3.5 hidden sm:block" />
            Quality
          </TabsTrigger>
          <TabsTrigger value="changes" className="gap-2 text-xs sm:text-sm">
            <FileText className="h-3.5 w-3.5 hidden sm:block" />
            Changes
          </TabsTrigger>
          <TabsTrigger value="code" className="gap-2 text-xs sm:text-sm">
            <Code2 className="h-3.5 w-3.5 hidden sm:block" />
            Code
          </TabsTrigger>
        </TabsList>

        {/* Comparison Tab */}
        <TabsContent value="split" className="space-y-4">
          <ComparisonSlider />

          {/* Quick summary under preview */}
          <Card className="bg-gradient-to-r from-primary/5 via-violet-500/5 to-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">AI identified {totalChanges} personalization opportunities</p>
                    <p className="text-xs text-muted-foreground">
                      Based on ad-landing page message consistency analysis
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={onReset} className="gap-2">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Try Another
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quality Breakdown Tab */}
        <TabsContent value="quality" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Quality Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {QUALITY_METRICS.map((metric, index) => (
                  <MetricBar key={metric.label} metric={metric} index={index} />
                ))}
              </CardContent>
            </Card>

            {/* Change Summary */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    Change Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Additions</span>
                      </div>
                      <span className="text-sm font-semibold">
                        {MOCK_CHANGES.filter(c => c.type === 'addition').length} changes
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-amber-500" />
                        <span className="text-sm">Modifications</span>
                      </div>
                      <span className="text-sm font-semibold">
                        {MOCK_CHANGES.filter(c => c.type === 'modification').length} changes
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Optimizations</span>
                      </div>
                      <span className="text-sm font-semibold">
                        {MOCK_CHANGES.filter(c => c.type === 'optimization').length} changes
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="text-sm">Impact Distribution</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-green-500/10 rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">{highImpactCount}</p>
                        <p className="text-[11px] text-muted-foreground">High</p>
                      </div>
                      <div className="flex-1 bg-amber-500/10 rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{mediumImpactCount}</p>
                        <p className="text-[11px] text-muted-foreground">Medium</p>
                      </div>
                      <div className="flex-1 bg-blue-500/10 rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{MOCK_CHANGES.filter(c => c.impact === 'low').length}</p>
                        <p className="text-[11px] text-muted-foreground">Low</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendation Card */}
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-violet-500/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">AI Recommendation</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Your page has strong foundations. Focus on improving visual alignment (88%) 
                        by applying the ad creative&apos;s color palette more consistently across 
                        the hero section and CTA buttons for maximum conversion lift.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Changes Log Tab */}
        <TabsContent value="changes" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-base">Change Log</CardTitle>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-green-500" /> Addition
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Target className="h-3 w-3 text-amber-500" /> Modification
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Zap className="h-3 w-3 text-blue-500" /> Optimization
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[500px]">
                <div className="divide-y">
                  {MOCK_CHANGES.map((change, index) => (
                    <motion.div
                      key={change.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.06 }}
                      className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="mt-0.5 shrink-0">
                        {getTypeIcon(change.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge variant="outline" className="text-[11px] font-mono">
                            {change.section}
                          </Badge>
                          <Badge variant={getImpactBadgeVariant(change.impact) as 'default' | 'secondary' | 'outline'} className="text-[11px]">
                            {change.impact} impact
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground/90">{change.description}</p>
                      </div>
                      <div className="shrink-0 text-xs text-muted-foreground">
                        #{change.id}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Code Tab */}
        <TabsContent value="code" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Code2 className="h-4 w-4" />
                  Enhanced HTML
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyHtml}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy Code
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[500px]">
                <pre className="p-4 text-sm font-mono leading-relaxed overflow-x-auto bg-muted/20">
                  <code className="text-foreground/80">{MOCK_ENHANCED_HTML}</code>
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ad Creative Reference */}
      {adImageUrl && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <ArrowRight className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Personalized based on your ad creative</p>
                <div className="flex items-center gap-2 mt-1">
                  <img
                    src={adImageUrl}
                    alt="Source ad creative"
                    className="h-10 rounded border border-border object-cover"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
