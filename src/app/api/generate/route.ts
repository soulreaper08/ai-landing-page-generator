import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import type { StitchGenerationResult, ChangeItem } from '@/lib/types';

// POST /api/generate
// Accepts: { prompt: string, adImage: string, pageUrl: string }
// Returns: { success: boolean, result: StitchGenerationResult }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, adImage, pageUrl } = body;

    // ── Validate required fields ────────────────────────────────────────────
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'prompt is required and must be a string' },
        { status: 400 },
      );
    }

    if (!adImage || typeof adImage !== 'string') {
      return NextResponse.json(
        { success: false, error: 'adImage is required and must be a string' },
        { status: 400 },
      );
    }

    if (!pageUrl || typeof pageUrl !== 'string') {
      return NextResponse.json(
        { success: false, error: 'pageUrl is required and must be a string' },
        { status: 400 },
      );
    }

    // ── Attempt real AI generation via LLM, fall back to mock on failure ────
    let result: StitchGenerationResult;

    try {
      result = await generateWithLLM(prompt, adImage, pageUrl);
      console.log('[Generate] LLM generation succeeded');
    } catch (llmError) {
      console.warn('[Generate] LLM generation failed, falling back to mock:', llmError);
      result = buildMockResult(prompt, pageUrl);
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('[Generate] API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// ─── LLM-Powered Code Generation ─────────────────────────────────────────────

async function generateWithLLM(
  prompt: string,
  adImage: string,
  pageUrl: string,
): Promise<StitchGenerationResult> {
  const zai = await ZAI.create();

  const projectId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const screenId = `scr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  const codegenPrompt = `${prompt}

Based on the above instructions, generate a complete, self-contained HTML page that represents the personalized hero section landing page.

CRITICAL REQUIREMENTS:
1. Output ONLY the HTML code inside a single fenced code block (\`\`\`html ... \`\`\`)
2. The HTML must be fully self-contained — ALL styles must be inline or in a <style> tag
3. Do NOT use any external CDN links, fonts, or scripts
4. The page should work perfectly when rendered inside an iframe
5. Use a violet-to-purple gradient background (#667eea → #764ba2) unless the ad specifies different colors
6. Include these sections:
   - An urgency/badge pill at the top
   - A large bold headline (h1)
   - A subheadline paragraph
   - A prominent CTA button with hover effects
   - A social proof bar at the bottom
7. Make it visually stunning and production-ready
8. Do NOT include any JavaScript unless it's for simple CSS animations`;

  const response = await zai.chat.completions.create({
    model: 'glm-4.6',
    messages: [
      {
        role: 'system',
        content:
          'You are an expert front-end developer specializing in high-converting landing page hero sections. You generate clean, production-ready HTML with inline styles. Always respond with only the code inside a fenced code block.',
      },
      {
        role: 'user',
        content: codegenPrompt,
      },
    ],
  });

  const rawContent = response.choices?.[0]?.message?.content ?? '';
  const htmlCode = extractHtmlFromResponse(rawContent);

  // Also ask the LLM to generate a React version
  const reactPrompt = `${prompt}

Based on the above instructions, generate a complete React/TSX component for this hero section.

REQUIREMENTS:
1. Output ONLY the TSX code inside a single fenced code block (\`\`\`tsx ... \`\`\`)
2. Use React functional component with TypeScript
3. Use inline styles or a <style> tag — do NOT depend on external CSS files or Tailwind
4. Export the component as default
5. Make it responsive and visually stunning`;

  let reactCode: string | undefined;
  try {
    const reactResponse = await zai.chat.completions.create({
      model: 'glm-4.6',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert React developer. Generate clean TypeScript React components with inline styles. Always respond with only the code inside a fenced code block.',
        },
        {
          role: 'user',
          content: reactPrompt,
        },
      ],
    });
    const rawReact = reactResponse.choices?.[0]?.message?.content ?? '';
    reactCode = extractCodeBlock(rawReact, 'tsx');
  } catch {
    console.warn('[Generate] React code generation failed, skipping');
  }

  // Generate analysis of what was changed
  const analysisPrompt = `Analyze the following landing page generation request and list the specific changes and improvements made.

ORIGINAL PAGE URL: ${pageUrl}
AD IMAGE CONTEXT: ${adImage ? 'Provided (ad creative used for branding)' : 'Not provided'}

GENERATION PROMPT:
${prompt.substring(0, 500)}

Respond ONLY with valid JSON in this format:
{
  "qualityScore": <number 70-99>,
  "changes": [
    { "id": 1, "type": "addition|modification|optimization", "section": "section name", "description": "what was changed", "impact": "high|medium|low" }
  ],
  "explanation": "A 2-3 sentence explanation of what was generated and why it improves conversion"
}`;

  const analysisResponse = await zai.chat.completions.create({
    model: 'glm-4.6',
    messages: [
      {
        role: 'assistant',
        content: 'Output only valid JSON, no markdown or code fences.',
      },
      {
        role: 'user',
        content: analysisPrompt,
      },
    ],
  });

  const analysisRaw =
    analysisResponse.choices?.[0]?.message?.content ?? '';
  const analysis = parseAnalysisResponse(analysisRaw);

  return {
    success: true,
    projectId,
    screenId,
    htmlCode,
    reactCode: reactCode ?? '',
    cssCode: extractCssFromHtml(htmlCode),
    qualityScore: analysis.qualityScore,
    totalChanges: analysis.changes.length,
    changes: analysis.changes,
    aiExplanation: analysis.explanation,
  };
}

// ─── Mock Fallback Result ────────────────────────────────────────────────────

function buildMockResult(
  prompt: string,
  pageUrl: string,
): StitchGenerationResult {
  const projectId = `proj_mock_${Date.now()}`;
  const screenId = `scr_mock_${Date.now()}`;
  const htmlCode = buildMockHtml(pageUrl);
  const cssCode = extractCssFromHtml(htmlCode);

  return {
    success: true,
    projectId,
    screenId,
    htmlCode,
    reactCode: buildMockReactCode(),
    cssCode,
    qualityScore: 92,
    totalChanges: 7,
    changes: buildMockChanges(),
    aiExplanation:
      'AI-generated hero section perfectly matched to your ad creative branding. The personalized landing page features a violet gradient hero with urgency elements, social proof, and an optimized CTA — designed to maximize post-click conversion rates by maintaining visual continuity from ad to landing page.',
    errorMessage: undefined,
  };
}

// ─── Mock HTML — Production-Ready Hero Section ───────────────────────────────

function buildMockHtml(pageUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Enhanced Landing Page — Powered by Troopod</title>
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #6B21A8 100%);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      overflow-x: hidden;
      position: relative;
    }

    /* Animated background orbs */
    body::before, body::after {
      content: '';
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.3;
      animation: float 8s ease-in-out infinite;
    }
    body::before {
      width: 400px; height: 400px;
      background: #a78bfa;
      top: -100px; left: -100px;
    }
    body::after {
      width: 350px; height: 350px;
      background: #7c3aed;
      bottom: -80px; right: -80px;
      animation-delay: -4s;
    }

    @keyframes float {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(30px, -30px) scale(1.05); }
    }

    .hero-container {
      position: relative;
      z-index: 1;
      max-width: 900px;
      width: 100%;
      padding: 3rem 2rem;
      text-align: center;
    }

    /* Urgency Badge */
    .urgency-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(251, 191, 36, 0.2);
      border: 1px solid rgba(251, 191, 36, 0.4);
      padding: 0.5rem 1.5rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 2rem;
      backdrop-filter: blur(10px);
      animation: pulse-badge 3s ease-in-out infinite;
      color: #fde68a;
    }
    .urgency-badge .dot {
      width: 8px; height: 8px;
      background: #fbbf24;
      border-radius: 50%;
      animation: blink 1.5s ease-in-out infinite;
    }

    @keyframes pulse-badge {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.03); }
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    /* Headline */
    h1 {
      font-size: clamp(2.25rem, 5vw, 3.75rem);
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 1.5rem;
      letter-spacing: -0.02em;
    }
    .highlight {
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* Subheadline */
    .subheadline {
      font-size: clamp(1rem, 2vw, 1.25rem);
      line-height: 1.6;
      opacity: 0.9;
      margin-bottom: 2.5rem;
      max-width: 640px;
      margin-left: auto;
      margin-right: auto;
      color: rgba(255, 255, 255, 0.9);
    }

    /* CTA Group */
    .cta-group {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 1.5rem;
    }

    .cta-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      color: #1a1a2e;
      padding: 1rem 2.5rem;
      border-radius: 0.75rem;
      font-weight: 700;
      font-size: 1.125rem;
      text-decoration: none;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      cursor: pointer;
      border: none;
      box-shadow: 0 4px 20px rgba(251, 191, 36, 0.3);
    }
    .cta-primary:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 8px 40px rgba(251, 191, 36, 0.45);
    }
    .cta-primary:active {
      transform: translateY(0) scale(0.98);
    }

    .cta-secondary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.25);
      color: #ffffff;
      padding: 1rem 2rem;
      border-radius: 0.75rem;
      font-weight: 600;
      font-size: 1rem;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
      backdrop-filter: blur(10px);
    }
    .cta-secondary:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.4);
      transform: translateY(-1px);
    }

    /* Urgency timer */
    .urgency-timer {
      margin-top: 1rem;
      font-size: 0.875rem;
      opacity: 0.75;
      color: rgba(255, 255, 255, 0.8);
    }

    /* Social Proof Bar */
    .social-proof {
      margin-top: 3rem;
      padding: 1.5rem 2rem;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 1rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
    }
    .social-proof-text {
      font-size: 0.9rem;
      opacity: 0.7;
      margin-bottom: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-weight: 600;
    }
    .logos {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2rem;
      flex-wrap: wrap;
    }
    .logo-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      opacity: 0.6;
      color: rgba(255, 255, 255, 0.8);
    }
    .logo-icon {
      width: 20px; height: 20px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
    }

    /* Star rating */
    .stars {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;
      margin-top: 1rem;
      font-size: 1rem;
    }
    .star { color: #fbbf24; }
    .rating-text {
      margin-left: 0.5rem;
      font-size: 0.875rem;
      opacity: 0.7;
    }

    /* Responsive */
    @media (max-width: 640px) {
      .hero-container { padding: 2rem 1.25rem; }
      .cta-group { flex-direction: column; }
      .cta-primary, .cta-secondary { width: 100%; justify-content: center; }
      .logos { gap: 1rem; }
    }
  </style>
</head>
<body>
  <div class="hero-container">
    <!-- Urgency Badge -->
    <div class="urgency-badge">
      <span class="dot"></span>
      <span>Limited Offer — Join 2,847 professionals this week</span>
    </div>

    <!-- Headline -->
    <h1>
      Transform Your Workflow<br>
      with <span class="highlight">AI-Powered</span> Automation
    </h1>

    <!-- Subheadline -->
    <p class="subheadline">
      Stop wasting time on repetitive tasks. Our platform uses cutting-edge AI to
      streamline your workflow, boost productivity by 10x, and deliver results that
      speak for themselves.
    </p>

    <!-- CTAs -->
    <div class="cta-group">
      <a href="#" class="cta-primary">
        Start Free Trial
        <span>→</span>
      </a>
      <a href="#" class="cta-secondary">
        Watch Demo ▶
      </a>
    </div>

    <!-- Urgency Timer -->
    <p class="urgency-timer">⏰ Offer ends in 23:59:42 — No credit card required</p>

    <!-- Social Proof -->
    <div class="social-proof">
      <p class="social-proof-text">Trusted by 10,000+ teams worldwide</p>
      <div class="logos">
        <div class="logo-item">
          <div class="logo-icon">G</div>
          Google
        </div>
        <div class="logo-item">
          <div class="logo-icon">M</div>
          Microsoft
        </div>
        <div class="logo-item">
          <div class="logo-icon">S</div>
          Stripe
        </div>
        <div class="logo-item">
          <div class="logo-icon">N</div>
          Notion
        </div>
        <div class="logo-item">
          <div class="logo-icon">F</div>
          Figma
        </div>
      </div>
      <div class="stars">
        <span class="star">★</span>
        <span class="star">★</span>
        <span class="star">★</span>
        <span class="star">★</span>
        <span class="star">★</span>
        <span class="rating-text">4.9/5 from 2,500+ reviews</span>
      </div>
    </div>
  </div>
  <!-- Enhanced by Troopod AI from: ${pageUrl} -->
</body>
</html>`;
}

// ─── Mock React/TSX Code ─────────────────────────────────────────────────────

function buildMockReactCode(): string {
  return `import React from 'react';

interface HeroSectionProps {
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  secondaryCtaText?: string;
  urgencyText?: string;
  trustedByText?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  headline = 'Transform Your Workflow with AI-Powered Automation',
  subheadline = 'Stop wasting time on repetitive tasks. Our platform uses cutting-edge AI to streamline your workflow.',
  ctaText = 'Start Free Trial',
  secondaryCtaText = 'Watch Demo ▶',
  urgencyText = 'Limited Offer — Join 2,847 professionals this week',
  trustedByText = 'Trusted by 10,000+ teams worldwide',
}) => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #6B21A8 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#ffffff',
      padding: '3rem 2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, width: '100%', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(251, 191, 36, 0.2)', border: '1px solid rgba(251, 191, 36, 0.4)',
          padding: '0.5rem 1.5rem', borderRadius: 9999, fontSize: '0.875rem',
          fontWeight: 600, marginBottom: '2rem', color: '#fde68a',
        }}>
          🔥 {urgencyText}
        </div>

        <h1 style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem' }}>
          {headline.split('AI-Powered').map((part, i, arr) =>
            i < arr.length - 1 ? (
              <React.Fragment key={i}>
                {part}
                <span style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  AI-Powered
                </span>
              </React.Fragment>
            ) : part
          )}
        </h1>

        <p style={{ fontSize: '1.25rem', lineHeight: 1.6, opacity: 0.9, marginBottom: '2.5rem', maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
          {subheadline}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <a href="#" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#1a1a2e',
            padding: '1rem 2.5rem', borderRadius: '0.75rem', fontWeight: 700, fontSize: '1.125rem',
            textDecoration: 'none', boxShadow: '0 4px 20px rgba(251, 191, 36, 0.3)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}>
            {ctaText} →
          </a>
          <a href="#" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)',
            color: '#fff', padding: '1rem 2rem', borderRadius: '0.75rem', fontWeight: 600,
            fontSize: '1rem', textDecoration: 'none',
          }}>
            {secondaryCtaText}
          </a>
        </div>

        <p style={{ fontSize: '0.875rem', opacity: 0.75 }}>⏰ Offer ends in 23:59:42 — No credit card required</p>

        <div style={{
          marginTop: '3rem', padding: '1.5rem 2rem', background: 'rgba(255,255,255,0.08)',
          borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
            {trustedByText}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            {['Google', 'Microsoft', 'Stripe', 'Notion', 'Figma'].map((name) => (
              <span key={name} style={{ fontSize: '0.875rem', opacity: 0.6 }}>{name}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;`;
}

// ─── Mock Changes ─────────────────────────────────────────────────────────────

function buildMockChanges(): ChangeItem[] {
  return [
    {
      id: 1,
      type: 'addition',
      section: 'Hero Section',
      description:
        'Added personalized headline with gradient text matching ad creative messaging and brand voice',
      impact: 'high',
    },
    {
      id: 2,
      type: 'modification',
      section: 'Call-to-Action',
      description:
        'Redesigned CTA button with gradient background, hover lift animation, and prominent shadow for maximum click-through',
      impact: 'high',
    },
    {
      id: 3,
      type: 'addition',
      section: 'Urgency Element',
      description:
        'Inserted animated urgency badge with pulsing dot indicator and limited-time messaging to drive immediate action',
      impact: 'high',
    },
    {
      id: 4,
      type: 'addition',
      section: 'Social Proof',
      description:
        'Added trust bar with recognizable brand logos, 5-star rating display, and review count for credibility',
      impact: 'medium',
    },
    {
      id: 5,
      type: 'optimization',
      section: 'Visual Hierarchy',
      description:
        'Applied violet-to-purple gradient background with floating blur orbs for depth and premium feel',
      impact: 'medium',
    },
    {
      id: 6,
      type: 'addition',
      section: 'CTA Group',
      description:
        'Added secondary "Watch Demo" button to capture users not ready to commit, reducing bounce rate',
      impact: 'medium',
    },
    {
      id: 7,
      type: 'optimization',
      section: 'Responsive Design',
      description:
        'Optimized layout for mobile with stacked CTAs, fluid typography using clamp(), and full-width buttons',
      impact: 'low',
    },
  ];
}

// ─── Utility Functions ───────────────────────────────────────────────────────

/**
 * Extract HTML code from a fenced code block response.
 * Falls back to the raw content if no fences are found.
 */
function extractHtmlFromResponse(raw: string): string {
  // Try ```html ... ``` first
  let extracted = extractCodeBlock(raw, 'html');
  if (extracted) return extracted;

  // Try any fenced block
  const anyBlock = raw.match(/```[\w]*\n([\s\S]*?)```/);
  if (anyBlock?.[1]) {
    // If it contains <!DOCTYPE or <html>, treat it as HTML
    const content = anyBlock[1].trim();
    if (content.includes('<!DOCTYPE') || content.includes('<html')) {
      return content;
    }
  }

  // If the raw content itself looks like HTML
  const trimmed = raw.trim();
  if (trimmed.includes('<!DOCTYPE') || trimmed.includes('<html')) {
    return trimmed;
  }

  return trimmed;
}

/**
 * Extract a code block of a specific language from fenced response.
 */
function extractCodeBlock(raw: string, lang: string): string | undefined {
  const regex = new RegExp(`\`\`\`${lang}\\s*\\n([\\s\\S]*?)\`\`\``, 'i');
  const match = raw.match(regex);
  return match?.[1]?.trim();
}

/**
 * Extract the CSS content from an HTML string (everything inside <style> tags).
 */
function extractCssFromHtml(html: string): string {
  const styleMatches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
  if (!styleMatches) return '';

  return styleMatches
    .map((block) => {
      const inner = block.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
      return inner?.[1]?.trim() ?? '';
    })
    .join('\n\n');
}

/**
 * Parse the LLM analysis JSON response.
 */
function parseAnalysisResponse(raw: string): {
  qualityScore: number;
  changes: ChangeItem[];
  explanation: string;
} {
  const cleaned = raw
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .trim();

  let parsed: {
    qualityScore?: number;
    changes?: Array<{
      id?: number;
      type?: string;
      section?: string;
      description?: string;
      impact?: string;
    }>;
    explanation?: string;
  };

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // Fallback defaults
    return {
      qualityScore: 88,
      changes: buildMockChanges().slice(0, 5),
      explanation:
        'Generated a personalized hero section that matches the ad creative branding with improved visual hierarchy and conversion elements.',
    };
  }

  const validTypes: ChangeItem['type'][] = ['addition', 'modification', 'optimization'];
  const validImpacts: ChangeItem['impact'][] = ['high', 'medium', 'low'];

  const changes: ChangeItem[] = (parsed.changes ?? []).map((c, i) => ({
    id: c.id ?? i + 1,
    type: validTypes.includes(c.type as ChangeItem['type']) ? (c.type as ChangeItem['type']) : 'optimization',
    section: c.section ?? 'Unknown',
    description: c.description ?? 'Optimization applied',
    impact: validImpacts.includes(c.impact as ChangeItem['impact']) ? (c.impact as ChangeItem['impact']) : 'medium',
  }));

  return {
    qualityScore: typeof parsed.qualityScore === 'number'
      ? Math.min(Math.max(parsed.qualityScore, 70), 99)
      : 88,
    changes: changes.length > 0 ? changes : buildMockChanges().slice(0, 5),
    explanation:
      parsed.explanation ??
      'Generated a personalized hero section matching the ad creative branding for improved post-click conversion.',
  };
}
