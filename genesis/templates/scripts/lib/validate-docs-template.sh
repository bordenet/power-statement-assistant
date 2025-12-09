#!/usr/bin/env bash

################################################################################
# Documentation Hygiene Validator
#
# Ensures committed docs don't contain:
# - Completed work listings (lines of checkmarks with past-tense descriptions)
# - SESSION-CHECKPOINT files with no actual work remaining
# - References to deleted files
# - Stale context documents
#
# Run as pre-commit hook to prevent committing documentation clutter
################################################################################

set -euo pipefail

ERRORS=0

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

log_error() {
    echo -e "${RED}✗${NC} $1" >&2
    ((ERRORS++))
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1" >&2
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

################################################################################
# Check 1: SESSION-CHECKPOINT files should only exist if work remains
################################################################################

check_session_checkpoint() {
    if [[ ! -f "SESSION-CHECKPOINT.md" ]]; then
        return 0
    fi

    # If file exists and says "complete" or "production-ready" with no remaining work, flag it
    if grep -q "nothing left\|no work remaining\|all paths complete\|production-ready" SESSION-CHECKPOINT.md 2>/dev/null; then
        if ! grep -q "^## What's Left\|^## Remaining Work\|^## TODO" SESSION-CHECKPOINT.md 2>/dev/null; then
            log_error "SESSION-CHECKPOINT.md exists but describes completed work - should be deleted"
            return 1
        fi
    fi

    return 0
}

################################################################################
# Check 2: Documentation shouldn't list completed work in past tense
################################################################################

check_completed_work_listings() {
    # Look for documentation that's 80%+ checkmarks (completed work listings)
    local files=(CLAUDE.md README.md *.md)
    
    for file in "${files[@]}"; do
        [[ ! -f "$file" ]] && continue
        
        # Count lines with ✅ followed by past-tense completion language
        local checkmark_lines
        checkmark_lines=$(grep -c "^.*✅.*\(COMPLETE\|completed\|fixed\|added\|implemented\)" "$file" 2>/dev/null || true)
        
        if [[ $checkmark_lines -gt 10 ]]; then
            log_error "$file contains extensive completed work listing (${checkmark_lines} lines) - should be removed or moved to CHANGELOG"
            return 1
        fi
    done

    return 0
}

################################################################################
# Check 3: Don't reference deleted files
################################################################################

check_file_references() {
    local files=(CLAUDE.md *.md)
    
    for file in "${files[@]}"; do
        [[ ! -f "$file" ]] && continue
        
        # Check for references to deleted docs
        if grep -q "REVERSE-INTEGRATION-NOTES\|GENESIS-FIX-CONTEXT\|IMPLEMENTATION-CHECKLIST\|SESSION-CHECKPOINT-MODULE" "$file" 2>/dev/null; then
            log_error "$file references deleted documentation files"
            return 1
        fi
        
        # Check for references to deleted directories
        if grep -q "reference.*genesis/integration\|see.*data/\|check.*test-results" "$file" 2>/dev/null; then
            log_error "$file references deleted directories"
            return 1
        fi
    done

    return 0
}

################################################################################
# Check 4: CLAUDE.md shouldn't be too long (indicates cruft accumulation)
################################################################################

check_claude_length() {
    if [[ ! -f "CLAUDE.md" ]]; then
        return 0
    fi

    local lines
    lines=$(wc -l < CLAUDE.md)
    
    # CLAUDE.md should be focused - 400 lines is reasonable, 600+ indicates cruft
    if [[ $lines -gt 600 ]]; then
        log_warn "CLAUDE.md is very long ($lines lines) - consider if it could be more focused"
    fi

    return 0
}

################################################################################
# Check 5: No "TODO" lists in finished projects
################################################################################

check_todo_lists() {
    local files=(CLAUDE.md README.md *.md)
    
    for file in "${files[@]}"; do
        [[ ! -f "$file" ]] && continue
        
        # If file claims project is "complete" or "production-ready", it shouldn't have TODO lists
        if grep -q "production-ready\|complete.*✅\|all.*complete" "$file" 2>/dev/null; then
            if grep -q "^## TODO\|^## What's Left\|^## Remaining" "$file" 2>/dev/null; then
                log_error "$file claims project is complete but contains TODO lists - remove the TODO section"
                return 1
            fi
        fi
    done

    return 0
}

################################################################################
# Main
################################################################################

main() {
    local failed=0

    # Only run on markdown and checkpoint files that are being committed
    local staged_docs
    staged_docs=$(git diff --cached --name-only --diff-filter=ACM | grep -E "\.(md)$|SESSION-CHECKPOINT" || true)

    if [[ -z "$staged_docs" ]]; then
        return 0
    fi

    echo "🔍 Validating documentation hygiene..."

    check_session_checkpoint || failed=1
    check_completed_work_listings || failed=1
    check_file_references || failed=1
    check_claude_length || true
    check_todo_lists || failed=1

    if [[ $failed -eq 0 ]]; then
        log_success "Documentation looks good"
        return 0
    else
        echo ""
        echo "Documentation contains stale content that should be cleaned up before committing."
        echo "See errors above. Common fixes:"
        echo "  - Delete SESSION-CHECKPOINT.md if project is complete"
        echo "  - Remove ✅ completed work sections from documentation"
        echo "  - Update references to deleted files"
        echo "  - Remove TODO lists from completed projects"
        return 1
    fi
}

main "$@"

