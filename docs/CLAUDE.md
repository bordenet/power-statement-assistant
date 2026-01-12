# AI Assistant Instructions for power-statement-assistant

**CRITICAL**: Read this file FIRST before working on this codebase.

**📐 Design Patterns**: See [DESIGN-PATTERNS.md](./DESIGN-PATTERNS.md) for architecture and coding patterns used across all genesis-tools repos.

---

## ⚠️ CRITICAL: Fix ALL Linting Issues Immediately

**MANDATE**: When you detect ANY linting issue in a file you're working with, you MUST fix it immediately - regardless of whether it was pre-existing or newly introduced.

- Do NOT note that issues are "pre-existing" and move on
- Do NOT defer fixing to a later step
- Do NOT push code with known linting issues
- Fix ALL issues in the file before committing

**Rationale**: Linting issues indicate code quality problems. Ignoring them because they existed before your changes still means shipping low-quality code. Every touch point is an opportunity to improve the codebase. Sweeping lint errors "under the rug" causes them to accumulate over time, making each round of changes worse than the last.

---

## 🎯 Core Principles

### 0. **MANDATORY: Reference Known-Good Implementations FIRST**

**⚠️ BEFORE implementing ANY feature, reference these working examples:**

#### Primary References:
1. **[product-requirements-assistant](https://github.com/bordenet/product-requirements-assistant)** ⭐ **PRIMARY**
   - Dark mode toggle (CRITICAL - always broken without Tailwind config)
   - Workflow architecture (3-phase mock/manual pattern)
   - Form-to-prompt pattern
   - Deployment scripts (compact mode, quality gates)
   - Setup scripts (fast, resumable, smart caching)

2. **[one-pager](https://github.com/bordenet/one-pager)** ⭐ **SECONDARY**
   - Same workflow pattern, different document type
   - UI patterns (related projects dropdown, privacy notice)
   - Lessons learned from Genesis implementation

#### When to Reference:
**✅ ALWAYS check these implementations when:**
- Implementing dark mode (check `docs/index.html` lines 9-15 for Tailwind config)
- Setting up workflow phases (check `js/workflow.js`)
- Creating forms (check `js/app.js` renderPhase1Form)
- Writing scripts (check `scripts/deploy-web.sh`, `scripts/setup-macos.sh`)
- Adding UI patterns (check HTML/CSS patterns)
- **ANY TIME you're unsure how to implement something**

#### Create Reverse-Integration Notes:
**📝 MANDATORY: When you reference the implementations to solve a problem:**

1. Document it in `REVERSE-INTEGRATION-NOTES.md`
2. Note what Genesis template was missing
3. Suggest how to improve Genesis for next time

**Example**:
```markdown
## 2024-12-09: Dark Mode Toggle

**Problem**: Dark mode toggle didn't work initially.
**Solution**: Found Tailwind config in product-requirements-assistant/docs/index.html lines 9-15.
**Genesis Gap**: Templates should include this config by default.
**Recommendation**: Add Tailwind darkMode config to index-template.html.
```

### 1. **MANDATORY: Manual Deployment After CI Passes**

**ALL deployments MUST follow this 3-step process:**

```bash
# Step 1: Push changes to GitHub
git add .
git commit -m "feat: description of changes"
git push origin main

# Step 2: WAIT for CI to pass
# Check: https://github.com/bordenet/power-statement-assistant/actions
# ⚠️ DO NOT PROCEED until all checks are GREEN

# Step 3: Deploy ONLY after CI passes
./scripts/deploy-web.sh
```

**Why**:
- CI runs comprehensive quality gates (lint, test, coverage)
- Deploying before CI passes can ship broken code
- CI is the single source of truth for code quality

### 2. **ALWAYS Lint After Creating/Modifying Code**

**MANDATE**: After creating or modifying ANY file, run linting:

```bash
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix issues
```

**Why**: Linting catches bugs, enforces consistency, and prevents technical debt.

### 3. **ALWAYS Test After Creating/Modifying Tests**

**MANDATE**: After creating or modifying ANY test file, run tests:

```bash
NODE_OPTIONS=--experimental-vm-modules npm test
NODE_OPTIONS=--experimental-vm-modules npm run test:coverage
```

**Why**: Broken tests are worse than no tests. They create false confidence.

### 4. **ALWAYS Communicate What's Left**

**MANDATE**: After completing ANY task, proactively tell the user:

✅ **What you completed** (specific, measurable)
✅ **What's left to do** (if anything)
✅ **Quality metrics** (tests passing, coverage %, linting clean)

**Example**:
```
✅ Completed: Created workflow.js with 3-phase pattern
✅ Quality: 15/15 tests passing, 92% coverage, 0 lint errors
✅ What's Left: Need to create phase2.md prompt template
```

**Why**: This prevents miscommunication and ensures nothing is forgotten.

### 5. **NEVER Include Build Artifacts**

**MANDATE**: NEVER commit these directories/files:

- ❌ `node_modules/`
- ❌ `coverage/`
- ❌ `dist/`, `build/`
- ❌ `.DS_Store`
- ❌ `*.log`

**Why**: These bloat the repository and cause merge conflicts.

### 5. **NEVER Create Files Without Linting/Testing**

**MANDATE**: Every file you create must be:

1. ✅ Linted (`npm run lint`)
2. ✅ Tested (if applicable)
3. ✅ Verified to work

**Why**: Untested code is broken code. Unlinted code is inconsistent code.

---

## 📋 Project-Specific Workflow

This project implements a **3-phase adversarial workflow** for creating power statements:

### Phase 1: Initial Draft (Claude)
- User fills form with power statement details
- App generates prompt for Claude
- User copies prompt → Claude → pastes response back

### Phase 2: Critique & Improvement (Gemini)
- App generates adversarial prompt for Gemini
- Includes Phase 1 output for critique
- User copies prompt → Gemini → pastes improved version back

### Phase 3: Final Synthesis (Claude)
- App generates synthesis prompt for Claude
- Includes BOTH Phase 1 and Phase 2 outputs
- User copies prompt → Claude → pastes final version back

**CRITICAL**: The app generates PROMPTS, not AI responses. Users manually copy/paste between the app and external AI services.

---

## 🛠️ Development Commands

```bash
# Linting
npm run lint              # Check for issues
npm run lint:fix          # Auto-fix issues

# Testing
NODE_OPTIONS=--experimental-vm-modules npm test
NODE_OPTIONS=--experimental-vm-modules npm run test:coverage

# Deployment
./scripts/deploy-web.sh   # Lint + test + deploy to GitHub Pages
```

---

## 📚 Key Files

- `js/workflow.js` - Phase orchestration and prompt generation
- `js/app.js` - UI rendering and event handling
- `js/storage.js` - IndexedDB persistence
- `prompts/phase1.md` - Phase 1 prompt template
- `prompts/phase2.md` - Phase 2 prompt template
- `prompts/phase3.md` - Phase 3 prompt template
- `templates/power-statement-template.md` - Document template

---

**Remember**: Quality over speed. Lint, test, communicate.
