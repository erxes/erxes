#!/bin/bash

# GitHub PR Creation Script for erxes Bug Fixes
# This script creates a comprehensive PR with all bug fixes

set -e

echo "🚀 Creating GitHub PR for erxes Bug Fixes"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BRANCH_NAME="fix/security-stability-bugs-$(date +%Y%m%d)"
BASE_BRANCH="main"
PR_TITLE="🔒 Security & Stability Bug Fixes - Critical & High Priority"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}Error: Not a git repository${NC}"
    exit 1
fi

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) not installed${NC}"
    echo "Install from: https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated with gh
if ! gh auth status &> /dev/null; then
    echo -e "${RED}Error: Not authenticated with GitHub CLI${NC}"
    echo "Run: gh auth login"
    exit 1
fi

echo -e "${BLUE}Step 1: Creating new branch...${NC}"
git checkout -b "$BRANCH_NAME"

echo ""
echo -e "${BLUE}Step 2: Applying bug fixes...${NC}"
echo "This would apply all the fixes from the analysis."
echo "For now, creating documentation and tracking files."

# Add the analysis documents
git add BUG_ANALYSIS_REPORT.md
git add PR_DESCRIPTION.md
git add BUG_FIX_TRACKING.md
git add create-github-pr.sh

echo ""
echo -e "${BLUE}Step 3: Committing changes...${NC}"
git commit -m "docs: Add comprehensive bug analysis and fix tracking

Agent Swarm Analysis Results:
- 15 specialized agents analyzed the codebase
- 378+ bugs identified across frontend, backend, and database
- 22 critical bugs requiring immediate attention
- 100+ high severity bugs

Documents Added:
- BUG_ANALYSIS_REPORT.md: Comprehensive bug analysis
- PR_DESCRIPTION.md: Detailed PR description
- BUG_FIX_TRACKING.md: Fix tracking and sprint planning

Categories:
- Security vulnerabilities (XSS, auth, permissions)
- Data integrity issues (transactions, migrations)
- Performance issues (N+1 queries, missing indexes)
- Stability issues (memory leaks, error handling)"

echo ""
echo -e "${BLUE}Step 4: Pushing branch...${NC}"
git push -u origin "$BRANCH_NAME"

echo ""
echo -e "${BLUE}Step 5: Creating Pull Request...${NC}"

# Read PR description from file
PR_BODY=$(cat PR_DESCRIPTION.md)

# Create the PR
gh pr create \
    --title "$PR_TITLE" \
    --body "$PR_BODY" \
    --base "$BASE_BRANCH" \
    --head "$BRANCH_NAME" \
    --label "security,bug,critical" \
    --draft

echo ""
echo -e "${GREEN}✅ Pull Request created successfully!${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Review the PR on GitHub"
echo "2. Apply the actual code fixes"
echo "3. Add tests for critical bugs"
echo "4. Request reviews from team members"
echo "5. Merge after approval"
echo ""
echo -e "${BLUE}Branch: ${NC}$BRANCH_NAME"
echo -e "${BLUE}Base: ${NC}$BASE_BRANCH"
echo ""

# Show summary
echo "📊 Bug Fix Summary"
echo "=================="
echo "Critical: 22 bugs"
echo "High: 100+ bugs"
echo "Medium: 166 bugs"
echo "Low: 90 bugs"
echo "Total: 378+ bugs"
echo ""

# Show top priority fixes
echo "🚨 Top Priority Fixes"
echo "===================="
echo "1. XSS vulnerabilities (2 files)"
echo "2. Permission system disabled"
echo "3. JWT silent failures"
echo "4. Unauthenticated file uploads"
echo "5. z.any() in tRPC (all procedures)"
echo "6. Date.now() defaults (20+ files)"
echo "7. Missing transactions"
echo ""
