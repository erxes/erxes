# Semantic Skill Index

Use this index to find the correct skill or workflow for specific tasks, symptoms, or edge cases.

## 0. Scope Detection (ALWAYS RUN FIRST)

| Symptom / Task | Use Skill | Key Pattern |
|:---|:---|:---|
| Starting ANY new task | `detect-scope` | **MANDATORY**: Run before `intake`. Reads feature-map, identifies plugin/module, loads code context, asks minimal questions. |
| User request is vague | `detect-scope` → `intake` | detect-scope asks informed questions; intake builds checklist |
| User mentions a feature | `detect-scope` | Auto-maps to plugin via feature-map.yaml |

## 1. Project Initialization & Scaffolding

| Intent / Task | Use Skill | Key Correction / Edge Case |
|:---|:---|:---|
| Create a new plugin | `create-plugin` | **CRITICAL**: Scaffolding generates rule-violating code. You MUST fix default exports and placeholders immediately. |
| Add a new module to existing plugin | `create-page` | Ensure the module is registered in the plugin's `config.tsx`. |
| Set up backend for a feature | `create-backend-entity` | Avoid `schemaWrapper`. Use explicit Mongoose schemas. |

## 2. Navigation & Connectivity (Module Federation)

| Symptom / Task | Use Skill | Key Correction / Edge Case |
|:---|:---|:---|
| Page gives **404 Not Found** | `configure-plugin-navigation` | Check if path in `config.tsx` matches the route in `Main.tsx` and host registration. |
| **"Module unavailable"** error | `module-federation-expose` | Verify the module name in `module-federation.config.ts` matches the import in the host. |
| Navigation icon missing | `configure-plugin-navigation` | Use `@tabler/icons-react`. Icons must be imported and passed to `CONFIG`. |

## 3. UI Implementation (Frontend)

| Intent / Feature | Use Skill | Non-Negotiable Pattern |
|:---|:---|:---|
| Build a list/table page | `create-table` | Use `RecordTable.Provider` pattern. NO raw HTML tables. |
| Create a form (Create/Edit) | `create-form-drawer` | Use `Form.Field` pattern with Zod and success/error toasts. |
| Add a popup/dialog | `create-modal` | Use `erxes-ui` dialog components only. NO Radix direct imports. |
| Add user-facing text | `add-translations` | Use `t('key')` and register in `locales/en.json`. NO hardcoded strings. |
| Share state between siblings | `create-provider-context` | Use scoped Jotai atoms or React Context. Avoid global state if possible. |

## 4. Data & Logic (Backend)

| Intent / Task | Use Skill | Key Pattern |
|:---|:---|:---|
| Add new data model | `create-backend-entity` | Put definitions in `db/definitions` and models in `db/models`. |
| Fetch/Mutate data from UI | `create-query` | Operations MUST be named and prefixed (e.g., `salesDealList`). |
| Data needs cleanup/migration | `create-backend-migration` | Scripts must be idempotent and safe to run multiple times. |

## 5. Troubleshooting & Maintenance

| Problem / Task | Use Skill | Action |
|:---|:---|:---|
| Build/Lint is failing | `fix-sonar` | Fix warnings without changing behavior. Prioritize type safety. |
| Host loader is failing | `architecture.md` | Ensure named exports match the loader's expected name. |
| Rule violation reported | `non-negotiable.md` | Audit the file for `default` exports, `any` types, or forbidden imports. |

## 6. Edge Case: "Named Export" vs "Host App"

If the host app loader fails to find a component after you switched to named exports:
1. Check `RenderPluginsComponent.tsx` in `core-ui`.
2. Ensure the `remoteModuleName` matches the named export exactly.
3. If the loader is hardcoded to `.default`, use an alias or fix the loader (with permission).
