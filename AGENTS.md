# erxes AI Operating Rules

## ⟶ Start Here: one entry point

**To build anything from a plain "I want ..." request, run `.agents/ROUTER.md`**
(Claude Code: the `/erxes "I want ..."` command). ROUTER is the single linear
procedure — it classifies the request, resolves the exact plugin/module from
`.agents/maps/feature-map.yaml` (so you never guess or ask "which plugin"), asks
only about the desired **outcome**, confirms scope, loads just the rules that
scope needs, and builds by copying a real reference file.

Everything below in this document is the **reference material** ROUTER draws on
(rules, conventions, architecture). You do not need to execute the older
"Protocol"/"Workflow" step lists yourself — ROUTER supersedes them. Read the
specific rule sections when ROUTER's tier table (STEP 6) tells you to.

## Extended Documentation

For detailed information, see the `.agents/` directory:

- `.agents/manifest.yaml` — Rule layers, skill registry, plugin registry, context assembly protocol
- `.agents/rules/` — Modular engineering rules (non-negotiable, architecture, code-style, and more)
- `.agents/skills/` — Skill contracts and the `SEMANTIC_INDEX.md` for intent-based skill lookup
- `.agents/maps/feature-map.yaml` — Feature-to-plugin mapping for scope detection
- `.agents/scripts/` — `assemble-context.sh`, `preflight-check.sh`, `validate-manifest.sh`, `validate-scaffold.sh`
- `.agents/state/` — Runtime state written by skills (e.g., `last-detect-scope.json`)

---

## Agent Manifest Protocol (AMP) v1.0

This repository uses the **Agent Manifest Protocol** to ensure all AI agents
have complete, consistent context before making changes. The protocol is
declared in `.agents/manifest.yaml` and enforced through contract-based skills.

### Entry Point

**The entry point is `.agents/ROUTER.md` (run via `/erxes`).** `manifest.yaml` is
the registry/reference it uses — read it when you need the data below, not as a
first step. This file declares:
- Rule layers with precedence (constitution → global → category → plugin)
- Skill registry with contracts
- Plugin registry
- Context assembly protocol
- Validation requirements

### Quick Start

```bash
# Assemble context for your working directory
.agents/scripts/assemble-context.sh <path> [skill-name]

# Example: Working on content plugin table feature
.agents/scripts/assemble-context.sh frontend/plugins/content_ui/src/modules/cms create-table

# Validate manifest integrity
.agents/scripts/validate-manifest.sh
```

### Feature Mapping

When user describes a feature, search `.agents/maps/feature-map.yaml` to find:
- Which plugin owns this feature
- Which module to implement in
- Standard components and templates
- Scope (frontend, backend, or both)

Example: User says "Add tags to posts" → Map to `content/cms/tags`

### Protocol

1. **Read manifest.yaml** — Understand the system
2. **Assemble context** — Load all applicable rule layers
3. **Load skill contract** — If using a skill, load its contract.yaml
4. **Run detect-scope** — Analyze request, identify plugin/module, load code context
5. **Run pre-flight check** — Validate detect-scope output before proceeding (HARD GATE)
6. **Run intake** — Confirm scope and build checklist (receives from detect-scope)
7. **Execute with rules** — Follow loaded rules and skill workflow
8. **Validate** — Run required validation before finishing

## Purpose

These rules are the root source of truth for AI agents working in this repo.
Agents should preserve existing architecture, local patterns, and product
behavior while keeping changes small.

## General Rules

- **ALWAYS read `.agents/manifest.yaml` first** before any other file.
- Use the `assemble-context` skill to load all applicable rule layers
  automatically.
- Read relevant `.agents/rules/*.md` and
  `.agents/skills/<skill-name>/contract.yaml` files for task-specific guidance.
- Search for a similar implementation before creating new code.
- Reuse existing components, hooks, GraphQL documents, utilities, and state
  patterns before adding new ones.
- Keep changes minimal and scoped to the requested task.
- Do not refactor unrelated files.
- Do not introduce new dependencies unless the task explicitly requires it.
- Prefer repository consistency over personal preference.

## Architecture Rules

- Plugins must remain isolated; avoid cross-plugin imports.
- Shared frontend UI primitives belong in `frontend/libs/erxes-ui`.
- Shared frontend business/UI modules belong in `frontend/libs/ui-modules`.
- `frontend/core-ui` is the Module Federation host app, not the default place
  for reusable plugin UI.
- Follow existing GraphQL, Apollo, routing, and state management patterns in
  the touched project.
- Name GraphQL queries and mutations with the plugin or module prefix plus the
  operation purpose, such as `cmsPageList`; operation names must be unique.
- Do not introduce new `schemaWrapper` usage in backend schema definitions.
  Define schemas directly with `new Schema(...)` and explicit fields following
  nearby backend patterns; leave existing `schemaWrapper` usage untouched unless
  the task explicitly asks to migrate it.
- Do not modify backend contracts from a frontend task unless explicitly
  requested.

## Workflow

> **If you ran `/erxes` / `.agents/ROUTER.md`, you have already done this list** —
> ROUTER STEP 0–6 *is* this workflow, automated and tiered. The steps below are
> the manual/reference form (and the canonical detail for the "during" and
> "after" phases). The `detect-scope → preflight → intake` steps are the legacy
> scope mechanism; ROUTER STEP 2 + STEP 5 replace them. Don't run both.

Before coding:

1. **Read `.agents/ROUTER.md`** — This is the entry point (or run `/erxes`).
2. **Consult Semantic Index** — Read `.agents/skills/SEMANTIC_INDEX.md` to find the correct skills for your intent or to troubleshoot symptoms (404s, loading errors).
3. **Assemble context** — Run `.agents/scripts/assemble-context.sh <path> [skill]`
   or follow the `assemble-context` skill to load all applicable rule layers.
4. **Run detect-scope** — Use `.agents/skills/detect-scope` to analyze the user
   request, identify the target plugin/module, load relevant code context, and
   ask minimal informed questions. **ALWAYS run detect-scope before intake.**
   detect-scope MUST write output to `.agents/state/last-detect-scope.json`.
5. **Run pre-flight check** — Execute `.agents/scripts/preflight-check.sh`.
   **This is a HARD GATE.** If detect-scope did not complete, this script FAILS
   and intake CANNOT run. The script validates:
   - detect-scope state file exists
   - Required fields present (plugin, action, scope, user_confirmed, goal_condition)
   - user_confirmed is true
6. **Run intake** — Use `.agents/skills/intake` to build the component checklist
   and confirm scope. Intake receives detected scope from detect-scope.
   **NEVER start coding without confirmed scope.**
7. **Read ALL relevant rules** — Load `.agents/rules/*.md` files declared in the
   manifest for your working path. **MUST read `non-negotiable.md` IN FULL.**
   **MUST read `architecture.md` IN FULL.**
   **MUST read `code-style.md` IN FULL.**
   You are responsible for EVERY rule in these files.
8. **Load skill contract** (if applicable) — Read
   `.agents/skills/<skill-name>/contract.yaml` before executing any skill.
9. **Confirm scaffold awareness** — If using `create-plugin` skill, acknowledge
   that scaffolded code REQUIRES fixing. The scaffold generates violations.
10. Search for similar implementations with `rg`.
11. Confirm local routing, GraphQL, state, and UI patterns.
12. Reuse nearby code structure before inventing a new one.

During coding:

1. Keep changes small and readable.
2. Preserve naming conventions and UX behavior unless the task changes them.
3. Keep hooks, GraphQL documents, constants, types, and state near the feature
   they support unless the repo already has a shared location.
4. Remove debug code and avoid commented-out dead code.

After coding:

1. Run the focused project validation that exists in Nx.
2. For frontend plugins, prefer `pnpm nx lint <plugin>`,
   `pnpm nx build <plugin>`, and `pnpm nx test <plugin>` when tests or test
   setup are touched.
3. Fix TypeScript, lint, build, and Sonar issues introduced by the change.
4. Review the diff for unrelated edits before finishing.
5. **Run `.agents/scripts/validate-manifest.sh`** when modifying any `.agents/`
   files to ensure system integrity.

After creating a PR:

6. **Run PR Review Loop** — Use `.agents/skills/pr-review-loop` to poll AI
   reviewer comments (CodeRabbit, Sourcery, Claude Code Action, Kimi, SonarCloud),
   address every actionable item, wait for CI checks, and loop until zero open
   comments and all checks green. **Do not consider the task done until the PR
   review loop passes.**
7. **If you created a plugin, run `.agents/scripts/validate-scaffold.sh <plugin> [scope]`**
   to ensure the scaffolded code was properly fixed.

## PR Review Loop (Mandatory)

The erxes repo uses AI reviewers (CodeRabbit, Sourcery, Claude Code Action, Kimi,
SonarCloud) on every PR. You MUST NOT declare a task complete while:

- PR comments from AI reviewers are unresolved
- CI checks are failing
- `github-advanced-security[bot]` has flagged regressions

### After Every Commit to a PR

1. **Wait for CI** — Poll `gh pr checks` until no check is `pending`
2. **Buffer** — Sleep 180s for async AI reviewers to finish posting
3. **Poll comment stability** — Wait for comment count to stabilize across 2 consecutive polls
4. **Triage** — Classify every comment: fix vs reply vs skip
5. **Apply fixes** — One consolidated commit per round with all code changes
6. **Post replies** — For non-actionable items (style, docs, out-of-scope)
7. **Loop** — Re-fetch review state. Repeat until ALL of:
   - Zero unanswered bot threads (use author-engagement filter, not `isResolved`)
   - Zero failing relevant checks
   - Zero walkthrough findings (Kimi/SonarCloud top-level comments)
   - Comment count stable
   - Working tree clean

### Stop Conditions

- **Settled** — all reviews addressed + CI green → task done
- **Round cap** — default 5 rounds. If not settled, write blocker report and stop
- **Merge conflict** — write blocker report, do NOT auto-rebase

Use the `pr-review-loop` skill for this workflow. It composes with `plugin-workflow`.

## Red Lines (IMMEDIATE REJECTION)

Performance matching any of these patterns will result in immediate task rejection and system reset:

1. **Scaffold Abandonment**: Running a scaffolding script and leaving the generated placeholders as "complete".
2. **Rule Bypassing**: Knowingly violating `non-negotiable.md` (e.g., using `default` exports) because it's "easier" or because a tool generated it.
3. **Type Erasure**: Using `any` or skipping types to avoid compiler errors.
4. **Half-Implemented CRUD**: Providing a list page without a create form, or a button without a handler.
5. **Architectural Isolation**: Using relative imports (`./`) for module boundaries or importing across plugin lines.
6. **Path Mismatch**: Registering a config path (in `config.tsx`) that doesn't match the actual file path or route, causing 404s.

## Scaffolded Code Warning

**Scaffolding scripts (`pnpm create-plugin`, `pnpm create-backend-plugin`) generate code that VIOLATES non-negotiable rules.**

When using the `create-plugin` skill:
1. The scaffold creates directory structure and boilerplate
2. The scaffold does NOT produce production-ready code
3. You MUST fix all generated code before declaring completion
4. You MUST run `.agents/scripts/validate-scaffold.sh <plugin> [scope]` before finishing

**Common scaffold violations:**
- Default exports in application code (Rule #4)
- `any` types (Rule #9)
- Placeholder/empty content (Rule #3)
- `schemaWrapper` usage in backend (Rule #6)
- Relative imports instead of aliases (Code Style)

**You are responsible for every line of code in the final plugin.**

## Forbidden

- Do not introduce a new UI system.
- Do not replace existing patterns with personal preferences.
- Do not rename public APIs casually.
- Do not perform large refactors without an explicit request.
- Do not move Module Federation exposes without updating host references.
- Do not treat scaffolded code as finished implementation.

## Priority Order

When making decisions:

1. Existing repository patterns
2. Local plugin consistency
3. Minimal changes
4. Clear behavior and maintainability
5. Reusability
6. Performance
7. Personal preference

---

## Codebase Reference Guide

This section contains comprehensive information about the erxes codebase structure, development workflows, and key conventions.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [Repository Structure](#repository-structure)
4. [Development Workflows](#development-workflows)
5. [Plugin System](#plugin-system)
6. [Code Conventions](#code-conventions)
7. [Testing](#testing)
8. [CI/CD](#cicd)
9. [Common Tasks](#common-tasks)
10. [Important Patterns](#important-patterns)

## Project Overview

**erxes** (pronounced 'erk-sis') is a secure, self-hosted, and scalable source-available Experience Operating System (XOS) that enables businesses to manage marketing, sales, operations, and support in one unified platform.

### Key Characteristics
- **Architecture**: Nx-powered pnpm monorepo with microservices architecture
- **License**: AGPLv3 (core) with Enterprise Edition plugins
- **Package Manager**: pnpm >= 8 - **REQUIRED**
- **Build System**: Nx (v20.0.8) with intelligent caching and task orchestration
- **Version**: TypeScript 5.7.3, Node.js 22 in CI

### Core Philosophy
- 100% customizable through plugin architecture
- Self-hosted for data privacy
- Microservices with GraphQL Federation
- Micro-frontends with Module Federation

## Architecture & Technology Stack

### Backend Stack

```
┌─────────────────────────────────────────┐
│         API Gateway (Port 4000)         │
│    Apollo Router + Service Discovery    │
└─────────────────────────────────────────┘
                    │
      ┌─────────────┼─────────────┐
      ▼             ▼             ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Core API │  │ Plugin   │  │ Plugin   │
│ (3300)   │  │ APIs     │  │ APIs     │
└──────────┘  └──────────┘  └──────────┘
      │             │             │
      └─────────────┴─────────────┘
                    │
      ┌─────────────┼─────────────┐
      ▼             ▼             ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│ MongoDB  │  │  Redis   │  │Elasticsea│
│          │  │  +BullMQ │  │   rch    │
└──────────┘  └──────────┘  └──────────┘
```

**Technologies:**
- **Runtime**: Node.js with TypeScript 5.7.3
- **Framework**: Express.js
- **GraphQL**: Apollo Server v4, Apollo Federation (@apollo/subgraph)
- **API**: tRPC v11 for type-safe endpoints
- **Database**: MongoDB with Mongoose (v8.13.2)
- **Cache/Queue**: Redis (ioredis) + BullMQ v5.40.0
- **Search**: Elasticsearch 7
- **Real-time**: GraphQL Subscriptions (graphql-redis-subscriptions)
- **Authentication**: JWT (jsonwebtoken), WorkOS for SSO

### Frontend Stack

```
┌─────────────────────────────────────────┐
│    Core UI (Host - Port 3001)           │
│   Module Federation Host Application    │
└─────────────────────────────────────────┘
                    │
      ┌─────────────┼─────────────┐
      ▼             ▼             ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Plugin   │  │ Plugin   │  │ Plugin   │
│ UI (3005)│  │ UI (3006)│  │ UI (3007)│
└──────────┘  └──────────┘  └──────────┘
```

**Technologies:**
- **Framework**: React 18.3.1
- **Bundler**: Rspack v1.0.5 (Rust-based, faster than Webpack)
- **Module Federation**: @module-federation/enhanced v0.6.6
- **Styling**: TailwindCSS v4.1.17 + PostCSS
- **UI Components**: Radix UI primitives + custom design system (erxes-ui)
- **State Management**: Jotai (atomic state) + Apollo Client
- **Routing**: React Router v7
- **Forms**: React Hook Form + Zod validation
- **i18n**: react-i18next
- **Rich Text**: Blocknote editor
- **Icons**: @tabler/icons-react
- **Data Visualization**: Recharts

### Apps

**Standalone Applications:**
1. **client-portal-template**: Next.js 16 customer portal
2. **posclient-front**: Next.js 14 POS with PWA support
3. **frontline-widgets**: Customer-facing widgets (chat, forms)

## Repository Structure

```
erxes/
├── backend/                    # Backend microservices
│   ├── gateway/               # API Gateway (Port 4000)
│   │   └── src/main.ts       # Gateway entry point
│   ├── core-api/             # Core business logic (Port 3300)
│   │   ├── src/
│   │   │   ├── main.ts       # Core API entry point
│   │   │   ├── apollo/       # GraphQL schema & resolvers
│   │   │   ├── trpc/         # tRPC router
│   │   │   ├── modules/      # Business logic modules
│   │   │   │   ├── contacts/
│   │   │   │   ├── products/
│   │   │   │   ├── segments/
│   │   │   │   ├── automations/
│   │   │   │   └── documents/
│   │   │   ├── meta/         # Automation, segment configs
│   │   │   └── routes.ts     # Express routes
│   │   ├── Dockerfile
│   │   ├── project.json      # Nx configuration
│   │   └── tsconfig.json
│   ├── erxes-api-shared/     # Shared library for all services
│   │   └── src/
│   │       ├── utils/        # Service discovery, Redis, MQ
│   │       ├── core-types/   # TypeScript type definitions
│   │       └── core-modules/ # Reusable business logic
│   ├── plugins/              # Plugin microservices
│   │   ├── sales_api/        # Sales plugin (Port 3305)
│   │   ├── operation_api/    # Operations plugin
│   │   ├── frontline_api/    # Customer service plugin
│   │   ├── accounting_api/   # Accounting plugin (EE)
│   │   ├── content_api/      # Content management (EE)
│   │   └── ...
│   └── services/             # Background services
│       ├── automations/      # Automation execution engine
│       └── logs/             # Logging service
├── frontend/                  # Frontend applications
│   ├── core-ui/              # Module federation host (Port 3001)
│   │   ├── src/
│   │   │   ├── main.ts       # Entry point
│   │   │   └── bootstrap.tsx # App bootstrap
│   │   └── module-federation.config.ts
│   ├── libs/                 # Shared UI libraries
│   │   ├── erxes-ui/         # Core UI components & state
│   │   └── ui-modules/       # Reusable UI modules
│   └── plugins/              # Frontend plugin remotes
│       ├── sales_ui/         # Sales UI plugin (Port 3005)
│       │   ├── src/
│       │   │   ├── config.tsx           # Plugin configuration
│       │   │   ├── modules/             # Module components
│       │   │   ├── pages/               # Page components
│       │   │   └── widgets/             # Widget components
│       │   ├── module-federation.config.ts
│       │   └── rspack.config.ts
│       └── ...
├── apps/                      # Standalone applications
│   ├── client-portal-template/  # Next.js 16 customer portal
│   ├── posclient-front/         # Next.js 14 POS client
│   └── frontline-widgets/       # Customer-facing widgets
├── scripts/                   # Development scripts
│   ├── create-plugin.js       # Plugin generator
│   ├── start-api-dev.js       # Start all API services
│   └── start-ui-dev.js        # Start all UI plugins
├── .github/workflows/         # CI/CD pipelines (26+ workflows)
├── nx.json                    # Nx configuration
├── pnpm-workspace.yaml        # pnpm workspace config
├── package.json               # Root package.json
├── tsconfig.base.json         # Base TypeScript config
└── AGENTS.md                  # This file
```

### Path Aliases (TypeScript)

All backend services use consistent path aliases:
```typescript
"paths": {
  "~/*": ["./src/*"],              // Service root
  "@/*": ["./src/modules/*"],      // Modules directory
  "erxes-api-shared/*": ["../erxes-api-shared/src/*"]  // Shared lib
}
```

## Development Workflows

### Prerequisites

- **pnpm** ≥ 8 (enforced in package.json)
- **Node.js** 22 recommended to match CI
- **MongoDB** 27017
- **Redis** (default port)
- **Elasticsearch** 7 (optional, for search)

### Initial Setup

```bash
# Clone repository
git clone https://github.com/erxes/erxes.git
cd erxes

# Install dependencies (MUST use pnpm)
pnpm install

# Setup environment variables
cp .env.sample .env
# Edit .env with your configuration
```

### Running Development Environment

**Option 1: Run Core Only**
```bash
# Runs Gateway + Core API
pnpm dev:core-api
```

**Option 2: Run All APIs**
```bash
# Starts all backend services defined in ENABLED_PLUGINS
pnpm dev:apis
```

**Option 3: Run All UIs**
```bash
# Starts all frontend plugins
pnpm dev:uis
```

**Option 4: Run Specific Service (Nx)**
```bash
# Backend service
pnpm nx serve core-api
pnpm nx serve sales_api

# Frontend plugin
pnpm nx serve sales_ui

# Build specific project
pnpm nx build sales_api

# Run tests
pnpm nx test sales_api

# Run affected commands (only changed projects)
pnpm nx affected --target=build
pnpm nx affected --target=test
```

### Important Environment Variables

```bash
# Required
MONGO_URL=mongodb://localhost:27017/erxes
REDIS_HOST=localhost
REDIS_PORT=6379

# Plugin Management
ENABLED_PLUGINS=operation,sales,frontline,accounting

# API Configuration
DOMAIN=http://localhost:3000
REACT_APP_API_URL=http://localhost:4000

# Feature Flags
DISABLE_CHANGE_STREAM=true  # Disable MongoDB change streams in dev

# SAAS Mode (optional)
SAAS_MODE=true
```

### Port Allocation

```
Gateway:       4000
Core API:      3300
Core UI:       3001

Plugin APIs:   3305+ (sales=3305, operation=3306, etc.)
Plugin UIs:    3002-3011
               insurance=3002, content=3003, frontline=3004, sales=3005
               operation=3006, mongolian=3007, accounting=3008
               loyalty=3009, payment=3010, tourism=3011

BullMQ Board:  4000/bullmq-board
```

## Plugin System

### Architecture Overview

erxes uses a **plugin-based architecture** for both backend and frontend:

- **Backend Plugins**: Microservices registered with the gateway via Redis
- **Frontend Plugins**: Module Federation remotes dynamically loaded at runtime

### Backend Plugin Structure

**Standard Plugin Entry Point** (`src/main.ts`):
```typescript
import { startPlugin } from 'erxes-api-shared/utils';
import { appRouter } from './trpc/init-trpc';
import resolvers from './apollo/resolvers';
import { typeDefs } from './apollo/typeDefs';
import { generateModels } from './connectionResolvers';
import { router } from './routes';
import automations from './meta/automations';
import segments from './meta/segments';

startPlugin({
  name: 'sales',
  port: 3305,
  graphql: async () => ({
    typeDefs: await typeDefs(),
    resolvers,
  }),
  expressRouter: router,
  hasSubscriptions: true,
  subscriptionPluginPath: require('path').resolve(
    __dirname,
    'apollo',
    process.env.NODE_ENV === 'production'
      ? 'subscription.js'
      : 'subscription.ts',
  ),
  apolloServerContext: async (subdomain, context) => {
    const models = await generateModels(subdomain, context);
    context.models = models;
    return context;
  },
  trpcAppRouter: {
    router: appRouter,
    createContext: async (subdomain, context) => {
      const models = await generateModels(subdomain);
      context.models = models;
      return context;
    },
  },
  onServerInit: async () => {
    // Initialize workers, cron jobs, etc.
  },
  meta: {
    automations,
    segments,
    notificationModules: [/* ... */],
  },
});
```

**Key Files in Backend Plugin:**
- `main.ts` - Entry point using `startPlugin()`
- `connectionResolvers.ts` - Database models
- `apollo/` - GraphQL schema, resolvers, subscriptions
- `trpc/` - tRPC router and procedures
- `modules/` - Business logic organized by feature
- `meta/` - Automations, segments, exports configuration
- `routes.ts` - Express routes
- `Dockerfile` - Container configuration
- `project.json` - Nx build configuration

### Frontend Plugin Structure

**Plugin Configuration** (`src/config.tsx`):
```typescript
import { IconBriefcase } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui';
import { lazy, Suspense } from 'react';

const MainNavigation = lazy(() =>
  import('./modules/MainNavigation').then((module) => ({
    default: module.MainNavigation,
  })),
);

export const CONFIG: IUIConfig = {
  name: 'sales',
  icon: IconBriefcase,
  navigationGroup: {
    name: 'sales',
    icon: IconBriefcase,
    content: () => (
      <Suspense fallback={<div />}>
        <MainNavigation />
      </Suspense>
    ),
  },
  modules: [
    {
      name: 'sales',
      icon: IconBriefcase,
      path: 'sales',
      hasSettings: false,
      hasRelationWidget: true,
      hasFloatingWidget: false,
    },
  ],
  widgets: {
    relationWidgets: [
      {
        name: 'deals',
        icon: IconBriefcase,
      },
    ],
  },
};
```

**Module Federation Configuration** (`module-federation.config.ts`):
```typescript
import { ModuleFederationConfig } from '@nx/rspack/module-federation';

const coreLibraries = new Set([
  'react',
  'react-dom',
  'react-router',
  'react-router-dom',
  'erxes-ui',
  '@apollo/client',
  'jotai',
  'ui-modules',
  'react-i18next',
]);

const config: ModuleFederationConfig = {
  name: 'sales_ui',
  exposes: {
    './config': './src/config.tsx',
    './sales': './src/modules/Main.tsx',
    './dealsSettings': './src/pages/SettingsPage.tsx',
    './Widgets': './src/widgets/Widgets.tsx',
    './relationWidget': './src/widgets/relation/RelationWidgets.tsx',
  },
  shared: (libraryName, defaultConfig) => {
    if (coreLibraries.has(libraryName)) {
      return defaultConfig;
    }
    return false;
  },
};

export default config;
```

### Creating a New Plugin

**Using the Plugin Generator:**
```bash
pnpm create-plugin
```

This will prompt for:
- **Plugin name**: e.g., "inventory"
- **Module name**: e.g., "products"

The script creates:
- Backend: `backend/plugins/inventory_api/`
- Frontend: `frontend/plugins/inventory_ui/`

Both with complete boilerplate including:
- GraphQL/tRPC setup
- Module Federation configuration
- Example components and routes
- Nx project configuration

**Plugin Activation:**

Add to `.env`:
```bash
ENABLED_PLUGINS=operation,sales,frontline,inventory
```

### Service Discovery (Backend)

Plugins register with the gateway using Redis:
```typescript
// From erxes-api-shared/utils
await joinErxesGateway({
  name: 'sales',
  address: 'http://localhost:3305',
  config: {
    typeDefs,
    hasSubscriptions: true,
    meta: { automations, segments },
  },
});
```

Gateway dynamically routes requests to plugins:
- GraphQL: Federated via Apollo Router
- REST: Proxy via `/pl:{serviceName}/*`
- tRPC: Proxy via `/trpc/`

## Code Conventions

### TypeScript

**Configuration:**
- Strict null checks: enabled
- No implicit any: disabled (legacy code compatibility)
- Target: ES2017
- Module: CommonJS (backend), ESNext (frontend)

**Naming Conventions:**
```typescript
// Interfaces & Types
interface IUser { ... }
type UserRole = 'admin' | 'user';

// Classes (PascalCase)
class UserService { ... }

// Functions & Variables (camelCase)
const getUserById = (id: string) => { ... };

// Constants (UPPER_SNAKE_CASE for globals)
const MAX_RETRY_COUNT = 3;

// Files
// - Components: PascalCase (UserProfile.tsx)
// - Utils/Services: camelCase (authService.ts)
// - Config: kebab-case (module-federation.config.ts)
```

### Code Style (Prettier)

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "endOfLine": "auto"
}
```

**Key Rules:**
- Single quotes for strings
- Trailing commas in arrays/objects
- 2-space indentation (inferred)
- No semicolons (inferred)

### React Patterns

**Component Structure:**
```typescript
// Prefer functional components with hooks
export const UserList: React.FC<Props> = ({ users, onSelect }) => {
  // State
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Queries (Apollo)
  const { data, loading, error } = useQuery(GET_USERS);

  // Mutations
  const [updateUser] = useMutation(UPDATE_USER);

  // Effects
  useEffect(() => {
    // Side effects
  }, [dependency]);

  // Handlers
  const handleSelect = (id: string) => {
    setSelectedId(id);
    onSelect(id);
  };

  // Render
  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return (
    <div>
      {users.map(user => (
        <UserCard key={user.id} user={user} onClick={handleSelect} />
      ))}
    </div>
  );
};
```

**State Management:**
- **Local State**: `useState` for component-local state
- **Global State**: Jotai atoms for app-wide state
- **Server State**: Apollo Client for GraphQL data
- **Form State**: React Hook Form with Zod validation

**Lazy Loading (Module Federation):**
```typescript
// Always lazy load federation modules
const RemoteModule = lazy(() => import('remote/Module'));

// Always wrap in Suspense
<Suspense fallback={<Loading />}>
  <RemoteModule />
</Suspense>
```

### GraphQL Conventions

**Schema Naming:**
```graphql
# Types: PascalCase
type User {
  _id: String!
  email: String
  details: UserDetails
}

# Queries: {pluginName}{ResolverName}{FunctionName} in camelCase
type Query {
  salesUsers(page: Int, perPage: Int): [User]
  salesUserDetail(_id: String!): User
  salesUsersTotalCount: Int
}

# Mutations: {pluginName}{ResolverName}{FunctionName} in camelCase
type Mutation {
  salesUsersAdd(email: String!, details: UserDetailsInput): User
  salesUsersEdit(_id: String!, doc: UserDetailsInput): User
  salesUsersRemove(_id: String!): JSON
}

# Subscriptions: {pluginName}{ResolverName}{FunctionName} in camelCase
type Subscription {
  salesUserChanged(_id: String!): User
}
```

**Resolver Structure:**
```typescript
const resolvers = {
  Query: {
    users: async (_, { page, perPage }, { models, subdomain }) => {
      return models.Users.find({})
        .skip((page - 1) * perPage)
        .limit(perPage);
    },
  },
  Mutation: {
    usersAdd: async (_, doc, { models, subdomain, user }) => {
      // Permission check
      if (!user) throw new Error('Unauthorized');

      // Business logic
      return models.Users.createUser(doc);
    },
  },
  User: {
    // Field resolver for computed fields
    fullName: (user) => `${user.firstName} ${user.lastName}`,
  },
};
```

### Backend Patterns

**Service Layer Pattern:**
```typescript
// modules/users/services.ts
export const userService = {
  async createUser(models, doc) {
    // Validation
    if (!doc.email) throw new Error('Email required');

    // Business logic
    const user = await models.Users.create(doc);

    // Side effects
    await sendWelcomeEmail(user.email);

    return user;
  },
};
```

**Model Layer (Mongoose):**
```typescript
// connectionResolvers.ts
export const generateModels = (subdomain: string) => {
  const Users = loadUsersClass(subdomain);

  return {
    Users,
  };
};

// models/definitions/users.ts
export const userSchema = new Schema({
  email: { type: String, unique: true, required: true },
  details: {
    firstName: String,
    lastName: String,
  },
  createdAt: { type: Date, default: Date.now },
});

// models/Users.ts
export class UserModel {
  static async createUser(doc) {
    // Business logic
    return this.create(doc);
  }
}
```

**Error Handling:**
```typescript
// Always throw descriptive errors
throw new Error('User with this email already exists');

// Use custom error classes for API responses
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

### Multi-tenancy (Subdomains)

Every request includes a `subdomain` for tenant isolation:
```typescript
// Context includes subdomain
const resolver = async (_, args, { subdomain, models, user }) => {
  // Models are scoped to subdomain automatically
  const users = await models.Users.find({ /* tenant-specific */ });
};

// MongoDB collections are prefixed with subdomain
// Example: subdomain_users, subdomain_products
```

## Testing

### Test Structure

```
src/
├── modules/
│   └── users/
│       ├── __tests__/
│       │   ├── users.test.ts       # Unit tests
│       │   └── queries.test.ts     # GraphQL query tests
│       ├── services.ts
│       └── models.ts
```

### Running Tests

```bash
# Run all tests
pnpm nx test <project-name>

# Run tests in watch mode
pnpm nx test <project-name> --watch

# Run tests with coverage
pnpm nx test <project-name> --coverage

# Run affected tests (only changed projects)
pnpm nx affected --target=test
```

### Test Configuration (Jest)

```typescript
// jest.config.ts
export default {
  displayName: 'sales-api',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/backend/plugins/sales_api',
};
```

### Example Tests

**Backend Service Test:**
```typescript
import { generateModels } from '../connectionResolvers';

describe('User Service', () => {
  let models;

  beforeEach(async () => {
    models = await generateModels('test');
  });

  afterEach(async () => {
    await models.Users.deleteMany({});
  });

  it('should create a user', async () => {
    const user = await models.Users.createUser({
      email: 'test@example.com',
    });

    expect(user.email).toBe('test@example.com');
    expect(user._id).toBeDefined();
  });
});
```

**Frontend Component Test:**
```typescript
import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { UserList } from './UserList';

describe('UserList', () => {
  it('renders user list', async () => {
    const mocks = [
      {
        request: {
          query: GET_USERS,
        },
        result: {
          data: {
            users: [{ _id: '1', email: 'test@example.com' }],
          },
        },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <UserList />
      </MockedProvider>
    );

    expect(await screen.findByText('test@example.com')).toBeInTheDocument();
  });
});
```

## CI/CD

### GitHub Actions Workflows

Located in `.github/workflows/` with 26+ workflow files:

**Naming Convention:**
- `ci-api-core.yml` - Core API CI
- `ci-plugin-sales.yml` - Sales plugin CI
- `ci-ui-sales.yml` - Sales UI CI

**Workflow Pattern:**
```yaml
name: CI plugin--sales-api

on:
  push:
    branches: [main, develop]
    paths:
      - 'backend/plugins/sales_api/**'
      - 'backend/erxes-api-shared/**'
      - '.github/workflows/ci-plugin-sales.yml'
  pull_request:
    paths:
      - 'backend/plugins/sales_api/**'
      - 'backend/erxes-api-shared/**'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4

      - run: pnpm install
      - run: pnpm nx build erxes-api-shared  # Build shared lib first
      - run: pnpm nx build sales_api

      # Docker multi-platform build
      - uses: docker/setup-buildx-action@v3
      - uses: docker/build-push-action@v5
        with:
          platforms: linux/amd64,linux/arm64
          tags: |
            erxes/erxes-next-sales-api:latest
            erxes/erxes-next-sales-api:${{ env.DATE }}-${{ env.SHORT_SHA }}
```

**Key Features:**
- **Path-based triggers**: Only builds affected services
- **Nx caching**: Leverages Nx build cache
- **Multi-platform**: Builds for AMD64 and ARM64
- **Tagging**: `latest` + `YYYYMMDD-{sha}`
- **Shared lib**: Always builds `erxes-api-shared` first for backend

### Docker Configuration

**Each service has its own Dockerfile:**
```dockerfile
# Example: backend/plugins/sales_api/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy shared dependencies
COPY backend/erxes-api-shared/dist ./erxes-api-shared/dist
COPY backend/plugins/sales_api/dist ./sales_api/dist
COPY backend/plugins/sales_api/package.json ./sales_api/

RUN cd sales_api && npm install --production

WORKDIR /app/sales_api
CMD ["node", "dist/main.js"]
```

**Docker Images:**
- Registry: Docker Hub
- Org: `erxes`
- Naming: `erxes-next-{service-name}`
- Example: `erxes/erxes-next-sales-api:latest`

### Deployment

Services are typically deployed as:
1. **Docker Compose** (development/self-hosted)
2. **Kubernetes** (production/scaled)
3. **Cloud Platforms** (AWS, GCP, Azure)

## Common Tasks

### Adding a New Backend Feature

1. **Identify the service** (core-api or plugin)
2. **Define GraphQL schema** in `apollo/typeDefs/`
3. **Create resolvers** in `apollo/resolvers/`
4. **Add service logic** in `modules/{feature}/`
5. **Create models** if needed in `models/`
6. **Add tRPC endpoints** (optional) in `trpc/`
7. **Write tests** in `__tests__/`
8. **Update meta** if automation/segment related

### Adding a New Frontend Feature

1. **Identify the plugin** (e.g., sales_ui)
2. **Create component** in `modules/{feature}/`
3. **Define routes** if needed
4. **Add GraphQL queries** using Apollo Client
5. **Update config.tsx** to expose in navigation
6. **Update module-federation.config.ts** to expose module
7. **Add translations** in locales
8. **Write tests** in `__tests__/`

### Modifying Shared Code

**Backend Shared (`erxes-api-shared`):**
1. Make changes in `backend/erxes-api-shared/src/`
2. Build: `pnpm nx build erxes-api-shared`
3. Rebuild dependent services (they reference dist/)

**Frontend Shared (`erxes-ui`):**
1. Make changes in `frontend/libs/erxes-ui/src/`
2. No build needed (imported directly)
3. Hot reload works across plugins

### Database Migrations

**Mongoose migrations pattern:**
```typescript
// scripts/migration-{feature}.ts
import { connect } from '../db/connection';

const migrate = async () => {
  const db = await connect();

  // Migration logic
  await db.collection('users').updateMany(
    { role: { $exists: false } },
    { $set: { role: 'user' } }
  );

  console.log('Migration complete');
  process.exit(0);
};

migrate();
```

Run via: `tsx scripts/migration-{feature}.ts`

### Debugging

**Backend:**
```bash
# Enable debug logs
DEBUG=* pnpm nx serve sales_api

# Node inspector
node --inspect dist/main.js
```

**Frontend:**
```bash
# React DevTools
# Apollo DevTools (browser extension)
# Redux DevTools for Jotai (jotai-devtools)

# Rspack dev server provides source maps
pnpm nx serve sales_ui
```

**Common Issues:**
- **Port conflicts**: Check if services are already running
- **Module Federation errors**: Clear cache, restart dev servers
- **GraphQL errors**: Check gateway logs, verify service registration
- **Shared lib not found**: Rebuild `erxes-api-shared`

## Important Patterns

### Subdomain Context (Multi-tenancy)

```typescript
// Always use subdomain for data access
const { subdomain, models } = context;

// Models are automatically scoped
const users = await models.Users.find({});  // Only tenant's users

// Manual subdomain in collection names
const collectionName = `${subdomain}_users`;
```

### Service Communication

**Via GraphQL Federation:**
```typescript
// Reference other service types
type Deal @key(fields: "_id") {
  _id: ID!
  customer: Contact @provides(fields: "email")  # From contacts service
}
```

**Via tRPC:**
```typescript
// backend/plugins/sales_api/src/trpc/routers/deals.ts
export const dealsRouter = t.router({
  list: t.procedure
    .input(z.object({ customerId: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.models.Deals.find({ customerId: input.customerId });
    }),
});

// From another service
import { trpc } from '@/lib/trpc';
const deals = await trpc.deals.list.query({ customerId: '123' });
```

### Redis Patterns

**Caching:**
```typescript
import { redis } from 'erxes-api-shared/utils';

// Set with expiration
await redis.set(`user:${id}`, JSON.stringify(user), 'EX', 3600);

// Get
const cached = await redis.get(`user:${id}`);
const user = cached ? JSON.parse(cached) : null;

// Delete
await redis.del(`user:${id}`);
```

**PubSub (Real-time):**
```typescript
import { RedisPubSub } from 'graphql-redis-subscriptions';

const pubsub = new RedisPubSub({ /* redis config */ });

// Publish
await pubsub.publish('USER_CHANGED', { userChanged: user });

// Subscribe (GraphQL)
const subscriptions = {
  userChanged: {
    subscribe: () => pubsub.asyncIterator(['USER_CHANGED']),
  },
};
```

### BullMQ (Job Queue)

```typescript
import { Queue, Worker } from 'bullmq';

// Create queue
const emailQueue = new Queue('emails', {
  connection: { host: 'localhost', port: 6379 },
});

// Add job
await emailQueue.add('send', {
  to: 'user@example.com',
  subject: 'Welcome',
});

// Process jobs
const worker = new Worker('emails', async (job) => {
  const { to, subject } = job.data;
  await sendEmail(to, subject);
}, {
  connection: { host: 'localhost', port: 6379 },
});

// View dashboard at http://localhost:4000/bullmq-board
```

### Automation System

Plugins can register automation actions/triggers:

```typescript
// meta/automations.ts
export default {
  constants: {
    actions: [
      {
        type: 'sales:createDeal',
        icon: 'file-plus',
        label: 'Create deal',
        description: 'Create a new deal',
      },
    ],
    triggers: [
      {
        type: 'sales:dealCreated',
        icon: 'file-check',
        label: 'Deal created',
        description: 'Triggered when deal is created',
      },
    ],
  },

  actions: async ({ subdomain, data }) => {
    const { action, execution } = data;

    if (action.type === 'sales:createDeal') {
      // Execute action
      const models = await generateModels(subdomain);
      return models.Deals.createDeal(execution.target);
    }
  },

  triggers: async ({ subdomain, data }) => {
    // Emit trigger events
    await emitTrigger('sales:dealCreated', deal);
  },
};
```

### Segment System

Dynamic user/customer segmentation:

```typescript
// meta/segments.ts
export default {
  contentTypes: [
    {
      type: 'sales:deal',
      description: 'Deals',
      fields: [
        {
          key: 'name',
          label: 'Name',
          type: 'string',
        },
        {
          key: 'amount',
          label: 'Amount',
          type: 'number',
        },
      ],
    },
  ],

  esTypes: ['deal'],

  associationTypes: [
    {
      name: 'deal',
      label: 'Deal',
    },
  ],
};
```

### Import/Export System

```typescript
// meta/import-export.ts
export default {
  importTypes: [
    {
      text: 'Deals',
      contentType: 'deal',
      icon: 'file-plus',
    },
  ],

  exporter: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    const deals = await models.Deals.find(data.filter);

    return {
      data: deals.map(deal => ({
        Name: deal.name,
        Amount: deal.amount,
      })),
    };
  },
};
```

## Additional Resources

### Documentation
- **Main Docs**: https://erxes.io/docs
- **Local Setup**: https://erxes.io/docs/local-setup
- **Contributing**: See CONTRIBUTING.md
- **Roadmap**: https://erxes.io/roadmap
- **Changelog**: https://erxes.io/changelog

### Community
- **Discord**: https://discord.com/invite/aaGzy3gQK5
- **GitHub Issues**: https://github.com/erxes/erxes/issues
- **Transifex (i18n)**: https://explore.transifex.com/erxes-inc/erxesxos/

### Code Exploration Tips

**Finding Features:**
```bash
# Find GraphQL type definition
rg 'type Deal' backend frontend apps

# Find component usage
rg 'UserList' frontend

# Find API endpoint
rg '/api/deals' backend frontend apps
```

**Understanding Plugin Flow:**
1. Start at `main.ts` - entry point
2. Check `apollo/typeDefs.ts` - GraphQL schema
3. Look at `apollo/resolvers/` - query/mutation logic
4. Explore `modules/` - business logic
5. Review `models/` - data layer

**Understanding Frontend Plugin:**
1. Start at `config.tsx` - plugin configuration
2. Check `module-federation.config.ts` - exposed modules
3. Look at `modules/` - main components
4. Check `pages/` - route components
5. Review `widgets/` - reusable widgets

## Best Practices for AI Assistants

### Code Analysis
- Always read existing code before making changes
- Understand the plugin architecture before modifications
- Check both GraphQL and tRPC endpoints when working with APIs
- Review module-federation.config.ts for exposed modules

### Making Changes
- **Backend**: Rebuild `erxes-api-shared` if shared code changed
- **Frontend**: Check if changes affect module federation exports
- Always maintain TypeScript types
- Follow existing patterns in the same service/plugin
- Test multi-tenancy (subdomain) implications

### Common Pitfalls
- Don't bypass plugin system - use proper extension points
- Don't break module federation shared dependencies
- Don't modify core without considering plugin impacts
- Always consider subdomain context for data access
- Remember port allocation when adding new services

### Testing Your Changes
1. Run Nx affected commands to see what's impacted
2. Test in development mode first
3. Verify GraphQL schema still federates correctly
4. Check module federation loads properly
5. Test with different subdomains if multi-tenant

### Git Workflow
- Branch naming: `feat/`, `fix/`, `docs/`
- Reference issues in commits
- Keep commits focused and atomic
- Run affected tests before pushing
- See CONTRIBUTING.md for full guidelines

---

**Last Updated**: 2026-06-12
**Version**: 1.1.0
**Maintainer**: erxes Team

For questions or clarifications, please open an issue or join our Discord community.
