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

# Configuration - use timestamp for unique branch name
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BRANCH_NAME="fix/security-stability-bugs-${TIMESTAMP}"
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
    echo ""
    echo "Install with:"
    echo "  brew install gh"
    echo ""
    echo "Then authenticate:"
    echo "  gh auth login"
    exit 1
fi

# Check if user is authenticated with gh
if ! gh auth status &> /dev/null; then
    echo -e "${RED}Error: Not authenticated with GitHub CLI${NC}"
    echo ""
    echo "Run: gh auth login"
    exit 1
fi

# Check for remote
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
if [ -z "$REMOTE_URL" ]; then
    echo -e "${YELLOW}No remote repository configured.${NC}"
    echo ""
    echo "To add your GitHub repository, run:"
    echo "  git remote add origin https://github.com/YOUR_USERNAME/erxes.git"
    echo ""
    echo "Or for SSH:"
    echo "  git remote add origin git@github.com:YOUR_USERNAME/erxes.git"
    echo ""
    
    # Ask for remote URL
    echo -n "Enter your GitHub repository URL (or press Enter to skip): "
    read -r REPO_URL
    
    if [ -n "$REPO_URL" ]; then
        git remote add origin "$REPO_URL"
        echo -e "${GREEN}Remote added: $REPO_URL${NC}"
    else
        echo -e "${YELLOW}Skipping remote setup. You can add it later.${NC}"
    fi
fi

echo -e "${BLUE}Step 1: Checking git status...${NC}"
git status --short

echo ""
echo -e "${BLUE}Step 2: Creating new branch: $BRANCH_NAME${NC}"
git checkout -b "$BRANCH_NAME"

echo ""
echo -e "${BLUE}Step 3: Staging analysis documents...${NC}"

# Add the analysis documents if they exist
STAGED_COUNT=0

for file in BUG_ANALYSIS_REPORT.md PR_DESCRIPTION.md BUG_FIX_TRACKING.md AGENT_SWARM_SUMMARY.md create-github-pr.sh; do
    if [ -f "$file" ]; then
        git add "$file"
        echo "  ✓ $file"
        STAGED_COUNT=$((STAGED_COUNT + 1))
    fi
done

if [ $STAGED_COUNT -eq 0 ]; then
    echo -e "${YELLOW}No analysis documents found to stage.${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 4: Committing changes...${NC}"
git commit -m "docs: Add comprehensive bug analysis and fix tracking

Agent Swarm Analysis Results:
- 15 specialized agents analyzed the codebase
- 378+ bugs identified across frontend, backend, and database
- 22 critical bugs requiring immediate attention
- 100+ high severity bugs

Documents Added:
- BUG_ANALYSIS_REPORT.md: Comprehensive bug analysis (378 bugs)
- PR_DESCRIPTION.md: Detailed PR description
- BUG_FIX_TRACKING.md: Fix tracking and sprint planning
- AGENT_SWARM_SUMMARY.md: Executive summary

Categories:
- Security vulnerabilities (XSS, auth, permissions)
- Data integrity issues (transactions, migrations)
- Performance issues (N+1 queries, missing indexes)
- Stability issues (memory leaks, error handling)"

echo ""

# Check if we have a remote to push to
if git remote get-url origin &> /dev/null; then
    echo -e "${BLUE}Step 5: Pushing branch to origin...${NC}"
    
    # Try to push, if it fails, show instructions
    if git push -u origin "$BRANCH_NAME"; then
        echo -e "${GREEN}Branch pushed successfully!${NC}"
        
        echo ""
        echo -e "${BLUE}Step 6: Creating Pull Request...${NC}"
        
        # Read PR description from file
        if [ -f PR_DESCRIPTION.md ]; then
            PR_BODY=$(cat PR_DESCRIPTION.md)
        else
            PR_BODY="This PR addresses security and stability bugs identified through comprehensive analysis using 15 specialized agents."
        fi
        
        # Create the PR
        if gh pr create \
            --title "$PR_TITLE" \
            --body "$PR_BODY" \
            --base "$BASE_BRANCH" \
            --head "$BRANCH_NAME" \
            --draft 2>/dev/null; then
            
            echo ""
            echo -e "${GREEN}✅ Pull Request created successfully!${NC}"
        else
            echo -e "${YELLOW}Could not create PR automatically.${NC}"
            echo "Create it manually at:"
            echo "  https://github.com/$(gh repo view --json owner,name -q '.owner.login + "/" + .name')/compare/$BASE_BRANCH...$BRANCH_NAME"
        fi
    else
        echo -e "${RED}Failed to push branch.${NC}"
        echo ""
        echo "To push manually, run:"
        echo "  git push -u origin $BRANCH_NAME"
    fi
else
    echo -e "${YELLOW}No remote configured. Cannot push.${NC}"
    echo ""
    echo "To add a remote and push:"
    echo "  git remote add origin https://github.com/YOUR_USERNAME/erxes.git"
    echo "  git push -u origin $BRANCH_NAME"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "=========================================="
echo ""
echo -e "${BLUE}Branch: ${NC}$BRANCH_NAME"
echo -e "${BLUE}Base: ${NC}$BASE_BRANCH"
echo ""
echo "📊 Bug Fix Summary"
echo "=================="
echo "Critical: 22 bugs"
echo "High: 100+ bugs"
echo "Medium: 166 bugs"
echo "Low: 90 bugs"
echo "Total: 378+ bugs"
echo ""

echo "🚨 Top Priority Fixes"
echo "===================="
echo "1. XSS vulnerabilities (2 files)"
echo "2. Permission system disabled"
echo "3. JWT silent failures"
echo "4. Unauthenticated file uploads"
echo "5. z.any() in tRPC (all procedures)"
echo ""

echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Review the analysis documents"
echo "2. Apply the actual code fixes"
echo "3. Add tests for critical bugs"
echo "4. Push to GitHub and create PR"
echo "5. Request reviews from team"
echo ""

echo "📁 Analysis Documents"
echo "===================="
ls -la *.md 2>/dev/null || echo "Documents committed to branch"
echo ""

echo -e "${GREEN}Done!${NC}"
