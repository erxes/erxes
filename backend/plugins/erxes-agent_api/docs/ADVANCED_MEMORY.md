# Advanced Memory — Spec & Implementation Plan

> Status: **SPEC (pre-development)** · Plugin: `erxes-agent_api` (port 3312) · Owner: erxes Mastra plugin
>
> This document is the single source of truth for the "Advanced memory feature". Everything it
> describes lives **inside the mastra plugin** — including the Qdrant Docker definition. Nothing
> spills into the monorepo root except documented `.env` keys.

---

## 1. Goal & guiding principles

Give Mastra agents **long-term memory across sessions** without compromising the current, working
setup.

1. **Opt-in, never required.** Default behavior is exactly today's: Mongo-native conversation
   replay, stateless agent, clean Kimi-safe message shape. Advanced memory is **off** unless the
   operator explicitly enables it.
2. **Single flag, env-controlled.** `ERXES_AGENT_MEMORY=enable` turns it on. Anything else / unset = off.
3. **Read-only in the UI.** Settings displays "Advanced memory feature = On/Off" **untouchably**
   (no toggle) because it is controlled by the environment, not by app data.
4. **Self-contained.** Qdrant runs from a `docker-compose.yml` that lives in the plugin directory.
5. **Graceful degradation.** If enabled but Qdrant/embedder is unreachable, chat still works — it
   silently falls back to recent-history replay and the Settings page shows the broken status.
6. **Kimi safety preserved.** Recalled context is injected as **plain context text**, never as
   tool-call frames, so the `reasoning_content` shim and clean replay remain intact.

---

## 2. What "Advanced memory" includes (v1)

| Sub-feature         | Backed by         | Scope                                           | Needs Qdrant? |
| ------------------- | ----------------- | ----------------------------------------------- | ------------- |
| **Semantic recall** | Qdrant + embedder | per-resource (a user), across all their threads | ✅ yes        |
| **Working memory**  | MongoDB           | per-resource (a user), per-agent                | ❌ no         |

- **Semantic recall** = long-term retrieval. Every stored message is embedded and upserted into
  Qdrant. On each turn we query Qdrant for the top-K semantically relevant past snippets and inject
  them into context. This is what lets the agent "remember" something said three sessions ago.
- **Working memory** = a persistent, agent-maintained profile of the user/task (markdown by
  default; Zod schema optional later). Injected into the system context each turn; refreshed after
  each turn by a small extraction call. Stored in Mongo — no vector infra needed.

Both turn on together behind the one `ERXES_AGENT_MEMORY=enable` flag.

---

## 3. Architecture — augmentation, not replacement

We do **not** hand the agent over to Mastra's stateful `Memory` class. That class replays full
message history _including tool-call/tool-result frames_, which is exactly what triggered the
earlier Kimi `"reasoning_content is missing in assistant tool call message"` failure. Instead,
advanced memory is an **augmentation layer** around the existing flow:

```
                          ┌─────────────────────────── mastraAgentChat (per turn) ───────────────────────────┐
                          │                                                                                    │
  user message ──▶ recent history (Mongo, last 20)                                                            │
                          │                                                                                    │
   [advanced ON] ──▶ semantic recall (Qdrant top-K) ─┐                                                        │
                          │                            ├──▶ build convo: [workingMemoryBlock?, recallBlock?,   │
   [advanced ON] ──▶ working memory (Mongo profile) ──┘                  ...recentHistory, userMessage]        │
                          │                                                                                    │
                          ▼                                                                                    │
                 stateless Agent.generate(convo)  ──▶ reply                                                    │
                          │                                                                                    │
   persist user+assistant to Mongo (unchanged)                                                                │
   [advanced ON] ──▶ embed + upsert both into Qdrant                                                          │
   [advanced ON] ──▶ refresh working-memory profile (non-blocking extraction call)                            │
                          └────────────────────────────────────────────────────────────────────────────────┘
```

- Recall + working-memory blocks are appended as **context messages** (role `system`/`user`
  preface), not as tool frames.
- Mongo (`MastraThread` / `MastraMessage`) stays the **source of truth** for the transcript. Qdrant
  is a derived index; it can be rebuilt from Mongo at any time.
- When advanced is OFF, none of the new modules are imported (lazy `import()` behind the flag), so
  default deployments pay zero cost and never download an embed model.

---

## 4. Multi-tenancy (correctness requirement)

erxes is subdomain-multi-tenant. Mongo models are already subdomain-scoped via `generateModels`.
**Qdrant is shared infrastructure**, so every point/query MUST carry and filter on `subdomain`.

- Qdrant payload on every point: `{ subdomain, resourceId, threadId, agentId, role, messageId, text, createdAt }`.
- Every recall query filters `subdomain == <current>` **and** the scope key (`resourceId` for
  resource scope, `threadId` for thread scope). Missing this = cross-tenant leakage. Non-negotiable.

---

## 5. Identity: resourceId & threadId

- `threadId` — already exists (the chat session id / bot conversation id).
- `resourceId` — the "who", stable across sessions. Derivation:
  - **Chat** (`mastraAgentChat`): `resourceId = user._id` (from Apollo context). Fallback `agent:<agentId>` if no user.
  - **Bot bridge** (`/pl:mastra/bot/:conversationId`): `resourceId = customer id` if resolvable, else `bot:<conversationId>`.
- **Working memory scope:** `resource` (remember a user across their sessions).
- **Semantic recall scope:** `resource` by default (configurable to `thread`).

---

## 6. Configuration (all `ERXES_AGENT_*` env keys)

| Env var                         | Default                                                             | Purpose                                                 |
| ------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------- |
| `ERXES_AGENT_MEMORY`            | _(unset)_                                                           | `enable` turns advanced memory on. Anything else = off. |
| `ERXES_AGENT_QDRANT_URL`        | `http://localhost:6333`                                             | Qdrant REST endpoint.                                   |
| `ERXES_AGENT_QDRANT_API_KEY`    | _(unset)_                                                           | Optional Qdrant API key.                                |
| `ERXES_AGENT_EMBEDDER`          | `fastembed`                                                         | `fastembed` (local) or `openai` (API).                  |
| `ERXES_AGENT_EMBEDDER_MODEL`    | `bge-small-en-v1.5` (fastembed) / `text-embedding-3-small` (openai) | Embedding model id.                                     |
| `ERXES_AGENT_EMBEDDER_BASE_URL` | `https://api.openai.com/v1`                                         | OpenAI-compatible base URL (openai mode).               |
| `ERXES_AGENT_EMBEDDER_API_KEY`  | _(unset)_                                                           | Key for the API embedder (openai mode).                 |
| `ERXES_AGENT_MEMORY_TOPK`       | `4`                                                                 | Semantic recall: snippets retrieved per turn.           |
| `ERXES_AGENT_MEMORY_MIN_SCORE`  | `0.5`                                                               | Minimum cosine score to include a recalled snippet.     |
| `ERXES_AGENT_MEMORY_SCOPE`      | `resource`                                                          | `resource` or `thread` for semantic recall.             |

Embedding **dimensions** differ per model (FastEmbed `bge-small-en-v1.5` = 384, OpenAI
`text-embedding-3-small` = 1536). The Qdrant collection name encodes model+dim
(`mastra_memory_<model>_<dim>`) so switching embedders creates a fresh collection instead of
crashing on a dimension mismatch. Changing the embedder = a new empty index (documented; old index
can be deleted or backfilled).

`.env.sample` (repo root) gets the keys above, commented, with `ERXES_AGENT_MEMORY` disabled by default.

---

## 7. Qdrant Docker — in plugin scope

`backend/plugins/erxes-agent_api/docker-compose.yml`:

```yaml
# Qdrant for the Mastra "Advanced memory feature". Only needed when
# ERXES_AGENT_MEMORY=enable. Run:  docker compose -f backend/plugins/erxes-agent_api/docker-compose.yml up -d
services:
  qdrant:
    image: qdrant/qdrant:v1.12.4 # pinned
    container_name: mastra-qdrant
    ports:
      - '6333:6333' # REST
      - '6334:6334' # gRPC
    volumes:
      - mastra_qdrant_storage:/qdrant/storage
    # environment:
    #   QDRANT__SERVICE__API_KEY: ${ERXES_AGENT_QDRANT_API_KEY}
    restart: unless-stopped
volumes:
  mastra_qdrant_storage:
```

Self-hosted, open-source, no Atlas. Documented in this file's "Operations" section below.

---

## 8. Settings UI — read-only status

- New **computed, read-only** GraphQL fields on `MastraSettings` (type only, **not** the input):
  - `advancedMemory: Boolean!` — `process.env.ERXES_AGENT_MEMORY === 'enable'`.
  - `advancedMemoryStatus: MastraMemoryStatus` — `{ enabled, embedder, qdrantUrl, qdrantReachable, collection }`.
- `GeneralSettingsPage.tsx` renders a **disabled** control (lock icon + "Advanced memory feature"
  with an On/Off badge) and, when on, a small status line: embedder name + Qdrant connectivity dot
  (green reachable / red unreachable) + collection name. Helper text: "Controlled by the
  `ERXES_AGENT_MEMORY` environment variable." No editable input — matches the user's "untouchably" ask.

---

## 9. Boot behavior (`main.ts` → `onServerInit`)

When `ERXES_AGENT_MEMORY=enable`:

1. Lazy-import the advanced-memory module.
2. Resolve embedder + dimension; compute collection name.
3. Ping Qdrant. If reachable → `ensureCollection()` (create if absent with the right dim + cosine).
   If unreachable → **loud warning**, do not crash; advanced features no-op until it recovers.
4. (Optional) warm the FastEmbed model so the first chat isn't slow.

Per-request code never assumes health — it `try/catch`es and falls back to recent-history replay.

---

## 10. File-by-file plan

**New files (all in `backend/plugins/erxes-agent_api/`):**

1. `docker-compose.yml` — Qdrant service (§7).
2. `src/mastra/memory/config.ts` — env reader: `isAdvancedMemoryEnabled()`, qdrant/embedder/tuning config, collection-name helper.
3. `src/mastra/memory/embedder.ts` — `getEmbedder()` → `{ embed(texts): number[][], dimension }`. FastEmbed default, OpenAI optional. Lazy imports.
4. `src/mastra/memory/vectorStore.ts` — Qdrant wrapper via `@mastra/qdrant`: `ensureCollection`, `upsert`, `query`, `health`.
5. `src/mastra/memory/semanticRecall.ts` — `recallBlock(query, {subdomain,resourceId,...})` and `indexMessages([...])`.
6. `src/mastra/memory/workingMemory.ts` — `readBlock(resourceId, agentId)` and `refresh(resourceId, agentId, exchange)` (extraction call, merge semantics).
7. `src/mastra/memory/index.ts` — façade: `initAdvancedMemory()`, `augmentConvo()`, `persistAndIndex()`, `getStatus()`.
8. `src/modules/memory/` — Mongo model for working memory: `db/definitions/workingMemory.ts`, `db/models/WorkingMemory.ts`, `@types/`. Doc: `{ resourceId, agentId, content, updatedAt }`.

**Modified files:**

- `src/main.ts` — add `onServerInit` (§9).
- `src/connectionResolvers.ts` — register `MastraWorkingMemory` model.
- `src/modules/agent/graphql/resolvers/queries/agent.ts` — in `mastraAgentChat`: derive resourceId, `augmentConvo()` before generate, `persistAndIndex()` + working-memory refresh after (refresh is non-blocking).
- `src/modules/settings/graphql/schemas/settings.ts` — add read-only `advancedMemory` + `MastraMemoryStatus` type.
- `src/modules/settings/graphql/resolvers/queries/*` — compute status from env + Qdrant health.
- `src/routes.ts` — bot bridge passes a resourceId.
- `package.json` — add `@mastra/qdrant`, `@mastra/fastembed`.
- `frontend/plugins/erxes-agent_ui/src/graphql/queries.ts` — `ERXES_AGENT_SETTINGS` gets the new read-only fields.
- `frontend/plugins/erxes-agent_ui/src/pages/settings/GeneralSettingsPage.tsx` — read-only status block.
- repo `.env.sample` — documented `ERXES_AGENT_*` keys (disabled by default).

---

## 11. Dependencies & lockfile

**Scope constraint (decided during Phase 1): keep everything inside the mastra plugin; no
out-of-plugin / root changes, including no `pnpm-lock.yaml` churn.** Two deviations from the
original draft follow from this:

1. **Qdrant via raw REST (`fetch`), not `@mastra/qdrant`.** Qdrant's REST surface is tiny and
   stable; calling it directly keeps the feature self-contained with **zero new dependency**. See
   `src/mastra/memory/vectorStore.ts`.
2. **FastEmbed (the default local embedder) is an optional, lazily-loaded dependency.** It is the
   only thing that needs a package (`fastembed`) and therefore the only thing that would touch the
   root lockfile. It is loaded via a computed import specifier and is **not** added to
   `package.json` yet — until it is, the default embedder throws a clear "install fastembed" error
   and the **OpenAI embedder works dep-free** (`ERXES_AGENT_EMBEDDER=openai`). Adding `fastembed` is a
   deliberate, separately-approved step (it's the plugin's own dependency, but the resulting
   lockfile entry is the one unavoidable root touch).

---

## 12. Phased delivery (each phase = one atomic commit, independently verifiable)

- **Phase 0 — Flag & read-only status (no behavior change).** `config.ts`, settings computed
  field, `GeneralSettingsPage` status block, `.env.sample`. Verify: off → "Off"; `enable` → "On".
- **Phase 1 — Qdrant infra.** `docker-compose.yml`, `embedder.ts`, `vectorStore.ts`,
  `initAdvancedMemory()` + `onServerInit`. Verify: flag on + Qdrant up → collection created, status
  green; Qdrant down → status red, plugin still boots & chat works.
- **Phase 2 — Semantic recall.** `semanticRecall.ts`, wire into `mastraAgentChat` (augment + index),
  tenant filter, graceful fallback. Verify: cross-session recall works; default mode byte-identical;
  Kimi replay still clean.
- **Phase 3 — Working memory.** `WorkingMemory` model, `workingMemory.ts`, inject + post-turn
  refresh. Verify: agent recalls a fact set in a previous session via the profile.
- **Phase 4 — Bot bridge + polish.** resourceId for bot route, settings status detail, finalize this
  doc's Operations section.

---

## 13. Risks & mitigations

| Risk                                       | Mitigation                                                                        |
| ------------------------------------------ | --------------------------------------------------------------------------------- |
| Cross-tenant leakage via shared Qdrant     | Mandatory `subdomain` payload + filter on every query (§4).                       |
| Kimi `reasoning_content` regression        | Recall/WM injected as context text, never tool frames; stateless agent unchanged. |
| Embedder dimension change crashes index    | Collection name encodes model+dim; switch = fresh index.                          |
| FastEmbed first-run model download latency | Optional warm-up in `onServerInit`; documented.                                   |
| Qdrant down in production                  | Per-request try/catch → fall back to recent-history; status surfaced in Settings. |
| Working-memory refresh cost/latency        | Non-blocking (fire-and-forget after reply); can throttle to every N turns.        |
| Lockfile churn from new deps               | Discrete dep-add step with reviewed, minimal diff.                                |

---

## 14. Operations (filled in during Phase 1/4)

```bash
# Start Qdrant (only when using advanced memory)
docker compose -f backend/plugins/erxes-agent_api/docker-compose.yml up -d

# Enable in .env
ERXES_AGENT_MEMORY=enable
ERXES_AGENT_QDRANT_URL=http://localhost:6333
ERXES_AGENT_EMBEDDER=fastembed        # or: openai (+ ERXES_AGENT_EMBEDDER_API_KEY)

# Restart the plugin; check Settings → General → "Advanced memory feature = On" with a green Qdrant dot.
```
