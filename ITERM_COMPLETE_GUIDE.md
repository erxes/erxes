# Complete iTerm Terminal Guide: Create All Web Builder Documentation

## Overview

This guide will help you create **ALL** the Web Builder documentation files using iTerm on your Mac.

**Total files to create**: 10 MDX files + 4 JSON files = **14 files**

---

## Step 1: Open iTerm

1. Press `Command + Space`
2. Type: `iterm`
3. Press Enter

---

## Step 2: Navigate to Your Repository

```bash
cd ~/Documents/GitHub/erxes-global-profile
```

Verify you're in the right place:
```bash
pwd
# Should show: /Users/mendorshikh/Documents/GitHub/erxes-global-profile
```

---

## Step 3: Create New Branch

```bash
# Create and switch to new branch
git checkout -b feat/add-web-builder-docs

# Verify you're on the new branch
git branch
# Should show * feat/add-web-builder-docs
```

---

## Step 4: Create All Directories at Once

```bash
mkdir -p markdown/getting-started
mkdir -p markdown/plugins/content/web-builder
```

---

## Step 5: Create All Files

I'll give you ONE command to create each file. Just copy-paste each block!

### File 1: markdown/_meta.json

```bash
cat > markdown/_meta.json << 'EOF'
{
  "getting-started": "🚀 Getting Started",
  "architecture": "🏗️ Architecture",
  "plugin-development": "🔌 Plugin Development",
  "plugins": "📦 Plugins",
  "contributing": "🤝 Contributing",
  "resources": "🔍 Resources"
}
EOF
```

### File 2: markdown/plugins/_meta.json

```bash
cat > markdown/plugins/_meta.json << 'EOF'
{
  "overview": "Overview",
  "frontline": "Frontline",
  "sales": "Sales",
  "operation": "Operation",
  "content": "Content & Web Builder"
}
EOF
```

### File 3: markdown/plugins/content/_meta.json

```bash
cat > markdown/plugins/content/_meta.json << 'EOF'
{
  "overview": "Overview",
  "features": "Features",
  "setup": "Setup & Installation",
  "web-builder": "Web Builder Guide"
}
EOF
```

### File 4: markdown/plugins/content/web-builder/_meta.json

```bash
cat > markdown/plugins/content/web-builder/_meta.json << 'EOF'
{
  "introduction": "Introduction",
  "installation": "Installation",
  "development-guide": "Development Guide",
  "template-structure": "Template Structure",
  "template-layout": "Template Layout",
  "template-sections": "Template Sections",
  "template-pages": "Template Pages"
}
EOF
```

### File 5: markdown/getting-started/local-setup.mdx

```bash
cat > markdown/getting-started/local-setup.mdx << 'EOF'
---
title: "Local Development Setup"
description: "Complete guide to setting up erxes XOS on your local machine for development"
---

# Local Development Setup

Get erxes running on your local machine in under 10 minutes.

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime |
| **pnpm** | ≥ 8 | Package manager (required) |
| **MongoDB** | 5.0+ | Primary database |
| **Redis** | 6+ | Caching and job queues |
| **Git** | Latest | Version control |

### Install Prerequisites

#### Node.js & pnpm

```bash
# Install Node.js 18+ from nodejs.org or use Homebrew
brew install node@18

# Install pnpm globally
npm install -g pnpm

# Verify installation
node --version  # Should be v18 or higher
pnpm --version  # Should be 8 or higher
```

#### MongoDB

**Option 1: Docker (Recommended)**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:5
```

**Option 2: Homebrew**
```bash
brew tap mongodb/brew
brew install mongodb-community@5.0
brew services start mongodb-community@5.0
```

#### Redis

**Option 1: Docker (Recommended)**
```bash
docker run -d -p 6379:6379 --name redis redis:alpine
```

**Option 2: Homebrew**
```bash
brew install redis
brew services start redis
```

## Installation Steps

### 1. Clone Repository

```bash
git clone https://github.com/erxes/erxes.git
cd erxes
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment

```bash
cp .env.example .env
open .env  # Edit configuration
```

**Essential Environment Variables:**

```env
MONGO_URL=mongodb://localhost:27017/erxes
REDIS_HOST=localhost
REDIS_PORT=6379
ENABLED_PLUGINS=sales,operation,frontline,content
NODE_ENV=development
```

### 4. Start Development Servers

```bash
# Start all APIs
pnpm dev:apis

# In another terminal tab (Command + T):
pnpm dev:uis
```

### 5. Verify Installation

Open your browser:
- **Frontend**: http://localhost:3001
- **API Gateway**: http://localhost:4000/graphql

## Need Help?

- **Discord**: https://discord.com/invite/aaGzy3gQK5
- **Documentation**: https://erxes.io/docs

---

**Updated**: 2026-01-16
EOF
```

### File 6: markdown/plugins/content/overview.mdx

```bash
cat > markdown/plugins/content/overview.mdx << 'EOF'
---
title: "Content Plugin"
description: "Enterprise-grade content management system built into erxes XOS"
---

# Content Plugin Overview

The Content plugin transforms erxes into a powerful headless CMS with integrated web building capabilities.

## What is the Content Plugin?

The Content plugin provides enterprise-grade content management capabilities:

- **Headless CMS**: Manage content via GraphQL API
- **Web Builder**: Create custom templates with Next.js
- **Multi-channel Publishing**: Websites, e-commerce, knowledge bases
- **SEO Optimization**: Built-in SEO tools
- **Asset Management**: Images, videos, documents

## Key Features

### 🏗️ Web Builder

Create beautiful, performant websites using modern web technologies:
- Next.js 14+ with App Router
- TailwindCSS for styling
- TypeScript for type safety
- [Learn more →](./web-builder/introduction)

### 📝 Content Management

Flexible content modeling and management:
- Custom content types
- Rich text editor
- Media library
- Multi-language support

### 🛍️ E-commerce

Full e-commerce capabilities:
- Product catalogs
- Shopping cart
- Checkout process
- Payment integration

## Getting Started

### For Different Audiences

- **Template Developers**: [Installation Guide](./web-builder/installation)
- **UI Designers**: Customize existing templates
- **CMS Developers**: Integrate erxes CMS with custom applications

## Plugin Configuration

Enable the Content plugin in your `.env`:

```env
ENABLED_PLUGINS=sales,operation,frontline,content
```

Then restart your erxes services:

```bash
pnpm dev:apis
```

## Resources

- [Web Builder Documentation](./web-builder/introduction)
- [Template Gallery](https://erxes.io/templates)
- [Discord Community](https://discord.com/invite/aaGzy3gQK5)

---

**License**: Enterprise Edition (EE)
**Plugin Type**: Official
**Maintained by**: erxes Team
EOF
```

### File 7: markdown/plugins/content/web-builder/introduction.mdx

```bash
cat > markdown/plugins/content/web-builder/introduction.mdx << 'EOF'
---
title: "Web Builder Introduction"
description: "Build beautiful, performant websites with erxes Web Builder"
---

# Web Builder Introduction

Web Builder is a template development framework within the erxes Content plugin that enables developers to create customizable, data-driven website templates.

## What is Web Builder?

Web Builder provides a structured approach to building Next.js templates that integrate seamlessly with the erxes CMS. Templates are composable, reusable, and fully customizable.

## Key Concepts

### Templates
Pre-built website designs optimized for specific use cases:
- **E-commerce**: Product catalogs, shopping carts, checkout
- **Tour & Travel**: Booking systems, itineraries, availability
- **Corporate**: Company websites, portfolios, contact forms

### Sections
Reusable UI components that make up pages:
- Hero sections
- Product galleries
- Contact forms
- Testimonials
- Blog posts

### CMS Integration
Dynamic content pulled from erxes backend via GraphQL:
- Real-time content updates
- Asset management
- SEO configuration
- Multi-language support

## Technology Stack

### Frontend
- **Next.js 14+**: React framework with App Router
- **TypeScript**: Type-safe development
- **TailwindCSS**: Utility-first styling
- **React Server Components**: Optimized rendering

### Data Fetching
- **GraphQL**: Query erxes content API
- **SSR**: Server-side rendering for SEO
- **CSR**: Client-side rendering for interactivity

## Who Should Use Web Builder?

### Template Developers
Build complete website templates from scratch

**Skills Needed**:
- React & TypeScript
- Next.js & TailwindCSS
- GraphQL

[Get Started →](./installation)

### UI Designers
Customize existing templates with your designs

**Skills Needed**:
- HTML & CSS
- Basic React knowledge
- Design tools (Figma, Sketch)

## Development Workflow

### 1. Clone Template
```bash
git clone https://github.com/erxes-web-templates/ecommerce-boilerplate.git
cd ecommerce-boilerplate
pnpm install
```

### 2. Configure Environment
```bash
cp .env.local.example .env.local
```

### 3. Start Development
```bash
pnpm dev
```

### 4. Customize UI
- Modify components in `app/_components/`
- Adjust styles with TailwindCSS
- Test responsive design

## Important Constraints

### UI-Only Modifications
You can ONLY modify:
- ✅ Markup (HTML structure)
- ✅ Styles (CSS/TailwindCSS)
- ✅ Layout and spacing

You CANNOT modify:
- ❌ Routes or pages structure
- ❌ GraphQL queries
- ❌ Data flow or state

## Next Steps

1. **Template Developers** → [Installation Guide](./installation)
2. **Learn Structure** → [Template Structure](./template-structure)
3. **Explore Sections** → [Template Sections](./template-sections)

## Resources

- [Template Gallery](https://erxes.io/templates)
- [GitHub Examples](https://github.com/erxes-web-templates)
- [Discord Community](https://discord.com/invite/aaGzy3gQK5)

---

**Part of**: erxes Content Plugin
**License**: Enterprise Edition (EE)
**Updated**: 2026-01-16
EOF
```

### File 8: markdown/plugins/content/web-builder/installation.mdx

```bash
cat > markdown/plugins/content/web-builder/installation.mdx << 'EOF'
---
title: "Installation"
description: "Set up your local environment for building Web Builder templates"
---

# Installation

Set up your local environment for building composable, data-aware templates in the Web Builder.

## Prerequisites

- Node.js 18+ and a package manager (`yarn`, `npm`, or `pnpm`)
- A local erxes instance running. Follow the official guide: https://erxes.io/docs/local-setup
- Git access to the Web Builder monorepo and template repos

---

## Option A: Based on local erxes (Recommended)

### 1. Clone the Web Builder monorepo

```bash
git clone git@github.com:pages-web/web-builder.git
cd web-builder
```

### 2. Install dependencies

```bash
yarn install
# or: npm install
# or: pnpm install
```

### 3. Clone a template boilerplate

In `web-builder/apps/templates`, clone the template you need:

```bash
cd apps/templates
# choose one:
git clone git@github.com:erxes-web-templates/ecommerce-boilerplate.git
# or
git clone git@github.com:erxes-web-templates/tour-boilerplate.git
```

### 4. Configure environment

Copy the example env file:

```bash
cp .env.example .env.local
```

Add CMS/API variables needed for data-aware sections (e.g., `CMS_BASE_URL`, `API_TOKEN`).

### 5. Run the Web Builder locally

Start the dev server:

```bash
yarn dev
```

Then open `http://localhost:3000`. Confirm that:

- Global layout renders (header/footer/theme)
- Sections load with either live CMS data or mocked data
- Hot reload works when you edit a section or component

### 6. Verify linting and build

```bash
yarn lint   # catches accessibility, typing, and styling issues
yarn build  # ensures templates compile
```

---

## Option B: Based on SaaS erxes

### 1. Clone a SaaS-dependent template

```bash
git clone -b saas-dependent git@github.com:erxes-web-templates/ecommerce-boilerplate.git
cd ecommerce-boilerplate
```

### 2. Install a CORS browser extension

Ensure a CORS extension is installed and enabled in your browser for local development.

### 3. Set SaaS environment variables

Configure the environment values in `next.config.ts`:

```typescript
export default {
  env: {
    ERXES_API_URL: "https://sales.app.erxes.io/gateway/graphql",
    ERXES_URL: "https://sales.app.erxes.io/gateway",
    ERXES_CP_ID: "your-client-portal-id",
    ERXES_APP_TOKEN: "your-app-token",
  },
};
```

### 4. Run the template locally

```bash
yarn dev
```

---

## Next steps

Move on to [Template Structure](./template-structure) to see how pages, sections, and shared components are organized.

---

**Updated**: 2026-01-16
EOF
```

### File 9: markdown/plugins/content/web-builder/development-guide.mdx

```bash
cat > markdown/plugins/content/web-builder/development-guide.mdx << 'EOF'
---
title: "Development Guide"
description: "Rules and workflow for template developers"
---

# Development Guide

Rules and workflow for template developers: UI-only changes, repo setup, and what you are allowed to edit.

## UI-only rules (must follow)

You are working on a template inside the Web Builder system. **You cannot change core code.** Your job is UI only:

- Update markup, styling, spacing, and responsive behavior
- Rearrange and position existing fields/components
- Adjust copy and visuals based on Figma

You must **not**:

- Add or remove pages, sections, or core modules
- Change routing, data flow, queries, or configuration schemas
- Modify section type mapping or CMS contracts

> **Scope**: Treat the core as a platform. Change presentation only.

---

## Create your own repo and push a template

Use this flow to create a new repo for a template derived from a boilerplate.

### 1. Clone the boilerplate

```bash
git clone git@github.com:erxes-web-templates/template-boilerplate.git
```

### 2. Create a new empty repo

Create a new empty repo in https://github.com/orgs/erxes-web-templates. Do not initialize with a README.

### 3. Point your local repo at the new remote

```bash
git remote -v
git remote set-url origin git@github.com:erxes-web-templates/your-template.git
```

### 4. Push the template

```bash
git push -u origin main
```

---

## What you can change

### Pages (UI only)

You can update the UI inside existing page files. Common pages include:

- `app/products/page.tsx` (only ecommerce and hotel)
- `app/blog/page.tsx`
- `app/checkout/page.tsx`
- `app/profile/page.tsx`
- `app/auth/login/` and `app/auth/register/`

Do not change routing or how pages load sections.

### Sections and fields (UI only)

You can update **existing** section components inside `app/_components/sections/`. Keep the data shape intact and adjust UI only.

### Layout (UI only)

You can update the global shell and chrome:

- `app/_components/Header.tsx`
- `app/_components/Footer.tsx`
- `app/globals.css` (base styles only)

Do not change how theme values, menus, or metadata are loaded.

---

## Section Examples

### Hero Section

**Fields:**
- Background Image
- Title
- Content
- Primary CTA Button
- Secondary CTA Button

### Products Section (ecommerce only)

**Fields:**
- Title
- Description
- Products list
- Read More Button

### Contact Section

**Fields:**
- Title
- Description
- Contact Form
- Google Map
- Address, Email, Phone
- Social Links

---

## Template-specific focus

- **Ecommerce templates**: Developers change **product-related** pages and sections only
- **Tour templates**: Developers change **tour-related** pages and sections only

Keep all non-related pages/sections untouched unless explicitly requested.

---

**Updated**: 2026-01-16
EOF
```

### File 10: markdown/plugins/content/web-builder/template-structure.mdx

```bash
cat > markdown/plugins/content/web-builder/template-structure.mdx << 'EOF'
---
title: "Template Structure"
description: "Understand how templates are organized in Web Builder"
---

# Template Structure

Understand how the ecommerce boilerplate is organized so you can update UIs without touching core plumbing.

## Architecture at a Glance

- **Location**: Templates are cloned into `web-builder/apps/templates/`
- **App Router-first**: Routes live in `app/` with a shared layout
- **Composable sections**: Page JSON defines `pageItems`; React components render each section type
- **Data-aware**: GraphQL operations fetch CMS data; static JSON backs local mocks
- **UI-only scope**: Do not add/remove sections or change core wiring

---

## Top-Level Folders

### `app/`
All routes and page shells. Notable entries:
- `_components/`: Layout components and section components
- `page.tsx`: Home page that maps sections
- Route folders like `about/`, `contact/`, `products/`

### `components/`
Reusable UI components:
- `ui/`: Shadcn primitives (buttons, inputs, dialogs)
- `common/`: Shared widgets (loaders, forms, empty states)

### `data/`
Local config and mock content:
- `configs.json`: Template metadata, appearance tokens, menus
- `pages/*.json`: Page-level content for local development

### `graphql/`
Domain-specific operations grouped by feature:
- `auth/`, `clientportal/`, `cms/`, `ecommerce/`, `products/`

### `lib/`
Cross-cutting utilities:
- `apollo-wrapper.tsx`: Apollo Client setup
- Contexts: `AuthContext`, `CartContext`
- Hooks: `useClientPortal`, `usePage`, `fetchCms`

### `types/`
Shared TypeScript contracts

### `public/`
Static assets (images, icons, favicons)

---

## Page Composition Flow

**Home (`app/page.tsx`)**:
Imports `pageData` from `data/pages/index.json`, builds a section component map, and renders sections.

**Other routes**:
Pages like `about/page.tsx` and `contact/page.tsx` call `usePage(pageName)` to fetch CMS content.

**Layout**:
`app/layout.tsx` wraps everything ensuring GraphQL and layout chrome are available.

---

## Sections

- **Location**: `app/_components/sections/`
- **Registry**: Maps `section.type` to components
- **Behavior**: Sections handle their own data needs and provide fallbacks

---

## Config and Data Sources

- **Template config**: `data/configs.json` stores meta tags, theme tokens, menus
- **Page mocks**: `data/pages/*.json` supply content for local development
- **Environment flags**: `BUILD_MODE=true` toggles builder-driven rendering

---

## Shared UI and Utilities

- UI primitives in `components/ui`
- Cross-template widgets in `components/common`
- Utility helpers in `lib/utils.ts`

---

## GraphQL Layer

- Operations organized by domain inside `graphql/`
- `lib/apollo-wrapper.tsx` provides the provider setup
- Hooks standardize data requests across pages and sections

---

**Updated**: 2026-01-16
EOF
```

### File 11: markdown/plugins/content/web-builder/template-layout.mdx

```bash
cat > markdown/plugins/content/web-builder/template-layout.mdx << 'EOF'
---
title: "Template Layout"
description: "Understand the global layout components in Web Builder"
---

# Template Layout

Understand the global layout (header, footer, theme) so you can adjust UI without touching core logic.

> **Scope**: UI-only changes. Do not alter routing, data flow, or add/remove layout modules.

## Layout entry points

- **Root layout**: `app/layout.tsx` wraps all pages with providers
- **Client layout shell**: `app/_components/ClientLayout.tsx` orchestrates header, footer, and page container
- **Header/Footer**: `app/_components/Header.tsx` and `Footer.tsx` render navigation and site chrome
- **Styles**: `app/globals.css` and Tailwind tokens drive base styling

---

## Theme and branding

Theme tokens and branding values come from `data/configs.json`:

- **Fonts**: `appearance.baseFont`, `appearance.headingFont`
- **Colors**: `appearance.baseColor`, `appearance.backgroundColor`
- **Theme mode**: `theme: "light" | "dark"`
- **Meta**: `meta.title`, `meta.description`, `meta.favicon`, `meta.logo`
- **Menus**: `menus.main`, `menus.footerMenu`
- **Additional**: `additional.social`, `additional.copyright`

> Keep these contracts intact; adjust UI by consuming the existing values.

---

## Header fields (UI)

- Logo
- Site name / description
- Main menu
- Language switcher
- Contact fields: email, phone, address, social links
- Auth actions: login / signup buttons

---

## Footer fields (UI)

- Logo
- Site name / description
- Main menu and footer menu
- Language switcher
- Contact fields
- Legal links: privacy, terms
- Copyright text

---

## UI change guidelines

- Work inside `Header`/`Footer` components to adjust layout, spacing, and visuals
- Do not change how menus, branding, or theme values are fetched
- Keep accessibility in mind (aria labels, focus states, contrast)

---

## Testing

- Run `yarn dev` and verify header/footer across key pages
- Toggle theme and inspect responsiveness
- Run `yarn lint` before opening a PR

---

**Updated**: 2026-01-16
EOF
```

### File 12: markdown/plugins/content/web-builder/template-sections.mdx

```bash
cat > markdown/plugins/content/web-builder/template-sections.mdx << 'EOF'
---
title: "Template Sections"
description: "Update existing section UIs in Web Builder templates"
---

# Template Sections

Update the UIs of existing sections while keeping templates composable and data-aware.

## What is a section?

A section is a reusable slice of a page. Each section:

- Receives a `Section` object with a `type` string and a `config` payload
- Renders independently and can fetch its own data
- Is mapped to `section.type` in both JSON mocks and CMS responses

Files live in `app/_components/sections/` (e.g., `HeroSection.tsx`, `ProductsSection.tsx`).

> **Scope**: You cannot add new sections or modify core plumbing. Changes must stay within existing section UIs.

---

## Anatomy of a section

- **Signature**: Every section component accepts `{ section: Section }`
- **Config-driven props**: All styling and content comes from `section.config`
- **Data awareness**: Sections can call hooks for live data
- **Client vs server**: Add `"use client"` only when needed

Example: `HeroSection.tsx` reads `section.config.image`, `title`, `description`, and `primaryCta`.

---

## Where sections are registered

- **Build/local rendering**: `app/page.tsx` builds a component map
- **CMS-driven rendering**: `lib/usePage.tsx` switches on `section.type`

---

## Updating an existing section (UI-only checklist)

1. **Stay within the file**: Edit the section component, don't add new files
2. **Keep the contract**: Don't change `section.type` or how `section.config` is read
3. **Respect data hooks**: Leave data flow intact, only update presentation
4. **Handle states**: Preserve loading, empty, and error handling
5. **Test locally**: Use existing mocks to verify UI changes

---

## Common patterns from existing sections

- **Media-heavy**: `BannerSection` and `HeroSection` resolve images and provide CTAs
- **List/data-driven**: `ProductsSection`, `ToursSection`, `CmsPostsSection` fetch collections
- **Form/contact**: `ContactSection` and `FormSection` read fields from config
- **Personalization**: `LastViewedProductsSection` reads from cart/context

---

## Data contracts

- `Section` type includes:
  - `type: string`
  - `config?: any` (shape is section-specific)
  - Optional metadata: `content`, `contentType`, `order`, `name`

Document expected `config` fields in PRs or code comments.

---

## Testing a section

- **Local mock**: Add the section to `data/pages/*.json` and run `yarn dev`
- **Builder/CMS**: Set `BUILD_MODE=true` and load via the builder
- **Quality checks**: Run `yarn lint` and test all states

---

**Updated**: 2026-01-16
EOF
```

### File 13: markdown/plugins/content/web-builder/template-pages.mdx

```bash
cat > markdown/plugins/content/web-builder/template-pages.mdx << 'EOF'
---
title: "Template Pages"
description: "Understand existing pages in Web Builder templates"
---

# Template Pages

This guide covers the existing pages in templates. Developers may modify the user interface only.

> **Important**: You cannot add new pages or change routing/core logic. Update UI only (markup, styles, states, copy) inside existing page files.

---

## Page Structure (App Router)

### Core Pages

- **Home**: `app/page.tsx` - Renders sections from JSON or CMS
- **About**: `app/about/page.tsx` - Uses `usePage` to render CMS sections
- **Contact**: `app/contact/page.tsx` - Follows same pattern as About
- **Products**: `app/products/page.tsx` for listing; `app/products/[id]/` for details
- **Blog**: `app/blog/page.tsx` for listings; `app/blog/[id]/` for articles
- **Checkout**: `app/checkout/page.tsx`
- **Payment**: `app/payment/page.tsx`
- **Profile**: `app/profile/page.tsx` with tabs
- **Authentication**: `app/auth/login/` and `app/auth/register/`
- **Inquiry**: `app/inquiry/page.tsx`
- **Custom**: `app/custom/page.tsx`
- **Legal**: `app/legal/page.tsx`

---

### Global Configuration

- **Layout**: `app/layout.tsx` wraps all pages with providers
- **Sections**: Most pages retrieve sections from CMS or JSON files

---

## UI Modification Guidelines

### Permitted Changes

- Adjust markup, styles, component states, and copy
- Modify child components (e.g., profile tabs)

### Required Constraints

- Maintain all routing logic and `usePage` hooks
- Do not alter `section.type` mappings
- Preserve data flow and query variables
- Test in both local mode and builder/CMS mode

---

## Testing

- Verify all pages render correctly
- Test responsive behavior
- Check loading and error states
- Run `yarn lint` before submitting PR

---

**Updated**: 2026-01-16
EOF
```

---

## Step 6: Verify All Files Created

```bash
# List all created files
find markdown -type f | sort
```

You should see 14 files listed.

---

## Step 7: Check Git Status

```bash
git status
```

You should see all 14 files as "new file" in green.

---

## Step 8: Commit All Files

```bash
git add markdown/

git commit -m "docs: Add complete Web Builder documentation

Created comprehensive Web Builder documentation under Content plugin:

MDX Files (10):
- getting-started/local-setup.mdx
- plugins/content/overview.mdx
- plugins/content/web-builder/introduction.mdx
- plugins/content/web-builder/installation.mdx
- plugins/content/web-builder/development-guide.mdx
- plugins/content/web-builder/template-structure.mdx
- plugins/content/web-builder/template-layout.mdx
- plugins/content/web-builder/template-sections.mdx
- plugins/content/web-builder/template-pages.mdx

Navigation JSON Files (4):
- markdown/_meta.json
- markdown/plugins/_meta.json
- markdown/plugins/content/_meta.json
- markdown/plugins/content/web-builder/_meta.json

All content migrated from https://web-builder-doc.vercel.app
Web Builder is correctly positioned under Content plugin."
```

---

## Step 9: Push to GitHub

```bash
git push -u origin feat/add-web-builder-docs
```

Wait for the push to complete.

---

## Step 10: Create Pull Request

After pushing, GitHub will show you a link in the terminal output like:

```
remote: Create a pull request for 'feat/add-web-builder-docs' on GitHub by visiting:
remote:   https://github.com/erxes/erxes-global-profile/pull/new/feat/add-web-builder-docs
```

Copy that URL and open it in your browser, OR:

1. Go to: `https://github.com/erxes/erxes-global-profile`
2. Click the yellow "Compare & pull request" button
3. Fill in the PR details
4. Click "Create pull request"

---

## 🎉 Done!

You've successfully created all 14 documentation files using iTerm!

### Summary

- ✅ 10 MDX documentation files
- ✅ 4 JSON navigation files
- ✅ All content from Web Builder docs migrated
- ✅ Web Builder correctly under Content plugin
- ✅ Everything committed and pushed

---

## 💡 Tips

### If you make a mistake:

```bash
# Undo last commit (keeps files)
git reset --soft HEAD~1

# Undo last commit (deletes changes)
git reset --hard HEAD~1

# Delete a file
rm markdown/path/to/file.mdx
```

### Edit a file after creation:

```bash
# Open in default editor
open markdown/plugins/content/web-builder/introduction.mdx

# Or open in VS Code
code markdown/plugins/content/web-builder/introduction.mdx
```

---

**Created**: 2026-01-16
**Total Commands**: ~20 copy-paste commands
**Time Required**: ~5 minutes
