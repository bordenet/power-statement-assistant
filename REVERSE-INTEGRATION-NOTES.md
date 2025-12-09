# Reverse-Integration Notes for {{PROJECT_NAME}}

**Purpose**: Track improvements that should be reverse-integrated back to Genesis

**Instructions for AI Assistants**:
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

## Example Note (DELETE THIS AFTER READING)

```markdown
## REVERSE-INTEGRATION NOTE #1

**Date**: 2025-11-21
**Created By**: AI Assistant (Claude)
**Issue**: Dark mode toggle didn't work after initial Genesis setup
**Solution**: Referenced product-requirements-assistant/docs/index.html lines 9-15 to add Tailwind config
**Reference**: https://github.com/bordenet/product-requirements-assistant/blob/main/docs/index.html#L9-L15
**Genesis Gap**: Genesis templates were missing the critical Tailwind `darkMode: 'class'` configuration
**Recommendation**: Add Tailwind config to all HTML templates in genesis/templates/web-app/
**Files to Update**: 
  - genesis/templates/web-app/index-template.html
  - genesis/examples/hello-world/index.html
  - genesis/docs/WORKFLOW-ARCHITECTURE.md (add dark mode section)
**Priority**: CRITICAL
**Estimated Effort**: Small (already fixed in commit 814bfef)
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


