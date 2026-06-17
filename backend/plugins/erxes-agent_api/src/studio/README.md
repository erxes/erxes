# Mastra Studio bridge (dev tool)

Runs **Mastra Studio** (`mastra dev`) against this plugin so you can browse and
exercise erxes-agent's real **agents, tools, workflows, memory and processors**
in Studio's UI — reusing the production runtime, with no schema translation.

This is a **dev tool**: it is never imported by the plugin runtime
(`main.ts` / `startPlugin`) and is excluded from the plugin's production build.

## Run

```bash
cd backend/plugins/erxes-agent_api
pnpm studio          # = mastra dev --env ../../../.env
```

Then open **http://localhost:4111**.

### Prerequisites
- The same **`MONGO_URL`** erxes uses must be reachable (the bridge connects on
  import; a bad URL makes erxes-api-shared `process.exit(1)`).
- The **gateway / erxes API on `:4000`** must be up — full-reuse agents build
  their tools from its operation registry, and workflows compile against it.
- **`ERXES_AGENT_MEMORY=enable`** for the per-agent memory/history tab and Qdrant
  semantic recall (otherwise agents register without memory).
- SaaS only: set `ERXES_STUDIO_SUBDOMAIN=<org-subdomain>` (defaults to `os`).

## What you get
- **Agents** — real, tool-bound, via `getOrCreateAgent(cfg, models, subdomain)`.
- **Memory / history** — native `getMastraMemory` (Mongo `erxes_mastra_memory` +
  Qdrant + fastembed). `/api/memory/status` is `true` for memory-enabled agents.
- **Workflows** — the `mastra_workflows` definitions, compiled via the production
  `buildRunDeps` + `compileDefinition` and registered by readable name.
- **Processors** — the memory `ToolCallFilter` surfaces as `*-input-processor`.

## Files
| File | Role |
|---|---|
| `../mastra/index.ts` | CLI entry (conventional path) — re-exports `~/studio` |
| `index.ts` | builds `new Mastra({ agents, workflows, storage })` |
| `tenant.ts` | tenant resolution + cached `generateModels(subdomain)` |
| `storage.ts` | `MongoDBStore` on `erxes_mastra_memory` (matches the runtime) |
| `agents.ts` | registers real agents (memory attaches via the subdomain) |
| `workflows.ts` | compiles + registers business workflows |

## Notes
- **History tab shows the native Mastra memory** (sparse, untitled — only chats
  since the native-memory refactor), **not** the dashboard's titled conversation
  log. That log lives in the custom `mastra_threads` / `mastra_messages` store.
  Making Studio show those readable conversations is the planned migration: move
  the custom chat store onto Mastra-native storage (separate PR).
- **Build**: the bridge is excluded from `tsconfig.build.json` (`src/studio/**` +
  `src/mastra/index.ts`), so `pnpm build` stays green — it's compiled only by the
  `mastra` CLI (esbuild). Your editor may show one cosmetic *top-level-await*
  squiggle on `index.ts`; it's harmless (esbuild bundles it, not `tsc`).
- **Do not** add a `src/studio/tsconfig.json` or exclude `src/studio` from the
  root `tsconfig.json` — it breaks the `mastra` bundler's `~/` alias resolution
  (bare `~` import → `ERR_MODULE_NOT_FOUND`).
