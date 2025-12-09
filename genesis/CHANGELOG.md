# Genesis Changelog

All notable changes to the Genesis template system will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Added - Phase C: UI Module Test Coverage (2025-12-01)

**ENHANCEMENT**: Comprehensive test coverage for all remaining UI modules.

**New Test Files**:

1. **`ai-mock-ui.test-template.js`** (150 lines, 10 tests)
   - Tests `initMockModeUI()` - Creates mock mode toggle UI
   - Tests `toggleMockMode()` - State management and localStorage
   - Tests `updateMockModeUI()` - UI state updates
   - Tests production environment detection (hides UI in production)
   - Tests localStorage persistence across sessions

2. **`project-view.test-template.js`** (150 lines, 12 tests)
   - Tests `renderProjectView()` - Valid/invalid project rendering
   - Tests `renderPhaseIndicator()` - All phases, active/completed states
   - Tests `handlePhaseNavigation()` - Click handling and restrictions
   - Tests phase completion logic
   - Tests export button rendering
   - Tests back button functionality

3. **`views.test-template.js`** (150 lines, 13 tests)
   - Tests `renderProjectsList()` - Empty state and multiple projects
   - Tests `renderNewProjectForm()` - With/without existing data
   - Tests `renderEmptyState()` - Empty state rendering
   - Tests project card click handlers
   - Tests form validation and button states
   - Tests date formatting

**Test Coverage Improvement**:
- **Before**: 9/12 modules tested (75%)
- **After**: 12/12 modules tested (100%)

**Modules Now Fully Tested**:
- ✅ storage (database operations)
- ✅ router (navigation)
- ✅ app (initialization)
- ✅ workflow (phase management)
- ✅ projects (CRUD operations)
- ✅ ui (theme, toasts)
- ✅ same-llm-adversarial (AI strategy)
- ✅ ai-mock (mock responses)
- ✅ ai-mock-ui (mock mode toggle) - NEW
- ✅ project-view (workflow view) - NEW
- ✅ views (list/form rendering) - NEW
- ✅ phase2-review (review generation)
- ✅ phase3-synthesis (ADR synthesis)

All Genesis templates now have comprehensive test coverage for both core logic and UI components.

### Added - Phase 3: Validation Hardening (2025-12-01)

**ENHANCEMENT**: Comprehensive validation hardening with accessibility, visual regression, and linting.

**Accessibility Validation** (Added to `validate-module-system.sh`):

1. **Check 7/9: Images Without Alt Text**
   - Scans all HTML files for `<img>` tags missing `alt` attributes
   - Warns about accessibility issues (non-blocking)
   - Provides fix examples with proper alt text

2. **Check 8/9: Buttons Without Accessible Labels**
   - Detects icon-only buttons that may need `aria-label`
   - Identifies `<button>` tags with `<svg>` or `<i>` without labels
   - Warns about potential screen reader issues (non-blocking)

3. **Check 9/9: Semantic HTML Structure**
   - Verifies presence of `<header>`, `<main>`, `<footer>` elements
   - Promotes better document structure for accessibility
   - Warns about missing semantic elements (non-blocking)

**Visual Regression Testing** (`visual-regression.test-template.js`):

- 9 comprehensive Playwright visual regression tests
- Tests light mode, dark mode, responsive viewports
- Tests empty states, project lists, workflow views
- Screenshot comparison with `--update-snapshots` flag
- Animations disabled for consistent screenshots
- Full-page and component-level screenshot support

**ESLint Configuration** (`.eslintrc-template.json`):

- Browser environment with ES2021 support
- **Enforces ES6 modules**: Blocks `require`, `module.exports`, `exports`
- **Blocks Node.js globals**: `process`, `__dirname`, `__filename`
- Code style rules: single quotes, semicolons, 2-space indent
- Space and formatting rules for consistency
- Test file overrides for Vitest environment
- Ignores node_modules, dist, build, coverage

**Package Updates** (`package-template.json`):

- **Switched to Vitest** (from Jest) for faster, better ES6 support
- Added `test:visual` script for visual regression tests
- Added `validate` and `validate:full` scripts
- Updated dependencies: `vitest`, `@vitest/coverage-v8`, `happy-dom`
- Configured Vitest with coverage settings (text, json, html reporters)
- Removed Jest and jsdom dependencies

**Validation Improvements**:

- Validator now runs 9 checks (was 6): module system + accessibility
- All accessibility checks are warnings (non-blocking) to avoid false positives
- ESLint catches Node.js globals and CommonJS at development time
- Visual regression catches UI regressions before deployment

### Added - Phase 2: Template Audit & Test Coverage (2025-12-01)

**IMPROVEMENT**: Comprehensive template audit and test coverage improvements.

**Audit Results**:
- ✅ No incomplete stub implementations found
- ✅ No TODO/FIXME requiring immediate action
- ✅ All placeholder text is legitimate (form inputs, documentation)
- ✅ All error handling is appropriate
- ⚠️  Test coverage gaps identified and addressed

**Test Coverage Improvements**:

1. **Router Module Tests** (`testing/router.test-template.js`)
   - 150 lines, 15 comprehensive test cases
   - Tests `navigateTo()` for all route types (home, new-project, project)
   - Tests `initRouter()` hashchange listener setup
   - Tests hash parsing and route parameter extraction
   - Tests `getCurrentRoute()` state management
   - Tests error handling for invalid routes
   - Coverage: All exported functions tested

2. **App Module Tests** (`testing/app.test-template.js`)
   - 150 lines, 10 comprehensive test cases
   - Tests initialization sequence (storage → prompts → router)
   - Tests loading indicator lifecycle (show → hide)
   - Tests error handling during initialization
   - Tests event listener setup (theme toggle, export, import, dropdown)
   - Tests graceful degradation on component failures
   - Coverage: Core initialization and event binding tested

**Coverage Metrics**:
- Before Phase 2: 7/12 modules tested (58%)
- After Phase 2: 9/12 modules tested (75%)
- Remaining untested: `ai-mock-ui`, `project-view`, `views` (UI-heavy, lower priority)

**Validation**:
- All new tests follow Vitest conventions
- All tests use proper mocking for dependencies
- All tests include setup/teardown with `beforeEach`
- All tests verify both success and error paths

### Added - Module System Validation (2025-12-01)

**CRITICAL FIX**: Prevents CommonJS/ES6 module system mismatches that break browser-based projects.

**Problem**: Genesis templates use ES6 modules (`import`/`export`) for browser compatibility, but AI assistants sometimes generate CommonJS (`require()`/`module.exports`) which fails in browsers with `<script type="module">`.

**Solution**: Comprehensive validation and documentation to enforce ES6-only code generation.

#### New Features

1. **Module System Validator Script** (`scripts/validate-module-system.sh`)
   - Detects CommonJS `require()` statements in browser code
   - Detects CommonJS `module.exports` in browser code
   - Checks for unreplaced template variables (`{{VAR}}`)
   - Verifies ES6 imports/exports are present
   - Color-coded output with fix suggestions
   - Exit code 0 for pass, 1 for fail (CI-friendly)

2. **Integrated Validation in Setup Scripts**
   - `setup-macos-web-template.sh` now validates module system
   - Fails fast with helpful error messages
   - Runs after linting, before completion
   - Zero performance impact (fast grep checks)

3. **Enhanced Documentation**
   - **`01-AI-INSTRUCTIONS.md`**: New "Module System Validation" section (113 lines)
     - Mandatory checklist for all browser-based projects
     - ES6 vs CommonJS comparison table
     - Event listener attachment requirements
     - Template variable validation
     - Common failures and fixes table
   - **`REFERENCE-IMPLEMENTATIONS.md`**: New "Module System" section (165 lines)
     - Correct vs incorrect patterns with examples
     - When to use bundlers (rarely)
     - Validation checklist
     - Real-world testing procedures
   - **`TROUBLESHOOTING.md`**: Two new sections (203 lines)
     - "Module System Errors (require is not defined)"
     - "Event Listeners Not Working"
     - Step-by-step solutions with code examples
   - **`index-template.html`**: Enhanced ES6 module documentation
     - Comprehensive comment block explaining `type="module"`
     - Links to reference implementations

#### Template Fixes

1. **`same-llm-adversarial-template.js`**
   - Converted from CommonJS to ES6 modules
   - Replaced `module.exports` with `export`
   - Added critical module system warning comment
   - Last template to be converted - all templates now ES6-only

#### Validation Results

- ✅ Genesis templates: All pass validation (ES6 modules only)
- ✅ Test project: Bootstrapped and validated successfully
- ❌ architecture-decision-record: Correctly fails (uses CommonJS)

#### References

- Design Document: `docs/plans/GENESIS-MODULE-SYSTEM-FIX.md`
- Commits: 0389cd8, 4eea835, 9f5c90b, f59e09c, d72ceea, 143af99, 0805c3b

---

### Added - Node.js Globals Validation (2025-12-01)

**CRITICAL FIX**: Prevents `process is not defined` errors in browser deployments.

**Problem**: AI-generated code uses Node.js globals (`process.env`, `__dirname`, `__filename`) that don't exist in browsers, causing runtime errors.

**Solution**: Enhanced validation and browser-safe patterns.

#### Enhanced Features

1. **Module System Validator Enhancement** (`scripts/validate-module-system.sh`)
   - **Check 3/6**: Node.js globals detection
   - Detects unguarded `process.env` at variable declaration level
   - Detects unguarded `__dirname` and `__filename` usage
   - Smart context-aware detection (allows properly guarded usage)
   - Distinguishes between unsafe direct access and safe typeof guards

2. **Template Fix** (`same-llm-adversarial-template.js`)
   - Replaced direct `process.env` access with `getEnvVar()` helper
   - Browser-safe: checks `typeof process !== 'undefined'`
   - Fallback to `window.AI_CONFIG` for browser environments
   - Works in both Node.js and browser contexts

3. **AI Instructions Enhancement** (`01-AI-INSTRUCTIONS.md`)
   - **New STEP 4**: Never Use Node.js Globals Directly (45 lines)
   - Shows correct vs incorrect patterns
   - Lists all Node.js globals to avoid
   - Browser-safe alternatives documented
   - Added to mandatory validation checklist

4. **Troubleshooting Documentation** (`TROUBLESHOOTING.md`)
   - **New section**: Node.js Globals in Browser (115 lines)
   - Symptoms, causes, solutions for `process.env` errors
   - Code examples for all Node.js globals
   - Browser alternatives table (process.cwd → window.location, etc.)
   - Prevention strategies

#### Node.js Globals Covered

| Node.js Global | Browser Alternative |
|----------------|---------------------|
| `process.env` | `window.AI_CONFIG` or `localStorage` |
| `process.cwd()` | Relative paths or `window.location` |
| `process.platform` | `navigator.platform` or `navigator.userAgent` |
| `__dirname` | `import.meta.url` or relative paths |
| `__filename` | `import.meta.url` |
| `Buffer` | `Uint8Array` or `TextEncoder/TextDecoder` |
| `global` | `window` or `globalThis` |
| `require.resolve()` | Relative import paths |

#### Validation Results

- ✅ Genesis templates: Pass (properly guarded usage)
- ❌ architecture-decision-record: Correctly fails (unguarded usage)

#### References

- User Feedback: architecture-decision-record debugging session
- Commit: 3a8ff67

---

### Changed - Footer Link Styling (2025-12-01)

**Improvement**: Make footer links more visible and clearly clickable.

**Before**: Gray text with subtle hover effect
- `class="hover:text-gray-700 dark:hover:text-gray-200"`
- Low visibility, looks like plain text
- User feedback: "Gray GitHub text is pretty stupid looking"

**After**: Blue text with underline on hover
- `class="text-blue-600 dark:text-blue-400 hover:underline"`
- Clearly indicates clickable links
- Matches architecture-decision-record styling
- Better accessibility

**Files Changed**:
- `templates/web-app/index-template.html` (footer links)

**References**:
- Commit: bef86c2

---

### Changed - Genesis Bootstrapper Improvements (GameWiki Feedback)

- **Renamed `AI-EXECUTION-CHECKLIST.md` to `00-AI-MUST-READ-FIRST.md`** - Sorts to top alphabetically so AI assistants can't miss it
- **Added prominent warning banner to START-HERE.md** - Points to checklist with real failure examples
- **Added "Quick Verification Before Committing" section to START-HERE.md** - Bash commands to catch common mistakes
- **Added "Minimum Viable Project Checklist" to START-HERE.md** - Table of 10 critical files that must exist
- **Created `scripts/validate-genesis-output.sh`** - Validation script that checks for:
  - genesis/ directory still exists (should be deleted)
  - Unreplaced {{VARIABLES}} in files
  - README.md is a stub (<50 lines)
  - Missing CLAUDE.md, .gitignore, scripts/ directory
- **Updated CI template with Genesis cleanup check** - Fails build if genesis/ exists or template variables remain
- **Added MUST-ASK peer site navigation question** - Ensures AI asks if new project should link to related/peer sites
  - Added to Step 2 in both START-HERE.md and 00-AI-MUST-READ-FIRST.md
  - Includes complete code examples for header dropdown and footer links
  - References One-Pager implementation as pattern to follow

### Fixed - Script Path and GitHub Pages Architecture Issues

- **Added REPO_ROOT pattern to all shell script templates** - Scripts now work from any directory
  - `deploy-web.sh.template` - Added REPO_ROOT detection and cd
  - `validate-template.sh` - Added REPO_ROOT detection and cd
  - `setup-macos-template.sh` - Added REPO_ROOT detection and cd
  - `setup-linux-template.sh` - Added REPO_ROOT detection and cd
  - `setup-windows-wsl-template.sh` - Added REPO_ROOT detection and cd
  - `setup-macos-web-template.sh` - Added REPO_ROOT detection and cd
  - `setup-codecov-template.sh` - Added REPO_ROOT detection and cd
  - `validate-genesis-setup-template.sh` - Added REPO_ROOT detection and cd
  - `lib/common-template.sh` - Added REPO_ROOT fallback detection
- **Added MUST-ASK GitHub Pages architecture question** - Prevents file duplication drift
  - Architecture A: Serve from /docs (deploy script syncs root → docs/)
  - Architecture B: Serve from / root (RECOMMENDED - no sync, no drift)
  - Added to Step 2 in both START-HERE.md and 00-AI-MUST-READ-FIRST.md
  - Updated Step 6 with architecture-specific instructions
- **Updated .gitignore template for Architecture B** - Blocks docs/js/, docs/css/, docs/index.html
  - Prevents accidental duplication of app files in docs/ directory
  - Uses conditional template syntax for Architecture B projects

### Added - Comprehensive Audit (Pass 1)

- **Comprehensive Genesis Audit** - Top-to-bottom review to prevent deployment issues
  - Created `GENESIS-AUDIT-PASS-1.md` - Complete audit findings and action plan
  - Analyzed all 140 files in genesis/ directory
  - Identified and fixed 14 orphaned template files
  - Verified all user-reported pain points are fixed (setup scripts, dark mode, navigation)
- **New Recommended Files** - Added high-value optional files to Genesis
  - `.env.example` template - Documents required environment variables
  - `CONTRIBUTING.md` template - Contribution guidelines for open source projects
  - Pre-commit hook template - Quality gate enforcement (runs linting before commits)
- **Optional Files Documentation** - New Section 3.7 in START-HERE.md
  - Separate linting workflow (optional - ci.yml already has linting)
  - Non-web macOS setup script (for backend/CLI projects)
  - Validation script (project structure validation)
  - Playwright E2E testing config (advanced browser testing)
  - Documentation templates (architecture, deployment, development, testing)
- **Same-LLM Adversarial Configuration System** - Automatically detects when Phase 1 and Phase 2 use the same LLM and applies Gemini personality simulation to maintain adversarial tension
  - `templates/web-app/js/same-llm-adversarial-template.js` - Complete implementation with 4 core classes
  - `templates/testing/same-llm-adversarial.test-template.js` - Comprehensive test suite with 19 test scenarios
  - `SAME-LLM-ADVERSARIAL-GUIDE.md` - Complete documentation and usage guide
  - Detection methods: Provider/model match, URL match (LibreChat), endpoint match (localhost/corporate)
  - Forget clause detection and handling (5 patterns)
  - Gemini personality simulation template
  - Quality validation metrics (semantic difference, adversarial language, challenge count)
  - Critical for corporate deployments using single-endpoint LLM platforms
- Verification script (`scripts/verify-templates.sh`) to check template completeness
- End-to-end test script (`scripts/test-genesis.sh`) to validate Genesis execution
- Testing procedure documentation (`TESTING-PROCEDURE.md`)
- This changelog file

### Changed

- **START-HERE.md** - Added 3 recommended files and optional files section
  - Added `.env.example` copy instruction (Section 3.1)
  - Added `CONTRIBUTING.md` copy instruction (Section 3.1)
  - Added pre-commit hook installation (Section 3.4)
  - Added Section 3.7 "Optional Files (Advanced)" with 5 categories
  - Updated verification checklist (Section 3.6) to include recommended files
- **AI-EXECUTION-CHECKLIST.md** - Updated to match START-HERE.md changes
  - Added `.env.example` and `CONTRIBUTING.md` to Pre-Execution Verification
  - Added pre-commit hook to Scripts section
  - Added Section 3.7 for optional files decision-making
  - Updated verification checklist to include recommended files
- Template variable replacement now includes `{{DOCUMENT_TYPE}}` in JavaScript and test files
- Verification script now checks for 49 template files (up from 46)

### Fixed

- **User-Reported Pain Points** - All verified fixed
  - ✅ Setup/deployment scripts: All referenced in START-HERE.md Section 3.4
  - ✅ Dark mode toggle: Fully implemented with Tailwind config + functions
  - ✅ Navigation: Dropdown menu fully implemented with toggle logic
- **Orphaned Template Files** - 14 files were not referenced in START-HERE.md
  - 3 high-value files now RECOMMENDED (pre-commit hook, .env.example, CONTRIBUTING.md)
  - 11 files now documented as OPTIONAL in Section 3.7

---

## [1.0.0] - 2025-11-21

### Summary

Four-pass comprehensive review that identified and fixed 27 gaps in Genesis templates. Now production-ready with 92% confidence.

### Added - Pass 1 (17 gaps fixed)

- Setup scripts for Linux, Windows WSL, and Codecov
- `.eslintrc.json` template
- `codecov.yml` template
- Pre-commit hook installation script
- `prompts/` directory with phase1, phase2, phase3 templates
- `document-templates/` directory structure
- Style guide references in CLAUDE.md
- Phase configuration explanation
- Comprehensive template file checklist in START-HERE.md
- Updated AI-EXECUTION-CHECKLIST.md

### Fixed - Pass 1

- Contradictory instructions (examples vs templates)
- Variable replacement instructions made clear
- Jest configs now from templates (not examples)
- Unreachable template files now accessible
- Examples vs templates inconsistency resolved

### Added - Pass 2 (6 gaps fixed)

- `css/styles.css` copy instruction (CRITICAL - index.html references it)
- `data/` directory guidance
- Specific customization instructions with file names and line numbers
- Document template guidance with concrete examples
- `css/styles.css` to Step 3.6 checklist
- Improved verification command using `find`

### Fixed - Pass 2

- Missing css/styles.css caused 404 errors and broken styling
- Missing data/ directory caused inconsistency with reference implementations
- Ambiguous "customize" instructions now specific
- No document template guidance now has concrete examples

### Added - Pass 3 (1 CRITICAL gap fixed)

- GitHub Actions workflows copy instructions in START-HERE.md Step 3.1
- `.github/workflows/ci.yml` to Step 3.6 checklist
- Workflow verification steps in AI-EXECUTION-CHECKLIST.md
- Warning comments in README-template.md about workflow dependency
- GENESIS-CRITICAL-GITHUB-WORKFLOWS-GAP.md analysis document

### Fixed - Pass 3

- **CRITICAL**: Missing GitHub Actions workflows caused:
  - No CI/CD pipeline
  - Broken badges (showed "unknown" or 404)
  - No code coverage tracking
  - No automated deployment
  - No quality gates
- START-HERE.md never told AI to copy `.github/workflows/` files
- Badges in README referenced non-existent workflows

### Added - Pass 4 (3 gaps fixed)

- `.nojekyll` file creation in START-HERE.md Step 3.2
- `.nojekyll` to Step 3.6 checklist
- `.nojekyll` to AI-EXECUTION-CHECKLIST.md
- GitHub Pages "GitHub Actions" source configuration in Step 6
- Workflow dependency warning in ci-template.yml
- Clear END IF labels in ci-template.yml
- GENESIS-ADDITIONAL-GAPS-ANALYSIS.md analysis document

### Fixed - Pass 4

- Workflow dependency chain: `coverage` job now nested inside `test` conditional
- GitHub Pages configuration mismatch: Instructions now say "GitHub Actions" not "Deploy from a branch"
- Missing `.nojekyll` file: Now created to improve deployment speed

### Documentation

- Created GENESIS-GAP-ANALYSIS.md (Pass 1)
- Created GENESIS-IMPLEMENTATION-PLAN.md (Pass 1)
- Created GENESIS-REVIEW-AND-REFINEMENTS.md (Pass 1)
- Created GENESIS-FINAL-GAP-ANALYSIS.md (Pass 2)
- Created GENESIS-READY-FOR-PRODUCTION.md (Pass 2)
- Created GENESIS-CRITICAL-GITHUB-WORKFLOWS-GAP.md (Pass 3)
- Created GENESIS-THIRD-PASS-COMPLETE.md (Pass 3)
- Created GENESIS-ADDITIONAL-GAPS-ANALYSIS.md (Pass 4)
- Created GENESIS-RETROSPECTIVE.md (Post-completion)

### Metrics

- **Total Passes**: 4
- **Total Gaps Fixed**: 27 (10 CRITICAL, 13 MEDIUM, 4 LOW)
- **Commits Pushed**: 13
- **Files Modified**: 15+
- **Files Created**: 11
- **Confidence Level**: 92%

---

## [0.1.0] - 2025-11-20 (Pre-review)

### Initial State

- Basic Genesis template structure
- Reference implementations: one-pager, product-requirements-assistant
- Dark mode fix applied
- Reverse-integration tracking system created

### Known Issues (Pre-review)

- Missing setup scripts
- Missing config files
- Contradictory instructions
- Unreachable template files
- Missing GitHub Actions workflows (discovered later)

---

## Key Learnings

### What Worked

- Structured, multi-pass approach
- Detailed gap analysis documents
- User feedback integration
- Incremental improvement
- Comprehensive documentation

### What Didn't Work

- Overconfidence after second pass
- Insufficient end-to-end verification
- Missed workflow dependency analysis
- Configuration inconsistencies
- Missing best practices initially

### Critical Insight

**User feedback is gold.** The most critical gap (GitHub workflows) was only discovered when a user reported broken badges on their first real project. No amount of theoretical analysis replaces real-world testing.

---

## Future Improvements

### Planned

- Automated tests for Genesis templates
- Quarterly review process
- Genesis metrics dashboard
- Video walkthrough for AI assistants
- Troubleshooting guide

### Under Consideration

- Additional workflow templates (deploy-web.yml, release.yml)
- More comprehensive documentation templates
- Platform-specific optimizations
- Integration with other tools

---

## Contributing

When making changes to Genesis:

1. Update this changelog
2. Run verification script: `./genesis/scripts/verify-templates.sh`
3. Run end-to-end test: `./genesis/scripts/test-genesis.sh`
4. Follow testing procedure: See `TESTING-PROCEDURE.md`
5. Update documentation as needed
6. Create detailed commit messages

---

## Links

- [Genesis Repository](https://github.com/bordenet/genesis)
- [Reference: one-pager](https://github.com/bordenet/one-pager)
- [Reference: product-requirements-assistant](https://github.com/bordenet/product-requirements-assistant)
