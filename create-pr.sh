#!/bin/bash

# GitHub PR Setup Script for erxes Bug Fixes
# Non-interactive version - provides instructions

echo "🚀 GitHub PR Setup for erxes Bug Fixes"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BRANCH_NAME="fix/security-stability-bugs-${TIMESTAMP}"

cd /Users/mendorshikh/Documents/kimi/erxes

echo -e "${BLUE}Step 1: Creating branch...${NC}"
git checkout -b "$BRANCH_NAME"

echo ""
echo -e "${BLUE}Step 2: Adding analysis documents...${NC}"
git add BUG_ANALYSIS_REPORT.md PR_DESCRIPTION.md BUG_FIX_TRACKING.md AGENT_SWARM_SUMMARY.md create-github-pr.sh create-pr.sh 2>/dev/null || true

echo ""
echo -e "${BLUE}Step 3: Committing...${NC}"
git commit -m "docs: Add comprehensive bug analysis (378 bugs found)" || echo "Nothing new to commit"

echo ""
echo -e "${GREEN}✅ Local branch created: $BRANCH_NAME${NC}"
echo ""

# Check for remote
if git remote -v > /dev/null 2>&1; then
    echo -e "${BLUE}Remote found. Pushing...${NC}"
    git push -u origin "$BRANCH_NAME" || echo "Push failed - check remote URL"
else
    echo -e "${YELLOW}No GitHub remote configured.${NC}"
    echo ""
    echo "To complete the setup, run these commands:"
    echo ""
    echo "1. Add your GitHub repository:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/erxes.git"
    echo ""
    echo "2. Push the branch:"
    echo "   git push -u origin $BRANCH_NAME"
    echo ""
    echo "3. Create PR on GitHub or run:"
    echo "   gh pr create --title \"🔒 Security & Stability Bug Fixes\" --draft"
fi

echo ""
echo "📊 Summary"
echo "=========="
echo "Branch: $BRANCH_NAME"
echo "Files ready: BUG_ANALYSIS_REPORT.md, PR_DESCRIPTION.md, BUG_FIX_TRACKING.md"
echo "Bugs documented: 378+ (22 Critical, 100+ High, 166 Medium, 90 Low)"
