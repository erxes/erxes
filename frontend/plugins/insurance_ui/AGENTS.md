# `insurance_ui` Plugin Guide

## Identity

- **Plugin:** `insurance`
- **Project:** `insurance_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/insurance_ui`
- **Last synchronized:** `2026-10-20`

## Scope

### Owns

- Insurance frontend routes, navigation, search providers, pages, widgets, assets, and module UI under `src/modules/insurance`.

### Does not own

- Insurance backend persistence or GraphQL resolvers, core UI primitives, shared libraries, or another plugin's source.

## Current Capabilities

- Runs as the `insurance_ui` Module Federation remote on port `3002`.
- Registers insurance navigation and routes for types, products, risks, vendors, vendor users, customers, regions, and contracts.
- Exposes insurance config, main routes, settings routes, and widgets through Module Federation.
- Development Rspack serving ignores generated dependency/cache/output folders to keep local file watchers bounded.
- Codegen validates all local GraphQL documents against the composed gateway schema and generates client types before builds and serves.

## Architecture

| Area              | Path                                                        | Responsibility                                                                                              |
| ----------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| App sidebar       | `frontend/plugins/insurance_ui/src/Sidebar.tsx`             | `InsuranceSidebar`: the plugin's whole app sidebar, rendered by the `./insurance` entry through `AppLayout` |
| Runtime           | `frontend/plugins/insurance_ui/src/main.ts`                 | Starts the insurance UI remote.                                                                             |
| Federation config | `frontend/plugins/insurance_ui/module-federation.config.ts` | Exposes config, insurance routes, settings, and widgets.                                                    |
| Dev server config | `frontend/plugins/insurance_ui/rspack.config.ts`            | Module Federation development serving and watch ignore rules.                                               |
| Plugin config     | `frontend/plugins/insurance_ui/src/config.tsx`              | Registers navigation, modules, and search providers.                                                        |
| Insurance module  | `frontend/plugins/insurance_ui/src/modules/insurance`       | Owns insurance route composition and feature UI.                                                            |
| Pages             | `frontend/plugins/insurance_ui/src/pages/insurance`         | Provides route-level insurance pages.                                                                       |
| Widgets           | `frontend/plugins/insurance_ui/src/widgets`                 | Provides plugin widget exports.                                                                             |
| Codegen           | `frontend/plugins/insurance_ui/codegen.ts`                  | Generates client documents/types in ignored `src/gql/` from `backend/gateway/generated/schema.graphql`      |

## Contracts

### Provides

- Module Federation exposes: `./config`, `./insurance`, and `./widgets`.
- Frontend navigation paths under `insurance/*` registered from `src/config.tsx`.

### Consumes

- Public UI APIs from `erxes-ui` and `ui-modules`.
- Insurance API contracts through the plugin's local GraphQL documents and hooks.
- GraphQL query and mutation aggregates are named exports from `src/modules/insurance/graphql`; individual document exports remain available for direct imports.
- React Router host mounting contracts from core UI Module Federation.
- The composed client-facing schema from the `gateway:schema:compose` Nx target, consumed only at codegen time; no running backend is needed for generation.

## Data and State

- Apollo Client owns server state where insurance feature hooks use GraphQL.
- React local state and form state belong inside the insurance feature modules.
- Static assets are owned under `src/assets`.

## Local Invariants

- The plugin owns its whole app sidebar. `src/modules/insurance/Main.tsx` (the `./insurance`
  expose) wraps its routes in `erxes-ui` `AppLayout` (`id="insurance"`) with
  `InsuranceSidebar`. Core-ui draws only the top `CoreTab` bar; `navigationGroup` in
  `src/config.tsx` supplies just the tab name, icon and `defaultPath` and takes
  no `content`/`subGroup`.
- Keep insurance-specific UI inside `frontend/plugins/insurance_ui`.
- Module Federation exposes, route paths, and named exports must stay aligned.
- Every GraphQL document is a `gql()` call from `~/gql`, and hooks infer result and variable types from their documents. Response types in `src/modules/insurance/types` (and `ContractTemplate` in its hook) are derived from the generated queries, with nullable fields kept nullable.
- A vendor's offered product resolves `product` to null when the product was deleted; vendor views skip those entries.
- GraphQL documents use static selections without JavaScript interpolation. Operation names start with `Insurance`; update string-based `refetchQueries` whenever an operation is renamed, preserving the backend field names, arguments, and selections.
- Product/vendor pricing form shapes live in `src/modules/insurance/types/pricing.ts`. Preserve extra JSON keys and legacy string percentages in both base rates and `percentageByDuration` entries; type cleanup must not introduce payload filtering or change pricing defaults/calculations.
- When the product form loads a product, it copies only the input fields of additional coverages, compensation calculations and the deductible config into form state. Apollo response objects carry `__typename`, which the product mutation inputs reject.
- Product/vendor duration and vendor discount rows use stable UI-only `rowId` keys assigned when loaded or added. Preserve these keys during edits/removal and omit them from mutation variables; changing an editable value must not change the row identity.
- Pricing configuration, vendor pricing overrides, and insured objects are existing JSON API contracts, generated as `unknown`. Their payloads, extra keys and legacy string rates are preserved; `isRecord` (as in Operation) and `toPricingConfig`, built on it, narrow them where the UI reads them.
- Vendor mutation documents select nested product regions. Keep these selections aligned with the API's populated responses; do not hide a response error by dropping region fields or coercing pricing JSON in the client.
- The `InsuranceCustomer` operation selects the public `insuranceCustomer(id: ID!)` field. Preserve that field and its nullable result; customer list rows come from `insuranceCustomers` independently of the single-customer lookup.
- `eslint.config.js` matches Operation's: `gql` from `@apollo/client` or `graphql-tag`, and type arguments on Apollo hooks or `subscribeToMore`, are lint errors.
- `src/gql/` is generated, gitignored, and excluded from lint/document scanning. Do not edit generated files manually; JSON maps to `unknown` and Date outputs to `string`.
- Keep `codegen` in both build and serve dependencies, and keep the build's `dependentTasksOutputFiles` input so a schema-only change invalidates the cached bundle. `codegen:watch` is a separate long-running target with no dependencies; the shared development launcher discovers both targets when Insurance is enabled.
- Table callbacks that call hooks are named React components, rendered through `RecordTable`/TanStack `flexRender`. Keep translations reactive.
- Native delete confirmations use `window.confirm`, matching the existing Insurance dialogs.
- Use `erxes-ui` and `ui-modules`; do not import another plugin's source.
- Dev watch ignores must not include plugin source directories required for hot reload.

## Validation

- `pnpm nx lint insurance_ui`
- `pnpm nx build insurance_ui`
- `pnpm nx run insurance_ui:codegen --skip-nx-cache`
- `pnpm nx run insurance_ui:codegen:watch` (after `codegen`, which composes the schema the watcher reads)
- `pnpm nx test insurance_ui --passWithNoTests` (Jest is configured; there are currently no test files).
- `pnpm exec tsc -p frontend/plugins/insurance_ui/tsconfig.app.json --noEmit` (distinguish plugin diagnostics from diagnostics in shared libraries).
- Smoke scenario: open the insurance navigation and verify insurance type, product, risk, vendor, customer, region, and contract routes load through the remote.
