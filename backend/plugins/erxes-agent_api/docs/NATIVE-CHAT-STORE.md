# Native Chat Store — design spec

Status: **DONE — native-only, no flag.** The custom `mastra_threads`/
`mastra_messages` mongoose store is deleted; the chat store IS Mastra's native
memory store (`erxes_mastra_memory`). Reads, writes, titling, feedback, the
learning sweep, schedules and the bot bridge all run against native. The
`ERXES_AGENT_NATIVE_CHAT_STORE` flag is removed (native is unconditional).
**Consequence:** chat persistence now requires `ERXES_AGENT_MEMORY=enable` (the
native store IS the memory store — no custom fallback). Legacy custom-store
conversations are not read (they age out); native threads created before the
agentId/subdomain metadata existed won't appear in the agent-scoped list.

**Principle (drives every decision below):** use Mastra's built-in capabilities
for everything Mastra owns; write custom code **only** where Mastra genuinely
cannot serve an erxes need. Replace the bespoke `mastra_threads` /
`mastra_messages` store + hand-rolled persistence/read/titling with Mastra's
native memory store, behind a flag, via a **cutover** (no backfill).

**Architecture decision: Level 2** — Mastra is the *engine* (storage, retrieval,
titling, recall, streaming); erxes keeps a *thin* SSE/GraphQL **shell** only for
auth, multi-tenancy, and the existing UI contract. (Level 3 — frontend on
`@mastra/client-js` + Mastra's HTTP server — was considered and declined: it
buys "Mastra owns the HTTP layer" at the cost of a frontend rewrite + auth
bridge, for the same irreducible custom core.)

---

## 1. Mastra built-in vs custom (the capability map)

| Concern | Mastra built-in? | Decision |
|---|---|---|
| Thread/message storage | ✅ native memory store (`mastra_threads`/`messages`/`resources` in `erxes_mastra_memory`) | **use native** — drop custom mongoose store |
| Persist a turn | ✅ auto-persists on `agent.generate(msg, { memory })` | **use native** — drop `persistTurn`'s write |
| List threads / get messages | ✅ `listThreads({ filter:{ resourceId, metadata } })`, `listMessages`, `getThreadById` | **use native** — drop custom read layer |
| Thread title generation | ✅ `Memory({ options:{ threads:{ generateTitle } } })` | **use native** — drop `titler.ts`'s LLM call (thin precedence guard remains, §6) |
| Recent-history replay | ✅ `lastMessages` | **use native** — already (#8058) |
| Semantic recall / working memory | ✅ native + Qdrant | **use native** — already (#8058) |
| Streaming engine | ✅ `agent.stream()` | **use native** — erxes shell just relays chunks |
| Tool-call / reasoning capture | ✅ native `content.parts` | **use native**, translate to the UI shape |
| **Auth + tool execution via the erxes gateway** | ❌ Mastra can't (tools are erxes meta-tools, run with the user's token) | **custom** (the agent + tools, unchanged) |
| **Multi-tenant subdomain scoping** | ❌ not a Mastra concept | **custom** (thin: `scopedResource`) |
| **Learning / distillation** | ❌ erxes-specific | **custom** (re-pointed to read the native store) |
| **UI GraphQL/SSE contract** + erxes-only fields (`interrupted`, `learningIdsInContext`, attachment shape) | ❌ Mastra's shapes differ | **custom** (thin translation + a `content.metadata` patch) |

Everything in the "custom" rows is a genuine "Mastra cannot do this for erxes"
case. Everything else becomes Mastra-native.

---

## 2. Current state

- **Dual-write today.** `runAgentTurn` calls `agent.generate(message, { memory: { thread, resource } })` (`turn.ts:485-502`) → Mastra already auto-persists every turn to `erxes_mastra_memory`. `persistTurn` *also* writes the custom store. The conversation is stored twice.
- **The UI reads only the custom store** (`mastraThreads`/`mastraThreadMessages` + SSE). Rich per-message data (`meta.thinking`, ordered `meta.parts`, `meta.toolCalls`, `meta.interrupted`, `meta.learningIdsInContext`, `attachments`) and thread metadata (`agentId`, `title`/`titleSource`, `distilledMessageCount`, ownership) live **only** in the custom store.
- 1:1 already holds: erxes session id **is** the Mastra thread id; resource id is `scopedResource(subdomain, userId)`.

---

## 3. Target architecture (Level 2)

```
SSE /chat/stream            ┌─────────────────────────────────────────┐
mastraAgentChat (fallback) ─▶│ erxes shell: auth · tenancy · UI contract │
                            └───────────────┬───────────────────────────┘
                                            │ delegates to
                                            ▼
                         agent.generate/stream(msg, { memory:{thread,resource} })
                                            │  (Mastra owns the engine)
                                            ▼
                  Mastra Memory ── persist · recall · workingMemory · generateTitle
                    └─ MongoDBStore(erxes_mastra_memory) + QdrantVector
                                            │
UI (unchanged) ◀─ GraphQL/SSE translate native ⇄ MastraThread/MastraMessage ◀─┘
```

- The transports (SSE + the `mastraAgentChat` blocking fallback) are kept (Level
  2) — they delegate to the agent + Mastra memory, and **translate** native
  records into the existing GraphQL/SSE shapes so the frontend is untouched.
- erxes adds only: auth/tenancy, the tool-exec gateway (the agent's tools), the
  learning system, and a small `content.metadata` patch for erxes-only fields.

---

## 4. Schema mapping

### 4.1 Thread  (`MastraThread` ⇄ native `StorageThreadType`)
| UI/erxes field | Native location |
|---|---|
| `threadId` | `thread.id` (same session id, already 1:1) |
| ownership (`userId` / `bot:<id>`) | `thread.resourceId = scopedResource(subdomain, userId)` |
| `agentId` | `thread.metadata.agentId` (list query filters on it) |
| `title` | `thread.title` (set by native `generateTitle`) |
| `titleSource` / `titleMessageCount` | `thread.metadata.*` (precedence guard, §6) |
| `messageCount` | **derive on read** (count native messages) |
| `lastMessageAt` | `thread.updatedAt` |
| `distilledMessageCount` | `thread.metadata.distilledMessageCount` |

Thread list: `listThreads({ filter:{ resourceId: scopedResource(subdomain, userId), metadata:{ agentId } } })` → translate to `[MastraThread]`.

### 4.2 Message  (`MastraMessage` ⇄ native `MastraDBMessage`)
| UI/erxes field | Native location |
|---|---|
| `_id` (feedback key) | `message.id` (native id — see §10) |
| `role` / `createdAt` | same |
| `content` (string) | `message.content.content` |
| `meta.thinking` / `meta.toolCalls` / `meta.parts` | `content.metadata.erxes.*` — erxes ordered shape kept verbatim for faithful replay (native `content.parts` is the lossy fallback) |
| `meta.interrupted` / `meta.learningIdsInContext` | `content.metadata.erxes.*` (erxes-only) |
| `attachments` | `content.metadata.erxes.attachments` (erxes `{url,name,type,size}`) |

**Namespacing (as built):** erxes-only fields live under a single
`content.metadata.erxes` blob, **not** as flat `content.metadata.*` keys, so they
never collide with Mastra's own `content.metadata` keys. erxes owns both the
write and the (Phase 3) read of that blob.

**Write path:** Mastra auto-persists the turn during `generate()`/`stream()`; the
shell then reads the turn's two tail messages back (`memory.recall` with no
search string → a plain recency list, newest-first), **merges** the erxes blob
into the assistant message (parts, thinking, toolCalls, interrupted,
learningIdsInContext) and the user message (attachments) via `memory.updateMessages`,
and stamps `thread.metadata.agentId` via `memory.updateThread` (which requires a
title, so the current one is preserved). This is `patchNativeTurn` in `turn.ts` —
all that remains of `persistTurn`'s write once the custom store is dropped.

---

## 5. Titles

Use native `Memory({ options: { generateTitle: { instructions } } })`. **API
note (as built against @mastra/core 1.42):** the old `options.threads.generateTitle`
is deprecated and *throws* — title config moved to **top-level `options.generateTitle`**.
`model` is intentionally **omitted**: the runtime title path (`genTitle → getLLM`)
falls back to the calling **agent's own model** when none is given, so the shared
Memory needs no per-tenant model resolution; we pass only erxes's multilingual
`TITLER_INSTRUCTIONS`. (The published type marks `model` required; the existing
`as never` cast on the Memory config covers the omission.)

**Behavioural nuances:**
- **One-shot.** Native generateTitle fires only while `!thread.title` (verified
  in the compiled runtime) — it titles once and never refreshes, unlike the
  custom titler's `REFRESH_EVERY=6`. Acceptable for chat; periodic refresh can
  be revisited if needed.
- **Manual precedence.** Mastra doesn't know erxes's manual/derived/generated
  precedence, but its one-shot rule gives it to us almost for free: once the read
  path moves to native (Phase 3), a rename writes `thread.title` +
  `metadata.titleSource='manual'`, and because a title now exists, native
  generateTitle won't overwrite it. The thin guard is just "rename sets the
  title + titleSource".

In Phase 2 the custom `titler.ts` still runs (dual-write); native generateTitle
populates the native thread title in parallel (one extra LLM call on the first
turn, removed in cleanup when `titler.ts`'s LLM path is dropped).

---

## 6. Cutover (no backfill)

When `ERXES_AGENT_NATIVE_CHAT_STORE=enable`:
- **Writes** go to the native store only (custom dual-write dropped).
- **Reads** serve the native store, **native-only** — legacy custom-store threads
  (created before the flag) stay in Mongo but **age out of the UI** (no union, no
  migration). Per the cutover decision.
- The custom collections are dropped in a later cleanup phase.

---

## 7. Feature flag + rollback

- **`ERXES_AGENT_NATIVE_CHAT_STORE=enable`** (exact `enable`, matching
  `ERXES_AGENT_MEMORY/KNOWLEDGE/LEARNING`). Off → today's behavior exactly.
- Requires `ERXES_AGENT_MEMORY=enable` (the native store *is* the memory store).
- Rollback = flip off. No destructive step until the final cleanup phase.

---

## 8. Component changes

| Component | Change |
|---|---|
| `turn.ts` `persistTurn` | shrinks to a `content.metadata` + `thread.metadata` patch over the natively-persisted turn (flag-gated; else today's path) |
| `routes.ts` SSE + bot bridge | stream protocol unchanged; `done.messageId` = native id; persistence via native + metadata patch; bot threads keyed by `scopedResource(subdomain,'bot:'+customerId)` |
| `mastraAgentChat` (kept) | thin `agent.generate` wrapper; shares the same native persist + translate |
| `session/graphql` reads + rename/remove | read/translate from native store; rename → `updateThread`; remove → native `deleteThread` |
| `mastra/memory/mastraMemory.ts` | add `options.threads.generateTitle` |
| `titler.ts` | LLM-call path removed; only the manual-precedence guard remains (§5) |
| `learning/worker.ts` | idle/undistilled query + cursor against native threads (`metadata.distilledMessageCount`); messages via native list |
| feedback (`mastraMessageFeedback`) | keys off the native message id; ownership via `resourceId` |
| `schedules/runner.ts` | schedule output threads via the native store |
| `session/db/*` custom models | removed in the final cleanup phase |

---

## 9. Risks & mitigations

- **Feedback id change** — native id ≠ custom `_id`. Return native ids in
  `mastraThreadMessages._id` + SSE `done.messageId`; old feedback rows go stale
  (cutover, acceptable).
- **Rich-meta fidelity** — store erxes shapes verbatim in `content.metadata`;
  don't rely on lossy native-part inference for the UI.
- **Ownership / agent filtering** — `thread.metadata.agentId` + `filter`;
  ownership via `resourceId`; `bot:` isolation via `scopedResource`.
- **Title precedence** — thin manual guard (§5).
- **Two stores during transition** — flag + native-only reads; cleanup later.

---

## 10. Phased rollout

1. **Spec** (this doc) — review. ✅
2. **Native title + write patch** (flag-gated) — ✅ **done.** Enabled
   `generateTitle` on the shared Memory; `patchNativeTurn` (in `turn.ts`) mirrors
   the erxes turn blob + `thread.metadata.agentId` onto the native records after
   each turn; custom dual-write retained. Flag: `ERXES_AGENT_NATIVE_CHAT_STORE`.
   `persistTurn` still returns the **custom** `assistantMessageId` (feedback reads
   the custom store until Phase 4), so nothing user-facing changes this phase.
   Files: `memory/config.ts` (+flag & tests), `memory/mastraMemory.ts`
   (+generateTitle), `agent/turn.ts` (+`patchNativeTurn`).
3. **Read path** — ✅ **done.** `session/nativeStore.ts` translates native
   threads/messages → the `MastraThread`/`MastraMessage` GraphQL shapes;
   resolvers (list/transcript/rename/remove) + SSE + feedback serve native;
   ownership is by resourceId scope.
4. **Repoint** — ✅ **done.** Learning sweep (`worker.ts`), feedback
   (`learning` mutation + `mastraMessageFeedbacks` query), bot bridge
   (`routes.ts`), schedules (`runner.ts`) all run against native. `turn.ts`
   stamps `thread.metadata.{agentId,subdomain}` so the sweep can enumerate a
   tenant's threads (resourceId is per-user).
5. **Cutover / cleanup** — ✅ **done.** Custom writes dropped from
   `persistTurn`/`prepareChatTurn` (native ownership replaces the custom gate);
   `titler.ts` LLM path removed (native `generateTitle`); custom models +
   definitions deleted + unregistered from `connectionResolvers`; the
   `ERXES_AGENT_NATIVE_CHAT_STORE` flag removed (native is unconditional).

Each of 2–4 ships behind the off-by-default flag.

---

## 11. Resolved decisions / non-goals

- **Level 2** (Mastra engine + thin erxes shell) — not Level 3.
- **Cutover, no backfill**; legacy history **ages out** (no union).
- **Keep `mastraAgentChat`** (frontend untouched).
- **`messageCount` derive-on-read.**
- **Non-goals:** frontend changes; migrating historical conversations.
