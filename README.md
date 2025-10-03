# Front

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

## Overview

Front is a React-based monorepo project built with Nx. This documentation provides comprehensive information about the project structure, development workflow, and best practices.

## Table of Contents

1. [Project Setup](#project-setup)
2. [Development Workflow](#development-workflow)
3. [Project Structure](#project-structure)
4. [Best Practices](#best-practices)
5. [Commands Reference](#commands-reference)
6. [UI Design Inspiration](#ui-design-inspiration)

## Project Setup

This project is built as an Nx workspace, which provides tools for monorepo management, code generation, and task execution. The workspace contains multiple applications and libraries that share code and configurations.

### Prerequisites

- Node.js v23 (use `nvm use 23` to switch)
- npm or yarn

### Getting Started

1. Clone the repository
2. Install dependencies: `pnpm install
`
3. Start the development server: `npx nx serve core`

## Development Workflow

### Running Applications

To run the development server for a specific application:

```sh
npx nx serve core-ui        # Run the core application
npx nx serve core-ui --devRemotes=[plugin name]-ui,[another plugin name]-ui      # Run plugin in development mode
```

### Building for Production

```sh
npx nx build core        # Build the core application
npx nx build plugin      # Build a plugin application
```

### Serving Production Build

```sh
npx nx serve-static core    # Serve the built core application
```

### Exploring Project Structure

```sh
npx nx graph              # Visualize project dependencies
npx nx show project core  # Show available targets for a project
```

## Project Structure

The recommended folder structure for modules:

```
module_name/
├── components/       # React components
├── hooks/            # Custom React hooks
├── types/            # TypeScript interfaces and types
├── utils/            # Utility functions
├── contexts/         # React contexts
├── graphql/          # GraphQL queries and mutations
└── states/           # State management
```

## Best Practices

### Code Style

- Use TypeScript for all code; prefer interfaces over types
- Use functional components with TypeScript interfaces
- Avoid classes; use functional and declarative programming patterns
- Use descriptive variable names with auxiliary verbs (e.g., `isLoading`, `hasError`)
- Structure files with exported component, utils, contexts, hooks, types

### Naming Conventions

- Use lowercase with dashes for directories (e.g., `components/auth-wizard`)
- Favor named exports for components

### TypeScript Usage

- Avoid enums; use maps instead
- Think twice before using `any` type
- Use absolute paths for imports

### UI and Styling

- Use Shadcn UI, Radix, and Tailwind for components and styling
- Implement responsive design with Tailwind CSS; use a mobile-first approach
- Avoid arbitrary Tailwind class names when possible

### Performance Optimization

- Minimize use of `useEffect`

### State Management

- Use `useQueryState` hook for URL search parameter state management

### Before Committing

- Clean up console.log statements
- Ensure code follows project structure and naming conventions

## Commands Reference

### Node Version Management

```sh
nvm use 23              # Switch to Node.js v23
```

### Development Commands

```sh
npx nx serve core-ui                         # Start core development server
npx nx serve core-ui --devRemotes=[plugin name]-ui  # Start with remote modules
```

### Build Commands

```sh
npx nx build core       # Build core for production
npx nx build plugin     # Build plugin for production
```

### Utility Commands

```sh
npx nx serve-static core  # Serve production build
npx nx list               # List installed plugins
npx nx list <plugin-name> # Show capabilities of a plugin
npx nx g @nx/react:app demo  # Generate a new application
npx nx g @nx/react:lib mylib # Generate a new library
```

## UI Design Inspiration

The project draws design inspiration from:

- Shopify
- Airtable
- Attio
- Twenty

## Quick Actions Feature

The project includes a Quick Actions feature that provides suggestions based on:

- Current page context
- Recent user actions
- User context (company, team, role)
- User intent
- Browser location
- User activity history

## Additional Resources

- [Nx Documentation](https://nx.dev)
- [Nx Discord Community](https://go.nx.dev/community)
- [Nx Twitter](https://twitter.com/nxdevtools)
- [Nx LinkedIn](https://www.linkedin.com/company/nrwl)
- [Nx YouTube Channel](https://www.youtube.com/@nxdevtools)
- [Nx Blog](https://nx.dev/blog)

### Library Documentation

- [React](https://reactjs.org/docs/getting-started.html) - UI library
- [TypeScript](https://www.typescriptlang.org/docs/) - JavaScript with syntax for types
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first CSS framework
- [Shadcn UI](https://ui.shadcn.com) - Re-usable components built with Radix UI and Tailwind
- [Radix UI](https://www.radix-ui.com/docs/primitives/overview/introduction) - Unstyled, accessible UI components
- [React Router](https://reactrouter.com/en/main) - Routing library for React

## Tailwind CSS Variables

Tailwind CSS in this project uses CSS variables for theming and consistent styling. These variables are defined in the root CSS file and can be accessed throughout the application.

### Theme Variables

The project uses CSS variables for colors, spacing, and other design tokens. These are defined in the theme configuration and can be accessed in Tailwind classes or directly in CSS.

#### Color Variables

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;

  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;

  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;

  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;

  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;

  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;

  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;

  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;

  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;

  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;

  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;

  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;

  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;

  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;

  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;

  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;

  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;

  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 212.7 26.8% 83.9%;
}
```

### Shadow Variables

The project uses a set of shadow CSS variables for consistent elevation across the UI. These are the shadow variables currently implemented in the project:

```css
:root {
  /* Default shadow set */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}

.dark {
  /* Adjusted shadows for dark mode */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.4);
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3);
}
```

These shadow variables are used in Tailwind classes throughout the application:

```html
<div className="shadow-sm">Small shadow for subtle elevation</div>
<div className="shadow">Default shadow for cards and containers</div>
<div className="shadow-md">Medium shadow for dropdowns and popovers</div>
<div className="shadow-lg">Large shadow for modals and dialogs</div>
<div className="shadow-xl">Extra large shadow for important UI elements</div>
```

The shadow system automatically adjusts between light and dark modes to maintain appropriate visual hierarchy while ensuring sufficient contrast in both themes.

## Create new plugin

1. copy&paste sample_ui folder & replace name
2. fix port in project.json
3. replace all plugin names
4. `core-ui/module-federation.config.ts` add to remotes
5. run in dev mode `nx serve core-ui --devRemotes=[plugin name]_ui`
6. change icon at module/constants/config.ts

# Backend

A Node.js backend service

## Project Structure

```
backend/
├── core-api/           # Core API service
├── gateway/           # API Gateway
├── libs/              # Shared libraries
```

## Core API Service

The core API service handles all accounting-related operations.

### Features

- Main settings management
- Currency configuration
- Tax settings (VAT and CTax)
- Account mapping
- GraphQL API
- TypeScript support
- MongoDB integration

### API Endpoints

#### GraphQL API

##### Queries

```graphql
query GetMainConfigs {
  getMainConfigs {
    MainCurrency
    HasVat
    VatPayableAccount
    VatReceivableAccount
    VatAfterPayableAccount
    VatAfterReceivableAccount
    HasCtax
    CtaxPayableAccount
  }
}

query GetAccounts($journal: String) {
  getAccounts(journal: $journal) {
    _id
    name
    code
    type
  }
}
```

##### Mutations

```graphql
mutation UpdateMainConfigs($input: MainConfigsInput!) {
  updateMainConfigs(input: $input) {
    MainCurrency
    HasVat
    VatPayableAccount
    VatReceivableAccount
    VatAfterPayableAccount
    VatAfterReceivableAccount
    HasCtax
    CtaxPayableAccount
  }
}
```

### Data Models

#### MainConfigs

```typescript
interface MainConfigs {
  MainCurrency: string;
  HasVat: boolean;
  VatPayableAccount?: string;
  VatReceivableAccount?: string;
  VatAfterPayableAccount?: string;
  VatAfterReceivableAccount?: string;
  HasCtax: boolean;
  CtaxPayableAccount?: string;
}
```

### Services

#### ConfigsService

Handles configuration management:

```typescript
class ConfigsService {
  async getMainConfigs(): Promise<MainConfigs>;
  async updateMainConfigs(input: MainConfigsInput): Promise<MainConfigs>;
}
```

#### AccountsService

Manages account-related operations:

```typescript
class AccountsService {
  async getAccounts(journal?: string): Promise<Account[]>;
}
```

## API Gateway

The API Gateway provides:

- Request routing
- Authentication
- Rate limiting
- Request/Response transformation
- Error handling

## Shared Libraries

### Common Utilities

- Type definitions
- Validation schemas
- Helper functions
- Constants

### Database Models

- MongoDB schemas
- TypeScript interfaces
- Validation rules

## Message Queue Dashboard

Monitors and manages message queues:

- Queue status
- Message processing
- Error tracking
- Performance metrics

## Development Setup

1. Install dependencies:

```bash
pnpm install
```

2. Set up environment variables:

```bash
cp .env.sample .env
```

3. Start development servers:

```bash
# Start core API
pnpm dev:core-api

# Start gateway
pnpm dev:gateway

```

## Testing

```bash
# Run all tests
pnpm test

# Run specific service tests
pnpm test:core-api
pnpm test:gateway
```

## Database

### MongoDB Collections

- `configs`: Stores system configurations
- `accounts`: Stores account information
- `transactions`: Stores transaction records

### Indexes

```typescript
// configs collection
db.configs.createIndex({ MainCurrency: 1 });

// accounts collection
db.accounts.createIndex({ code: 1 }, { unique: true });
db.accounts.createIndex({ journal: 1 });
```

## Error Handling

The backend implements a standardized error handling system:

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}
```

Common error codes:

- `INVALID_INPUT`: Invalid request data
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `INTERNAL_ERROR`: Server error

## Security

- JWT authentication
- Role-based access control
- Input validation
- Rate limiting
- CORS configuration
- Security headers

## Performance Optimization

- Database indexing
- Query optimization
- Caching strategies
- Connection pooling
- Request batching

## Monitoring

- Health checks
- Performance metrics
- Error tracking
- Usage statistics
- Logging system

## Contributing

1. Follow TypeScript best practices
2. Write unit tests for new features
3. Update documentation
4. Follow the established code style
5. Create feature branches
6. Submit pull requests

## License

[Your License Here]
