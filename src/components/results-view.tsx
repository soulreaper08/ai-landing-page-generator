'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
    description: 'Restructured layout to follow ad creative\'s visual flow — gradient accent colors applied',
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

export function ResultsView({ pageUrl, adImageUrl, onReset }: ResultsViewProps) {
  const [activeTab, setActiveTab] = useState('split');
  const [copied, setCopied] = useState(false);

  const qualityScore = 92;
  const totalChanges = MOCK_CHANGES.length;
  const highImpactCount = MOCK_CHANGES.filter((c) => c.impact === 'high').length;

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

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(MOCK_ENHANCED_HTML);
    setCopied(true);
    toast.success('HTML copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
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
          <h2 className="text-lg font-semibold">Personalization Results</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Quality Score</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">{qualityScore}/100</p>
            </div>
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm',
              qualityScore >= 90 ? 'bg-green-500' : qualityScore >= 70 ? 'bg-amber-500' : 'bg-red-500'
            )}>
              A+
            </div>
          </div>
          <Button onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Download HTML
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{totalChanges}</p>
            <p className="text-xs text-muted-foreground">Total Changes</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{highImpactCount}</p>
            <p className="text-xs text-muted-foreground">High Impact</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">+34%</p>
            <p className="text-xs text-muted-foreground">Est. Conversion Lift</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
          <TabsTrigger value="split" className="gap-2">
            <Eye className="h-3.5 w-3.5 hidden sm:block" />
            Split Preview
          </TabsTrigger>
          <TabsTrigger value="changes" className="gap-2">
            <FileText className="h-3.5 w-3.5 hidden sm:block" />
            Change Log
          </TabsTrigger>
          <TabsTrigger value="code" className="gap-2">
            <Code2 className="h-3.5 w-3.5 hidden sm:block" />
            HTML Code
          </TabsTrigger>
        </TabsList>

        {/* Split Preview Tab */}
        <TabsContent value="split" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Before */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                    Original Page
                  </CardTitle>
                  <Badge variant="outline" className="text-[11px]">BEFORE</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="iframe-container border-t border-border h-[400px] bg-muted/10">
                  <iframe
                    src={pageUrl}
                    title="Original landing page"
                    sandbox="allow-scripts"
                    className="w-full h-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* After */}
            <Card className="ring-2 ring-primary/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Enhanced Page
                    <Badge variant="default" className="text-[10px] bg-green-500 hover:bg-green-500">
                      <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                      Improved
                    </Badge>
                  </CardTitle>
                  <Badge variant="outline" className="text-[11px] border-primary/30 text-primary">AFTER</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="iframe-container border-t border-border h-[400px] bg-muted/10">
                  <iframe
                    srcDoc={MOCK_ENHANCED_HTML}
                    title="Enhanced landing page"
                    sandbox="allow-scripts"
                    className="w-full h-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick summary under preview */}
          <Card className="bg-gradient-to-r from-primary/5 via-violet-500/5 to-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">AI identified 6 personalization opportunities</p>
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

        {/* Changes Log Tab */}
        <TabsContent value="changes" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
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
                      transition={{ delay: index * 0.08 }}
                      className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="mt-0.5 shrink-0">
                        {getTypeIcon(change.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
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


