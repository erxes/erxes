# erxes.io/docs - Proposed Documentation Architecture

## Executive Summary

This proposal merges the Web Builder documentation into the main erxes documentation while significantly improving the overall developer experience, creating a unified, well-organized documentation hub.

## Current Problems

1. **Fragmented Documentation**: Web Builder docs are separate from main erxes docs
2. **Unclear Navigation**: Current docs don't clearly guide different developer personas
3. **Missing Context**: Web Builder appears isolated, not clearly positioned as part of Content plugin
4. **Limited Scope**: Current docs focus mainly on setup, lacking comprehensive development guides
5. **Poor Discoverability**: Hard to find specific plugin documentation

## Proposed Solution: Unified Developer-Friendly Documentation

### New Sitemap Structure

```
erxes.io/docs/
│
├─── 🚀 Getting Started
│    ├─── Introduction to erxes XOS
│    ├─── Quick Start (5-minute setup)
│    ├─── Local Setup (detailed)
│    ├─── Self-Hosting Guide
│    ├─── Docker Setup
│    └─── Environment Configuration
│
├─── 🏗️ Architecture
│    ├─── Overview & Core Concepts
│    ├─── Microservices Architecture
│    ├─── GraphQL Federation
│    ├─── Module Federation (Frontend)
│    ├─── Plugin System
│    ├─── Multi-tenancy
│    └─── Database Schema
│
├─── 🔌 Plugin Development
│    ├─── Introduction
│    ├─── Creating Your First Plugin
│    ├─── Backend Plugin Development
│    │    ├─── GraphQL Schema & Resolvers
│    │    ├─── tRPC Endpoints
│    │    ├─── Database Models
│    │    ├─── Service Discovery
│    │    └─── Automations & Segments
│    ├─── Frontend Plugin Development
│    │    ├─── Module Federation Setup
│    │    ├─── Plugin Configuration
│    │    ├─── Components & Pages
│    │    ├─── State Management
│    │    └─── Styling with TailwindCSS
│    ├─── Testing Plugins
│    ├─── Publishing Plugins
│    └─── Best Practices
│
├─── 📦 Core Plugins
│    ├─── Overview
│    ├─── Frontline (Customer Support)
│    │    ├─── Features
│    │    ├─── Setup Guide
│    │    ├─── API Reference
│    │    └─── Customization
│    ├─── Sales
│    │    ├─── Features
│    │    ├─── Setup Guide
│    │    ├─── API Reference
│    │    └─── Customization
│    ├─── Operation
│    │    ├─── Features
│    │    ├─── Setup Guide
│    │    ├─── API Reference
│    │    └─── Customization
│    └─── Content (Web Builder) ⭐ NEW
│         ├─── Overview
│         ├─── Features & Capabilities
│         ├─── Setup & Installation
│         ├─── Web Builder Guide
│         │    ├─── Introduction
│         │    ├─── Architecture
│         │    ├─── Getting Started
│         │    │    ├─── For Template Developers
│         │    │    ├─── For UI Designers
│         │    │    └─── For CMS + Next.js Developers
│         │    ├─── Template Development
│         │    │    ├─── Installation
│         │    │    ├─── Development Guide
│         │    │    ├─── Template Structure
│         │    │    ├─── Template Layout
│         │    │    ├─── Template Sections
│         │    │    └─── Template Pages
│         │    ├─── CMS Integration
│         │    │    ├─── Queries
│         │    │    ├─── SSR Fetching
│         │    │    └─── CSR Fetching
│         │    ├─── Deployment
│         │    └─── Best Practices
│         ├─── API Reference
│         └─── Troubleshooting
│
├─── 📱 Frontend Development
│    ├─── Core UI Overview
│    ├─── Module Federation
│    ├─── Component Library (erxes-ui)
│    ├─── State Management (Jotai)
│    ├─── Routing
│    ├─── Forms & Validation
│    ├─── Internationalization (i18n)
│    └─── Theming & Styling
│
├─── 🔧 Backend Development
│    ├─── Gateway & Service Discovery
│    ├─── GraphQL API
│    ├─── tRPC API
│    ├─── Database (MongoDB)
│    ├─── Caching (Redis)
│    ├─── Job Queues (BullMQ)
│    ├─── Real-time (Subscriptions)
│    └─── Authentication & Authorization
│
├─── 🧪 Testing
│    ├─── Testing Strategy
│    ├─── Unit Testing
│    ├─── Integration Testing
│    ├─── E2E Testing
│    └─── Testing Plugins
│
├─── 🚢 Deployment
│    ├─── Docker Deployment
│    ├─── Kubernetes
│    ├─── Cloud Platforms
│    ├─── CI/CD
│    └─── Monitoring & Logging
│
├─── 📚 API Reference
│    ├─── GraphQL API
│    │    ├─── Core API
│    │    ├─── Plugin APIs
│    │    └─── Playground
│    ├─── tRPC API
│    ├─── REST API
│    └─── Webhooks
│
├─── 🤝 Contributing
│    ├─── How to Contribute
│    ├─── Code of Conduct
│    ├─── Development Workflow
│    ├─── Pull Request Guidelines
│    ├─── Code Style Guide
│    └─── Documentation Contributions
│
├─── 🎓 Tutorials
│    ├─── Build a Custom Plugin from Scratch
│    ├─── Create a Custom Template (Web Builder)
│    ├─── Integrate External Service
│    ├─── Build a Custom Widget
│    └─── Implement Custom Automation
│
└─── 🔍 Resources
     ├─── FAQ
     ├─── Troubleshooting
     ├─── Migration Guides
     ├─── Changelog
     ├─── Roadmap
     ├─── Community
     └─── CLAUDE.md (AI Assistant Guide)
```

## Key Improvements

### 1. **Clear Information Architecture**
- Organized by persona and task, not just feature
- Progressive disclosure: Quick Start → Detailed Guides → Advanced Topics
- Clear navigation breadcrumbs

### 2. **Integrated Web Builder Documentation**
- Positioned correctly as part of Content plugin
- Maintains all existing content
- Shows relationship to broader erxes ecosystem
- Includes all three audience paths (Template Devs, UI Designers, CMS Devs)

### 3. **Developer-Friendly Organization**
- **Getting Started**: Fast onboarding
- **Architecture**: Understand before building
- **Development Guides**: Frontend, Backend, Plugins
- **API Reference**: Quick lookup
- **Tutorials**: Learn by doing

### 4. **Multiple Audience Support**
- **New Users**: Getting Started → Quick Start
- **Plugin Developers**: Plugin Development section
- **Template Developers**: Core Plugins → Content → Web Builder Guide
- **UI Designers**: Same path, simplified content
- **Contributors**: Contributing section
- **AI Assistants**: CLAUDE.md in Resources

### 5. **Better Discoverability**
- Search-optimized structure
- Related content links
- Cross-references between sections
- "Next steps" suggestions

## Implementation Strategy

### Phase 1: Structure & Migration (Week 1)
1. Create new folder structure in erxes-global-profile repo
2. Migrate existing erxes.io/docs content to new structure
3. Migrate Web Builder docs to Content plugin section
4. Update internal links

### Phase 2: Content Enhancement (Week 2)
1. Add missing Architecture documentation
2. Expand Plugin Development guides
3. Create API Reference sections
4. Add tutorials

### Phase 3: Polish & Launch (Week 3)
1. Add search functionality
2. Create navigation components
3. Add code playgrounds
4. User testing & feedback

## File Organization (GitHub Repo Structure)

```
erxes-global-profile/
├── markdown/
│   ├── getting-started/
│   │   ├── introduction.md
│   │   ├── quick-start.md
│   │   ├── local-setup.md
│   │   ├── self-hosting.md
│   │   ├── docker-setup.md
│   │   └── environment-config.md
│   │
│   ├── architecture/
│   │   ├── overview.md
│   │   ├── microservices.md
│   │   ├── graphql-federation.md
│   │   ├── module-federation.md
│   │   ├── plugin-system.md
│   │   ├── multi-tenancy.md
│   │   └── database-schema.md
│   │
│   ├── plugin-development/
│   │   ├── introduction.md
│   │   ├── first-plugin.md
│   │   ├── backend/
│   │   │   ├── graphql.md
│   │   │   ├── trpc.md
│   │   │   ├── models.md
│   │   │   ├── service-discovery.md
│   │   │   └── automations.md
│   │   ├── frontend/
│   │   │   ├── module-federation.md
│   │   │   ├── configuration.md
│   │   │   ├── components.md
│   │   │   ├── state-management.md
│   │   │   └── styling.md
│   │   ├── testing.md
│   │   ├── publishing.md
│   │   └── best-practices.md
│   │
│   ├── core-plugins/
│   │   ├── overview.md
│   │   ├── frontline/
│   │   ├── sales/
│   │   ├── operation/
│   │   └── content/
│   │       ├── overview.md
│   │       ├── features.md
│   │       ├── setup.md
│   │       └── web-builder/  ⭐ WEB BUILDER DOCS HERE
│   │           ├── introduction.md
│   │           ├── architecture.md
│   │           ├── getting-started/
│   │           │   ├── template-developers.md
│   │           │   ├── ui-designers.md
│   │           │   └── cms-nextjs-developers.md
│   │           ├── template-development/
│   │           │   ├── installation.md
│   │           │   ├── development-guide.md
│   │           │   ├── template-structure.md
│   │           │   ├── template-layout.md
│   │           │   ├── template-sections.md
│   │           │   └── template-pages.md
│   │           ├── cms-integration/
│   │           │   ├── queries.md
│   │           │   ├── ssr-fetching.md
│   │           │   └── csr-fetching.md
│   │           ├── deployment.md
│   │           └── best-practices.md
│   │
│   ├── frontend-development/
│   ├── backend-development/
│   ├── testing/
│   ├── deployment/
│   ├── api-reference/
│   ├── contributing/
│   ├── tutorials/
│   └── resources/
│       └── claude-ai-guide.md (symlink to ../../CLAUDE.md)
│
├── _meta.json  (Nextra configuration for sidebar)
├── theme.config.tsx  (Nextra theme config)
└── README.md
```

## Navigation Configuration (_meta.json example)

```json
{
  "getting-started": "🚀 Getting Started",
  "architecture": "🏗️ Architecture",
  "plugin-development": "🔌 Plugin Development",
  "core-plugins": {
    "title": "📦 Core Plugins",
    "items": {
      "overview": "Overview",
      "frontline": "Frontline",
      "sales": "Sales",
      "operation": "Operation",
      "content": {
        "title": "Content & Web Builder",
        "items": {
          "overview": "Overview",
          "features": "Features",
          "setup": "Setup",
          "web-builder": "Web Builder Guide"
        }
      }
    }
  },
  "frontend-development": "📱 Frontend Development",
  "backend-development": "🔧 Backend Development",
  "testing": "🧪 Testing",
  "deployment": "🚢 Deployment",
  "api-reference": "📚 API Reference",
  "contributing": "🤝 Contributing",
  "tutorials": "🎓 Tutorials",
  "resources": "🔍 Resources"
}
```

## Benefits

### For Users
✅ Easier to find what they need
✅ Clear learning path
✅ Better context about how pieces fit together

### For Template Developers
✅ All Web Builder docs integrated with main docs
✅ Clear relationship to Content plugin
✅ Access to broader erxes ecosystem docs

### For Plugin Developers
✅ Comprehensive guides
✅ Clear examples
✅ API references easily accessible

### For Contributors
✅ Better organized contribution guidelines
✅ Clear code standards
✅ Development workflow documented

### For AI Assistants
✅ CLAUDE.md accessible in Resources
✅ Better structured information
✅ Clearer context for code assistance

## Next Steps

1. **Review & Approve** this architecture proposal
2. **Clone repos** (erxes-global-profile, web-builder-doc) locally
3. **Create branch** in erxes-global-profile for the merge
4. **Migrate content** following the new structure
5. **Create PR** with the merged documentation
6. **Deploy** to erxes.io/docs

## Success Metrics

- **Reduced time to first contribution**: Developers can contribute faster
- **Improved documentation search**: Higher success rate finding content
- **Better onboarding**: New developers productive in < 1 hour
- **Unified experience**: All erxes documentation in one place

---

**Status**: Proposal
**Created**: 2026-01-16
**Author**: Claude (AI Assistant)
**For**: erxes Documentation Improvement Initiative
