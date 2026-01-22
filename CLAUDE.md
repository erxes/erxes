# CLAUDE.md - AI Assistant Guide for erxes

This document provides comprehensive information about the erxes codebase structure, development workflows, and key conventions for AI assistants working on this project.

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
- **Package Manager**: pnpm (v9.12.3) - **REQUIRED**
- **Build System**: Nx (v20.0.8) with intelligent caching and task orchestration
- **Version**: TypeScript 5.7.3, Node.js 18+

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
└── CLAUDE.md                  # This file
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
- **Node.js** 18.16.9+ (see `.nvmrc` if exists)
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
cp .env.example .env
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
pnpm nx affected:build
pnpm nx affected:test
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
Plugin UIs:    3005+ (sales=3005, operation=3006, etc.)

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

# Queries: camelCase with descriptive names
type Query {
  users(page: Int, perPage: Int): [User]
  userDetail(_id: String!): User
  usersTotalCount: Int
}

# Mutations: camelCase verb + noun
type Mutation {
  usersAdd(email: String!, details: UserDetailsInput): User
  usersEdit(_id: String!, doc: UserDetailsInput): User
  usersRemove(_id: String!): JSON
}

# Subscriptions: noun + past tense verb
type Subscription {
  userChanged(_id: String!): User
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
pnpm nx affected:test
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
pnpm nx run-many -t grep -p 'type Deal'

# Find component usage
pnpm nx run-many -t grep -p 'UserList'

# Find API endpoint
pnpm nx run-many -t grep -p '/api/deals'
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

**Last Updated**: 2026-01-15
**Version**: 1.0.0
**Maintainer**: erxes Team

For questions or clarifications, please open an issue or join our Discord community.
