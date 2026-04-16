---
Task ID: 5-a
Agent: code-viewer-agent
Task: Create CodeViewer component for HTML syntax highlighting

Work Log:
- Read worklog.md to understand project context (Troopod v2.0, AI-powered landing page personalization tool)
- Checked existing UI components (Card, Button, Sonner toast) for proper integration
- Created src/components/code-viewer.tsx with all required features
- Ran ESLint — 0 errors, 0 warnings
- Verified dev server compiles successfully after component creation

Stage Summary:
- CodeViewer component created at src/components/code-viewer.tsx
- Implements 'use client' directive as required
- Props: { code: string; language?: string; fileName?: string }
- Toolbar with FileCode icon, filename display, line count badge, and Copy button
- Copy button uses sonner toast for success/error feedback with check icon transition
- Regex-based HTML syntax highlighting (no external libraries):
  - HTML comments → gray-500 italic
  - Strings (single/double quoted) → emerald-400
  - HTML entities → pink-300
  - Tag names and brackets → blue-400 (tag names bold)
  - Attribute names → amber-300
  - Plain text → gray-300
- Line numbers with sticky positioning and dark background
- Scrollable code area: max-h-[500px] overflow-y-auto
- Dark GitHub-inspired code theme (#0d1117 background, #161b22 toolbar)
- Wrapped in shadcn Card with proper overflow handling
- Hover highlight on each code line for readability
