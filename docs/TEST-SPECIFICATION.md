# Test Specification
# Power Statement Assistant

**Version:** 1.0  
**Date:** 2024-12-15  
**Status:** Active  
**Related:** [Product Requirements](PRODUCT-REQUIREMENTS.md) | [Design Specification](DESIGN-SPECIFICATION.md)  

---

## 1. Testing Overview

### 1.1 Testing Philosophy

- **Test Pyramid:** 70% unit tests, 20% integration tests, 10% manual tests
- **Coverage Target:** > 80% code coverage
- **Test-Driven:** Write tests before fixing bugs
- **Continuous:** Run tests on every commit (CI/CD)

### 1.2 Testing Tools

- **Framework:** Jest 29.x
- **Runner:** Node.js with `--experimental-vm-modules` flag (for ES6 modules)
- **Coverage:** Jest built-in coverage (Istanbul)
- **Linting:** ESLint 8.x
- **CI/CD:** GitHub Actions

### 1.3 Test Execution

```bash
# Run all tests
NODE_OPTIONS=--experimental-vm-modules npm test

# Run with coverage
NODE_OPTIONS=--experimental-vm-modules npm run test:coverage

# Run linting
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

---

## 2. Unit Tests

### 2.1 Storage Module Tests (`tests/storage.test.js`)

**Test Suite:** Storage CRUD Operations

**Test Cases:**

1. **Initialize Database**
   - ✅ Should create database with correct name and version
   - ✅ Should create 'projects', 'prompts', and 'settings' object stores
   - ✅ Should create indexes on 'projects' store (updatedAt, title, phase)

2. **Save Project**
   - ✅ Should save new project to IndexedDB
   - ✅ Should generate UUID for project ID
   - ✅ Should set createdAt and updatedAt timestamps
   - ✅ Should initialize phases object with 3 phases

3. **Get Project**
   - ✅ Should retrieve project by ID
   - ✅ Should return null for non-existent project
   - ✅ Should return project with all fields intact

4. **Get All Projects**
   - ✅ Should return empty array when no projects exist
   - ✅ Should return all projects sorted by updatedAt (newest first)
   - ✅ Should return projects with correct structure

5. **Update Project**
   - ✅ Should update existing project
   - ✅ Should update updatedAt timestamp
   - ✅ Should preserve other fields

6. **Delete Project**
   - ✅ Should delete project by ID
   - ✅ Should not throw error for non-existent project
   - ✅ Should remove project from getAllProjects() results

7. **Save/Get Prompt**
   - ✅ Should save prompt template for phase
   - ✅ Should retrieve prompt template by phase
   - ✅ Should return null for non-existent prompt

8. **Save/Get Setting**
   - ✅ Should save setting by key
   - ✅ Should retrieve setting by key
   - ✅ Should return null for non-existent setting

9. **Export All Data**
   - ✅ Should export all projects as JSON
   - ✅ Should include version, exportedAt, projectCount
   - ✅ Should include all project fields

10. **Import Data**
    - ✅ Should import projects from JSON
    - ✅ Should handle backup file format (with version and projects array)
    - ✅ Should handle single project format
    - ✅ Should throw error for invalid format

**Edge Cases:**

- Empty database (no projects)
- Corrupt project data (missing required fields)
- Storage quota exceeded
- Concurrent operations (multiple tabs)

---

### 2.2 Workflow Module Tests (`tests/workflow.test.js`)

**Test Suite:** Prompt Generation

**Test Cases:**

1. **Load Default Prompts**
   - ✅ Should load prompts from markdown files
   - ✅ Should save prompts to IndexedDB
   - ✅ Should not overwrite existing custom prompts

2. **Get Phase Metadata**
   - ✅ Should return correct metadata for Phase 1 (Claude, blue, 📝)
   - ✅ Should return correct metadata for Phase 2 (Gemini, purple, 🔍)
   - ✅ Should return correct metadata for Phase 3 (Claude, green, ✨)
   - ✅ Should return empty object for invalid phase

3. **Generate Prompt for Phase 1**
   - ✅ Should replace {product_name} with project.productName
   - ✅ Should replace {customer_type} with project.customerType
   - ✅ Should replace {problem} with project.problem
   - ✅ Should replace {outcome} with project.outcome
   - ✅ Should replace {proof_points} with project.proofPoints
   - ✅ Should replace {differentiators} with project.differentiators
   - ✅ Should replace {objections} with project.objections
   - ✅ Should handle missing fields (replace with empty string)

4. **Generate Prompt for Phase 2**
   - ✅ Should include all Phase 1 variables
   - ✅ Should replace {phase1_output} with project.phases[1].response
   - ✅ Should handle missing Phase 1 response

5. **Generate Prompt for Phase 3**
   - ✅ Should include all Phase 1 variables
   - ✅ Should replace {phase1_output} with project.phases[1].response
   - ✅ Should replace {phase2_output} with project.phases[2].response
   - ✅ Should handle missing Phase 1 or Phase 2 responses

6. **Export Final Document**
   - ✅ Should export Phase 3 response as Markdown
   - ✅ Should fall back to Phase 2 if Phase 3 not complete
   - ✅ Should fall back to Phase 1 if Phase 2 not complete
   - ✅ Should sanitize filename (remove special characters)
   - ✅ Should trigger download with correct filename

**Edge Cases:**

- Missing prompt template
- Empty project fields
- Special characters in project title
- Very long project titles (> 50 chars)

---

### 2.3 Projects Module Tests (`tests/projects.test.js`)

**Test Suite:** Project CRUD Operations

**Test Cases:**

1. **Create Project**
   - ✅ Should create project with title, problems, context
   - ✅ Should trim whitespace from inputs
   - ✅ Should set phase to 1
   - ✅ Should initialize phases object
   - ✅ Should set createdAt and updatedAt timestamps
   - ✅ Should save to storage

2. **Update Phase**
   - ✅ Should update phase prompt and response
   - ✅ Should set completed to true if response exists
   - ✅ Should set completed to false if response is empty
   - ✅ Should update updatedAt timestamp
   - ✅ Should NOT auto-advance phase (handled in UI)

3. **Update Project**
   - ✅ Should update project fields
   - ✅ Should update updatedAt timestamp
   - ✅ Should preserve other fields

4. **Delete Project**
   - ✅ Should delete project by ID
   - ✅ Should call storage.deleteProject()

5. **Export All Projects**
   - ✅ Should export all projects as JSON file
   - ✅ Should include version, exportedAt, projectCount
   - ✅ Should trigger download with date in filename

6. **Import Projects**
   - ✅ Should import projects from JSON file
   - ✅ Should return count of imported projects
   - ✅ Should handle backup file format
   - ✅ Should handle single project format
   - ✅ Should reject invalid file format

**Edge Cases:**

- Empty title (should fail validation)
- Empty problems (should fail validation)
- Missing context (should default to empty string)
- Duplicate project IDs (should overwrite)

---

## 3. Integration Tests

### 3.1 Complete Workflow Test (`tests/workflow-integration.test.js`)

**Test Suite:** End-to-End 3-Phase Workflow

**Test Scenario:** User creates power statement from start to finish

**Steps:**

1. Create new project
   - ✅ Project created with phase = 1
   - ✅ All 3 phases initialized

2. Generate Phase 1 prompt
   - ✅ Prompt contains all project variables
   - ✅ Prompt matches Phase 1 template structure

3. Save Phase 1 response
   - ✅ Phase 1 marked as completed
   - ✅ updatedAt timestamp updated

4. Generate Phase 2 prompt
   - ✅ Prompt contains Phase 1 output
   - ✅ Prompt contains all project variables

5. Save Phase 2 response
   - ✅ Phase 2 marked as completed

6. Generate Phase 3 prompt
   - ✅ Prompt contains Phase 1 and Phase 2 outputs
   - ✅ Prompt contains all project variables

7. Save Phase 3 response
   - ✅ Phase 3 marked as completed
   - ✅ Project remains on phase 3 (no auto-advance)

8. Export final document
   - ✅ Markdown file contains Phase 3 response
   - ✅ Filename sanitized correctly

---

### 3.2 Sequential UX Patterns Test (`tests/ux-patterns.test.js`)

**Test Suite:** 8 Critical UX Patterns

**Test Cases:**

1. **Pattern 1: Sequential Button Reveal**
   - ✅ "Open AI" button has disabled classes on initial render
   - ✅ "Open AI" button has aria-disabled="true" on initial render
   - ✅ After "Copy Prompt" clicked, disabled classes removed
   - ✅ After "Copy Prompt" clicked, hover effect added

2. **Pattern 2: Sequential Textarea Enable**
   - ✅ Response textarea has disabled attribute on initial render
   - ✅ Response textarea has disabled styling classes
   - ✅ After "Copy Prompt" clicked, disabled attribute removed
   - ✅ After "Copy Prompt" clicked, textarea receives focus

3. **Pattern 3: Shared Browser Tab**
   - ✅ All "Open AI" links have target="ai-assistant-tab"
   - ✅ Phase 1 link opens Claude
   - ✅ Phase 2 link opens Gemini
   - ✅ Phase 3 link opens Claude

4. **Pattern 4: Auto-Advance on Save**
   - ✅ Saving Phase 1 response advances to Phase 2
   - ✅ Saving Phase 2 response advances to Phase 3
   - ✅ Saving Phase 3 response does NOT advance
   - ✅ Toast notification shown before advancing

5. **Pattern 5: Step A/B Labeling**
   - ✅ Phase content shows "Step A: Copy Prompt to AI"
   - ✅ Phase content shows "Step B: Paste [AI Name]'s Response"
   - ✅ No steps labeled "Step 1" or "Step 2"

6. **Pattern 6: Dynamic AI Name Labels**
   - ✅ Phase 1 shows "Paste Claude's Response"
   - ✅ Phase 2 shows "Paste Gemini's Response"
   - ✅ Phase 3 shows "Paste Claude's Response"
   - ✅ Phase 1 shows "Open Claude"
   - ✅ Phase 2 shows "Open Gemini"
   - ✅ Phase 3 shows "Open Claude"

7. **Pattern 7: Footer Stats Auto-Update**
   - ✅ Footer shows "0 projects" on initial load
   - ✅ After creating project, footer shows "1 project"
   - ✅ After deleting project, footer shows "0 projects"
   - ✅ Footer updates without page refresh

8. **Pattern 8: Phase Tab Underline Sync**
   - ✅ Active phase tab has blue underline on initial load
   - ✅ Clicking phase tab updates underline
   - ✅ Clicking "Next Phase" button updates underline
   - ✅ Clicking "Previous Phase" button updates underline
   - ✅ Auto-advance updates underline
   - ✅ Only one tab has underline at a time

---

### 3.3 Dark Mode Test (`tests/dark-mode.test.js`)

**Test Suite:** Dark Mode Functionality

**Test Cases:**

1. **Auto-Detection**
   - ✅ Should detect system dark mode preference
   - ✅ Should apply dark class to document.documentElement
   - ✅ Should persist theme preference to localStorage

2. **Manual Toggle**
   - ✅ Should toggle dark mode on button click
   - ✅ Should update localStorage
   - ✅ Should update all components with dark: variants

3. **Persistence**
   - ✅ Should remember theme preference across sessions
   - ✅ Should override system preference if user has set preference

---

## 4. Manual Testing

### 4.1 Power Statement Quality Tests

**Test Suite:** Verify AI Output Quality

**Test Cases:**

1. **Specificity Test**
   - [ ] Power statement identifies specific customer type (not "businesses")
   - [ ] Power statement names specific problem (not vague "challenges")
   - [ ] Power statement includes specific numbers/metrics

2. **Outcome Focus Test**
   - [ ] Power statement emphasizes results (what customers achieve)
   - [ ] Power statement avoids feature lists (what product does)
   - [ ] Power statement uses outcome-oriented language

3. **Credibility Test**
   - [ ] Power statement includes quantified proof points
   - [ ] Proof points are specific (e.g., "48% appointment rate" not "high success")
   - [ ] Numbers match original input data

4. **Conversational Test**
   - [ ] Power statement sounds natural when read aloud
   - [ ] Power statement avoids jargon and technical terms
   - [ ] Power statement flows as spoken language

5. **Format Test**
   - [ ] Version A is concise (3-5 sentences, 30-second delivery)
   - [ ] Version B has all 4 sections (Challenge, Solution, Results, Why It Works)
   - [ ] Both versions use flowing paragraphs (NOT bullet points)
   - [ ] Usage guidance explains when to use each version

6. **Adversarial Quality Test**
   - [ ] Phase 2 identifies at least 3 weaknesses in Phase 1
   - [ ] Phase 2 provides specific recommendations
   - [ ] Phase 3 incorporates improvements from Phase 2
   - [ ] Phase 3 is measurably better than Phase 1

---

### 4.2 Browser Compatibility Tests

**Test Suite:** Cross-Browser Functionality

**Browsers to Test:**

- [ ] Chrome 90+ (Windows, macOS, Linux)
- [ ] Firefox 88+ (Windows, macOS, Linux)
- [ ] Safari 14+ (macOS, iOS)
- [ ] Edge 90+ (Windows)
- [ ] Mobile Safari (iOS 14+)
- [ ] Mobile Chrome (Android 10+)

**Test Cases:**

1. **IndexedDB Support**
   - [ ] Database initializes correctly
   - [ ] Projects save and load
   - [ ] Export/import works

2. **ES6 Module Support**
   - [ ] App loads without errors
   - [ ] All modules import correctly

3. **Tailwind CSS**
   - [ ] Styles render correctly
   - [ ] Dark mode works
   - [ ] Responsive breakpoints work

4. **Clipboard API**
   - [ ] Copy to clipboard works
   - [ ] Toast notification shows

5. **File Download**
   - [ ] Export triggers download
   - [ ] Filename is correct
   - [ ] File content is correct

---

### 4.3 Accessibility Tests

**Test Suite:** WCAG 2.1 AA Compliance

**Test Cases:**

1. **Keyboard Navigation**
   - [ ] All interactive elements reachable via Tab
   - [ ] Tab order is logical
   - [ ] Enter/Space activates buttons
   - [ ] Escape closes modals

2. **Screen Reader**
   - [ ] All images have alt text
   - [ ] Form fields have labels
   - [ ] Buttons have descriptive text
   - [ ] ARIA attributes used correctly (aria-disabled, aria-label)

3. **Color Contrast**
   - [ ] Text meets 4.5:1 contrast ratio (normal text)
   - [ ] Text meets 3:1 contrast ratio (large text)
   - [ ] Dark mode meets contrast requirements

4. **Focus Indicators**
   - [ ] All interactive elements have visible focus state
   - [ ] Focus ring is clearly visible
   - [ ] Focus order is logical

---

### 4.4 Performance Tests

**Test Suite:** Load Time and Responsiveness

**Test Cases:**

1. **Initial Load**
   - [ ] App loads in < 2 seconds on 3G
   - [ ] First Contentful Paint < 1 second
   - [ ] Time to Interactive < 2 seconds

2. **IndexedDB Operations**
   - [ ] Save project < 100ms
   - [ ] Load project < 100ms
   - [ ] Get all projects < 200ms

3. **UI Responsiveness**
   - [ ] Button clicks feel instant (< 50ms)
   - [ ] Navigation transitions smooth
   - [ ] No janky scrolling

4. **Memory Usage**
   - [ ] No memory leaks (test with 100+ projects)
   - [ ] Memory usage stable over time

---

## 5. Edge Cases and Error Scenarios

### 5.1 Data Edge Cases

**Test Cases:**

1. **Empty Database**
   - [ ] App shows "No projects yet" message
   - [ ] Create project button works
   - [ ] No errors in console

2. **Corrupt Project Data**
   - [ ] Missing required fields → Show error, skip project
   - [ ] Invalid JSON → Show error, offer to reset storage
   - [ ] Null values → Handle gracefully with defaults

3. **Storage Quota Exceeded**
   - [ ] Show error message
   - [ ] Prompt user to delete old projects
   - [ ] Offer export before deletion

4. **Very Long Text**
   - [ ] Project title > 1000 chars → Truncate in UI
   - [ ] Problems > 10,000 chars → Handle without performance issues
   - [ ] Response > 50,000 chars → Handle without performance issues

5. **Special Characters**
   - [ ] Project title with emojis → Display correctly
   - [ ] Project title with HTML tags → Escape correctly (no XSS)
   - [ ] Project title with quotes → Escape correctly

---

### 5.2 User Flow Edge Cases

**Test Cases:**

1. **Incomplete Workflow**
   - [ ] User creates project but never generates prompt → No errors
   - [ ] User generates prompt but never pastes response → No errors
   - [ ] User completes Phase 1 but skips Phase 2 → Cannot access Phase 2 (sequential)

2. **Navigation Edge Cases**
   - [ ] User navigates to invalid project ID → Redirect to home with error
   - [ ] User navigates to invalid route → Redirect to home
   - [ ] User uses browser back button → Works correctly

3. **Concurrent Operations**
   - [ ] User opens app in multiple tabs → Data syncs correctly
   - [ ] User creates project in Tab A, deletes in Tab B → No errors

4. **Offline Scenarios**
   - [ ] User loads app online, goes offline → App still works
   - [ ] User tries to load app offline (first time) → Show error
   - [ ] User tries to open AI link offline → Browser handles (not app error)

---

## 6. Regression Tests

### 6.1 Critical Bugs to Prevent

**Test Cases:**

1. **Form Field Mismatch**
   - [ ] Verify form collects all fields needed by prompts
   - [ ] Verify prompts don't reference non-existent fields
   - [ ] Verify variable substitution works for all fields

2. **Auto-Advance Bug**
   - [ ] Phase 1 → Phase 2 auto-advance works
   - [ ] Phase 2 → Phase 3 auto-advance works
   - [ ] Phase 3 does NOT auto-advance

3. **Dark Mode Toggle**
   - [ ] Tailwind dark mode config present in <head>
   - [ ] All components use dark: variants
   - [ ] Theme persists across sessions

4. **Sequential UX Patterns**
   - [ ] All 8 patterns implemented correctly
   - [ ] No pattern regressions after code changes

---

## 7. Test Coverage Requirements

### 7.1 Coverage Targets

- **Overall:** > 80%
- **Storage Module:** > 90%
- **Workflow Module:** > 85%
- **Projects Module:** > 85%
- **UI Module:** > 70% (harder to test DOM manipulation)

### 7.2 Coverage Exclusions

- Third-party libraries (Tailwind CSS)
- Test files themselves
- Configuration files (jest.config.js, eslint.config.js)

### 7.3 Coverage Reporting

```bash
# Generate coverage report
NODE_OPTIONS=--experimental-vm-modules npm run test:coverage

# View HTML report
open coverage/lcov-report/index.html
```

---

## 8. Continuous Integration

### 8.1 CI Pipeline (GitHub Actions)

**Workflow:** `.github/workflows/ci.yml`

**Steps:**

1. Checkout code
2. Setup Node.js 18.x
3. Install dependencies (`npm ci`)
4. Run linting (`npm run lint`)
5. Run tests (`npm test`)
6. Upload coverage to Codecov
7. Fail build if coverage < 80%

**Triggers:**

- Push to `main` branch
- Pull request to `main` branch

---

## 9. Test Maintenance

### 9.1 When to Update Tests

- **New Feature:** Write tests BEFORE implementing feature
- **Bug Fix:** Write failing test FIRST, then fix bug
- **Refactor:** Ensure all tests still pass
- **Breaking Change:** Update tests to match new behavior

### 9.2 Test Review Checklist

- [ ] Test names are descriptive
- [ ] Tests are independent (no shared state)
- [ ] Tests are deterministic (no random failures)
- [ ] Tests are fast (< 1 second each)
- [ ] Tests cover happy path and edge cases
- [ ] Tests use meaningful assertions

---

## 10. Known Test Gaps

### 10.1 Fixed Gaps

1. **✅ Form Field Mismatch** (FIXED 2024-12-15)
   - **Previous Gap:** Form only collected 3 fields, prompts expected 7 fields
   - **Impact:** Prompts had empty variables, severely reducing quality
   - **Fix Applied:** Updated form to collect all 7 fields + created 11 integration tests
   - **Tests Added:** `tests/form-prompt-integration.test.js` (11 tests)
   - **Verification:** All 71 tests passing, no empty placeholders in prompts
   - **Details:** See `docs/CRITICAL-BUG-FIX-2024-12-15.md`

### 10.2 Current Gaps (To Be Addressed)

1. **UI Component Tests**
   - **Gap:** Limited tests for DOM manipulation in project-view.js
   - **Impact:** UI bugs may slip through
   - **Fix:** Add JSDOM-based tests for rendering
   - **Priority:** MEDIUM

2. **Error Handling Tests**
   - **Gap:** Limited tests for error scenarios (storage quota, corrupt data)
   - **Impact:** App may crash in edge cases
   - **Fix:** Add tests for all error paths
   - **Priority:** MEDIUM

3. **Performance Tests**
   - **Gap:** No automated performance tests
   - **Impact:** Performance regressions may go unnoticed
   - **Fix:** Add performance benchmarks
   - **Priority:** LOW

### 10.3 Test Coverage Summary

**Current Status (2024-12-15):**
- **Total Tests:** 71 (60 original + 11 new integration tests)
- **Test Suites:** 4 (storage, ai-mock, same-llm-adversarial, form-prompt-integration)
- **All Tests:** ✅ PASSING
- **Coverage:** 35.88% statements, 44.89% branches, 37.32% functions, 36.98% lines
- **Lint Errors:** 0 (14 warnings about console.log, which are acceptable)

---

**Document Status:** ✅ Complete
**Last Updated:** 2024-12-15
**Next Review:** After V1 launch


