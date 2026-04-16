# Troopod — AI-Powered Landing Page Personalization Tool

---

## Project Overview
**Troopod** is a modern web application that helps marketers personalize landing pages to better match their ad creatives, improving conversion rates through AI-powered analysis.

---

## Current Project Status

### ✅ Completed
1. **Full application scaffold** — Next.js 16 with App Router, TypeScript, Tailwind CSS 4, shadcn/ui
2. **Purple/Violet theme** — Custom CSS variables for both light and dark modes with violet primary color palette
3. **Homepage with hero section** — Animated gradient text, background decorations, feature badges
4. **Image upload zone** — Drag & drop, click-to-browse, clipboard paste support with preview
5. **URL input with validation** — Real-time URL validation, auto-prefix https://, example URLs
6. **Generate button** — Prominent violet gradient button with glow pulse animation, disabled state management
7. **Loading state with step indicators** — 4-step animated progress:
   - "Analyzing ad creative..."
   - "Scraping page..."
   - "Finding gaps..."
   - "Generating enhancements..."
8. **Results page with 3 tabs**:
   - Split Preview (before/after iframes)
   - Change Log (6 mock changes with type/section/impact)
   - HTML Code (syntax-displayed with copy button)
9. **Quality score badge** — A+ grade, 92/100 score
10. **Download button** — Downloads enhanced HTML file
11. **Stats bar** — Total changes, high impact count, estimated conversion lift
12. **Features section** — 6 feature cards with hover animations
13. **How It Works section** — 3-step guide
14. **CTA section** — Gradient card with call-to-action
15. **Dark mode support** — Theme toggle in navbar
16. **Responsive design** — Mobile-first, works on all screen sizes
17. **Sticky footer** — Properly positioned with mt-auto
18. **API endpoint** — POST /api/generate accepting { adImageUrl, pageUrl }
19. **Animations** — Framer Motion throughout (page transitions, scroll reveals, hover effects)
20. **Cron job** — Auto-review scheduled every 15 minutes

### 🔧 Architecture
- **Single page app** with 3 states: `input` → `loading` → `results`
- **State managed** in main page component with useCallback hooks
- **Components**:
  - `src/components/image-upload-zone.tsx` — Drag & drop upload
  - `src/components/url-input.tsx` — Validated URL input
  - `src/components/generation-progress.tsx` — Step-by-step loading
  - `src/components/results-view.tsx` — Full results display
- **API**: `src/app/api/generate/route.ts` — POST endpoint with mock data
- **Theme**: Custom violet CSS variables in `globals.css` with light/dark variants

### 📝 Key Decisions
- Used purple/violet color scheme as explicitly requested by user
- Mock data for results (API returns simulated enhancement data)
- Single route architecture (/) with client-side state management
- iframe-based split preview (original URL vs srcDoc enhanced HTML)

---

## Unresolved Issues / Risks
- Iframes may be blocked by some target sites' X-Frame-Options headers
- No actual AI integration yet (mock responses) — would need VLM + LLM integration
- No file upload to server (images stored as blob URLs only)

---

## Priority Recommendations for Next Phase
1. Integrate real AI skills (VLM for image analysis, LLM for page generation)
2. Add history/saved analyses feature with localStorage
3. Implement real file upload with server-side storage
4. Add A/B test comparison mode
5. Create API key settings panel for AI providers
6. Add export options (HTML, React component, CSS snippet)
