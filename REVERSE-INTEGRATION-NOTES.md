# Reverse-Integration Notes for Power Statement Assistant

**Purpose**: Track improvements that should be reverse-integrated back to Genesis

**Project**: Power Statement Assistant
**Genesis Version**: Based on product-requirements-assistant Genesis template
**Date Range**: 2024-12-09
**Total Issues Found**: 7 critical issues

---

## 📊 EXECUTIVE SUMMARY

This project uncovered **7 CRITICAL issues** in the Genesis template system that prevented the app from working after initial generation. All issues have been fixed and documented below for reverse-integration.

### Critical Issues by Category:

1. **Template System Failures** (3 issues)
   - #1: Storage export mismatch (named vs default)
   - #2: App container ID mismatch
   - #3: Unreplaced template placeholders ⚠️ **MOST CRITICAL**

2. **Missing Code** (2 issues)
   - #4: Missing workflow functions
   - #7: Missing storage methods

3. **Missing HTML Elements** (1 issue)
   - #6: Missing loading overlay and toast container

4. **Naming Conventions** (1 issue)
   - #5: PRD-specific naming instead of generic

### Impact:
- **Initial State**: App completely broken (blank screen, JavaScript errors)
- **After Fixes**: App fully functional with all features working
- **Commits Required**: 7 separate fixes
- **Time to Fix**: ~2 hours of debugging

### Recommendation:
**Genesis needs a comprehensive validation system** that checks for:
- ✅ All template placeholders replaced
- ✅ All imports/exports match
- ✅ All HTML elements referenced by JavaScript exist
- ✅ No hardcoded project-specific names in templates

---

## 📋 INSTRUCTIONS FOR AI ASSISTANTS

- When you reference product-requirements-assistant or one-pager to solve a problem, **CREATE A NOTE HERE**
- When you discover a pattern missing from Genesis, **CREATE A NOTE HERE**
- When you fix a bug that Genesis should prevent, **CREATE A NOTE HERE**
- Share this file with Genesis maintainer after project completion

---

## Template for New Notes

```markdown
## REVERSE-INTEGRATION NOTE #[NUMBER]

**Date**: YYYY-MM-DD
**Created By**: [AI Assistant / Human Developer]
**Issue**: [What problem did you encounter?]
**Solution**: [How did you solve it by referencing the implementations?]
**Reference**: [Link to specific file/line in product-requirements-assistant or one-pager]
**Genesis Gap**: [What's missing from Genesis that caused this?]
**Recommendation**: [What should be added/updated in Genesis?]
**Files to Update**: [List Genesis files that need changes]
**Priority**: [CRITICAL / HIGH / MEDIUM / LOW]
**Estimated Effort**: [Small / Medium / Large]
```

---

## Notes for power-statement-assistant

## REVERSE-INTEGRATION NOTE #1

**Date**: 2024-12-09
**Created By**: AI Assistant (Claude)
**Issue**: App showed blank screen on load due to storage import mismatch
**Solution**: Changed storage.js to use `export default new Storage()` to match reference implementation
**Reference**: https://github.com/bordenet/product-requirements-assistant/blob/main/docs/js/storage.js#L189
**Genesis Gap**: Genesis template uses `export const storage = new Storage()` (named export) but reference uses default export
**Recommendation**: Update storage-template.js to use default export for consistency
**Files to Update**:
  - genesis/templates/web-app/js/storage-template.js (line 174)
  - All test templates that import storage
**Priority**: CRITICAL
**Estimated Effort**: Small

## REVERSE-INTEGRATION NOTE #2

**Date**: 2024-12-09
**Created By**: AI Assistant (Claude)
**Issue**: App showed blank screen because HTML had `id="app"` but views.js expected `id="app-container"`
**Solution**: Changed index.html to use `id="app-container"`
**Reference**: https://github.com/bordenet/product-requirements-assistant/blob/main/docs/index.html
**Genesis Gap**: Template inconsistency between index-template.html and views-template.js
**Recommendation**: Ensure consistent container ID across all templates
**Files to Update**:
  - genesis/templates/web-app/index-template.html (use id="app-container")
  - Verify all view templates reference the same container ID
**Priority**: CRITICAL
**Estimated Effort**: Small

## REVERSE-INTEGRATION NOTE #3

**Date**: 2024-12-09
**Created By**: AI Assistant (Claude)
**Issue**: App completely broken due to unreplaced template placeholders ({{DB_NAME}}, {{STORE_NAME}}, {{PROJECT_TYPE}}, etc.)
**Solution**: Manually replaced all template placeholders with actual values
**Reference**: N/A - Genesis template system issue
**Genesis Gap**: Genesis template replacement script failed to replace all placeholders
**Recommendation**: Add validation step to Genesis that checks for unreplaced {{}} placeholders before completion
**Files to Update**:
  - Add post-processing validation script that scans all files for {{.*}} patterns
  - Fail loudly if any placeholders remain unreplaced
  - Add to checklist: "Verify no template placeholders remain"
**Priority**: CRITICAL
**Estimated Effort**: Medium

## REVERSE-INTEGRATION NOTE #4

**Date**: 2024-12-09
**Created By**: AI Assistant (Claude)
**Issue**: Missing workflow functions (getPhaseMetadata, generatePromptForPhase, exportFinalDocument) caused module import errors
**Solution**: Added standalone function exports to workflow.js to match reference implementation pattern
**Reference**: https://github.com/bordenet/product-requirements-assistant/blob/main/docs/js/workflow.js
**Genesis Gap**: Genesis template uses class-based Workflow but project-view.js expects standalone functions
**Recommendation**:
  - Either standardize on class-based OR function-based workflow pattern
  - Ensure workflow.js exports match what project-view.js imports
  - Add validation that all imports resolve correctly
**Files to Update**:
  - genesis/templates/web-app/js/workflow-template.js
  - genesis/templates/web-app/js/project-view-template.js
**Priority**: CRITICAL
**Estimated Effort**: Medium

## REVERSE-INTEGRATION NOTE #5

**Date**: 2024-12-09
**Created By**: AI Assistant (Claude)
**Issue**: Function named exportFinalPRD instead of generic exportFinalDocument
**Solution**: Renamed to exportFinalDocument and updated references
**Reference**: N/A - naming convention issue
**Genesis Gap**: Genesis should use generic terminology, not PRD-specific names
**Recommendation**:
  - Use "document" or "output" instead of "PRD" in function names
  - Use template variables for document type names
  - Search for all PRD references and make them generic
**Files to Update**:
  - genesis/templates/web-app/js/workflow-template.js
  - genesis/templates/web-app/js/project-view-template.js
**Priority**: HIGH
**Estimated Effort**: Small

## REVERSE-INTEGRATION NOTE #6

**Date**: 2024-12-09
**Created By**: AI Assistant (Claude)
**Issue**: Missing loading overlay and toast container in HTML caused UI errors
**Solution**: Added loading-overlay and toast-container divs to index.html
**Reference**: https://github.com/bordenet/product-requirements-assistant/blob/main/docs/index.html#L130-L145
**Genesis Gap**: Genesis template index.html missing required UI elements that ui.js expects
**Recommendation**:
  - Add loading overlay to index-template.html
  - Add toast container to index-template.html
  - Ensure all UI elements that JavaScript references are present in HTML
**Files to Update**:
  - genesis/templates/web-app/index-template.html
**Priority**: CRITICAL
**Estimated Effort**: Small

## REVERSE-INTEGRATION NOTE #7

**Date**: 2024-12-09
**Created By**: AI Assistant (Claude)
**Issue**: Missing storage methods (getPrompt, savePrompt, getSetting, saveSetting, getStorageEstimate)
**Solution**: Added all missing methods to storage.js
**Reference**: https://github.com/bordenet/product-requirements-assistant/blob/main/docs/js/storage.js
**Genesis Gap**: Genesis storage template missing prompt and settings store methods
**Recommendation**:
  - Add getPrompt/savePrompt methods to storage-template.js
  - Add getSetting/saveSetting methods to storage-template.js
  - Add getStorageEstimate as alias for getStorageInfo
  - Ensure all methods that workflow.js and app.js expect are present
**Files to Update**:
  - genesis/templates/web-app/js/storage-template.js
**Priority**: CRITICAL
**Estimated Effort**: Small

---

## 🎯 ACTION PLAN FOR GENESIS MAINTAINER

### Phase 1: Critical Fixes (Do First)

**Issue #3: Template Placeholder Validation** ⚠️ **HIGHEST PRIORITY**
- Create post-processing validation script
- Scan all generated files for `{{.*}}` patterns
- Fail loudly if any placeholders remain
- Add to Genesis checklist
- **Impact**: Prevents completely broken apps

**Issue #1: Storage Export Consistency**
- Change `storage-template.js` line 174 to `export default new Storage()`
- Update all test templates to use default import
- **Impact**: Prevents blank screen on load

**Issue #2: Container ID Consistency**
- Change `index-template.html` to use `id="app-container"`
- Verify all view templates reference same ID
- **Impact**: Prevents blank screen on load

**Issue #6: Missing HTML Elements**
- Add loading overlay to `index-template.html`
- Add toast container to `index-template.html`
- **Impact**: Prevents UI initialization errors

**Issue #7: Missing Storage Methods**
- Add `getPrompt/savePrompt` to `storage-template.js`
- Add `getSetting/saveSetting` to `storage-template.js`
- Add `getStorageEstimate` alias
- **Impact**: Prevents app initialization errors

### Phase 2: Code Quality Improvements

**Issue #4: Workflow Function Consistency**
- Standardize on class-based OR function-based pattern
- Ensure workflow.js exports match project-view.js imports
- Add import/export validation
- **Impact**: Prevents module loading errors

**Issue #5: Generic Naming Conventions**
- Replace "PRD" with "document" or template variables
- Search all templates for project-specific terminology
- **Impact**: Improves template reusability

### Phase 3: Long-term Improvements

**Create Comprehensive Validation System**
- ✅ Template placeholder validation
- ✅ Import/export matching validation
- ✅ HTML element existence validation
- ✅ Naming convention validation
- ✅ Pre-commit hooks for template changes
- ✅ Automated testing of generated projects

**Documentation Updates**
- Add troubleshooting guide for common issues
- Document all template variables
- Create validation checklist
- Add "known issues" section

---

## 📈 SUCCESS METRICS

After implementing these fixes, Genesis should:
- ✅ Generate working apps on first try (no debugging required)
- ✅ Pass all validation checks automatically
- ✅ Have zero unreplaced template placeholders
- ✅ Have zero import/export mismatches
- ✅ Have zero missing HTML elements
- ✅ Use generic terminology throughout

**Target**: 100% of generated apps work immediately after generation

---

## 📝 NOTES

- All 7 issues were discovered and fixed on 2024-12-09
- Total debugging time: ~2 hours
- All fixes have been tested and verified working
- Reference implementation: https://github.com/bordenet/product-requirements-assistant
- This project: https://github.com/bordenet/power-statement-assistant

**Status**: ✅ All issues documented and ready for reverse-integration

---

## REVERSE-INTEGRATION NOTE #8

**Date**: 2024-12-14
**Created By**: AI Assistant (Claude)
**Issue**: UX patterns from one-pager needed to be manually synced to power-statement-assistant
**Solution**: Referenced one-pager project-view.js to implement 10 UX enhancements
**Reference**: https://github.com/bordenet/one-pager/blob/main/js/project-view.js
**Genesis Gap**: Genesis doesn't include latest UX patterns that improve user experience
**Recommendation**: Add these UX patterns to Genesis templates:
  1. Footer stats auto-update (call updateStorageInfo after every route render)
  2. Auto-advance on save (move to next phase automatically)
  3. Button enable/disable based on user action (Open AI button disabled until Copy Prompt clicked)
  4. Textarea enable/disable based on workflow (disabled until prerequisite action)
  5. Shared browser tab for external links (target="ai-assistant-tab")
  6. Extract title from markdown output (update project title from # Title in final output)
  7. Dynamic AI name labels (show specific AI names like "Paste Claude's Response")
  8. Step A/B vs Step 1/2 disambiguation (use letters for sub-steps within phases)
  9. Phase tab underline sync (updatePhaseTabStyles function)
  10. Clean .gitignore (remove Genesis template syntax like <!-- IF --> blocks)
**Files to Update**:
  - genesis/templates/web-app/js/router-template.js (add updateStorageInfo call)
  - genesis/templates/web-app/js/project-view-template.js (add all UX patterns)
  - genesis/templates/web-app/js/projects-template.js (remove auto-advance from updatePhase)
  - genesis/templates/.gitignore-template (clean up, add Python/coverage patterns)
**Priority**: HIGH
**Estimated Effort**: Medium

**Specific Changes Made**:
1. **Footer Stats Auto-Update**: Exported updateStorageInfo from app.js, imported in router.js, called after every route render
2. **Auto-Advance on Save**: Removed auto-advance from projects.js updatePhase, added to project-view.js saveResponseBtn handler
3. **Button Enable/Disable**: Open AI button starts disabled (opacity-50, pointer-events-none), enabled after Copy Prompt clicked
4. **Textarea Enable/Disable**: Response textarea starts disabled if no prompt, enabled after Copy Prompt or if has existing content
5. **Shared Browser Tab**: All "Open AI" links use target="ai-assistant-tab"
6. **Extract Title**: Added extractTitleFromMarkdown function, called on Phase 3 completion, updates project title
7. **Dynamic AI Names**: Changed "Paste AI Response" to "Paste Claude's Response" or "Paste Gemini's Response" based on phase
8. **Step A/B**: Changed "Step 1" and "Step 2" to "Step A" and "Step B" within each phase
9. **Phase Tab Sync**: Added updatePhaseTabStyles function, called from all navigation points (tab clicks, prev/next, auto-advance)
10. **Clean .gitignore**: Removed all <!-- IF --> blocks, added .coverage, .mypy_cache, .pytest_cache patterns

**Testing**: All 60 tests pass, 0 lint errors (14 warnings for console.log which are acceptable)
