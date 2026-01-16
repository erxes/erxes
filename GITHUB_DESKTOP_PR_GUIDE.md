# erxes-global-profile Documentation Restructure Guide

## Quick Reference for Your Setup

**Your Repository Location**: `/user/mendorshikh/documents/GitHub/erxes-global-profile`
**Documentation Format**: MDX files
**Target**: Create new developer-friendly docs with Web Builder under Content Plugin

---

## Part 1: Create a New Branch Using GitHub Desktop

### Step 1: Open GitHub Desktop
1. Open GitHub Desktop application
2. Make sure you're in the `erxes-global-profile` repository (top left dropdown)

### Step 2: Create New Branch
1. Click **Current Branch** dropdown at the top
2. Click **New Branch** button
3. Name it: `feat/improve-docs-structure-with-web-builder`
4. Based on: `main` (or whatever your default branch is)
5. Click **Create Branch**

### Step 3: Verify Branch Created
- You should now see your new branch name at the top
- The branch exists locally on your computer

---

## Part 2: Explore Current Structure

Open your terminal (Command Prompt, PowerShell, or Terminal) and run:

```bash
# Navigate to the repository
cd /user/mendorshikh/documents/GitHub/erxes-global-profile

# List current structure
dir markdown  # Windows
# OR
ls -la markdown  # Mac/Linux

# See what MDX files exist
dir markdown /s *.mdx  # Windows
# OR
find markdown -name "*.mdx"  # Mac/Linux
```

Take note of:
- What folders exist in `markdown/`
- What MDX files are there
- Current documentation structure

---

## Part 3: Create New Documentation Structure

### Recommended Folder Structure

Create this structure in your `markdown/` folder:

```
markdown/
├── getting-started/
│   ├── introduction.mdx
│   ├── quick-start.mdx
│   ├── local-setup.mdx
│   ├── self-hosting.mdx
│   └── environment-configuration.mdx
│
├── architecture/
│   ├── overview.mdx
│   ├── microservices.mdx
│   ├── graphql-federation.mdx
│   ├── plugin-system.mdx
│   └── multi-tenancy.mdx
│
├── plugin-development/
│   ├── introduction.mdx
│   ├── creating-first-plugin.mdx
│   ├── backend-development.mdx
│   ├── frontend-development.mdx
│   └── best-practices.mdx
│
├── plugins/
│   ├── overview.mdx
│   ├── frontline/
│   │   ├── overview.mdx
│   │   └── setup.mdx
│   ├── sales/
│   │   ├── overview.mdx
│   │   └── setup.mdx
│   ├── operation/
│   │   ├── overview.mdx
│   │   └── setup.mdx
│   └── content/  ⭐ CONTENT PLUGIN (not Core Plugins)
│       ├── overview.mdx
│       ├── features.mdx
│       ├── setup.mdx
│       └── web-builder/  ⭐ WEB BUILDER UNDER CONTENT
│           ├── introduction.mdx
│           ├── for-template-developers.mdx
│           ├── for-ui-designers.mdx
│           ├── for-cms-developers.mdx
│           ├── installation.mdx
│           ├── development-guide.mdx
│           ├── template-structure.mdx
│           ├── template-layout.mdx
│           ├── template-sections.mdx
│           ├── template-pages.mdx
│           ├── cms-queries.mdx
│           ├── ssr-fetching.mdx
│           ├── csr-fetching.mdx
│           └── deployment.mdx
│
├── contributing/
│   ├── how-to-contribute.mdx
│   └── code-style-guide.mdx
│
└── resources/
    ├── faq.mdx
    ├── troubleshooting.mdx
    └── claude-ai-guide.mdx
```

### Commands to Create Structure

Open your terminal and run these commands:

**For Windows (Command Prompt):**
```cmd
cd /user/mendorshikh/documents/GitHub/erxes-global-profile

mkdir markdown\getting-started
mkdir markdown\architecture
mkdir markdown\plugin-development
mkdir markdown\plugins
mkdir markdown\plugins\frontline
mkdir markdown\plugins\sales
mkdir markdown\plugins\operation
mkdir markdown\plugins\content
mkdir markdown\plugins\content\web-builder
mkdir markdown\contributing
mkdir markdown\resources
```

**For Mac/Linux (Terminal):**
```bash
cd /user/mendorshikh/documents/GitHub/erxes-global-profile

mkdir -p markdown/getting-started
mkdir -p markdown/architecture
mkdir -p markdown/plugin-development
mkdir -p markdown/plugins/{frontline,sales,operation,content/web-builder}
mkdir -p markdown/contributing
mkdir -p markdown/resources
```

---

## Part 4: Create MDX Files

I'll provide you with template MDX files. Create these files in your text editor (VS Code, Notepad++, etc.)

### 4.1 Local Setup (Enhanced Version)

**File**: `markdown/getting-started/local-setup.mdx`

```mdx
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
# Install Node.js 18+ from nodejs.org
# Then install pnpm globally
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

**Option 2: Native Installation**
- **Mac**: `brew install mongodb-community`
- **Windows**: Download from mongodb.com
- **Linux**: Follow official MongoDB docs

#### Redis

**Option 1: Docker (Recommended)**
```bash
docker run -d -p 6379:6379 --name redis redis:alpine
```

**Option 2: Native Installation**
- **Mac**: `brew install redis`
- **Windows**: Download from redis.io
- **Linux**: `sudo apt install redis-server`

## Installation Steps

### 1. Clone Repository

```bash
# Clone the monorepo
git clone https://github.com/erxes/erxes.git
cd erxes

# Check you're in the right place
ls  # Should see: backend/ frontend/ apps/ scripts/
```

### 2. Install Dependencies

```bash
# Install all dependencies (this may take a few minutes)
pnpm install

# This installs dependencies for all packages in the monorepo
```

### 3. Configure Environment

```bash
# Create environment file
cp .env.example .env

# Edit .env with your preferred text editor
# Windows: notepad .env
# Mac: open .env
# Linux: nano .env
```

**Essential Environment Variables:**

```env
# Database
MONGO_URL=mongodb://localhost:27017/erxes
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# API Configuration
DOMAIN=http://localhost:3000
REACT_APP_API_URL=http://localhost:4000

# Plugin Management (enable plugins you want to use)
ENABLED_PLUGINS=sales,operation,frontline,content

# Development Settings
NODE_ENV=development
DISABLE_CHANGE_STREAM=true  # Recommended for local dev
```

### 4. Start Development Servers

You have several options:

**Option A: Start Core Services Only** (Gateway + Core API)
```bash
pnpm dev:core-api
```

**Option B: Start All Backend APIs**
```bash
pnpm dev:apis
```

**Option C: Start Frontend (in separate terminal)**
```bash
# Open a new terminal window/tab
cd erxes
pnpm dev:uis
```

**Option D: Start Everything** (two terminals)
```bash
# Terminal 1: All APIs
pnpm dev:apis

# Terminal 2: All UIs
pnpm dev:uis
```

### 5. Verify Installation

Open your browser and check these URLs:

- **Frontend**: http://localhost:3001
- **API Gateway**: http://localhost:4000/graphql
- **Core API**: http://localhost:3300
- **BullMQ Dashboard**: http://localhost:4000/bullmq-board

If you see the login screen at `localhost:3001`, congratulations! 🎉

## Development Workflow

### Using Nx Commands

```bash
# Run specific backend service
pnpm nx serve sales_api

# Run specific frontend plugin
pnpm nx serve sales_ui

# Build a specific project
pnpm nx build core-api

# Run tests
pnpm nx test sales_api

# Run only affected projects (smart rebuilds)
pnpm nx affected:build
pnpm nx affected:test

# See project graph
pnpm nx graph
```

### Hot Reload

- Backend services restart automatically on file changes
- Frontend plugins have hot module replacement (HMR)
- No need to manually restart after code changes

### Port Allocation

Default ports used by erxes:

| Service | Port | URL |
|---------|------|-----|
| Frontend (core-ui) | 3001 | http://localhost:3001 |
| API Gateway | 4000 | http://localhost:4000 |
| Core API | 3300 | http://localhost:3300 |
| Sales API | 3305 | http://localhost:3305 |
| Sales UI | 3005 | http://localhost:3005 |
| Operation API | 3306 | http://localhost:3306 |
| Operation UI | 3006 | http://localhost:3006 |

## Troubleshooting

### Port Already in Use

```bash
# Find process using port (Mac/Linux)
lsof -i :3001

# Find process using port (Windows)
netstat -ano | findstr :3001

# Kill the process
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules
pnpm install

# Clear Nx cache
pnpm nx reset
```

### MongoDB Connection Failed

```bash
# Check if MongoDB is running
# Mac/Linux:
ps aux | grep mongod

# Windows:
tasklist | findstr mongod

# Start MongoDB if not running
# Docker:
docker start mongodb

# Native (Mac):
brew services start mongodb-community
```

### Redis Connection Failed

```bash
# Check if Redis is running
redis-cli ping  # Should return PONG

# Start Redis
# Docker:
docker start redis

# Native (Mac):
brew services start redis
```

## Next Steps

- [Architecture Overview](/architecture/overview) - Understand the system
- [Creating Your First Plugin](/plugin-development/creating-first-plugin) - Build custom functionality
- [Frontend Development](/frontend-development/overview) - UI customization
- [Contributing Guide](/contributing/how-to-contribute) - Join the community

## Need Help?

- **Discord**: https://discord.com/invite/aaGzy3gQK5
- **GitHub Issues**: https://github.com/erxes/erxes/issues
- **Documentation**: https://erxes.io/docs

---

**Updated**: 2026-01-16
**Difficulty**: Beginner
**Time**: ~15 minutes
```

### 4.2 Content Plugin Overview

**File**: `markdown/plugins/content/overview.mdx`

```mdx
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
- **Version Control**: Content history and rollback

## Key Features

### 🏗️ Web Builder

Create beautiful, performant websites using modern web technologies:
- Next.js 14+ with App Router
- TailwindCSS for styling
- TypeScript for type safety
- Server-side and client-side rendering
- [Learn more →](./web-builder/introduction)

### 📝 Content Management

Flexible content modeling and management:
- Custom content types
- Rich text editor
- Media library
- Multi-language support
- Workflow management

### 🛍️ E-commerce

Full e-commerce capabilities:
- Product catalogs
- Shopping cart
- Checkout process
- Payment integration
- Order management

### 📚 Knowledge Base

Build help centers and documentation sites:
- Article management
- Categories and tags
- Search functionality
- Analytics

## Architecture

```
┌─────────────────────────────────────────┐
│     Next.js Templates (Frontend)        │
│   - E-commerce templates                │
│   - Tour & travel templates             │
│   - Corporate site templates            │
└─────────────────────────────────────────┘
                 ↓ GraphQL
┌─────────────────────────────────────────┐
│      Content Plugin API (Backend)       │
│   - Content storage (MongoDB)           │
│   - Asset management                    │
│   - GraphQL/tRPC endpoints              │
│   - CMS admin interface                 │
└─────────────────────────────────────────┘
```

## Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 14+, React 18, TailwindCSS, TypeScript |
| **Backend** | Node.js, GraphQL, tRPC, MongoDB |
| **Deployment** | Vercel, Docker, Kubernetes |

## Use Cases

### E-commerce Store
Build online stores with product catalogs, shopping carts, and checkout.

### Tour & Travel Sites
Create booking systems with itineraries, availability, and reservations.

### Corporate Websites
Professional company websites with portfolios and contact forms.

### Knowledge Bases
Documentation sites and help centers with search and categorization.

### Blogs & News Sites
Publishing platforms for articles, news, and updates.

## Getting Started

### For Different Audiences

- **Template Developers**: Build complete website templates
  → [Get Started](./web-builder/for-template-developers)

- **UI Designers**: Customize existing templates with your designs
  → [Get Started](./web-builder/for-ui-designers)

- **CMS Developers**: Integrate erxes CMS with custom applications
  → [Get Started](./web-builder/for-cms-developers)

### Quick Setup

1. [Install Content Plugin](./setup)
2. [Configure Settings](./configuration)
3. [Choose or Create Template](./web-builder/installation)
4. [Start Building](./web-builder/development-guide)

## Plugin Configuration

Enable the Content plugin in your `.env`:

```env
ENABLED_PLUGINS=sales,operation,frontline,content
```

Then restart your erxes services:

```bash
pnpm dev:apis
```

## API Reference

The Content plugin exposes several GraphQL endpoints:

### Queries
- `contentPages` - List all pages
- `contentPage` - Get single page
- `contentPosts` - List blog posts
- `contentProducts` - List products

### Mutations
- `contentPagesAdd` - Create page
- `contentPagesEdit` - Update page
- `contentPagesRemove` - Delete page

[Full API Reference →](../../api-reference/content-plugin)

## Examples

### Fetching Content

```typescript
import { gql, useQuery } from '@apollo/client';

const GET_PAGES = gql`
  query GetPages {
    contentPages {
      _id
      title
      slug
      content
      seoTitle
      seoDescription
    }
  }
`;

function PageList() {
  const { data, loading } = useQuery(GET_PAGES);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {data.contentPages.map(page => (
        <PageCard key={page._id} page={page} />
      ))}
    </div>
  );
}
```

## Resources

- [Web Builder Documentation](./web-builder/introduction)
- [Template Gallery](https://erxes.io/templates)
- [Video Tutorials](https://youtube.com/@erxesxos)
- [Community Examples](https://github.com/erxes/examples)

## Support

- **Discord**: https://discord.com/invite/aaGzy3gQK5
- **GitHub**: https://github.com/erxes/erxes
- **Enterprise Support**: sales@erxes.io

---

**License**: Enterprise Edition (EE)
**Plugin Type**: Official
**Maintained by**: erxes Team
```

### 4.3 Web Builder Introduction

**File**: `markdown/plugins/content/web-builder/introduction.mdx`

```mdx
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

### Pages
Route-based views in your Next.js application:
- Home page
- Product listings
- Product details
- Blog
- Checkout

### CMS Integration
Dynamic content pulled from erxes backend via GraphQL:
- Real-time content updates
- Asset management
- SEO configuration
- Multi-language support

## Architecture

```
┌──────────────────────────────────────────────┐
│         Next.js Template Application         │
│                                              │
│  ┌────────────┐  ┌────────────┐            │
│  │   Pages    │  │  Sections  │            │
│  │  (Routes)  │→ │ (Components)│            │
│  └────────────┘  └────────────┘            │
│         ↓              ↓                     │
│  ┌────────────────────────────┐             │
│  │    Layouts (Shell)         │             │
│  │  Header, Footer, Theme     │             │
│  └────────────────────────────┘             │
└──────────────────────────────────────────────┘
                   ↓ GraphQL API
┌──────────────────────────────────────────────┐
│       erxes Content Plugin (Backend)         │
│                                              │
│  - Content storage (MongoDB)                 │
│  - Asset management                          │
│  - Configuration & settings                  │
│  - SEO metadata                              │
└──────────────────────────────────────────────┘
```

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
- **ISR**: Incremental static regeneration

### Development Tools
- **Hot Reload**: Instant feedback during development
- **Mock Data**: JSON fixtures for offline development
- **TypeScript**: IntelliSense and type safety

## Who Should Use Web Builder?

### Template Developers
**Role**: Build complete website templates from scratch

**Skills Needed**:
- React & TypeScript
- Next.js & TailwindCSS
- GraphQL
- Responsive design

**What You'll Do**:
- Clone boilerplate templates
- Adjust UI to match Figma designs
- Integrate with CMS API
- Deploy to production

[Get Started →](./for-template-developers)

### UI Designers
**Role**: Customize existing templates with your designs

**Skills Needed**:
- HTML & CSS
- Basic React knowledge
- Design tools (Figma, Sketch)

**What You'll Do**:
- Modify styles and layouts
- Adjust spacing and typography
- Match brand guidelines
- Ensure responsive design

[Get Started →](./for-ui-designers)

### CMS + Next.js Developers
**Role**: Integrate erxes CMS with custom Next.js apps

**Skills Needed**:
- Advanced Next.js knowledge
- GraphQL & API integration
- MongoDB understanding

**What You'll Do**:
- Set up custom Next.js projects
- Integrate erxes GraphQL API
- Implement SSR/CSR strategies
- Optimize performance

[Get Started →](./for-cms-developers)

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
# Add your erxes API credentials
```

### 3. Start Development
```bash
pnpm dev
# Opens at http://localhost:3000
```

### 4. Customize UI
- Modify components in `app/_components/`
- Adjust styles with TailwindCSS
- Test responsive design

### 5. Deploy
```bash
pnpm build
# Deploy to Vercel, Docker, or your platform
```

## Important Constraints

### UI-Only Modifications
You can ONLY modify:
- ✅ Markup (HTML structure)
- ✅ Styles (CSS/TailwindCSS)
- ✅ Layout and spacing
- ✅ Responsive behavior

You CANNOT modify:
- ❌ Routes or pages structure
- ❌ GraphQL queries
- ❌ Data flow or state
- ❌ Core modules or types

### Data Integrity
Keep the data shape intact while adjusting UI:
- Sections expose specific fields (Title, Content, Images, CTAs)
- These fields must remain even if visually redesigned
- The CMS depends on these contracts

## Template Types

### E-commerce Template
**Use for**: Online stores, product catalogs
**Features**: Product listings, shopping cart, checkout, order management

### Tour Template
**Use for**: Travel agencies, tour operators
**Features**: Tour listings, availability, booking, itineraries

### Corporate Template
**Use for**: Company websites, portfolios
**Features**: About pages, services, contact forms, team pages

## Example: Simple Page

```typescript
// app/products/page.tsx
import { getProducts } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

export default async function ProductsPage() {
  // Fetch products from erxes CMS
  const products = await getProducts();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Our Products</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

## Next Steps

Choose your path:

1. **Template Developers** → [Installation Guide](./installation)
2. **UI Designers** → [Design Guide](./for-ui-designers)
3. **CMS Developers** → [CMS Integration](./cms-queries)

Or explore:
- [Template Structure](./template-structure)
- [Development Guide](./development-guide)
- [Deployment](./deployment)

## Resources

- [Template Gallery](https://erxes.io/templates)
- [GitHub Examples](https://github.com/erxes-web-templates)
- [Video Tutorials](https://youtube.com/@erxesxos)
- [Discord Community](https://discord.com/invite/aaGzy3gQK5)

---

**Part of**: erxes Content Plugin
**License**: Enterprise Edition (EE)
**Updated**: 2026-01-16
```

---

## Part 5: Create Pull Request with GitHub Desktop

### Step 1: Review Your Changes in GitHub Desktop

1. Open GitHub Desktop
2. You should see all your new files listed in the left sidebar
3. Review each file to make sure it looks correct

### Step 2: Commit Changes

1. In the bottom left, you'll see:
   - **Summary** field (required)
   - **Description** field (optional)

2. Fill in the commit message:

**Summary:**
```
docs: Restructure documentation with Web Builder under Content plugin
```

**Description:**
```
Created new developer-friendly documentation structure with:

- Enhanced local setup guide with troubleshooting
- Clear plugin documentation organization
- Web Builder docs properly positioned under Content plugin (not Core)
- MDX format for all documentation files
- Better developer experience and discoverability

New structure:
- getting-started/ - Onboarding documentation
- architecture/ - System architecture docs
- plugin-development/ - Plugin creation guides
- plugins/content/web-builder/ - Web Builder under Content plugin
- contributing/ - Contribution guidelines
- resources/ - Additional resources

This reorganization makes it easier for developers to find and understand
erxes documentation while properly positioning Web Builder as part of
the Content plugin ecosystem.
```

3. Click **Commit to feat/improve-docs-structure-with-web-builder**

### Step 3: Publish Branch

1. After committing, you'll see a button: **Publish branch**
2. Click it to push your branch to GitHub
3. Wait for the upload to complete

### Step 4: Create Pull Request

1. After publishing, GitHub Desktop will show: **Create Pull Request**
2. Click **Create Pull Request**
3. This opens GitHub in your browser

### Step 5: Fill Out PR Details on GitHub

**Title:**
```
docs: Restructure documentation with improved developer experience
```

**Description:**
```markdown
## Summary

Restructures the erxes documentation with improved organization and developer experience. Web Builder documentation is now properly positioned under the Content plugin.

## Changes

### New Documentation Structure
- ✅ Created clear folder hierarchy
- ✅ Enhanced local-setup.mdx with troubleshooting
- ✅ Added Content plugin overview
- ✅ Positioned Web Builder under plugins/content/ (not core-plugins)
- ✅ Created MDX files for all sections

### Documentation Sections Added
- **Getting Started**: Introduction, Quick Start, Local Setup
- **Architecture**: System overview and patterns
- **Plugin Development**: Creating custom plugins
- **Plugins**: Official plugin documentation
  - **Content Plugin** → **Web Builder** (correct location)
- **Contributing**: How to contribute
- **Resources**: FAQ, troubleshooting, AI guide

### Web Builder Integration
- Properly positioned under Content plugin
- Includes guides for three audiences:
  * Template Developers
  * UI Designers
  * CMS + Next.js Developers
- Complete installation and development guides

## Testing

- [ ] Local build successful
- [ ] All links work correctly
- [ ] Navigation is intuitive
- [ ] Mobile responsive
- [ ] Search works (if applicable)

## Screenshots

(Add screenshots of the new documentation structure if possible)

## Benefits

- 🎯 Better information architecture
- 🔍 Improved discoverability
- 📚 Clear learning path for developers
- 🔗 Proper positioning of Web Builder
- 🧭 Intuitive navigation

## Related Issues

Closes #[issue-number-if-exists]

## Next Steps

After merge:
1. Update erxes.io to use new documentation structure
2. Test all links and navigation
3. Gather user feedback

---

cc: @team-members-to-review
```

5. Click **Create Pull Request**

### Step 6: Done!

Your PR is now created! Team members can:
- Review your changes
- Leave comments
- Request modifications
- Approve and merge

---

## Part 6: Making Updates After PR Feedback

If reviewers request changes:

### In GitHub Desktop:

1. Make the requested changes to your files
2. Save the files
3. GitHub Desktop will show the new changes
4. Commit again with a message like:
   ```
   docs: Address review feedback - update Web Builder introduction
   ```
5. Click **Push origin** to update the PR
6. The PR automatically updates with your new commits!

---

## Troubleshooting

### Can't See Repository in GitHub Desktop
1. Go to File → Add Local Repository
2. Browse to: `/user/mendorshikh/documents/GitHub/erxes-global-profile`
3. Click Add Repository

### Branch Not Showing
1. Make sure you've selected the correct repository
2. Check that you created the branch (Current Branch dropdown)
3. If stuck, try: Repository → Open in Command Prompt/Terminal

### Can't Push Branch
1. Check your internet connection
2. Make sure you're signed in to GitHub Desktop
3. Check repository permissions (you need write access)

---

## Quick Command Reference

### Check Current Branch
```bash
cd /user/mendorshikh/documents/GitHub/erxes-global-profile
git branch  # Shows current branch with *
```

### See What Changed
```bash
git status  # See modified files
git diff    # See actual changes
```

### Create Files Quickly
```bash
# Create multiple files at once (Windows PowerShell)
New-Item -ItemType File -Path markdown\plugins\content\web-builder\introduction.mdx

# Mac/Linux
touch markdown/plugins/content/web-builder/introduction.mdx
```

---

## Need Help?

If you get stuck:
1. Take a screenshot of the error
2. Share it in Discord: https://discord.com/invite/aaGzy3gQK5
3. Or create a GitHub issue with details

---

**Created**: 2026-01-16
**For**: erxes-global-profile private repository
**Method**: GitHub Desktop workflow
