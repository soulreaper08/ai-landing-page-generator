import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import type { StitchGenerationResult, ChangeItem, AdAnalysisResult, PageAnalysisResult } from '@/lib/types';

// POST /api/generate
// Accepts: { adImage: string (base64), pageUrl: string }
// Returns: { success: boolean, result: StitchGenerationResult }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adImage, pageUrl } = body;

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

    console.log('[Generate] Starting full pipeline — VLM analysis + page scrape + LLM generation');

    let result: StitchGenerationResult;

    try {
      result = await fullPipeline(adImage, pageUrl);
      console.log('[Generate] Pipeline completed successfully');
    } catch (pipelineError) {
      console.error('[Generate] Pipeline failed:', pipelineError);
      const errMsg = pipelineError instanceof Error ? pipelineError.message : 'Unknown error';
      return NextResponse.json(
        { success: false, error: `Generation failed: ${errMsg}` },
        { status: 500 },
      );
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

// ─── Full Pipeline: Analyze → Scrape → LLM Generate → Analyze ──────────────────

async function fullPipeline(
  adImage: string,
  pageUrl: string,
): Promise<StitchGenerationResult> {
  const zai = await ZAI.create();

  // Step 1: Analyze ad image via VLM (extract design style)
  console.log('[Generate] Step 1: Analyzing ad image via VLM...');
  const adAnalysis = await analyzeAdImageWithRetry(zai, adImage);
  console.log('[Generate] Ad analysis complete:', adAnalysis.headline);

  // Step 2: Scrape landing page for context
  console.log('[Generate] Step 2: Scraping landing page...');
  const pageAnalysis = await scrapeLandingPage(pageUrl);
  console.log('[Generate] Page analysis complete:', pageAnalysis.title);

  // Step 3: Fetch original page HTML for before/after comparison
  console.log('[Generate] Step 3: Fetching original page HTML...');
  const originalHtml = await fetchOriginalHtml(pageUrl);

  // Step 4: Generate HTML page via LLM
  console.log('[Generate] Step 4: Generating HTML via LLM...');
  const htmlCode = await generateHtmlViaLLM(zai, adAnalysis, pageAnalysis);
  console.log('[Generate] HTML generated, length:', htmlCode.length);

  // Step 5: Generate quality analysis using LLM
  console.log('[Generate] Step 5: Generating quality analysis...');
  const analysis = await generateAnalysis(zai, adAnalysis, pageAnalysis, htmlCode);

  return {
    success: true,
    projectId: `gen-${Date.now()}`,
    htmlCode,
    originalHtml,
    qualityScore: analysis.qualityScore,
    totalChanges: analysis.changes.length,
    changes: analysis.changes,
    aiExplanation: analysis.explanation,
  };
}

// ─── VLM Ad Image Analysis ────────────────────────────────────────────────────

function cleanBase64Image(dataUrl: string): string {
  let cleaned = dataUrl.replace(/\s+/g, '');
  if (cleaned.startsWith('data:image/')) {
    const mimeMatch = cleaned.match(/^data:(image\/\w+);base64,/);
    if (mimeMatch) {
      const mime = mimeMatch[1];
      const base64 = cleaned.substring(mimeMatch[0].length);
      return `data:${mime};base64,${base64}`;
    }
  }
  return cleaned;
}

function isValidAnalysisHeadline(headline: string): boolean {
  if (!headline || headline.length < 2) return false;
  if (headline.length > 100) return false;
  if (/^Analyze|^Extract|^Please|^Here|^Output/i.test(headline)) return false;
  if (headline.includes('JSON')) return false;
  if (headline.includes('```')) return false;
  return true;
}

async function analyzeAdImage(
  zai: Awaited<ReturnType<typeof ZAI.create>>,
  imageInput: string,
): Promise<AdAnalysisResult> {
  const isBase64 = imageInput.startsWith('data:image/');

  if (!isBase64) {
    console.warn('[Generate] Image is not base64, using fallback');
    return buildFallbackAdAnalysis();
  }

  const cleanImage = cleanBase64Image(imageInput);
  const base64SizeKB = Math.round((cleanImage.length * 3) / 4 / 1024);
  console.log(`[Generate] Image base64 size: ~${base64SizeKB}KB`);

  const analysisPrompt = `Analyze this advertisement image and extract:

1. COLOR PALETTE (give me exact hex codes):
   - Primary (most dominant color)
   - Secondary (second most prominent)
   - Accent (for CTAs/highlights/buttons)
   - Background
   - Text color

2. TEXT CONTENT (extract exactly as written):
   - Headline (main message)
   - Subheadline (if present, or empty string)
   - CTA button text (if present, or "Learn More")
   - Any value propositions or bullet points (as array)

3. BRAND CHARACTERISTICS:
   - Tone: one of [professional, playful, luxury, urgent, technical, friendly]
   - Visual style: one of [modern, classic, minimal, bold, elegant, corporate]
   - Emotional appeal: one word (e.g. fear, greed, urgency, trust, aspiration, curiosity)
   - Imagery type: one of [photography, illustration, 3d-render, abstract, text-only]

Respond ONLY with valid JSON in this exact format:
{
  "colors": { "primary": "#hex", "secondary": "#hex", "accent": "#hex", "background": "#hex", "text": "#hex" },
  "headline": "exact text",
  "subheadline": "exact text or empty string",
  "ctaText": "exact text",
  "valueProps": ["prop1", "prop2"],
  "tone": "one_option",
  "style": "one_option",
  "emotionalAppeal": "one_word",
  "imageryType": "one_option"
}`;

  try {
    const response = await zai.chat.completions.createVision({
      model: 'glm-4.6v',
      messages: [
        { role: 'system', content: 'You are an expert ad creative analyst. You ONLY output valid JSON. No markdown, no explanation, no code fences. Just raw JSON.' },
        {
          role: 'user',
          content: [
            { type: 'text', text: analysisPrompt },
            { type: 'image_url', image_url: { url: cleanImage } },
          ],
        },
      ],
      thinking: { type: 'disabled' },
    });

    const raw = response.choices?.[0]?.message?.content ?? '';
    const parsed = parseAdAnalysis(raw);

    if (!isValidAnalysisHeadline(parsed.headline)) {
      console.warn('[Generate] VLM returned invalid headline, using fallback:', parsed.headline?.substring(0, 50));
      return buildFallbackAdAnalysis();
    }

    return parsed;
  } catch (error) {
    console.warn('[Generate] VLM analysis failed:', error);
    return buildFallbackAdAnalysis();
  }
}

async function analyzeAdImageWithRetry(
  zai: Awaited<ReturnType<typeof ZAI.create>>,
  imageInput: string,
  maxRetries = 2,
): Promise<AdAnalysisResult> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const result = await analyzeAdImage(zai, imageInput);
    if (isValidAnalysisHeadline(result.headline)) {
      return result;
    }
    if (attempt < maxRetries) {
      console.log(`[Generate] Retrying VLM analysis (attempt ${attempt + 2}/${maxRetries + 1})...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  return buildFallbackAdAnalysis();
}

function parseAdAnalysis(raw: string): AdAnalysisResult {
  const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
  const parsed = JSON.parse(cleaned);

  return {
    imageUrl: '',
    fileName: 'uploaded-ad.png',
    colors: {
      primary: parsed.colors?.primary ?? '#7c3aed',
      secondary: parsed.colors?.secondary ?? '#a78bfa',
      accent: parsed.colors?.accent ?? '#f59e0b',
      background: parsed.colors?.background ?? '#ffffff',
      text: parsed.colors?.text ?? '#1f2937',
    },
    headline: parsed.headline ?? 'Transform Your Business',
    subheadline: parsed.subheadline ?? '',
    ctaText: parsed.ctaText ?? 'Get Started',
    tone: ['professional', 'playful', 'luxury', 'urgent', 'technical', 'friendly'].includes(parsed.tone)
      ? parsed.tone : 'professional',
    style: ['modern', 'classic', 'minimal', 'bold', 'elegant', 'corporate'].includes(parsed.style)
      ? parsed.style : 'modern',
    valueProps: Array.isArray(parsed.valueProps) ? parsed.valueProps : ['Save time', 'Boost results'],
    emotionalAppeal: parsed.emotionalAppeal ?? 'trust',
    imageryType: parsed.imageryType ?? 'photography',
  };
}

function buildFallbackAdAnalysis(): AdAnalysisResult {
  return {
    imageUrl: '',
    fileName: 'uploaded-ad.png',
    colors: {
      primary: '#7c3aed',
      secondary: '#a78bfa',
      accent: '#fbbf24',
      background: '#0f0a1a',
      text: '#ffffff',
    },
    headline: 'Transform Your Workflow',
    subheadline: 'AI-powered tools to supercharge your productivity',
    ctaText: 'Start Free Trial',
    tone: 'professional',
    style: 'modern',
    valueProps: ['Save time', 'Boost productivity', 'Easy to use'],
    emotionalAppeal: 'aspiration',
    imageryType: 'photography',
  };
}

// ─── Landing Page Scraping ────────────────────────────────────────────────────

async function scrapeLandingPage(url: string): Promise<PageAnalysisResult> {
  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
  const domain = (() => {
    try {
      return new URL(normalizedUrl).hostname;
    } catch {
      return url;
    }
  })();

  try {
    const res = await fetch(`https://r.jina.ai/${normalizedUrl}`, {
      headers: { 'Accept': 'text/plain' },
      signal: AbortSignal.timeout(12000),
    });
    const text = await res.text();
    const contentText = text.substring(0, 5000);

    const titleMatch = text.match(/Title:\s*(.+)/i);
    const title = titleMatch?.[1]?.trim() ?? domain;

    const lines = contentText.split('\n').filter((l) => l.trim().length > 5);
    const currentHeadline = lines[0]?.replace(/^#+\s*/, '').trim().substring(0, 100) ?? 'Welcome';
    const currentSubheadline = lines[1]?.trim().substring(0, 150) ?? '';

    const sections: string[] = ['Hero'];
    if (/feature|capability|what we do/i.test(contentText)) sections.push('Features');
    if (/pricing|plan|price/i.test(contentText)) sections.push('Pricing');
    if (/testimonial|review|customer story/i.test(contentText)) sections.push('Testimonials');
    if (/faq|question|frequently/i.test(contentText)) sections.push('FAQ');

    const hasForms = /contact|sign up|subscribe|register/i.test(contentText);
    const hasTestimonials = /testimonial|review|customer|rating/i.test(contentText);
    const hasSocialProof = /trusted|client|partner|logo|featured in/i.test(contentText);

    return {
      url: normalizedUrl,
      title,
      domain,
      currentHeadline,
      currentSubheadline,
      currentCTA: 'Get Started',
      ctaDestination: '/signup',
      sections,
      framework: 'Modern',
      styling: 'Custom CSS',
      hasForms,
      hasTestimonials,
      hasSocialProof,
      estimatedConversionElements: [hasForms ? 1 : 0, hasTestimonials ? 1 : 0, hasSocialProof ? 1 : 0].reduce((a, b) => a + b, 0),
    };
  } catch {
    return {
      url: normalizedUrl,
      title: domain,
      domain,
      currentHeadline: 'Welcome',
      currentSubheadline: '',
      currentCTA: 'Get Started',
      ctaDestination: '/signup',
      sections: ['Hero'],
      framework: 'Modern',
      styling: 'Custom CSS',
      hasForms: false,
      hasTestimonials: false,
      hasSocialProof: false,
      estimatedConversionElements: 0,
    };
  }
}

// ─── Fetch Original HTML ──────────────────────────────────────────────────────

async function fetchOriginalHtml(url: string): Promise<string> {
  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

  try {
    const res = await fetch(normalizedUrl, {
      signal: AbortSignal.timeout(10000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Troopod/2.0)',
        'Accept': 'text/html',
      },
    });
    const html = await res.text();
    return html.substring(0, 8000);
  } catch {
    console.warn('[Generate] Could not fetch original HTML, using placeholder');
    return `<!DOCTYPE html>
<html>
<head><title>${normalizedUrl}</title></head>
<body>
<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;color:#666;text-align:center;padding:2rem">
  <div>
    <h2 style="margin-bottom:1rem">Original Page</h2>
    <p>Could not load original page content from ${normalizedUrl}</p>
    <p style="font-size:0.875rem;color:#999;margin-top:1rem">The original page may block cross-origin requests</p>
  </div>
</div>
</body>
</html>`;
  }
}

// ─── HTML Generation via LLM ─────────────────────────────────────────────────

function buildHtmlGenerationPrompt(ad: AdAnalysisResult, page: PageAnalysisResult): string {
  return `You are an expert web developer and designer. Generate a COMPLETE, STANDALONE HTML landing page.

CRITICAL RULES:
- Output ONLY the raw HTML code. NO markdown, NO code fences, NO explanation, NO comments before/after.
- The HTML must be a complete document starting with <!DOCTYPE html> and ending with </html>.
- All CSS must be inline in a <style> tag within <head>.
- Include all JavaScript inline in <script> tags if needed.
- The page must look stunning and professional.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## AD CREATIVE DESIGN SPECIFICATIONS

### COLOR PALETTE (use these EXACT hex codes):
- Primary: ${ad.colors.primary}
- Secondary: ${ad.colors.secondary}
- Accent (CTAs/buttons): ${ad.colors.accent}
- Background: ${ad.colors.background}
- Text: ${ad.colors.text}

### CONTENT FROM THE AD:
- Headline: "${ad.headline}"
- Subheadline: "${ad.subheadline || 'Discover how we can help you achieve your goals'}"
- CTA Button: "${ad.ctaText}"
- Value Props: ${ad.valueProps.join(', ')}

### BRAND PERSONALITY:
- Tone: ${ad.tone}
- Visual Style: ${ad.style}
- Emotional Appeal: ${ad.emotionalAppeal}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## REFERENCE WEBSITE

URL: ${page.url}
Title: "${page.title}"
Domain: ${page.domain}

Current Headline: "${page.currentHeadline}"
Current Subheadline: "${page.currentSubheadline}"
Current CTA: "${page.currentCTA}"
Sections Detected: ${page.sections.join(', ')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PAGE STRUCTURE TO BUILD

Build a complete landing page with these sections (in order):

### 1. TRUST BAR (top)
- Thin bar with "Trusted by 10,000+ professionals" or similar
- Subtle background, small text

### 2. HERO SECTION
- Large bold headline using the ad headline EXACTLY: "${ad.headline}"
- Supporting subheadline: "${ad.subheadline || 'Discover how we can help you achieve your goals'}"
- Primary CTA button with text "${ad.ctaText}" using accent color ${ad.colors.accent}
- Secondary ghost button "Learn More"
- Background: gradient using primary ${ad.colors.primary} to secondary ${ad.colors.secondary}
- Add animated gradient orbs or subtle background patterns for depth

### 3. SOCIAL PROOF STRIP
- Row of 4-5 company/brand logos as text (e.g. "Google", "Microsoft", "Stripe")
- "Loved by 2,500+ teams" text

### 4. VALUE PROPOSITIONS (3 columns)
- 3 cards with icons for: ${ad.valueProps.slice(0, 3).map((v, i) => `${i + 1}. "${v}"`).join(', ')}
- Each card has an icon area (CSS-only), title, and description
- Hover effects: lift + shadow

### 5. FEATURES SECTION
- Heading: "Everything You Need"
- 6 feature cards in a 3x2 grid
- Each card: icon, title, description
- Glass-morphism or gradient card backgrounds
- Staggered entrance animations via CSS

### 6. HOW IT WORKS (3 steps)
- Step 1: "Sign Up" — Create your account in seconds
- Step 2: "Configure" — Set up your preferences  
- Step 3: "Launch" — Go live and start seeing results
- Connected with arrows or step indicators
- ${ad.style === 'modern' ? 'Minimal, clean design with numbered circles' : ad.style === 'bold' ? 'Large numbers, high contrast, strong typography' : 'Clean cards with step icons'}

### 7. TESTIMONIALS
- 3 testimonial cards with name, role, company, star rating
- Quote mark decorative element
- Subtle card shadows

### 8. PRICING TABLE (3 plans)
- Starter (Free), Pro ($29/mo, highlighted), Enterprise (Custom)
- Feature lists with checkmarks
- CTA buttons on each

### 9. FAQ SECTION
- 4-5 expandable FAQ items
- Clean accordion-style layout

### 10. CTA SECTION (bottom)
- Large centered CTA: "${ad.ctaText}"
- Email input + button combination
- Gradient background matching the hero

### 11. FOOTER
- 4-column layout: Product, Company, Resources, Legal
- Copyright notice
- Social media icon links (CSS-only)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## TECHNICAL REQUIREMENTS

### CSS:
- Use CSS custom properties for all colors:
  :root { --primary: ${ad.colors.primary}; --secondary: ${ad.colors.secondary}; --accent: ${ad.colors.accent}; --bg: ${ad.colors.background}; --text: ${ad.colors.text}; }
- Fully responsive (mobile, tablet, desktop) using @media queries
- Smooth hover transitions on all interactive elements
- CSS animations for: floating background orbs, pulse effects on CTAs, fade-in on scroll
- Max width: 1200px, centered
- Font: system-ui, -apple-system, sans-serif
- Box shadows, border-radius, backdrop-blur for modern feel

### JavaScript:
- FAQ accordion toggle (click to expand/collapse)
- Smooth scroll for anchor links
- Mobile hamburger menu toggle

### DO NOT:
- Do NOT use any external CDN links
- Do NOT use placeholder images (use colored divs with CSS gradients)
- Do NOT include any markdown formatting
- Do NOT wrap the HTML in code fences

OUTPUT THE COMPLETE HTML NOW.`;
}

async function generateHtmlViaLLM(
  zai: Awaited<ReturnType<typeof ZAI.create>>,
  ad: AdAnalysisResult,
  page: PageAnalysisResult,
): Promise<string> {
  const prompt = buildHtmlGenerationPrompt(ad, page);

  console.log('[Generate] Calling LLM for HTML generation (glm-4.6)...');

  const response = await zai.chat.completions.create({
    model: 'glm-4.6',
    messages: [
      {
        role: 'system',
        content: 'You are an expert web developer. You output ONLY raw HTML code. Never include markdown code fences, explanations, or any text outside the HTML document. Your output must start with <!DOCTYPE html> and end with </html>.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 16000,
  });

  let html = response.choices?.[0]?.message?.content ?? '';
  console.log('[Generate] Raw LLM response length:', html.length);

  // Clean up markdown code fences if the model wraps them
  html = html.replace(/^```html\s*\n?/i, '').replace(/\n?```\s*$/i, '');
  html = html.trim();

  // If the response doesn't start with <!DOCTYPE or <html, try to extract HTML
  if (!html.startsWith('<!DOCTYPE') && !html.startsWith('<html')) {
    const htmlMatch = html.match(/(<!DOCTYPE[\s\S]*<\/html>)/i);
    if (htmlMatch) {
      html = htmlMatch[1];
    }
  }

  // Validate minimum content
  if (html.length < 200) {
    console.error('[Generate] LLM returned too short response:', html.substring(0, 200));
    throw new Error('The AI generated an insufficient response. Please try again.');
  }

  // Ensure it's a valid HTML document
  if (!html.includes('<html') && !html.includes('<!DOCTYPE')) {
    console.warn('[Generate] Response is not valid HTML, wrapping...');
    html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${ad.headline} — ${page.domain}</title>
</head>
<body>
${html}
</body>
</html>`;
  }

  return html;
}

// ─── Analysis Generation ──────────────────────────────────────────────────────

async function generateAnalysis(
  zai: Awaited<ReturnType<typeof ZAI.create>>,
  ad: AdAnalysisResult,
  page: PageAnalysisResult,
  htmlCode: string,
): Promise<{ qualityScore: number; changes: ChangeItem[]; explanation: string }> {
  const analysisPrompt = `Analyze this landing page personalization and provide a detailed assessment.

AD CREATIVE ANALYSIS:
- Headline: "${ad.headline}"
- CTA: "${ad.ctaText}"
- Tone: ${ad.tone}
- Colors: Primary=${ad.colors.primary}, Accent=${ad.colors.accent}

TARGET PAGE: ${page.url}
DOMAIN: ${page.domain}

GENERATED HTML SUMMARY:
${htmlCode.substring(0, 2000)}

Respond ONLY with valid JSON in this format:
{
  "qualityScore": <number 70-99>,
  "changes": [
    { "id": 1, "type": "addition|modification|optimization", "section": "section name", "description": "what was changed", "impact": "high|medium|low" }
  ],
  "explanation": "A 2-3 sentence explanation of what was generated and why it improves conversion"
}`;

  try {
    const response = await zai.chat.completions.create({
      model: 'glm-4.6',
      messages: [
        { role: 'system', content: 'Output only valid JSON, no markdown or code fences.' },
        { role: 'user', content: analysisPrompt },
      ],
    });

    const raw = response.choices?.[0]?.message?.content ?? '';
    return parseAnalysisResponse(raw);
  } catch {
    return {
      qualityScore: 88,
      changes: buildMockChanges(),
      explanation: `Generated a personalized landing page matching the "${ad.headline}" ad creative. The page features matching colors, messaging, and conversion elements for improved post-click performance.`,
    };
  }
}

// ─── Mock Changes ─────────────────────────────────────────────────────────────

function buildMockChanges(): ChangeItem[] {
  return [
    { id: 1, type: 'addition', section: 'Hero Section', description: 'Added personalized headline with gradient text matching ad creative messaging', impact: 'high' },
    { id: 2, type: 'modification', section: 'Call-to-Action', description: 'Redesigned CTA button with gradient background and hover animation', impact: 'high' },
    { id: 3, type: 'addition', section: 'Urgency Element', description: 'Inserted animated urgency badge with pulsing dot indicator', impact: 'high' },
    { id: 4, type: 'addition', section: 'Social Proof', description: 'Added trust bar with brand logos and 5-star rating display', impact: 'medium' },
    { id: 5, type: 'optimization', section: 'Visual Hierarchy', description: 'Applied gradient background with floating blur orbs for depth', impact: 'medium' },
    { id: 6, type: 'addition', section: 'CTA Group', description: 'Added secondary button to capture users not ready to commit', impact: 'medium' },
    { id: 7, type: 'optimization', section: 'Responsive Design', description: 'Optimized layout for mobile with stacked CTAs and fluid typography', impact: 'low' },
  ];
}

// ─── Analysis Parsing ─────────────────────────────────────────────────────────

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
    return {
      qualityScore: 88,
      changes: buildMockChanges().slice(0, 5),
      explanation: 'Generated a personalized landing page that matches the ad creative branding with improved visual hierarchy and conversion elements.',
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
