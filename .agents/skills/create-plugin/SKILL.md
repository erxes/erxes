---
name: create-plugin
description: Create a new erxes plugin from scratch. Scaffolds both frontend and backend with proper structure, config, and registration.
---

# Skill: Create New Plugin

## When to Use

Use this skill when user wants to create a **brand new plugin** that doesn't exist in the monorepo yet.

**Do NOT use this skill for:**
- Adding features to existing plugins
- Modifying existing plugins
- Fixing bugs in existing plugins

## Prerequisites

Before creating a plugin:
1. Check if a similar plugin already exists
2. Confirm the plugin name and purpose
3. Determine initial module name
4. Check if plugin should be frontend-only, backend-only, or both

## Workflow

### Step 1: Confirm Requirements

Ask user:
- Plugin name (e.g., "inventory", "analytics")
- Initial module name (e.g., "items", "reports")
- Purpose/description
- Frontend only, backend only, or both?

### Step 2: Run Scaffolding Script

```bash
cd /Users/Amaraa0404/Documents/projects/erxes
pnpm create-plugin
```

This interactive script will ask for:
- Plugin name
- Module name

### Step 3: Fix Generated Code

The scaffold script generates code with **default exports**. You MUST fix this:

**In frontend plugin:**
```bash
# Find and fix default exports
find frontend/plugins/{plugin_name}_ui/src -name "*.tsx" -exec sed -i '' 's/export default /export const /g' {} +

# Fix lazy imports to use named exports
# Change from:
const IndexPage = lazy(() => import('~/pages/{module}/IndexPage'));
# To:
const IndexPage = lazy(() => import('~/pages/{module}/IndexPage').then(m => ({ default: m.IndexPage })));
```

**Critical fixes needed:**
1. Replace all `export default` with named exports
2. Fix lazy import patterns for named exports
3. Ensure config.tsx uses proper patterns
4. Add proper types

### Step 4: Create Module Federation Config

Create `module-federation.config.ts`:
```typescript
import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: '{plugin_name}_ui',
  exposes: {
    './config': './src/config.tsx',
    './{plugin_name}': './src/modules/{PluginName}Main.tsx',
  },
};

export default config;
```

### Step 5: Create Plugin AGENTS.md

Create `frontend/plugins/{plugin_name}_ui/AGENTS.md`:
```markdown
# {plugin_name} Plugin Rules

## Architecture

- This plugin is the Module Federation remote `{plugin_name}_ui`.
- Feature internals belong under `src/modules/{module}`.
- Keep hooks, GraphQL documents, states, constants, and types near the feature.

## UI Conventions

- Use `erxes-ui` and `ui-modules` components before creating new primitives.
- Use `@tabler/icons-react` for icons.
- Use `RecordTable` for cursor-paginated list pages.
- Use existing drawer/dialog patterns for create and edit flows.
- Do not introduce a new visual style, spacing system, UI library, or icon library.

## Data and GraphQL

- Use Apollo Client hooks.
- Name GraphQL operations with the plugin prefix plus purpose.
- Do not change backend GraphQL contracts from this frontend plugin unless explicitly requested.

## State and Routing

- Add routes using lazy imports and `Suspense`.
- Use Jotai only for state shared across sibling components or table/page state.

## Validation

- Run `pnpm nx lint {plugin_name}_ui` and `pnpm nx build {plugin_name}_ui`.
```

### Step 6: Register Plugin in Manifest

Add to `.agents/manifest.yaml`:
```yaml
plugins:
  frontend:
    - name: "{plugin_name}"
      nx_name: "{plugin_name}_ui"
      path: "frontend/plugins/{plugin_name}_ui"
      status: "active"
  backend:
    - name: "{plugin_name}"
      nx_name: "{plugin_name}_api"
      path: "backend/plugins/{plugin_name}_api"
      status: "active"
```

### Step 7: Add to Feature Map

Add to `.agents/maps/feature-map.yaml`:
```yaml
{module}:
  domain: "{plugin_name}"
  description: "{description}"
  keywords: ["{keyword1}", "{keyword2}"]
  frontend:
    plugin: "{plugin_name}_ui"
    module: "{module}"
    components: ["{Module}RecordTable", "{Module}Form"]
    routes: ["/{plugin_name}/{module}"]
  backend:
    plugin: "{plugin_name}_api"
    module: "{module}"
    entities: ["{Entity}"]
    resolvers: ["{module}Queries", "{module}Mutations"]
```

### Step 8: Update Host App (if needed)

If this plugin should be loaded by core-ui:
1. Add to `frontend/core-ui/src/plugins.ts` or equivalent
2. Register route in host app
3. Add Module Federation remote reference

### Step 9: Validate

```bash
pnpm nx lint {plugin_name}_ui
pnpm nx build {plugin_name}_ui
pnpm nx build {plugin_name}_api
```

## Important Rules

- The scaffold script generates default exports - YOU MUST FIX THESE
- Always create plugin-specific AGENTS.md
- Register plugin in manifest immediately
- Add to feature map for future reference
- Ensure Module Federation config is correct
- Host app must know about the new plugin

## Common Mistakes

❌ Forgetting to fix default exports
❌ Not creating AGENTS.md
❌ Not registering in manifest
❌ Forgetting Module Federation config
❌ Not updating host app references
❌ Using old lazy import patterns

## Example

```
User: "Create a new inventory plugin with items module"

LLM:
1. "I'll create the inventory plugin with items module."
2. Run: pnpm create-plugin
   - Plugin name: inventory
   - Module name: items
3. Fix default exports in generated files
4. Create module-federation.config.ts
5. Create AGENTS.md
6. Register in manifest.yaml
7. Add to feature-map.yaml
8. Run validation
9. "Inventory plugin created successfully!"
```
