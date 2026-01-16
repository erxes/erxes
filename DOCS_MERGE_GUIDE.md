# Web Builder → Global Profile Documentation Merge Guide

## Overview

This guide provides step-by-step instructions for merging Web Builder documentation into the erxes-global-profile repository with improved architecture.

## Prerequisites

- Access to both private repositories:
  - `erxes/erxes-global-profile` (target)
  - `pages-web/web-builder-doc` (source)
- GitHub authentication configured (SSH or GH CLI)
- Local development environment ready

## Step-by-Step Merge Process

### Step 1: Clone Both Repositories

```bash
# Create a workspace for the merge
mkdir -p ~/erxes-docs-merge
cd ~/erxes-docs-merge

# Clone the target repository (erxes-global-profile)
git clone git@github.com:erxes/erxes-global-profile.git
# OR using HTTPS:
gh repo clone erxes/erxes-global-profile

# Clone the source repository (web-builder-doc)
git clone git@github.com:pages-web/web-builder-doc.git
# OR using HTTPS:
gh repo clone pages-web/web-builder-doc

# Verify both repos are cloned
ls -la
# Should see: erxes-global-profile/ and web-builder-doc/
```

### Step 2: Explore Current Structure

```bash
# Check erxes-global-profile structure
cd erxes-global-profile
tree markdown/ -L 2  # or: find markdown -type f -name "*.md"

# Check web-builder-doc structure
cd ../web-builder-doc
tree docs/ -L 3  # or: find docs -type f -name "*.md"
```

### Step 3: Create Feature Branch in Global Profile

```bash
cd ~/erxes-docs-merge/erxes-global-profile

# Create a new branch for the merge
git checkout -b feat/merge-web-builder-docs

# Verify branch
git branch
```

### Step 4: Create New Directory Structure

```bash
# Create the new directory structure for Content plugin docs
mkdir -p markdown/core-plugins/content/web-builder/{getting-started,template-development,cms-integration}

# Create supporting directories
mkdir -p markdown/core-plugins/content/web-builder/template-development
mkdir -p markdown/core-plugins/content/web-builder/cms-integration
mkdir -p markdown/core-plugins/content/web-builder/getting-started

# Verify structure
tree markdown/core-plugins/content/web-builder/
```

### Step 5: Copy and Convert Web Builder Content

```bash
# Create a conversion script
cat > convert-docs.sh << 'EOF'
#!/bin/bash

# Source and destination directories
SRC_DIR="$HOME/erxes-docs-merge/web-builder-doc/docs"
DEST_DIR="$HOME/erxes-docs-merge/erxes-global-profile/markdown/core-plugins/content/web-builder"

# Copy template developers content
cp "$SRC_DIR/template-developers/introduction.md" "$DEST_DIR/getting-started/template-developers.md"
cp "$SRC_DIR/template-developers/installation.md" "$DEST_DIR/template-development/installation.md"
cp "$SRC_DIR/template-developers/development-guide.md" "$DEST_DIR/template-development/development-guide.md"
cp "$SRC_DIR/template-developers/template-structure.md" "$DEST_DIR/template-development/template-structure.md"
cp "$SRC_DIR/template-developers/template-layout.md" "$DEST_DIR/template-development/template-layout.md"
cp "$SRC_DIR/template-developers/template-sections.md" "$DEST_DIR/template-development/template-sections.md"
cp "$SRC_DIR/template-developers/template-pages.md" "$DEST_DIR/template-development/template-pages.md"

# Copy UI designers content
cp "$SRC_DIR/ui-designers/introduction.md" "$DEST_DIR/getting-started/ui-designers.md"

# Copy CMS + Next.js developers content
cp "$SRC_DIR/cms-nextjs-developers/introduction.md" "$DEST_DIR/getting-started/cms-nextjs-developers.md"
cp "$SRC_DIR/cms-nextjs-developers/queries.md" "$DEST_DIR/cms-integration/queries.md"
cp "$SRC_DIR/cms-nextjs-developers/ssr-fetching.md" "$DEST_DIR/cms-integration/ssr-fetching.md"
cp "$SRC_DIR/cms-nextjs-developers/csr-fetching.md" "$DEST_DIR/cms-integration/csr-fetching.md"

echo "✅ Documentation files copied successfully"
EOF

# Make executable and run
chmod +x convert-docs.sh
./convert-docs.sh
```

### Step 6: Create Overview and Introduction Files

Create new context files that position Web Builder within erxes:

```bash
cd ~/erxes-docs-merge/erxes-global-profile/markdown/core-plugins/content
```

**Create `overview.md`:**
```markdown
# Content Plugin Overview

The Content plugin is a powerful enterprise-grade content management system built into erxes XOS. It enables you to create and manage websites, e-commerce stores, knowledge bases, and more.

## Features

- **Web Builder**: Create custom templates with Next.js and TailwindCSS
- **Headless CMS**: Manage content via GraphQL API
- **E-commerce**: Product catalogs, shopping carts, checkout
- **Knowledge Base**: Help centers and documentation sites
- **Blog & News**: Publish articles and updates
- **SEO Optimization**: Built-in SEO tools

## Components

### Web Builder
The Web Builder allows template developers and UI designers to create beautiful, performant websites using modern web technologies. [Learn more →](./web-builder/introduction)

### CMS
Headless content management system with a flexible API for content delivery. [Learn more →](./cms/introduction)

### Deployment
Deploy your content sites to any platform supporting Next.js applications.

## Getting Started

- **Template Developers**: [Web Builder Guide](./web-builder/getting-started/template-developers)
- **UI Designers**: [Design Guide](./web-builder/getting-started/ui-designers)
- **CMS Developers**: [CMS Integration](./web-builder/getting-started/cms-nextjs-developers)

## Architecture

The Content plugin integrates with:
- **Core API**: Content storage and management
- **Gateway**: API routing and authentication
- **Frontend**: Preview and editing interface

Next: [Setup & Installation](./setup) →
```

**Create `web-builder/introduction.md`:**
```markdown
# Web Builder Introduction

Web Builder is a template development framework within the erxes Content plugin. It enables developers to create customizable, data-driven website templates using modern web technologies.

## What is Web Builder?

Web Builder provides a structured approach to building Next.js templates that integrate seamlessly with the erxes CMS. Templates are composable, reusable, and fully customizable.

## Key Concepts

- **Templates**: Pre-built website designs (e-commerce, tour, corporate)
- **Sections**: Reusable UI components (Hero, Gallery, Products)
- **Pages**: Route-based views (Home, Products, Blog)
- **CMS Integration**: Dynamic content from erxes backend

## Architecture

```
┌─────────────────────────────────────┐
│     Next.js Template (Frontend)     │
│   - Pages (routing)                 │
│   - Sections (components)           │
│   - Layouts (shell)                 │
└─────────────────────────────────────┘
                ↓ GraphQL
┌─────────────────────────────────────┐
│      erxes Content Plugin (API)     │
│   - Content storage                 │
│   - Asset management                │
│   - Configuration                   │
└─────────────────────────────────────┘
```

## Technology Stack

- **Next.js 14+**: React framework with App Router
- **TypeScript**: Type-safe development
- **TailwindCSS**: Utility-first styling
- **GraphQL**: Data fetching from erxes
- **React Server Components**: Optimized rendering

## Use Cases

- **E-commerce Sites**: Product catalogs, shopping carts
- **Tour & Travel**: Booking systems, itineraries
- **Corporate Sites**: Company websites, portfolios
- **Knowledge Bases**: Documentation, help centers

## Who Should Use This?

### Template Developers
Build complete website templates following erxes conventions. [Get Started →](./getting-started/template-developers)

### UI Designers
Customize existing templates with your designs. [Get Started →](./getting-started/ui-designers)

### CMS + Next.js Developers
Integrate erxes CMS with custom Next.js applications. [Get Started →](./getting-started/cms-nextjs-developers)

## Next Steps

1. [Installation & Setup](./template-development/installation)
2. [Development Guide](./template-development/development-guide)
3. [Template Structure](./template-development/template-structure)

---

**Part of**: erxes Content Plugin
**License**: Enterprise Edition (EE)
**Support**: [Discord Community](https://discord.com/invite/aaGzy3gQK5)
```

### Step 7: Update Internal Links

```bash
# Find and update relative links in copied files
cd ~/erxes-docs-merge/erxes-global-profile/markdown/core-plugins/content/web-builder

# Example: Update links to match new structure
# (This may need manual review depending on link format)
find . -name "*.md" -exec sed -i 's|/docs/template-developers/|/core-plugins/content/web-builder/template-development/|g' {} \;
find . -name "*.md" -exec sed -i 's|/docs/ui-designers/|/core-plugins/content/web-builder/getting-started/ui-designers/|g' {} \;
```

### Step 8: Create Navigation Metadata

Create `_meta.json` files for navigation:

```bash
# Root meta
cat > markdown/_meta.json << 'EOF'
{
  "getting-started": "🚀 Getting Started",
  "architecture": "🏗️ Architecture",
  "plugin-development": "🔌 Plugin Development",
  "core-plugins": "📦 Core Plugins",
  "contributing": "🤝 Contributing",
  "resources": "🔍 Resources"
}
EOF

# Core plugins meta
cat > markdown/core-plugins/_meta.json << 'EOF'
{
  "overview": "Overview",
  "frontline": "Frontline",
  "sales": "Sales",
  "operation": "Operation",
  "content": "Content & Web Builder"
}
EOF

# Content plugin meta
cat > markdown/core-plugins/content/_meta.json << 'EOF'
{
  "overview": "Overview",
  "features": "Features",
  "setup": "Setup & Installation",
  "web-builder": "Web Builder Guide"
}
EOF

# Web Builder meta
cat > markdown/core-plugins/content/web-builder/_meta.json << 'EOF'
{
  "introduction": "Introduction",
  "getting-started": "Getting Started",
  "template-development": "Template Development",
  "cms-integration": "CMS Integration",
  "deployment": "Deployment",
  "best-practices": "Best Practices"
}
EOF
```

### Step 9: Review and Test Locally

```bash
# If using Nextra or similar documentation framework
cd ~/erxes-docs-merge/erxes-global-profile

# Install dependencies
pnpm install

# Start local dev server
pnpm dev

# Open browser and verify:
# - Navigation works
# - Links are correct
# - Content renders properly
# - Search functions (if applicable)
```

### Step 10: Commit Changes

```bash
cd ~/erxes-docs-merge/erxes-global-profile

# Stage all new files
git add markdown/core-plugins/content/

# Also add metadata files
git add markdown/_meta.json
git add markdown/core-plugins/_meta.json

# Commit with descriptive message
git commit -m "$(cat <<'EOF'
docs: Merge Web Builder documentation into Content plugin section

Integrates Web Builder documentation from pages-web/web-builder-doc
into the main erxes documentation under Core Plugins → Content.

Changes:
- Created new directory structure: core-plugins/content/web-builder/
- Migrated all Web Builder docs for three audiences:
  * Template Developers
  * UI Designers
  * CMS + Next.js Developers
- Added overview and introduction pages with erxes context
- Updated internal links to match new structure
- Created navigation metadata (_meta.json files)
- Improved information architecture

The Web Builder docs are now properly positioned as part of the
Content plugin ecosystem, making it easier for developers to
understand the relationship and find relevant documentation.

Related repositories:
- Source: pages-web/web-builder-doc
- Target: erxes/erxes-global-profile

Closes: #[issue-number]
EOF
)"
```

### Step 11: Push and Create Pull Request

```bash
# Push branch to remote
git push -u origin feat/merge-web-builder-docs

# Create PR using GitHub CLI
gh pr create \
  --title "docs: Merge Web Builder documentation into Content plugin" \
  --body "$(cat <<'EOF'
## Summary

Merges Web Builder documentation from `pages-web/web-builder-doc` into the main erxes documentation under **Core Plugins → Content → Web Builder**.

## Changes

### New Documentation Structure
- ✅ Created `core-plugins/content/web-builder/` directory
- ✅ Migrated all template developer guides
- ✅ Migrated UI designer guides
- ✅ Migrated CMS + Next.js developer guides
- ✅ Added context and overview pages
- ✅ Updated navigation metadata

### Content Migration
- **Getting Started**: Template Developers, UI Designers, CMS Developers
- **Template Development**: Installation, Development Guide, Structure, Layout, Sections, Pages
- **CMS Integration**: Queries, SSR Fetching, CSR Fetching

### Improvements
- 🎯 Better information architecture
- 🔍 Improved discoverability
- 🔗 Updated internal links
- 📚 Added erxes ecosystem context
- 🧭 Clear navigation hierarchy

## Testing

- [ ] Local documentation site builds successfully
- [ ] All links work correctly
- [ ] Navigation is intuitive
- [ ] Search includes new content (if applicable)
- [ ] Mobile responsive

## Documentation Preview

View the new structure at:
- Main: `/docs/core-plugins/content/overview`
- Web Builder: `/docs/core-plugins/content/web-builder/introduction`

## Migration Checklist

- [x] Created new directory structure
- [x] Copied all content files
- [x] Updated internal links
- [x] Added overview pages
- [x] Created navigation metadata
- [ ] Team review
- [ ] Deploy to staging
- [ ] Final review
- [ ] Merge and deploy to production

## Related

- Source Repo: `pages-web/web-builder-doc`
- Architecture Proposal: See DOCS_ARCHITECTURE_PROPOSAL.md in erxes/erxes repo

## Breaking Changes

None - this is purely additive documentation.

## Next Steps

After merge:
1. Archive or deprecate `pages-web/web-builder-doc` repository
2. Update external links pointing to old docs
3. Add redirects from old URLs (if applicable)
4. Announce new documentation location to team

---

cc: @team-members-to-review
EOF
)" \
  --base main

# Get PR URL
gh pr view --web
```

### Step 12: Post-Merge Cleanup

After PR is merged:

```bash
# Update web-builder-doc repo with deprecation notice
cd ~/erxes-docs-merge/web-builder-doc

# Add deprecation notice to README
cat > DEPRECATION_NOTICE.md << 'EOF'
# ⚠️ Repository Archived

This repository has been archived. The Web Builder documentation has been merged into the main erxes documentation.

## New Documentation Location

📚 **Web Builder Guide**: https://erxes.io/docs/core-plugins/content/web-builder

The documentation is now part of the **Content Plugin** section in the erxes documentation.

## Migration Details

- **Date**: 2026-01-16
- **New Location**: erxes-global-profile/markdown/core-plugins/content/web-builder/
- **Documentation Site**: https://erxes.io/docs

## For Developers

All Web Builder documentation is now integrated with the main erxes docs:
- [Template Developers Guide](https://erxes.io/docs/core-plugins/content/web-builder/getting-started/template-developers)
- [UI Designers Guide](https://erxes.io/docs/core-plugins/content/web-builder/getting-started/ui-designers)
- [CMS + Next.js Guide](https://erxes.io/docs/core-plugins/content/web-builder/getting-started/cms-nextjs-developers)

For questions, visit our [Discord Community](https://discord.com/invite/aaGzy3gQK5).
EOF

# Commit and push
git add DEPRECATION_NOTICE.md
git commit -m "docs: Add deprecation notice - docs moved to erxes-global-profile"
git push

# Archive the repository (GitHub Settings → Archive)
# OR create issue recommending archival
```

## Troubleshooting

### Issue: Authentication Fails

```bash
# Use GitHub CLI for easier auth
gh auth login

# Or configure SSH keys
ssh-keygen -t ed25519 -C "your_email@example.com"
# Add to GitHub: Settings → SSH Keys
```

### Issue: Can't Find Markdown Files

```bash
# Search for all markdown files
find . -name "*.md" -type f

# Or use tree
tree -P "*.md"
```

### Issue: Links Broken After Migration

- Use relative links: `../other-page.md` instead of absolute `/docs/...`
- Use find/replace to update link patterns
- Test all links locally before pushing

## Summary Checklist

- [ ] Clone both repositories
- [ ] Create feature branch in erxes-global-profile
- [ ] Create new directory structure
- [ ] Copy Web Builder documentation
- [ ] Create overview and introduction pages
- [ ] Update internal links
- [ ] Create navigation metadata
- [ ] Test locally
- [ ] Commit changes
- [ ] Push and create PR
- [ ] Review and merge
- [ ] Deprecate old repository
- [ ] Update external references

## Support

For help with this merge:
- **Discord**: https://discord.com/invite/aaGzy3gQK5
- **GitHub Issues**: https://github.com/erxes/erxes-global-profile/issues
- **Documentation**: https://erxes.io/docs

---

**Created**: 2026-01-16
**Version**: 1.0
**Maintainer**: erxes Team
