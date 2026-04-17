// ─── Troopod v2.0 Type Definitions ──────────────────────────────────────────

/** Color palette extracted from an ad creative */
export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

/** Result of analyzing an uploaded ad creative image */
export interface AdAnalysisResult {
  imageUrl: string;
  fileName: string;
  colors: ColorPalette;
  headline: string;
  subheadline: string;
  ctaText: string;
  tone: 'professional' | 'playful' | 'luxury' | 'urgent' | 'technical' | 'friendly';
  style: 'modern' | 'classic' | 'minimal' | 'bold' | 'elegant' | 'corporate';
  valueProps: string[];
  emotionalAppeal: string;
  imageryType: string;
}

/** Result of analyzing a landing page URL */
export interface PageAnalysisResult {
  url: string;
  title: string;
  domain: string;
  currentHeadline: string;
  currentSubheadline: string;
  currentCTA: string;
  ctaDestination: string;
  sections: string[];
  framework: string;
  styling: string;
  hasForms: boolean;
  hasTestimonials: boolean;
  hasSocialProof: boolean;
  estimatedConversionElements: number;
}

/** Result from the generation endpoint */
export interface StitchGenerationResult {
  success: boolean;
  projectId?: string;
  screenId?: string;
  htmlCode?: string;
  originalHtml?: string;
  reactCode?: string;
  cssCode?: string;
  qualityScore?: number;
  totalChanges?: number;
  changes?: ChangeItem[];
  aiExplanation?: string;
  errorMessage?: string;
}

/** A single change applied by the AI */
export interface ChangeItem {
  id: number;
  type: 'addition' | 'modification' | 'optimization';
  section: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

/** State for the app's workflow */
export type AppState = 'input' | 'loading' | 'results';

/** Upload state machine */
export type UploadState = 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error';

/** URL validation state */
export type UrlState = 'idle' | 'validating' | 'valid' | 'invalid';

/** Prompt builder state */
export type PromptState = 'hidden' | 'collapsed' | 'expanded';

/** Component list in generated result */
export interface GeneratedComponent {
  name: string;
  description: string;
}

/** History entry stored in localStorage */
export interface HistoryEntry {
  id: number;
  pageUrl: string;
  timestamp: string;
  qualityScore: number;
  totalChanges: number;
  adImagePreview: string | null;
  headline?: string;
}
