# Design Specification
# Power Statement Assistant

**Version:** 1.0  
**Date:** 2024-12-15  
**Status:** Active  
**Related:** [Product Requirements](PRODUCT-REQUIREMENTS.md)  

---

## 1. Architecture Overview

### 1.1 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Web Application                      │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  │  │
│  │  │   UI Layer  │  │  Business   │  │   Storage    │  │  │
│  │  │  (Views)    │◄─┤   Logic     │◄─┤  (IndexedDB) │  │  │
│  │  │             │  │  (Workflow) │  │              │  │  │
│  │  └─────────────┘  └─────────────┘  └──────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  User manually copies prompts to external AI services:      │
│  ┌──────────────┐              ┌──────────────┐            │
│  │ Claude Tab   │              │ Gemini Tab   │            │
│  │ (Phase 1, 3) │              │  (Phase 2)   │            │
│  └──────────────┘              └──────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

- **Frontend:** Vanilla JavaScript (ES6 modules)
- **Styling:** Tailwind CSS 3.x
- **Storage:** IndexedDB (via native API)
- **Build:** None (no build step, runs directly in browser)
- **Testing:** Jest with ES6 module support
- **Deployment:** GitHub Pages (static hosting)

### 1.3 Design Principles

1. **Zero Dependencies:** No npm packages in production code (only dev dependencies for testing)
2. **Progressive Enhancement:** Works without JavaScript for basic content
3. **Privacy-First:** All processing happens client-side, no server communication
4. **Offline-Capable:** Works offline after initial page load
5. **Mobile-Responsive:** Adapts to all screen sizes

---

## 2. Data Models

### 2.1 Project Object

```javascript
{
  id: string,                    // UUID v4
  title: string,                 // Project title (e.g., "Cari AI Power Statement")
  productName: string,           // Product/service name (e.g., "Cari AI Receptionist")
  customerType: string,          // Target customer type (e.g., "Small business owners with 5-50 employees")
  problem: string,               // Problem being solved (multi-line text)
  outcome: string,               // Desired outcome (multi-line text)
  proofPoints: string,           // Proof points/results (multi-line text)
  differentiators: string,       // Key differentiators (multi-line text)
  objections: string,            // Common objections to address (multi-line text)
  phase: number,                 // Current phase (1, 2, or 3)
  createdAt: string,             // ISO 8601 timestamp
  updatedAt: string,             // ISO 8601 timestamp
  phases: {
    1: {
      prompt: string,            // Generated prompt for Phase 1
      response: string,          // AI response from Phase 1
      completed: boolean         // true if response exists
    },
    2: {
      prompt: string,            // Generated prompt for Phase 2
      response: string,          // AI response from Phase 2
      completed: boolean         // true if response exists
    },
    3: {
      prompt: string,            // Generated prompt for Phase 3
      response: string,          // AI response from Phase 3
      completed: boolean         // true if response exists
    }
  }
}
```

**Note:** All 7 content fields (productName through objections) are required and collected via the new project form. This ensures prompt templates have all necessary data for generating high-quality power statements.

**Note:** Current implementation has a gap - the form only collects `title`, `problems`, and `context`, but the prompt templates expect 7 fields: `product_name`, `customer_type`, `problem`, `outcome`, `proof_points`, `differentiators`, `objections`. This needs to be addressed in a future update.

### 2.2 Prompt Template Object

```javascript
{
  phase: number,                 // Phase number (1, 2, or 3)
  content: string                // Markdown template with {variable} placeholders
}
```

### 2.3 Settings Object

```javascript
{
  key: string,                   // Setting key (e.g., 'theme', 'privacy-notice-dismissed')
  value: any                     // Setting value
}
```

---

## 3. Module Architecture

### 3.1 Module Dependency Graph

```
app.js (entry point)
  ├── router.js
  │   ├── views.js
  │   │   ├── projects.js
  │   │   │   └── storage.js
  │   │   ├── ui.js
  │   │   └── router.js (circular, handled)
  │   └── project-view.js
  │       ├── projects.js
  │       ├── workflow.js
  │       │   ├── storage.js
  │       │   └── ui.js
  │       ├── ui.js
  │       └── router.js (circular, handled)
  ├── storage.js
  ├── workflow.js
  └── ui.js
```

### 3.2 Module Responsibilities

**app.js**
- Initialize application
- Load default prompts
- Set up global event listeners (dark mode, privacy notice, about modal)
- Initialize router

**router.js**
- Manage client-side routing (hash-based)
- Navigate between views (home, new-project, project/:id)
- Update footer stats after every route change

**views.js**
- Render projects list view
- Render new project form
- Handle project creation and deletion

**project-view.js**
- Render project detail view with 3-phase tabs
- Render phase content (prompt generation, AI integration, response capture)
- Handle phase navigation (tabs, prev/next buttons)
- Implement sequential UX patterns (button reveal, textarea enable)
- Handle auto-advance on save

**projects.js**
- CRUD operations for projects
- Export/import projects as JSON
- Update phase data

**workflow.js**
- Load default prompt templates
- Generate prompts for each phase (variable substitution)
- Export final document as Markdown
- Provide phase metadata (title, AI model, description, icon)

**storage.js**
- IndexedDB initialization and management
- CRUD operations for projects, prompts, settings
- Export/import all data

**ui.js**
- Toast notifications
- Confirmation dialogs
- Copy to clipboard
- Date formatting
- HTML escaping
- Prompt modal (view full prompt)

---

## 4. Workflow Implementation

### 4.1 Phase Workflow State Machine

```
┌─────────────┐
│   Phase 1   │
│  (Claude)   │
│             │
│ States:     │
│ - Empty     │──► User clicks "Copy Prompt"
│ - Copied    │──► User pastes response
│ - Complete  │──► Auto-advance to Phase 2
└─────────────┘
       │
       ▼
┌─────────────┐
│   Phase 2   │
│  (Gemini)   │
│             │
│ States:     │
│ - Empty     │──► User clicks "Copy Prompt"
│ - Copied    │──► User pastes response
│ - Complete  │──► Auto-advance to Phase 3
└─────────────┘
       │
       ▼
┌─────────────┐
│   Phase 3   │
│  (Claude)   │
│             │
│ States:     │
│ - Empty     │──► User clicks "Copy Prompt"
│ - Copied    │──► User pastes response
│ - Complete  │──► NO auto-advance (final phase)
└─────────────┘
```

### 4.2 Prompt Generation Algorithm

```javascript
function generatePromptForPhase(project, phase) {
  // 1. Load template from storage or default
  const template = await storage.getPrompt(phase) || defaultPrompts[phase];
  
  // 2. Replace project-specific variables
  let prompt = template;
  prompt = prompt.replace(/\{project_title\}/g, project.title);
  prompt = prompt.replace(/\{product_name\}/g, project.productName || '');
  prompt = prompt.replace(/\{customer_type\}/g, project.customerType || '');
  // ... (7 total variables)
  
  // 3. Replace phase outputs for phases 2 and 3
  if (phase >= 2) {
    prompt = prompt.replace(/\{phase1_output\}/g, project.phases[1].response);
  }
  if (phase >= 3) {
    prompt = prompt.replace(/\{phase2_output\}/g, project.phases[2].response);
  }
  
  return prompt;
}
```

---

## 5. UI/UX Patterns

### 5.1 Sequential UX Patterns (8 Critical Patterns)

**Pattern 1: Sequential Button Reveal**
- "Open AI" button starts disabled (`opacity-50 cursor-not-allowed pointer-events-none`)
- After "Copy Prompt" clicked, button becomes enabled
- Prevents users from opening AI before copying prompt

**Pattern 2: Sequential Textarea Enable**
- Response textarea starts disabled (`disabled` attribute)
- After "Copy Prompt" clicked, textarea becomes enabled and focused
- Guides users through correct workflow

**Pattern 3: Shared Browser Tab**
- All "Open AI" links use `target="ai-assistant-tab"`
- Prevents tab explosion when navigating between phases
- User has one Claude tab and one Gemini tab

**Pattern 4: Auto-Advance on Save**
- Saving response in Phase 1 → auto-advance to Phase 2
- Saving response in Phase 2 → auto-advance to Phase 3
- Saving response in Phase 3 → NO auto-advance (final phase)
- Shows toast notification before advancing

**Pattern 5: Step A/B Labeling**
- Within each phase, use "Step A" and "Step B" (not "Step 1" and "Step 2")
- Clearer visual hierarchy (phases are numbered, steps are lettered)

**Pattern 6: Dynamic AI Name Labels**
- Phase 1: "Open Claude", "Paste Claude's Response"
- Phase 2: "Open Gemini", "Paste Gemini's Response"
- Phase 3: "Open Claude", "Paste Claude's Response"
- Context-specific labeling (not generic "AI")

**Pattern 7: Footer Stats Auto-Update**
- After every route render, call `updateStorageInfo()`
- Project count updates immediately after create/delete
- No page refresh required

**Pattern 8: Phase Tab Underline Sync**
- Active phase tab has blue underline (`border-b-2 border-blue-600`)
- Underline updates from ALL navigation points:
  - Tab clicks
  - Prev/Next buttons
  - Auto-advance
  - Initial page load
- Implemented via `updatePhaseTabStyles(activePhase)` function

### 5.2 Dark Mode Implementation

```javascript
// Tailwind dark mode config (in <head>)
<script>
  if (localStorage.theme === 'dark' ||
      (!('theme' in localStorage) &&
       window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
</script>
```

All components use Tailwind's `dark:` variant for dark mode styles.

### 5.3 Responsive Design Breakpoints

- **Mobile:** < 640px (sm)
- **Tablet:** 640px - 1024px (md, lg)
- **Desktop:** > 1024px (xl, 2xl)

Key responsive behaviors:
- Project grid: 1 column (mobile) → 2 columns (tablet) → 3 columns (desktop)
- Phase tabs: Stacked (mobile) → Horizontal (tablet+)
- Form fields: Full width (mobile) → Constrained width (desktop)

---

## 6. Storage Implementation

### 6.1 IndexedDB Schema

**Database Name:** `power-statement-assistant`
**Version:** 1

**Object Stores:**

1. **projects**
   - Key Path: `id`
   - Indexes:
     - `updatedAt` (for sorting by recent)
     - `title` (for search)
     - `phase` (for filtering by progress)

2. **prompts**
   - Key Path: `phase`
   - No indexes

3. **settings**
   - Key Path: `key`
   - No indexes

### 6.2 Storage Operations

**Create Project:**
```javascript
async function createProject(title, problems, context) {
  const project = {
    id: crypto.randomUUID(),
    title: title.trim(),
    problems: problems.trim(),
    context: context.trim(),
    phase: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    phases: {
      1: { prompt: '', response: '', completed: false },
      2: { prompt: '', response: '', completed: false },
      3: { prompt: '', response: '', completed: false }
    }
  };
  await storage.saveProject(project);
  return project;
}
```

**Update Phase:**
```javascript
async function updatePhase(projectId, phase, prompt, response) {
  const project = await storage.getProject(projectId);
  project.phases[phase] = {
    prompt: prompt || '',
    response: response || '',
    completed: !!response
  };
  project.updatedAt = new Date().toISOString();
  await storage.saveProject(project);
  return project;
}
```

**Export/Import:**
```javascript
// Export format
{
  version: '1.0',
  exportedAt: '2024-12-15T10:30:00.000Z',
  projectCount: 5,
  projects: [ /* array of project objects */ ]
}
```

---

## 7. Prompt Template System

### 7.1 Template Variables

**Project Variables:**
- `{project_title}` - Project title
- `{product_name}` - Product/service name
- `{customer_type}` - Target customer type
- `{problem}` - Problem being solved
- `{outcome}` - Desired outcome
- `{proof_points}` - Proof points/results
- `{differentiators}` - Key differentiators
- `{objections}` - Common objections

**Phase Output Variables:**
- `{phase1_output}` - Phase 1 AI response (used in Phase 2 and 3)
- `{phase2_output}` - Phase 2 AI response (used in Phase 3)

### 7.2 Template Structure

Each prompt template (phase1.md, phase2.md, phase3.md) follows this structure:

```markdown
# Phase X: [Phase Name] ([AI Model])

[Role description for the AI]

## Context

[Variables with user-provided information]

## Your Task

[Detailed instructions for what to create]

### [Subsection 1]

[Specific guidance]

### Output Format

[Expected output structure with examples]

## Important Notes

[Critical reminders and constraints]

**Before you respond, ask [N] clarifying questions** to ensure...
```

### 7.3 Template Loading

1. **Initial Load:** Fetch from `prompts/phase1.md`, `prompts/phase2.md`, `prompts/phase3.md`
2. **Cache in IndexedDB:** Save to `prompts` object store
3. **Subsequent Loads:** Read from IndexedDB (faster)
4. **Customization:** Users can edit prompts (future feature)

---

## 8. Error Handling

### 8.1 Error Categories

**Storage Errors:**
- IndexedDB not supported → Show error message with browser upgrade instructions
- Storage quota exceeded → Prompt user to delete old projects or export data
- Corrupt data → Graceful fallback with option to reset storage

**User Input Errors:**
- Empty required fields → Show validation message
- Invalid JSON import → Show error with details
- Missing prompt template → Show error and reload defaults

**Navigation Errors:**
- Invalid project ID → Redirect to home with error toast
- Invalid route → Redirect to home

### 8.2 Error Handling Strategy

```javascript
try {
  // Operation
} catch (error) {
  console.error('Context:', error);
  showToast('User-friendly message', 'error');
  // Graceful degradation or recovery
}
```

All errors are:
1. Logged to console (for debugging)
2. Shown to user with friendly message (via toast)
3. Handled gracefully (no app crashes)

---

## 9. Performance Optimizations

### 9.1 Lazy Loading

- Prompt templates loaded on app init (not per-project)
- Project list rendered on-demand (not pre-loaded)
- Phase content rendered only when phase is active

### 9.2 Caching Strategy

- Prompt templates cached in IndexedDB
- No external API calls (except user-initiated AI tab opens)
- All assets served from CDN (Tailwind CSS)

### 9.3 Rendering Optimizations

- Use `innerHTML` for bulk rendering (faster than DOM manipulation)
- Debounce expensive operations (none currently needed)
- Minimize reflows (batch DOM updates)

---

## 10. Security Considerations

### 10.1 XSS Prevention

- All user input escaped via `escapeHtml()` before rendering
- No `eval()` or `Function()` constructors
- No inline event handlers (use `addEventListener`)

```javascript
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
```

### 10.2 Data Privacy

- No server communication (100% client-side)
- No analytics or tracking
- No cookies (except localStorage for theme preference)
- All data stored in IndexedDB (user-controlled)

### 10.3 Content Security Policy

Recommended CSP headers (for future deployment):
```
Content-Security-Policy:
  default-src 'self';
  style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com;
  script-src 'self' 'unsafe-inline';
  connect-src 'none';
```

---

## 11. Testing Strategy

### 11.1 Unit Tests

- **Storage Module:** CRUD operations, export/import, error handling
- **Workflow Module:** Prompt generation, variable substitution
- **Projects Module:** Create, update, delete, export/import

### 11.2 Integration Tests

- **3-Phase Workflow:** Complete workflow from project creation to export
- **Sequential UX:** Button reveal, textarea enable, auto-advance
- **Dark Mode:** Theme switching, persistence

### 11.3 Manual Testing Checklist

- [ ] Create project with all fields
- [ ] Generate Phase 1 prompt
- [ ] Copy prompt to clipboard
- [ ] Open Claude in new tab
- [ ] Paste response back
- [ ] Auto-advance to Phase 2
- [ ] Repeat for Phase 2 (Gemini)
- [ ] Repeat for Phase 3 (Claude)
- [ ] Export final power statement
- [ ] Verify both versions (concise + structured)
- [ ] Test dark mode toggle
- [ ] Test export/import projects
- [ ] Test delete project

---

## 12. Deployment

### 12.1 Build Process

**No build step required** - app runs directly in browser.

Deployment checklist:
1. Ensure all files in `docs/` directory (for GitHub Pages)
2. Verify `index.html` is at root of `docs/`
3. Test locally with `python3 -m http.server 8000`
4. Push to `main` branch
5. GitHub Pages auto-deploys from `docs/` directory

### 12.2 Deployment Script

```bash
#!/bin/bash
# scripts/deploy-web.sh

# 1. Run linting
npm run lint || exit 1

# 2. Run tests
NODE_OPTIONS=--experimental-vm-modules npm test || exit 1

# 3. Verify files exist
[ -f "docs/index.html" ] || exit 1
[ -f "docs/js/app.js" ] || exit 1

# 4. Push to GitHub
git add docs/
git commit -m "Deploy: $(date)"
git push origin main

echo "✅ Deployed to GitHub Pages"
```

---

## 13. Future Technical Enhancements

### 13.1 Enhanced Form (Priority: HIGH)

**Problem:** Current form only collects 3 fields (title, problems, context), but prompts expect 7 fields.

**Solution:** Update `renderNewProjectForm()` to collect:
- Product/Service Name
- Customer Type
- Problem Being Solved
- Desired Outcome
- Proof Points/Results
- Key Differentiators
- Common Objections

**Impact:** Enables prompts to work as designed, improves power statement quality.

### 13.2 Prompt Customization (Priority: MEDIUM)

Allow users to edit prompt templates:
- Add "Edit Prompt" button in phase view
- Show modal with textarea containing current prompt
- Save custom prompt to IndexedDB
- Reset to default option

### 13.3 Quality Scoring (Priority: LOW)

Automated scoring against 10 quality criteria:
- Parse final output
- Check for specificity, proof points, outcome focus, etc.
- Show score (0-100) with breakdown
- Suggest improvements

---

**Document Status:** ✅ Complete
**Last Updated:** 2024-12-15
**Next Review:** After V1 launch


