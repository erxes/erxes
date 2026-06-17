# Advanced Memory — Test Plan & Definition of Done

> Companion to `ADVANCED_MEMORY.md`. This is the acceptance contract: **implementation is "100%
> done" when every P0 case passes and the manual acceptance checklist (§7) is signed off.**
> Each case lists: type (Unit / Integration / E2E / Manual), priority (P0 critical · P1 important ·
> P2 nice), the spec clause it traces to, and the phase that introduces it.

Legend — Type: **U**nit (Jest, no external services) · **I**ntegration (needs Qdrant from the
plugin compose file) · **E2E** (plugin + a live model) · **M**anual (UI / ops).

---

## 0. Test harness prerequisite (Phase 0)

No backend plugin has a Jest target today. Before any unit case can run we add:

- `backend/plugins/erxes-agent_api/jest.config.ts` (preset `../../../jest.preset.js`, `testEnvironment: 'node'`, ts-jest).
- `backend/plugins/erxes-agent_api/tsconfig.spec.json`.
- a `test` target in `project.json` so `pnpm nx test erxes-agent_api` works.
- Unit tests live in `src/**/__tests__/*.test.ts`. Integration tests are tagged
  `*.int.test.ts` and skipped unless `ERXES_AGENT_QDRANT_URL` is reachable (guarded `describe`).

**T-HARNESS-1 (U, P0):** `pnpm nx test erxes-agent_api` runs and reports a green suite with at least one
trivial passing test. Establishes the runner before feature tests land.

---

## 1. Feature flag & gating — spec §1, §2, §3

To make these unit-testable, `config.ts` exposes pure functions that read an injected `env` object
(not `process.env` directly).

| ID        | Type/Pri | Case                                                                                 | Expected                                                                                                  |
| --------- | -------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| AM-FLAG-1 | U·P0     | `isAdvancedMemoryEnabled({})`                                                        | `false`                                                                                                   |
| AM-FLAG-2 | U·P0     | `isAdvancedMemoryEnabled({ ERXES_AGENT_MEMORY: 'enable' })`                          | `true`                                                                                                    |
| AM-FLAG-3 | U·P0     | `isAdvancedMemoryEnabled({ ERXES_AGENT_MEMORY: 'true' })`, `'1'`, `'on'`, `'ENABLE'` | `false` for all (only exact `'enable'` enables)                                                           |
| AM-FLAG-4 | U·P1     | `isAdvancedMemoryEnabled({ ERXES_AGENT_MEMORY: ' enable ' })` (whitespace)           | `true` (trimmed) — document the trim decision                                                             |
| AM-GATE-1 | I·P0     | Boot plugin with `ERXES_AGENT_MEMORY` unset; spy on the memory façade module loader  | Advanced-memory modules are **never imported**; no Qdrant connection attempted; no embed model downloaded |
| AM-GATE-2 | E2E·P0   | With flag off, run a chat turn                                                       | Identical code path to today (recent-history replay only); no Qdrant/embedder calls in logs               |

---

## 2. Embedder — spec §6

`resolveEmbedderConfig(env)` is pure; `getEmbedder()` instantiates lazily.

| ID       | Type/Pri | Case                                                                                                            | Expected                                                                                                 |
| -------- | -------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| AM-EMB-1 | U·P0     | `resolveEmbedderConfig({})`                                                                                     | `{ kind:'fastembed', model:'bge-small-en-v1.5', dimension:384 }`                                         |
| AM-EMB-2 | U·P0     | `resolveEmbedderConfig({ ERXES_AGENT_EMBEDDER:'openai' })`                                                      | `{ kind:'openai', model:'text-embedding-3-small', dimension:1536, baseUrl:'https://api.openai.com/v1' }` |
| AM-EMB-3 | U·P1     | `resolveEmbedderConfig({ ERXES_AGENT_EMBEDDER:'openai', ERXES_AGENT_EMBEDDER_MODEL:'text-embedding-3-large' })` | dimension resolves to `3072` (model→dim table)                                                           |
| AM-EMB-4 | U·P1     | Unknown `ERXES_AGENT_EMBEDDER` value                                                                            | falls back to `fastembed` default + a warning                                                            |
| AM-EMB-5 | I·P0     | FastEmbed `embed(['hello world'])`                                                                              | returns `number[][]` with one vector of length `384`; values finite                                      |
| AM-EMB-6 | I·P1     | `embed(['a','b','c'])` (batch)                                                                                  | returns 3 vectors, order preserved, each length = dimension                                              |
| AM-EMB-7 | I·P1     | OpenAI embedder (when key set) `embed(['hello'])`                                                               | one vector length `1536`                                                                                 |

---

## 3. Collection naming & vector store — spec §4, §6, §7

`collectionName(model, dim)` and `buildRecallFilter(...)`/`toPoint(...)` are pure → unit. The Qdrant
ops are integration.

| ID       | Type/Pri | Case                                                               | Expected                                                           |
| -------- | -------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| AM-COL-1 | U·P0     | `collectionName('bge-small-en-v1.5', 384)`                         | `mastra_memory_bge_small_en_v1_5_384` (sanitized, dim suffix)      |
| AM-COL-2 | U·P0     | `collectionName('text-embedding-3-small', 1536)` ≠ AM-COL-1 result | distinct name → switching embedder never reuses a wrong-dim index  |
| AM-VEC-1 | I·P0     | `ensureCollection()` against fresh Qdrant                          | collection created with vector size = dimension, distance = Cosine |
| AM-VEC-2 | I·P0     | `ensureCollection()` called twice                                  | idempotent; no error, no data loss                                 |
| AM-VEC-3 | I·P0     | `upsert(point)` then `query(vector)`                               | the point is returned as the top hit with its payload intact       |
| AM-VEC-4 | I·P1     | `health()` when Qdrant up / down                                   | `true` / `false` (no throw)                                        |

---

## 4. Multi-tenancy isolation — spec §4 (**security-critical**)

| ID       | Type/Pri | Case                                                                         | Expected                                                                                            |
| -------- | -------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| AM-TEN-1 | U·P0     | `buildRecallFilter({ subdomain:'acme', scope:'resource', resourceId:'u1' })` | filter contains **both** `subdomain == 'acme'` AND `resourceId == 'u1'`                             |
| AM-TEN-2 | U·P0     | `buildRecallFilter({ subdomain:'acme', scope:'thread', threadId:'t1' })`     | filter contains `subdomain == 'acme'` AND `threadId == 't1'`; no resourceId clause                  |
| AM-TEN-3 | U·P0     | `buildRecallFilter` with missing `subdomain`                                 | **throws** (fail-closed) — never query Qdrant without a tenant filter                               |
| AM-TEN-4 | U·P0     | `toPoint(...)` payload                                                       | includes `subdomain`, `resourceId`, `threadId`, `agentId`, `role`, `messageId`, `createdAt`, `text` |
| AM-TEN-5 | I·P0     | Upsert msgs for subdomain `A` and `B` (same resourceId string), query as `A` | only `A`'s points returned; zero `B` leakage                                                        |
| AM-TEN-6 | I·P0     | Query as a subdomain with no data                                            | empty result, no error, no fallback to other tenants                                                |

---

## 5. Semantic recall — spec §2, §3, §5, §6

| ID       | Type/Pri | Case                                                                                                                                                 | Expected                                                                                    |
| -------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| AM-REC-1 | U·P0     | `formatRecallBlock([])`                                                                                                                              | `null` (nothing injected when no hits)                                                      |
| AM-REC-2 | U·P0     | `formatRecallBlock([{text:'deadline is March 3',score:0.8}])`                                                                                        | a non-empty context string containing the snippet text                                      |
| AM-REC-3 | U·P0     | `formatRecallBlock` output scanned for tool frames                                                                                                   | contains **no** `tool_calls`, `function`, `<tool_call>` or JSON-call patterns (Kimi safety) |
| AM-REC-4 | U·P1     | `filterHitsByScore(hits, 0.5)` with scores [0.9,0.4,0.6]                                                                                             | keeps 0.9 & 0.6, drops 0.4                                                                  |
| AM-REC-5 | U·P1     | `resolveRecallTuning({ ERXES_AGENT_MEMORY_TOPK:'7', ERXES_AGENT_MEMORY_MIN_SCORE:'0.3' })`                                                           | `{ topK:7, minScore:0.3, scope:'resource' }`; garbage values → defaults                     |
| AM-REC-6 | I·P0     | Index 3 messages, recall with a query semantically close to msg #2                                                                                   | msg #2 ranked first; topK respected                                                         |
| AM-REC-7 | E2E·P0   | **Cross-session recall.** Session 1 (thread t1, user u1): "My project deadline is March 3." New session (thread t2, same u1): "When is my deadline?" | reply references **March 3** (retrieved from t1 via resource scope)                         |
| AM-REC-8 | E2E·P1   | Same as AM-REC-7 but `ERXES_AGENT_MEMORY_SCOPE=thread`                                                                                               | t2 does **not** recall t1's deadline (thread isolation)                                     |
| AM-REC-9 | I·P0     | After a chat turn, both user & assistant messages are embedded+upserted                                                                              | 2 new Qdrant points with correct payload                                                    |

---

## 6. Working memory — spec §2, §5

| ID       | Type/Pri | Case                                                                                                            | Expected                                                                        |
| -------- | -------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| AM-WM-1  | U·P0     | `buildWorkingMemoryBlock('')` / `null`                                                                          | `null` (nothing injected)                                                       |
| AM-WM-2  | U·P0     | `buildWorkingMemoryBlock('# Profile\n- Name: Sam')`                                                             | labeled context block containing "Sam"; no tool frames                          |
| AM-WM-3  | U·P0     | `mergeWorkingMemory(existing, update)` markdown mode                                                            | replace semantics: result == update                                             |
| AM-WM-4  | U·P1     | `mergeWorkingMemory(existingObj, {name:'Sam'})` schema mode                                                     | deep-merge: other fields preserved, `name` set                                  |
| AM-WM-5  | U·P1     | schema merge with `{timezone:null}`                                                                             | `timezone` field deleted                                                        |
| AM-WM-6  | U·P0     | `buildRefreshPrompt(existing, exchange)`                                                                        | a stateless messages array (system+user only); contains **no** tool-call frames |
| AM-WM-7  | I·P0     | `WorkingMemory` model upsert keyed by `(resourceId, agentId)`                                                   | one doc per pair; second write updates, not duplicates                          |
| AM-WM-8  | E2E·P0   | **Cross-session profile.** Session 1: "Call me Sam, I'm in Berlin." New session, same user: "Where am I based?" | reply uses **Berlin** (and/or addresses user as Sam) from the persisted profile |
| AM-WM-9  | I·P1     | Refresh runs **non-blocking**: reply returns before refresh completes                                           | `mastraAgentChat` latency not gated on the refresh call                         |
| AM-WM-10 | E2E·P1   | Working memory is per-resource, not global                                                                      | user u2 does not see u1's profile                                               |

---

## 7. Convo assembly & Kimi safety — spec §3 (**regression-critical**)

| ID        | Type/Pri | Case                                                                                                                    | Expected                                                                                               |
| --------- | -------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| AM-CONV-1 | U·P0     | `augmentConvo({recentHistory, userMessage, recallBlock, workingMemoryBlock})`                                           | order = `[workingMemoryBlock?, recallBlock?, ...recentHistory, userMessage]`; user message is **last** |
| AM-CONV-2 | U·P0     | Injected blocks' roles                                                                                                  | only `system`/`user`; **never** `assistant` with `tool_calls` or role `tool`                           |
| AM-CONV-3 | U·P0     | `augmentConvo` with both blocks null                                                                                    | identical array to today's `[...recentHistory, userMessage]` (default-mode parity)                     |
| AM-CONV-4 | E2E·P0   | **Kimi tool turn + advanced on.** With Kimi For Coding model, advanced memory on, run a turn that invokes an erxes tool | no HTTP 400 `reasoning_content is missing`; tool executes; reply returned                              |
| AM-CONV-5 | U·P1     | `deriveResourceId({user:{_id:'u1'}, agentId:'a'})` / `({user:null, agentId:'a'})`                                       | `'u1'` / `'agent:a'`                                                                                   |
| AM-CONV-6 | U·P1     | `deriveBotResourceId({customerId:'c1', conversationId:'cv'})` / `({conversationId:'cv'})`                               | `'c1'` / `'bot:cv'`                                                                                    |

---

## 8. Graceful degradation — spec §1, §9, §13 (**resilience-critical**)

| ID       | Type/Pri | Case                                                 | Expected                                                                             |
| -------- | -------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------ |
| AM-DEG-1 | I·P0     | Boot with flag on but Qdrant **down**                | plugin boots; loud warning logged; no crash                                          |
| AM-DEG-2 | E2E·P0   | Flag on, Qdrant down, run a chat turn                | reply still returned via recent-history fallback; error caught, not surfaced to user |
| AM-DEG-3 | E2E·P0   | Qdrant recovers mid-run; next turn                   | recall resumes; new turns index again                                                |
| AM-DEG-4 | E2E·P1   | Embedder failure (bad key / model load fail)         | turn still answers; recall skipped that turn; logged                                 |
| AM-DEG-5 | I·P1     | `ensureCollection` race / already-exists during boot | no crash; treated as success                                                         |

---

## 9. Settings (read-only status) — spec §8

| ID       | Type/Pri | Case                                                                           | Expected                                                                                      |
| -------- | -------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| AM-SET-1 | U·P0     | `computeAdvancedMemoryStatus({}, ...)`                                         | `{ enabled:false, ... }`                                                                      |
| AM-SET-2 | U·P0     | `computeAdvancedMemoryStatus({ERXES_AGENT_MEMORY:'enable'}, {reachable:true})` | `{ enabled:true, embedder:'fastembed', qdrantReachable:true, collection:'mastra_memory_…' }`  |
| AM-SET-3 | I·P1     | GraphQL `mastraSettings { advancedMemory advancedMemoryStatus{...} }`          | resolves the computed fields; `advancedMemory` is **not** in the input type (read-only)       |
| AM-SET-4 | M·P0     | Settings → General with flag off                                               | shows "Advanced memory feature = **Off**"; control is **disabled/locked**; no toggle works    |
| AM-SET-5 | M·P0     | Settings → General with flag on + Qdrant up                                    | shows "**On**", embedder label, **green** Qdrant dot, collection name; control still disabled |
| AM-SET-6 | M·P1     | Flag on + Qdrant down                                                          | shows "On" but **red** dot / "unreachable"                                                    |

---

## 10. Docker (in-plugin) — spec §7

| ID        | Type/Pri | Case                                                                          | Expected                                                                 |
| --------- | -------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| AM-DOCK-1 | M·P0     | `docker compose -f backend/plugins/erxes-agent_api/docker-compose.yml config` | valid; service `qdrant`, pinned image tag, ports 6333/6334, named volume |
| AM-DOCK-2 | M·P0     | `… up -d` then `GET http://localhost:6333/healthz`                            | Qdrant healthy                                                           |
| AM-DOCK-3 | M·P1     | Restart container                                                             | data persists via the named volume (re-query returns prior points)       |

---

## 11. Dependencies / lockfile — spec §11

| ID       | Type/Pri | Case                                        | Expected                                                                                                        |
| -------- | -------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| AM-DEP-1 | M·P0     | `git diff pnpm-lock.yaml` after adding deps | only additions for `@mastra/qdrant`, `@mastra/fastembed` + their transitive closure; **no whole-file reformat** |
| AM-DEP-2 | U·P0     | `pnpm nx build erxes-agent_api` (typecheck) | clean, exit 0                                                                                                   |

---

## 12. Traceability (requirement → cases)

| Spec clause                   | Covered by                                        |
| ----------------------------- | ------------------------------------------------- |
| §1 opt-in / graceful          | AM-GATE-_, AM-DEG-_                               |
| §2 sub-features               | AM-REC-_, AM-WM-_                                 |
| §3 augmentation / Kimi safety | AM-CONV-\*, AM-REC-3, AM-WM-6                     |
| §4 multi-tenancy              | AM-TEN-\* (all P0)                                |
| §5 identity                   | AM-CONV-5/6                                       |
| §6 config/env                 | AM-EMB-_, AM-COL-_, AM-REC-5                      |
| §7 Docker                     | AM-DOCK-\*                                        |
| §8 read-only Settings         | AM-SET-\*                                         |
| §9 boot health                | AM-GATE-1, AM-DEG-1/5                             |
| §13 risks                     | AM-TEN-_, AM-CONV-4, AM-DEG-_, AM-COL-2, AM-DEP-1 |

---

## 13. Definition of Done (the gate)

Implementation is **100% done** when:

1. ✅ `pnpm nx test erxes-agent_api` is green and `pnpm nx build erxes-agent_api` typechecks clean.
2. ✅ **All P0 cases pass** — especially the four safety pillars:
   - **Tenant isolation** (AM-TEN-1..6)
   - **Kimi safety** (AM-CONV-2, AM-CONV-4, AM-REC-3, AM-WM-6)
   - **Graceful degradation** (AM-DEG-1/2/3)
   - **Default-mode parity** (AM-GATE-1/2, AM-CONV-3)
3. ✅ The two flagship E2E behaviors demonstrably work: **cross-session recall** (AM-REC-7) and
   **cross-session working-memory profile** (AM-WM-8).
4. ✅ Manual acceptance checklist signed: AM-SET-4/5/6, AM-DOCK-1/2, AM-DEP-1.
5. ✅ With `ERXES_AGENT_MEMORY` unset, behavior is byte-identical to pre-feature (regression suite green).

### Per-phase exit criteria

- **Phase 0 done:** T-HARNESS-1, AM-FLAG-1..4, AM-SET-1/2/4, AM-DEP-2.
- **Phase 1 done:** AM-EMB-_, AM-COL-_, AM-VEC-_, AM-DOCK-_, AM-GATE-1, AM-DEG-1/5, AM-SET-5/6.
- **Phase 2 done:** AM-TEN-_, AM-REC-_, AM-CONV-\*, AM-DEG-2/3/4.
- **Phase 3 done:** AM-WM-\*.
- **Phase 4 done:** AM-CONV-6 (bot), full DoD re-run green.
