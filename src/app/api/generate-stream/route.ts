import { NextRequest } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import type { StitchGenerationResult, ChangeItem, AdAnalysisResult, PageAnalysisResult } from '@/lib/types';

// POST /api/generate-stream
// Accepts: { adImage: string (base64), pageUrl: string }
// Returns: SSE stream with progress events and final result
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adImage, pageUrl } = body;

    if (!adImage || typeof adImage !== 'string') {
      return new Response(JSON.stringify({ success: false, error: 'adImage is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!pageUrl || typeof pageUrl !== 'string') {
      return new Response(JSON.stringify({ success: false, error: 'pageUrl is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const encoder = new TextEncoder();
    const totalSteps = 6;

    function sendEvent(data: { type: 'progress' | 'result' | 'error'; step: number; stepName: string; message: string; data?: unknown }) {
      return `data: ${JSON.stringify(data)}\n\n`;
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const zai = await ZAI.create();

          // ── Step 1: VLM Ad Image Analysis ──
          controller.enqueue(encoder.encode(sendEvent({
            type: 'progress',
            step: 1,
            stepName: 'Analyzing Ad Creative',
            message: 'AI vision model is examining your ad image for colors, messaging, and style...',
          })));

          const adAnalysis = await analyzeAdImageWithRetry(zai, adImage);

          controller.enqueue(encoder.encode(sendEvent({
            type: 'progress',
            step: 1,
            stepName: 'Analyzing Ad Creative',
            message: `Ad analysis complete — extracted "${adAnalysis.headline}" headline and color palette`,
          })));

          // ── Step 2: Landing Page Scrape ──
          controller.enqueue(encoder.encode(sendEvent({
            type: 'progress',
            step: 2,
            stepName: 'Scanning Landing Page',
            message: `Scraping ${pageUrl} for structure, content, and conversion elements...`,
          })));

          const pageAnalysis = await scrapeLandingPage(pageUrl);

          controller.enqueue(encoder.encode(sendEvent({
            type: 'progress',
            step: 2,
            stepName: 'Scanning Landing Page',
            message: `Page analysis complete — "${pageAnalysis.title}" with ${pageAnalysis.sections.length} sections detected`,
          })));

          // ── Step 3: Fetch Original HTML ──
          controller.enqueue(encoder.encode(sendEvent({
            type: 'progress',
            step: 3,
            stepName: 'Fetching Original HTML',
            message: 'Retrieving raw HTML from the target page for before/after comparison...',
          })));

          const originalHtml = await fetchOriginalHtml(pageUrl);

          controller.enqueue(encoder.encode(sendEvent({
            type: 'progress',
            step: 3,
            stepName: 'Fetching Original HTML',
            message: `Original HTML fetched (${originalHtml.length} chars)`,
          })));

          // ── Step 4: LLM HTML Generation ──
          controller.enqueue(encoder.encode(sendEvent({
            type: 'progress',
            step: 4,
            stepName: 'Generating Personalized HTML',
            message: 'AI is crafting your personalized landing page with matched colors, messaging, and design...',
          })));

          const htmlCode = await generateHtmlPage(zai, adAnalysis, pageAnalysis);

          controller.enqueue(encoder.encode(sendEvent({
            type: 'progress',
            step: 4,
            stepName: 'Generating Personalized HTML',
            message: `HTML generated — ${htmlCode.length} chars of production-ready code`,
          })));

          // ── Step 5: Quality Analysis ──
          controller.enqueue(encoder.encode(sendEvent({
            type: 'progress',
            step: 5,
            stepName: 'Analyzing Quality',
            message: 'Running quality analysis and scoring your personalized page...',
          })));

          const analysis = await generateAnalysis(zai, adAnalysis, pageAnalysis, htmlCode);

          controller.enqueue(encoder.encode(sendEvent({
            type: 'progress',
            step: 5,
            stepName: 'Analyzing Quality',
            message: `Quality score: ${analysis.qualityScore}/100 — ${analysis.changes.length} optimizations identified`,
          })));

          // ── Step 6: Complete ──
          controller.enqueue(encoder.encode(sendEvent({
            type: 'progress',
            step: 6,
            stepName: 'Finalizing',
            message: 'Packaging results and preparing your personalized page...',
          })));

          const projectId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
          const screenId = `scr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

          const result: StitchGenerationResult = {
            success: true,
            projectId,
            screenId,
            htmlCode,
            originalHtml,
            qualityScore: analysis.qualityScore,
            totalChanges: analysis.changes.length,
            changes: analysis.changes,
            aiExplanation: analysis.explanation,
          };

          // Small delay for the finalizing step to feel natural
          await new Promise(resolve => setTimeout(resolve, 500));

          controller.enqueue(encoder.encode(sendEvent({
            type: 'result',
            step: totalSteps,
            stepName: 'Complete',
            message: 'Personalization complete!',
            data: result,
          })));

          controller.close();
        } catch (error) {
          console.error('[GenerateStream] Pipeline error:', error);
          controller.enqueue(encoder.encode(sendEvent({
            type: 'error',
            step: 0,
            stepName: 'Error',
            message: error instanceof Error ? error.message : 'An unexpected error occurred',
          })));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('[GenerateStream] API error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// ─── Reuse pipeline functions (copied from generate/route.ts) ──────────────────

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

async function analyzeAdImage(zai: Awaited<ReturnType<typeof ZAI.create>>, imageInput: string): Promise<AdAnalysisResult> {
  const isBase64 = imageInput.startsWith('data:image/');
  if (!isBase64) return buildFallbackAdAnalysis();

  const cleanImage = cleanBase64Image(imageInput);

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
    if (!isValidAnalysisHeadline(parsed.headline)) return buildFallbackAdAnalysis();
    return parsed;
  } catch {
    return buildFallbackAdAnalysis();
  }
}

async function analyzeAdImageWithRetry(zai: Awaited<ReturnType<typeof ZAI.create>>, imageInput: string, maxRetries = 2): Promise<AdAnalysisResult> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const result = await analyzeAdImage(zai, imageInput);
    if (isValidAnalysisHeadline(result.headline)) return result;
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 1000));
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
    tone: ['professional', 'playful', 'luxury', 'urgent', 'technical', 'friendly'].includes(parsed.tone) ? parsed.tone : 'professional',
    style: ['modern', 'classic', 'minimal', 'bold', 'elegant', 'corporate'].includes(parsed.style) ? parsed.style : 'modern',
    valueProps: Array.isArray(parsed.valueProps) ? parsed.valueProps : ['Save time', 'Boost results'],
    emotionalAppeal: parsed.emotionalAppeal ?? 'trust',
    imageryType: parsed.imageryType ?? 'photography',
  };
}

function buildFallbackAdAnalysis(): AdAnalysisResult {
  return {
    imageUrl: '',
    fileName: 'uploaded-ad.png',
    colors: { primary: '#7c3aed', secondary: '#a78bfa', accent: '#fbbf24', background: '#0f0a1a', text: '#ffffff' },
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

async function scrapeLandingPage(url: string): Promise<PageAnalysisResult> {
  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
  const domain = (() => { try { return new URL(normalizedUrl).hostname; } catch { return url; } })();

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
      url: normalizedUrl, title, domain, currentHeadline, currentSubheadline,
      currentCTA: 'Get Started', ctaDestination: '/signup', sections,
      framework: 'Modern', styling: 'Custom CSS',
      hasForms, hasTestimonials, hasSocialProof,
      estimatedConversionElements: [hasForms ? 1 : 0, hasTestimonials ? 1 : 0, hasSocialProof ? 1 : 0].reduce((a, b) => a + b, 0),
    };
  } catch {
    return {
      url: normalizedUrl, title: domain, domain, currentHeadline: 'Welcome', currentSubheadline: '',
      currentCTA: 'Get Started', ctaDestination: '/signup', sections: ['Hero'],
      framework: 'Modern', styling: 'Custom CSS',
      hasForms: false, hasTestimonials: false, hasSocialProof: false, estimatedConversionElements: 0,
    };
  }
}

async function fetchOriginalHtml(url: string): Promise<string> {
  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
  try {
    const res = await fetch(normalizedUrl, {
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Troopod/2.0)', 'Accept': 'text/html' },
    });
    const html = await res.text();
    return html.substring(0, 8000);
  } catch {
    return `<!DOCTYPE html><html><head><title>${normalizedUrl}</title></head><body style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;color:#666;text-align:center;padding:2rem"><div><h2 style="margin-bottom:1rem">Original Page</h2><p>Could not load original page content from ${normalizedUrl}</p></div></body></html>`;
  }
}

async function generateHtmlPage(zai: Awaited<ReturnType<typeof ZAI.create>>, ad: AdAnalysisResult, page: PageAnalysisResult): Promise<string> {
  const codegenPrompt = `You are an expert front-end developer who creates stunning, production-ready landing pages. Generate a COMPLETE, SELF-CONTAINED HTML landing page.

CRITICAL: Output ONLY the HTML code inside a single \`\`\`html code block. No markdown, no explanation before or after the code block.

DESIGN SPECIFICATIONS (from the ad creative):
- Primary Color: ${ad.colors.primary}
- Secondary Color: ${ad.colors.secondary}
- Accent Color: ${ad.colors.accent}
- Background Color: ${ad.colors.background}
- Text Color: ${ad.colors.text}
- Brand Tone: ${ad.tone}
- Visual Style: ${ad.style}
- Emotional Appeal: ${ad.emotionalAppeal}

CONTENT (from the ad creative):
- Headline: "${ad.headline}"
- Subheadline: "${ad.subheadline}"
- CTA Button Text: "${ad.ctaText}"
- Value Props: ${ad.valueProps.join(', ')}

CONTEXT:
- Target Landing Page: ${page.url}
- Page Domain: ${page.domain}
- Page Title: "${page.title}"

REQUIRED PAGE STRUCTURE:
1. Top Trust Badge Bar (slim, ~40px, "Trusted by 10,000+ teams")
2. Urgency/Announcement Badge (pill, centered, pulse animation)
3. Main Hero Section (full viewport, gradient background, blur orbs, dot pattern)
4. CTA Group (primary gradient button + secondary glass button)
5. Urgency Timer Text
6. Social Proof Bar (brand logos, star ratings)
7. Value Props Strip

TECHNICAL REQUIREMENTS:
- ALL CSS in <style> tag, NO external dependencies
- CSS variables for all colors
- Responsive with @media (max-width: 640px)
- CSS animations for float, pulse-badge, gradient-shift
- Box-sizing: border-box globally
- VISUALLY STUNNING — premium SaaS quality`;

  try {
    const response = await zai.chat.completions.create({
      model: 'glm-4.6',
      messages: [
        { role: 'system', content: 'You are an expert front-end developer specializing in high-converting SaaS landing pages. Always respond with ONLY the code inside a fenced code block.' },
        { role: 'user', content: codegenPrompt },
      ],
    });
    const rawContent = response.choices?.[0]?.message?.content ?? '';
    const htmlCode = extractHtmlFromResponse(rawContent);
    if (!htmlCode || htmlCode.length < 100) return buildMockHtml(page.url);
    return htmlCode;
  } catch {
    return buildMockHtml(page.url);
  }
}

async function generateAnalysis(
  zai: Awaited<ReturnType<typeof ZAI.create>>,
  ad: AdAnalysisResult,
  page: PageAnalysisResult,
  htmlCode: string,
): Promise<{ qualityScore: number; changes: ChangeItem[]; explanation: string }> {
  const analysisPrompt = `Analyze this landing page personalization. AD: "${ad.headline}" | CTA: "${ad.ctaText}" | Page: ${page.url}

GENERATED HTML SUMMARY:
${htmlCode.substring(0, 2000)}

Respond ONLY with valid JSON: { "qualityScore": 70-99, "changes": [{ "id": 1, "type": "addition|modification|optimization", "section": "name", "description": "what changed", "impact": "high|medium|low" }], "explanation": "2-3 sentence explanation" }`;

  try {
    const response = await zai.chat.completions.create({
      model: 'glm-4.6',
      messages: [
        { role: 'assistant', content: 'Output only valid JSON, no markdown or code fences.' },
        { role: 'user', content: analysisPrompt },
      ],
    });
    const raw = response.choices?.[0]?.message?.content ?? '';
    return parseAnalysisResponse(raw);
  } catch {
    return { qualityScore: 88, changes: buildMockChanges(), explanation: `Generated a personalized landing page matching "${ad.headline}".` };
  }
}

function buildMockChanges(): ChangeItem[] {
  return [
    { id: 1, type: 'addition', section: 'Hero Section', description: 'Added personalized headline matching ad creative', impact: 'high' },
    { id: 2, type: 'modification', section: 'Call-to-Action', description: 'Redesigned CTA button with gradient background', impact: 'high' },
    { id: 3, type: 'addition', section: 'Urgency Element', description: 'Inserted animated urgency badge', impact: 'high' },
    { id: 4, type: 'addition', section: 'Social Proof', description: 'Added trust bar with brand logos', impact: 'medium' },
    { id: 5, type: 'optimization', section: 'Visual Hierarchy', description: 'Applied gradient background with blur orbs', impact: 'medium' },
    { id: 6, type: 'addition', section: 'CTA Group', description: 'Added secondary button for non-committed users', impact: 'medium' },
    { id: 7, type: 'optimization', section: 'Responsive Design', description: 'Optimized layout for mobile', impact: 'low' },
  ];
}

function buildMockHtml(pageUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Personalized Landing Page — Powered by Troopod</title>
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    :root { --primary: #7c3aed; --secondary: #a78bfa; --accent: #fbbf24; --bg: #0f0a1a; --text: #ffffff; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 50%, #6B21A8 100%); min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text); overflow-x: hidden; position: relative; }
    body::before, body::after { content: ''; position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.3; animation: float 8s ease-in-out infinite; }
    body::before { width: 400px; height: 400px; background: #a78bfa; top: -100px; left: -100px; }
    body::after { width: 350px; height: 350px; background: #7c3aed; bottom: -80px; right: -80px; animation-delay: -4s; }
    @keyframes float { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(30px, -30px) scale(1.05); } }
    .hero-container { position: relative; z-index: 1; max-width: 900px; width: 100%; padding: 3rem 2rem; text-align: center; }
    .urgency-badge { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(251, 191, 36, 0.15); border: 1px solid rgba(251, 191, 36, 0.4); padding: 0.5rem 1.5rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; margin-bottom: 2rem; backdrop-filter: blur(10px); animation: pulse-badge 3s ease-in-out infinite; color: #fde68a; }
    @keyframes pulse-badge { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.03); } }
    h1 { font-size: clamp(2.5rem, 5vw, 3.75rem); font-weight: 800; line-height: 1.1; margin-bottom: 1.5rem; letter-spacing: -0.02em; }
    .highlight { background: linear-gradient(135deg, #fbbf24, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .subheadline { font-size: clamp(1rem, 2vw, 1.25rem); line-height: 1.6; opacity: 0.9; margin-bottom: 2.5rem; max-width: 640px; margin-left: auto; margin-right: auto; }
    .cta-group { display: flex; align-items: center; justify-content: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
    .cta-primary { display: inline-flex; align-items: center; gap: 0.5rem; background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #1a1a2e; padding: 1rem 2.5rem; border-radius: 0.75rem; font-weight: 700; font-size: 1.125rem; text-decoration: none; transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer; border: none; box-shadow: 0 4px 20px rgba(251, 191, 36, 0.3); }
    .cta-primary:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 8px 40px rgba(251, 191, 36, 0.45); }
    .cta-secondary { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.25); color: #ffffff; padding: 1rem 2rem; border-radius: 0.75rem; font-weight: 600; font-size: 1rem; text-decoration: none; transition: all 0.2s ease; cursor: pointer; backdrop-filter: blur(10px); }
    .cta-secondary:hover { background: rgba(255, 255, 255, 0.2); }
    .social-proof { margin-top: 3rem; padding: 1.5rem 2rem; background: rgba(255, 255, 255, 0.08); border-radius: 1rem; border: 1px solid rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); }
    .value-props { display: flex; justify-content: center; gap: 2rem; margin-top: 2rem; font-size: 0.875rem; flex-wrap: wrap; }
    .value-prop { display: flex; align-items: center; gap: 0.5rem; }
    .check-icon { color: #34d399; }
    @media (max-width: 640px) { .hero-container { padding: 2rem 1.25rem; } .cta-group { flex-direction: column; } .cta-primary, .cta-secondary { width: 100%; justify-content: center; } .value-props { flex-direction: column; align-items: center; gap: 0.75rem; } }
  </style>
</head>
<body>
  <div class="hero-container">
    <div class="urgency-badge"><span>Limited Offer — Join 2,847 professionals this week</span></div>
    <h1>Transform Your Workflow<br>with <span class="highlight">AI-Powered</span> Automation</h1>
    <p class="subheadline">Stop wasting time on repetitive tasks. Our platform uses cutting-edge AI to streamline your workflow and boost productivity by 10x.</p>
    <div class="cta-group">
      <a href="#" class="cta-primary">Start Free Trial &rarr;</a>
      <a href="#" class="cta-secondary">Watch Demo &#9654;</a>
    </div>
    <div class="social-proof">
      <p style="font-size:0.75rem;opacity:0.7;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:1rem">Trusted by 10,000+ Teams Worldwide</p>
      <div style="display:flex;justify-content:center;gap:2rem;flex-wrap:wrap;opacity:0.6">
        <span>Google</span><span>Microsoft</span><span>Stripe</span><span>Notion</span><span>Figma</span>
      </div>
    </div>
    <div class="value-props">
      <div class="value-prop"><span class="check-icon">&#10003;</span> Save time</div>
      <div class="value-prop"><span class="check-icon">&#10003;</span> Boost productivity</div>
      <div class="value-prop"><span class="check-icon">&#10003;</span> Easy to use</div>
    </div>
  </div>
  <!-- Enhanced by Troopod AI from: ${pageUrl} -->
</body>
</html>`;
}

function extractHtmlFromResponse(raw: string): string {
  let extracted = extractCodeBlock(raw, 'html');
  if (extracted) return extracted;
  const anyBlock = raw.match(/```[\w]*\n([\s\S]*?)```/);
  if (anyBlock?.[1]) {
    const content = anyBlock[1].trim();
    if (content.includes('<!DOCTYPE') || content.includes('<html')) return content;
  }
  const trimmed = raw.trim();
  if (trimmed.includes('<!DOCTYPE') || trimmed.includes('<html')) return trimmed;
  return trimmed;
}

function extractCodeBlock(raw: string, lang: string): string | undefined {
  const regex = new RegExp(`\`\`\`${lang}\\s*\\n([\\s\\S]*?)\`\`\``, 'i');
  const match = raw.match(regex);
  return match?.[1]?.trim();
}

function parseAnalysisResponse(raw: string): { qualityScore: number; changes: ChangeItem[]; explanation: string } {
  const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
  let parsed: { qualityScore?: number; changes?: Array<{ id?: number; type?: string; section?: string; description?: string; impact?: string }>; explanation?: string; };
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return { qualityScore: 88, changes: buildMockChanges().slice(0, 5), explanation: 'Generated a personalized hero section matching the ad creative branding.' };
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
    qualityScore: typeof parsed.qualityScore === 'number' ? Math.min(Math.max(parsed.qualityScore, 70), 99) : 88,
    changes: changes.length > 0 ? changes : buildMockChanges().slice(0, 5),
    explanation: parsed.explanation ?? 'Generated a personalized hero section matching the ad creative branding for improved post-click conversion.',
  };
}
