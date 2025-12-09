# Reference Implementations

**⚠️ CRITICAL: Study these BEFORE implementing ANY Genesis project!**

The reference implementations contain ALL the answers to common questions:
- How dark mode toggle works (Tailwind config)
- How prompts are structured and loaded
- How form data flows through phases
- How deployment scripts work (compact mode)
- How setup scripts work (fast, resumable)
- How defensive coding is implemented

**DO NOT skip this step!** Studying the reference implementations will save hours of debugging.

## 1. Product Requirements Assistant (3-Phase PRD Generator)
**Repository**: https://github.com/bordenet/product-requirements-assistant
**Live Demo**: https://bordenet.github.io/product-requirements-assistant/

### What to Study:
1. **Workflow Architecture** (`js/workflow.js`):
   - 3-phase workflow with mixed mock/manual modes
   - Phase 1: Mock mode (AI in-app)
   - Phase 2: Manual mode (user copies to Gemini)
   - Phase 3: Mock mode (AI in-app)

2. **Prompt Management** (`prompts/` directory):
   - Prompts stored as markdown files
   - Loaded asynchronously via fetch API
   - Template variable replacement: `{variableName}`

3. **Form-to-Prompt Pattern** (`js/app.js` - renderPhase1Form):
   - Phase 1 presents a form
   - Form fields map to document template sections
   - Validation before prompt generation
   - Form data stored in project.formData

4. **Template Abstraction** (`templates/` directory):
   - Document template stored separately from code
   - Easy to modify without touching JavaScript
   - Template structure guides form field design

5. **Defensive Coding**:
   - Input validation and sanitization
   - Error handling for missing data
   - User-friendly error messages
   - Graceful degradation

### Key Files to Review:

#### 🎨 **Dark Mode (CRITICAL - Always Broken Without This!)**
- **`docs/index.html`** (lines 9-15) - ⭐ **Tailwind dark mode configuration**
  ```html
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
      tailwind.config = {
          darkMode: 'class'
      }
  </script>
  ```
  **WHY**: Without this, dark mode toggle won't work (Tailwind defaults to 'media' mode)

- **`docs/js/app.js`** (lines 145-165) - ⭐ **Dark mode toggle functions**
  - `loadTheme()` - Load saved theme on page load (prevents flash)
  - `toggleTheme()` - Toggle between light/dark mode
  - Event listener setup for theme-toggle button

#### 📋 **Workflow Architecture**
- `js/workflow.js` - Phase definitions, prompt generation, data flow
- `js/app.js` - UI rendering, form handling, phase transitions
- `prompts/phase1.md` - Example prompt with template variables
- `templates/prd-template.md` - Document structure
- `tests/workflow.test.js` - How to test async prompt loading

#### 🚀 **Deployment & Setup Scripts**
- **`scripts/deploy-web.sh`** - ⭐ **REFERENCE IMPLEMENTATION for compact mode deployment**
  - Compact mode (single line updates, no spam)
  - Quality gates (lint, test, coverage)
  - Git output redirection in compact mode
  - Running timer display

- **`scripts/setup-macos.sh`** - ⭐ **REFERENCE IMPLEMENTATION for setup scripts**
  - Fast, resumable setup (~5-10 seconds on subsequent runs)
  - Smart caching (only installs missing packages)
  - Compact mode output
  - Force reinstall flag (`-f`)

- **`scripts/setup-linux.sh`** - Linux setup script example
- **`scripts/setup-windows-wsl.sh`** - Windows WSL setup script example
- **`scripts/setup-codecov.sh`** - Code coverage setup example

#### 🎯 **UI Patterns**
- **Related Projects Dropdown** (`docs/index.html` lines 37-53)
  - Lightning bolt icon button
  - Dropdown menu with related tools
  - Click outside to close

- **Privacy Notice** (`docs/index.html` lines 54-74)
  - Dismissible banner
  - Stored in localStorage
  - Blue info styling

## 2. One-Pager Assistant (3-Phase One-Pager Generator)
**Repository**: https://github.com/bordenet/one-pager
**Live Demo**: https://bordenet.github.io/one-pager/

### What to Study:
- Same 3-phase workflow pattern as PRD Assistant
- Different document template (one-pager vs PRD)
- 9 form fields mapping to one-pager sections
- Example of adapting the pattern to different document types

## 3. Hello World (2-Phase Simple Example)
**Location**: `genesis/examples/hello-world/`

### What to Study:
- Simpler 2-phase workflow
- Basic project structure
- Minimal viable implementation
- Good starting point for understanding the basics

---

## ⚠️ CRITICAL: Module System - Browser ES6 Modules

**MANDATORY FOR ALL BROWSER-BASED PROJECTS**

All Genesis web-app templates use **ES6 modules** (`import`/`export`) for browser compatibility. This section explains the correct patterns and common pitfalls.

### ✅ Correct Pattern (No Bundler Needed)

**Step 1: HTML loads modules with `type="module"`**
```html
<!-- index.html -->
<script type="module" src="js/storage.js"></script>
<script type="module" src="js/ui.js"></script>
<script type="module" src="js/app.js"></script>
```

**Step 2: JavaScript files use ES6 import/export**
```javascript
// storage.js
export class Storage {
    async init() { /* ... */ }
}
export const storage = new Storage();

// ui.js
export function showToast(message, type) { /* ... */ }
export function toggleTheme() { /* ... */ }

// app.js
import { storage } from './storage.js';
import { showToast, toggleTheme } from './ui.js';

async function init() {
    await storage.init();
    showToast('App ready!', 'success');
}
```

**Step 3: Event listeners are explicitly attached**
```javascript
// ui.js
export function toggleTheme() {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Attach listener immediately (CRITICAL!)
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}
```

### ❌ Incorrect Pattern (CommonJS - Breaks in Browser)

**What NOT to do:**
```javascript
// ❌ WRONG: Using CommonJS in browser code
const { storage } = require('./storage.js');  // Error: require is not defined
module.exports = { showToast };               // Error: module is not defined

// ❌ WRONG: Defining function but not attaching listener
export function toggleTheme() { /* ... */ }
// Missing: addEventListener() - button won't work!

// ❌ WRONG: Unreplaced template variables
const DB_NAME = '{{DB_NAME}}';  // Still a template variable!
```

### 🎯 Best Practice: ES6 Modules (No Bundler)

**Why ES6 modules are preferred:**
1. ✅ Native browser support (all modern browsers)
2. ✅ No build step required (faster development)
3. ✅ Parallel module loading (better performance)
4. ✅ Proper dependency management
5. ✅ Easier debugging (source maps not needed)

**When to use a bundler:**
- Only if you need code splitting for large apps
- Only if you need to support very old browsers
- Only if you need advanced optimizations

**For Genesis projects:** Start with ES6 modules. Only add a bundler if you have a specific need.

### Reference Implementations

**✅ Correct ES6 Module Usage:**

1. **product-requirements-assistant**
   - All `.js` files use `import`/`export`
   - No bundler needed for development or production
   - Event listeners properly attached in `setupGlobalEventListeners()`
   - See: `docs/js/app.js` lines 50-141

2. **architecture-decision-record** (Fixed)
   - Originally used CommonJS (broken)
   - Fixed to use ES6 modules
   - Added esbuild as temporary workaround (can be removed)
   - See: `js/storage.js` line 174 (`export const storage = new Storage()`)

### Common Failures and Solutions

| Symptom | Root Cause | Solution |
|---------|-----------|----------|
| "require is not defined" | CommonJS in browser | Replace `require()` with `import` |
| "module is not defined" | CommonJS exports | Replace `module.exports` with `export` |
| Buttons don't respond | Missing event listeners | Add `addEventListener()` calls |
| Dark mode doesn't work | Missing Tailwind config | Add `tailwind.config = { darkMode: 'class' }` |
| `{{VAR}}` in output | Template not replaced | Replace all `{{TEMPLATE_VAR}}` with actual values |
| Module not found | Missing `.js` extension | Always include `.js` in import paths |

### Validation Checklist

Before deploying ANY browser-based project:

- [ ] All `.js` files use `import`/`export` (no `require()` or `module.exports`)
- [ ] All import paths include `.js` extension (e.g., `'./storage.js'`)
- [ ] All DOM-handling functions have `addEventListener()` bindings
- [ ] All `{{TEMPLATE_VAR}}` replaced with actual values
- [ ] Tested in browser console (no "require is not defined" errors)
- [ ] All UI buttons/controls are responsive
- [ ] Dark mode toggle works (if applicable)

### Testing Module System

**Quick validation:**
```bash
# Check for CommonJS in browser code
grep -r "module\.exports\|require(" js/
# Should return: nothing (no matches)

# Check for unreplaced template variables
grep -r "{{[A-Z_]*}}" .
# Should return: nothing (all variables replaced)

# Test in browser
# 1. Open browser console
# 2. Load the app
# 3. Check for errors (should be none)
# 4. Test all buttons/toggles (should work)
```

**Real-world validation:**
1. Bootstrap a fresh project from templates
2. Load in browser WITHOUT bundler (just open index.html via http server)
3. Verify no console errors
4. Test all UI features (buttons, toggles, forms)
5. Verify dark mode works
6. Verify data persists (IndexedDB)

---

