// ─── Troopod v2.0 — Prompt Builder ─────────────────────────────────────────
// Constructs a detailed prompt for Google Stitch AI based on ad + page analysis

import type { AdAnalysisResult, PageAnalysisResult } from './types';

/**
 * Build the full Stitch prompt from analysis results.
 * This is the "brain" of the system — it turns raw analysis into actionable
 * instructions for the AI code generator.
 */
export function buildStitchPrompt(
  adData: AdAnalysisResult,
  pageData: PageAnalysisResult,
  customInstructions?: string
): string {
  const prompt = `You are an expert landing page optimization specialist working with Google Stitch.

TASK: Generate a PERSONALIZED HERO SECTION (and supporting components)
that enhances an existing landing page to perfectly match an advertisement
creative's branding and messaging.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ADVERTISEMENT CREATIVE SPECIFICATIONS

Extracted from the uploaded ad image:

### COLOR PALETTE (Use these EXACT hex codes):
- **Primary Color**: ${adData.colors.primary} (Dominant brand color)
- **Secondary Color**: ${adData.colors.secondary}
- **Accent/CTA Color**: ${adData.colors.accent} (For buttons, highlights)
- **Background**: ${adData.colors.background}
- **Text Color**: ${adData.colors.text}

### MESSAGING CONTENT (From the ad):
- **Headline**: "${adData.headline}"
- **Subheadline**: "${adData.subheadline}"
- **Call-to-Action Button Text**: "${adData.ctaText}"
- **Value Propositions**:
  ${adData.valueProps.map((v) => `  - ${v}`).join('\n')}

### BRAND PERSONALITY:
- **Tone**: ${adData.tone}
- **Visual Style**: ${adData.style}
- **Emotional Appeal**: ${adData.emotionalAppeal}
- **Imagery Type**: ${adData.imageryType}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## CURRENT LANDING PAGE (To Be Enhanced)

URL: ${pageData.url}
Page Title: "${pageData.title}"

### Current Content:
- **Headline (H1)**: "${pageData.currentHeadline}"
- **Subheadline**: "${pageData.currentSubheadline}"
- **Primary CTA**: "${pageData.currentCTA}" → ${pageData.ctaDestination}

### Page Structure:
- **Sections Detected**: ${pageData.sections.join(', ')}
- **Tech Stack**: ${pageData.framework} with ${pageData.styling}
- **Has Forms**: ${pageData.hasForms ? 'Yes' : 'No'}
- **Has Testimonials**: ${pageData.hasTestimonials ? 'Yes' : 'No'}
- **Has Social Proof**: ${pageData.hasSocialProof ? 'Yes' : 'No'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## REQUIREMENTS FOR GENERATED OUTPUT

### 1. MAIN COMPONENT: PersonalizedHeroSection

Create a HERO SECTION component that:

**Visual Design:**
- Uses the exact color palette specified above
- Background: Gradient using primary → secondary colors
- Typography: Bold, modern fonts matching the "${adData.style}" style
- Layout: Centered content, clear visual hierarchy
- Responsive: Looks great on mobile, tablet, desktop

**Content:**
- **H1 Headline**: "${adData.headline}" (from ad, NOT the current page headline)
- **Subheadline**: "${adData.subheadline}" (supporting message)
- **CTA Button**:
  - Text: "${adData.ctaText}"
  - Color: ${adData.colors.accent} background
  - Large, prominent placement
  - Hover animation (scale up slightly, shadow increase)
- Optional: Trust badges or urgency indicators if tone is "${adData.tone}"

### 2. SUPPORTING COMPONENTS (if needed):

${
  adData.tone.includes('urgent')
    ? `**UrgencyBadge:** Small pill/badge near headline. Red/orange background. White text, rounded-full. Subtle pulse animation. Text: "Limited Offer" or "Act Now".`
    : ''
}

${
  !pageData.hasSocialProof
    ? `**SocialProofBar:** Thin bar below hero. Light gray background. Text: "Trusted by 10,000+ professionals". Builds credibility immediately.`
    : ''
}

### 3. CODE QUALITY STANDARDS:

**Technology:**
- Use React functional components with TypeScript
- Tailwind CSS utility classes for styling
- No external UI libraries (keep it lightweight)
- Clean, semantic JSX

**Responsive Design:**
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Font sizes scale appropriately

### 4. WHAT NOT TO INCLUDE:

- Do NOT use placeholder images (use colored divs/gradients instead)
- Do NOT add complex JavaScript state management
- Do NOT include external dependencies beyond React/Tailwind
- Do NOT deviate from the specified color palette
- Do NOT change messaging from what's in the ad
- Do NOT make it overly complex (keep it focused)

${
  customInstructions
    ? `\n\n## CUSTOM USER INSTRUCTIONS:\n${customInstructions}`
    : ''
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## EXPECTED OUTPUT FORMAT:

Return a SINGLE complete React component file containing:
1. Main exported component: PersonalizedHeroSection
2. Any supporting sub-components (CTAButton, Badge, etc.)
3. All styled with Tailwind CSS classes
4. TypeScript interfaces for props (if any)

Make it PRODUCTION-READY, VISUALLY STUNNING, and FULLY RESPONSIVE.`;

  return prompt;
}

/** Get prompt statistics */
export function getPromptStats(prompt: string) {
  return {
    characters: prompt.length,
    words: prompt.split(/\s+/).filter(Boolean).length,
    estimatedReadingTime: Math.ceil(prompt.split(/\s+/).filter(Boolean).length / 200),
  };
}
