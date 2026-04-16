import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { buildStitchPrompt, getPromptStats } from '@/lib/prompt-builder';
import type { AdAnalysisResult, PageAnalysisResult, StitchGenerationResult, ChangeItem, GeneratedComponent } from '@/lib/types';

// POST /api/analyze
// Accepts: { adImage: string (base64 or url), pageUrl: string }
// Returns: { success, adAnalysis, pageAnalysis, prompt, promptStats }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adImage, pageUrl } = body;

    if (!adImage || !pageUrl) {
      return NextResponse.json(
        { success: false, error: 'Both adImage and pageUrl are required' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(pageUrl.startsWith('http') ? pageUrl : `https://${pageUrl}`);
    } catch {
      return NextResponse.json(
        { success: false, error: 'pageUrl must be a valid URL' },
        { status: 400 }
      );
    }

    // Step 1: Analyze ad image via VLM (only if base64 data URL is provided)
    let adAnalysis: AdAnalysisResult;
    const isBase64Image = adImage.startsWith('data:image/');
    if (isBase64Image) {
      try {
        adAnalysis = await analyzeAdImageWithVLM(adImage);
      } catch {
        console.warn('[Analyze] VLM analysis failed, using smart fallback');
        adAnalysis = buildFallbackAdAnalysis(adImage);
      }
    } else {
      console.warn('[Analyze] Image is not base64, skipping VLM — using smart fallback');
      adAnalysis = buildFallbackAdAnalysis(adImage);
    }

    // Step 2: Analyze landing page
    let pageAnalysis: PageAnalysisResult;
    try {
      pageAnalysis = await analyzeLandingPage(pageUrl);
    } catch {
      console.warn('[Analyze] Page analysis failed, using fallback');
      pageAnalysis = buildFallbackPageAnalysis(pageUrl);
    }

    // Step 3: Build prompt for Stitch
    const prompt = buildStitchPrompt(adAnalysis, pageAnalysis);
    const stats = getPromptStats(prompt);

    return NextResponse.json({
      success: true,
      adAnalysis,
      pageAnalysis,
      prompt,
      promptStats: stats,
      readyForStitch: true,
    });
  } catch (error) {
    console.error('Analyze API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to analyze inputs', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// ─── VLM-Powered Ad Image Analysis ─────────────────────────────────────────

async function analyzeAdImageWithVLM(imageInput: string): Promise<AdAnalysisResult> {
  const zai = await ZAI.create();

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

  const response = await zai.chat.completions.createVision({
    model: 'glm-4.6v',
    messages: [
      { role: 'assistant', content: [{ type: 'text', text: 'Output only valid JSON, no markdown or code fences.' }] },
      {
        role: 'user',
        content: [
          { type: 'text', text: analysisPrompt },
          { type: 'image_url', image_url: { url: imageInput } },
        ],
      },
    ],
    thinking: { type: 'disabled' },
  });

  const raw = response.choices?.[0]?.message?.content ?? '';
  return parseAdAnalysis(raw, imageInput);
}

function parseAdAnalysis(raw: string, imageUrl: string): AdAnalysisResult {
  const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
  const parsed = JSON.parse(cleaned);

  return {
    imageUrl,
    fileName: 'uploaded-ad.png',
    colors: {
      primary: parsed.colors?.primary ?? '#7c3aed',
      secondary: parsed.colors?.secondary ?? '#a78bfa',
      accent: parsed.colors?.accent ?? '#f59e0b',
      background: parsed.colors?.background ?? '#ffffff',
      text: parsed.colors?.text ?? '#1f2937',
    },
    headline: parsed.headline ?? 'Extracted from image',
    subheadline: parsed.subheadline ?? '',
    ctaText: parsed.ctaText ?? 'Learn More',
    tone: ['professional', 'playful', 'luxury', 'urgent', 'technical', 'friendly'].includes(parsed.tone)
      ? parsed.tone : 'professional',
    style: ['modern', 'classic', 'minimal', 'bold', 'elegant', 'corporate'].includes(parsed.style)
      ? parsed.style : 'modern',
    valueProps: Array.isArray(parsed.valueProps) ? parsed.valueProps : ['High quality', 'Fast results'],
    emotionalAppeal: parsed.emotionalAppeal ?? 'trust',
    imageryType: parsed.imageryType ?? 'photography',
  };
}

function buildFallbackAdAnalysis(imageUrl: string): AdAnalysisResult {
  return {
    imageUrl,
    fileName: 'uploaded-ad.png',
    colors: {
      primary: '#7c3aed',
      secondary: '#a78bfa',
      accent: '#f59e0b',
      background: '#ffffff',
      text: '#1f2937',
    },
    headline: 'Boost Your Productivity',
    subheadline: 'The smart way to get more done',
    ctaText: 'Start Free Trial',
    tone: 'professional',
    style: 'modern',
    valueProps: ['Save time', 'Increase efficiency', 'Easy to use'],
    emotionalAppeal: 'aspiration',
    imageryType: 'photography',
  };
}

// ─── Landing Page Analysis ─────────────────────────────────────────────────

async function analyzeLandingPage(url: string): Promise<PageAnalysisResult> {
  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
  const domain = new URL(normalizedUrl).hostname;

  try {
    const res = await fetch(`https://r.jina.ai/${normalizedUrl}`, {
      headers: { 'Accept': 'text/plain' },
      signal: AbortSignal.timeout(10000),
    });
    const text = await res.text();

    const titleMatch = text.match(/Title:\s*(.+)/i);
    const title = titleMatch?.[1]?.trim() ?? domain;

    const contentText = text.substring(0, 5000);

    const sections: string[] = ['Hero'];
    if (/feature|capability|what we do/i.test(contentText)) sections.push('Features');
    if (/pricing|plan|price/i.test(contentText)) sections.push('Pricing');
    if (/testimonial|review|customer story/i.test(contentText)) sections.push('Testimonials');
    if (/faq|question|frequently/i.test(contentText)) sections.push('FAQ');
    if (/contact|get in touch/i.test(contentText)) sections.push('Contact');

    const framework = contentText.includes('Next.js') ? 'Next.js'
      : contentText.includes('React') ? 'React'
      : contentText.includes('WordPress') ? 'WordPress'
      : 'Modern';

    const hasForms = /contact|sign up|subscribe|register/i.test(contentText);
    const hasTestimonials = /testimonial|review|customer|rating/i.test(contentText);
    const hasSocialProof = /trusted|client|partner|logo|featured in/i.test(contentText);

    const lines = contentText.split('\n').filter(l => l.trim().length > 5);
    const currentHeadline = lines[0]?.replace(/^#+\s*/, '').trim().substring(0, 100) ?? 'Welcome';
    const currentSubheadline = lines[1]?.trim().substring(0, 150) ?? '';

    return {
      url: normalizedUrl,
      title,
      domain,
      currentHeadline,
      currentSubheadline,
      currentCTA: 'Get Started',
      ctaDestination: '/signup',
      sections,
      framework,
      styling: 'Tailwind CSS',
      hasForms,
      hasTestimonials,
      hasSocialProof,
      estimatedConversionElements: [hasForms ? 1 : 0, hasTestimonials ? 1 : 0, hasSocialProof ? 1 : 0].reduce((a, b) => a + b, 0),
    };
  } catch {
    return buildFallbackPageAnalysis(normalizedUrl);
  }
}

function buildFallbackPageAnalysis(url: string): PageAnalysisResult {
  const domain = (() => { try { return new URL(url.startsWith('http') ? url : `https://${url}`).hostname; } catch { return url; } })();
  return {
    url: url.startsWith('http') ? url : `https://${url}`,
    title: domain,
    domain,
    currentHeadline: 'Welcome to Our Platform',
    currentSubheadline: 'Build something amazing today',
    currentCTA: 'Get Started',
    ctaDestination: '/signup',
    sections: ['Hero', 'Features'],
    framework: 'Modern',
    styling: 'Custom CSS',
    hasForms: false,
    hasTestimonials: false,
    hasSocialProof: false,
    estimatedConversionElements: 0,
  };
}
