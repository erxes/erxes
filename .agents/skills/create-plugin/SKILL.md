---
name: create-plugin
description: Create a new erxes plugin from scratch. Scaffolds both frontend and backend with proper structure, config, and registration.
---

# Skill: Create New Plugin

## CRITICAL WARNING

**The scaffold script (`pnpm create-plugin`) generates code that VIOLATES non-negotiable rules.**

You MUST fix ALL generated code before declaring completion. The scaffold is a starting point, NOT a finished implementation.

## When to Use

Use this skill when user wants to create a **brand new plugin** that doesn't exist in the monorepo yet.

**Do NOT use this skill for:**
- Adding features to existing plugins
- Modifying existing plugins
- Fixing bugs in existing plugins

## Prerequisites

Before creating a plugin:
1. **READ** `.agents/rules/non-negotiable.md` - ALL rules apply
2. Check if a similar plugin already exists
3. Confirm the plugin name and purpose
4. Determine initial module name
5. Check if plugin should be frontend-only, backend-only, or both

## Workflow

### Step 1: Confirm Requirements

Ask user:
- Plugin name (e.g., "inventory", "analytics")
- Initial module name (e.g., "items", "reports")
- Purpose/description
- Frontend only, backend only, or both?

### Step 2: Read Non-Negotiable Rules

**BEFORE running the scaffold, confirm you have read:**
- `.agents/rules/non-negotiable.md` (ALL rules)
- `.agents/rules/architecture.md`
- `.agents/rules/code-style.md`

You will be held accountable for every rule violation.

### Step 3: Run Scaffolding Script

```bash
cd /Users/Amaraa0404/Documents/projects/erxes
pnpm create-plugin
```

This interactive script will ask for:
- Plugin name
- Module name

**WARNING: The generated code will have:**
- Default exports (RULE VIOLATION)
- Placeholder content (RULE VIOLATION)
- `any` types (RULE VIOLATION)
- `schemaWrapper` usage in backend (RULE VIOLATION)

### Step 4: Fix Generated Code (CRITICAL - DO NOT SKIP)

This is the MOST IMPORTANT step. The scaffold generates broken code that violates rules.

**You MUST run the validation script to verify fixes:**
```bash
./.agents/scripts/validate-scaffold.sh {plugin_name} {scope}
```

**In frontend plugin - fix these files:**

1. **All .tsx files in `src/`** - Replace `export default` with named exports:
   ```bash
   # Find default exports (MANUAL REVIEW REQUIRED)
   grep -rn "export default" frontend/plugins/{plugin_name}_ui/src --include="*.tsx"
   
   # Fix each one individually - do NOT use blind sed replacement
   ```

2. **Fix lazy imports** to handle named exports:
   ```tsx
   // BEFORE (scaffolded):
   const IndexPage = lazy(() => import('~/pages/{module}/IndexPage'));
   
   // AFTER (correct):
   const IndexPage = lazy(() => 
     import('~/pages/{module}/IndexPage').then(m => ({ default: m.IndexPage }))
   );
   ```

3. **Remove all `any` types** from Widgets.tsx and other files

4. **Replace placeholder content** in Settings.tsx and IndexPage.tsx with real content or empty states

5. **Verify `module-federation.config.ts`** uses named exports for exposed modules

**In backend plugin - fix these files:**

1. **Replace `schemaWrapper`** with direct `new Schema(...)` in db/definitions
2. **Replace `export default`** with named exports in apollo/resolvers/index.ts
3. **Fix imports** to use aliases (`~/`, `@/`) instead of relative paths (`./`)

### Step 5: Run Rule Checker

```bash
./.agents/scripts/check-rules.sh frontend/plugins/{plugin_name}_ui
./.agents/scripts/check-rules.sh backend/plugins/{plugin_name}_api
```

**If this fails, you MUST fix the issues before proceeding.**

### Step 6: Create Module Federation Config

Verify `module-federation.config.ts`:
```typescript
import { ModuleFederationConfig } from '@nx/module-federation';

export const config: ModuleFederationConfig = {
  name: '{plugin_name}_ui',
  exposes: {
    './config': './src/config.tsx',
    './{plugin_name}': './src/modules/{PluginName}Main.tsx',
  },
};

// Default export required by Nx tooling - do not remove
export default config;
```

### Step 7: Create Plugin AGENTS.md

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

### Step 8: Register Plugin in Manifest

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

### Step 9: Add to Feature Map

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

### Step 10: Update Host App (if needed)

If this plugin should be loaded by core-ui:
1. Add to `frontend/core-ui/src/plugins.ts` or equivalent
2. Register route in host app
3. Add Module Federation remote reference

### Step 11: Validate (MANDATORY)

```bash
# Run the comprehensive validation script
./.agents/scripts/validate-scaffold.sh {plugin_name} {scope}

# If the above passes, also run:
pnpm nx lint {plugin_name}_ui
pnpm nx build {plugin_name}_ui
pnpm nx build {plugin_name}_api
```

**DO NOT declare completion until ALL validation passes.**

## Critical Rules

1. **The scaffold script generates rule-violating code - YOU MUST FIX IT**
2. **ALWAYS run `validate-scaffold.sh` before declaring done**
3. **ALWAYS create plugin-specific AGENTS.md**
4. **Register plugin in manifest immediately**
5. **Add to feature map for future reference**
6. **Ensure Module Federation config uses named exports**
7. **Host app must know about the new plugin**

## Common Mistakes (WILL CAUSE FAILURE)

❌ **Forgetting to fix default exports** - The #1 cause of "Module unavailable" errors
❌ **Not running validate-scaffold.sh** - You'll ship broken code
❌ **Leaving placeholder content** - Violates Completeness rule
❌ **Not creating AGENTS.md** - Future agents won't know plugin conventions
❌ **Not registering in manifest** - Plugin won't be recognized
❌ **Forgetting Module Federation config** - Plugin won't load
❌ **Not updating host app references** - Plugin won't appear in UI
❌ **Using old lazy import patterns** - Named exports need `.then(m => ({ default: m.Name }))`

## Why This Matters

The scaffold script exists to create directory structure and boilerplate. It does NOT produce production-ready code. An agent that stops at scaffolding produces:

- Broken plugins that can't load (default exports vs named exports mismatch)
- Empty pages with no functionality (violates Completeness rule)
- Code that fails lint and build (violates Quality rule)
- Technical debt that requires cleanup by human developers

**You are responsible for every line of code in the final plugin.**

## Example

```
User: "Create a new inventory plugin with items module"

LLM:
1. "I'll create the inventory plugin with items module."
2. Read: .agents/rules/non-negotiable.md
3. Run: pnpm create-plugin
   - Plugin name: inventory
   - Module name: items
4. Fix ALL default exports in generated files
5. Replace placeholder content with real content
6. Remove 'any' types
7. Fix backend schemaWrapper usage
8. Create module-federation.config.ts with named exports
9. Create AGENTS.md
10. Register in manifest.yaml
11. Add to feature-map.yaml
12. Run: ./.agents/scripts/validate-scaffold.sh inventory both
13. Fix any issues found
14. Run: pnpm nx build inventory_ui && pnpm nx build inventory_api
15. "Inventory plugin created and validated successfully!"
```
