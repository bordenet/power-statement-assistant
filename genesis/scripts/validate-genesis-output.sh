#!/usr/bin/env bash
#
# validate-genesis-output.sh
#
# Validates that a project created from Genesis templates is complete
# and ready for production. Run this BEFORE your first commit!
#
# Usage: ./genesis/scripts/validate-genesis-output.sh
#
# Exit codes:
#   0 - All checks passed
#   1 - One or more checks failed
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

echo "═══════════════════════════════════════════════════════════════"
echo "  Genesis Output Validation"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Function to check for file existence
check_file() {
    local file="$1"
    local priority="$2"
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file exists"
    else
        if [ "$priority" = "CRITICAL" ]; then
            echo -e "${RED}✗ CRITICAL: $file is missing!${NC}"
            ((ERRORS++))
        else
            echo -e "${YELLOW}⚠ WARNING: $file is missing${NC}"
            ((WARNINGS++))
        fi
    fi
}

# Function to check for directory existence
check_dir() {
    local dir="$1"
    local priority="$2"
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} $dir/ directory exists"
    else
        if [ "$priority" = "CRITICAL" ]; then
            echo -e "${RED}✗ CRITICAL: $dir/ directory is missing!${NC}"
            ((ERRORS++))
        else
            echo -e "${YELLOW}⚠ WARNING: $dir/ directory is missing${NC}"
            ((WARNINGS++))
        fi
    fi
}

echo "📁 Checking required files..."
echo "───────────────────────────────────────────────────────────────"

# Critical files that MUST exist
check_file "CLAUDE.md" "CRITICAL"
check_file "README.md" "CRITICAL"
check_file ".gitignore" "CRITICAL"
check_file "package.json" "CRITICAL"
check_file ".eslintrc.json" "HIGH"
check_file "jest.config.js" "HIGH"
check_dir "scripts" "HIGH"
check_dir "tests" "HIGH"
check_file ".github/workflows/ci.yml" "HIGH"

echo ""
echo "🚫 Checking genesis/ directory is deleted..."
echo "───────────────────────────────────────────────────────────────"

if [ -d "genesis" ]; then
    echo -e "${RED}✗ CRITICAL: genesis/ directory still exists!${NC}"
    echo -e "${RED}  Run: rm -rf genesis/ && git add . && git commit -m 'Remove genesis'${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✓${NC} genesis/ directory has been deleted"
fi

echo ""
echo "🔍 Checking for unreplaced template variables..."
echo "───────────────────────────────────────────────────────────────"

# Check for unreplaced {{VARIABLES}}
UNREPLACED=$(grep -r "{{" . --include="*.md" --include="*.js" --include="*.json" --include="*.html" --include="*.yml" --include="*.sh" \
    --exclude-dir=node_modules --exclude-dir=genesis --exclude-dir=.git 2>/dev/null || true)

if [ -n "$UNREPLACED" ]; then
    echo -e "${RED}✗ CRITICAL: Found unreplaced template variables:${NC}"
    echo "$UNREPLACED" | head -20
    ((ERRORS++))
else
    echo -e "${GREEN}✓${NC} No unreplaced {{VARIABLES}} found"
fi

echo ""
echo "📄 Checking README.md is not a stub..."
echo "───────────────────────────────────────────────────────────────"

if [ -f "README.md" ]; then
    README_LINES=$(wc -l < README.md | tr -d ' ')
    if [ "$README_LINES" -lt 50 ]; then
        echo -e "${RED}✗ CRITICAL: README.md is too short ($README_LINES lines)${NC}"
        echo -e "${RED}  A proper README should have 50+ lines${NC}"
        ((ERRORS++))
    else
        echo -e "${GREEN}✓${NC} README.md has $README_LINES lines"
    fi
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  SUMMARY"
echo "═══════════════════════════════════════════════════════════════"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Project is ready.${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warning(s) found. Review and fix if needed.${NC}"
    exit 0
else
    echo -e "${RED}❌ $ERRORS critical error(s) and $WARNINGS warning(s) found.${NC}"
    echo -e "${RED}   FIX THESE ISSUES BEFORE COMMITTING!${NC}"
    exit 1
fi

