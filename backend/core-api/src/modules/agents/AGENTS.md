# Agents module — AI chat agent (core)

The `agents` module is the AI assistant backend living **inside core-api** (not a
plugin; ported from the former private `erxes-agent` service). It provides:

- per-user **BYOK** multi-provider connections (`openai`, `grok`, `kimi`,
  `kimi-code`; `cloudflare-ai-gateway` resolves but is not offered on the BYOK
  surface) stored on `agents_user_connections` — one doc per user per tenant,
  one entry per provider, `hasKey`-only reads; `config.apiKey` is sealed at
  rest (`secretBox.ts`, AES-256-GCM, `enc:v1:` envelope keyed from
  `JWT_TOKEN_SECRET`) — readers use `openSecret`, writers seal on upsert,
  `getConnections` lazily re-seals legacy plaintext;
- a Mastra **DurableAgent** chat over SSE with durable suspend/resume
  (destructive-tool approval, `ask_user` questions), per-turn provider/model/
  `thinkingLevel` selection, and generated thread titles;
- a two-tier **tool bridge** (`searchTools` + `callTool`) that routes through
  every service's admit-only `/agent-tools/manifest` + `/agent-tools/call`
  (HMAC `x-erxes-agent-auth`, per-user permission enforced by the owning
  service). Tool ids are `${plugin}.trpc.${path}`;
- **code mode**: optional tenant flag adds `execute_typescript` (Mastra
  `createCodeMode` + QuickJS WASM sandbox, 15s cap, allow-list
  `{ searchTools, callTool: safeCallTool }` — never `askUser`; `safeCallTool`
  refuses approval-gated ids with `APPROVAL_REQUIRED`);
- **references**: `callTool` success returns `{ status:'ok', result,
  references? }` — `references.ts` maps known tool ids to
  `[[type:id:label]]` tokens the model may copy verbatim into replies (types:
  customer, company, user, product, branch, department, unit, brand, deal,
  conversation). Additive only — code-mode programs reading `.result` are
  unaffected;
- **pageContext**: `POST /agents/chat` accepts `pageContext: { path, record? }
  ` — strictly validated (path starts `/`, ≤200 chars, no control chars;
  record.type from the reference-type set; record.id matches
  `^[A-Za-z0-9_-]{1,64}$`; invalid parts silently dropped) and prepended to
  the newest user message as a `[Page context] ...` text part, which Mastra
  memory persists with the message (the UI strips the bracketed prefix on
  render — it is the agent's only page knowledge);
- tenant-wide `AgentsSettings` on `agents_settings` (`codeModeEnabled`,
  `codeModeEnvironment: 'in-process'`, `approvalMode: 'writes' |
  'destructive'` — default `'writes'`, stamped per run into RequestContext;
  `'writes'` makes every mutation tool call (and code-mode `safeCallTool`)
  suspend for approval; `'destructive'` gates by `HIGH_RISK_ACTION`
  (remove/delete/merge/destroy/archive/purge/send/reply/broadcast/publish)
  on the last path segment — the manifest marks every mutation
  `destructive`, so `descriptor.destructive` is intentionally unused there).

## Surfaces

- HTTP (mounted in `src/routes.ts` via `src/modules/agents/routes.ts`):
  `POST /agents/chat` (SSE; optional `runId` UUID, `provider`, `model`,
  `thinkingLevel`, `pageContext`; `X-Agents-Thread-Id` response header),
  `POST /agents/approve` `{ threadId, approved, reason? }`,
  `POST /agents/answer` `{ threadId, answer }`,
  `POST /agents/chat/reconnect` `{ threadId, runId }` (SSE replay or 204).
  All require the gateway `user` header; chat also checks `agentsChat` when
  attachments are sent. Identity is stamped from the header into Mastra
  RequestContext — never from the body or the model.
- GraphQL (wired into `src/apollo/schema/schema.ts` + resolvers):
  `agentsConnections`, `agentsModels` (server-side provider /models fetch),
  `agentsConnectionUpsert`/`agentsConnectionRemove` (BYOK; key never read
  back), `agentsThreads(page, perPage, pinned)` (`pinned: true` →
  `filter.metadata.pinned`), `agentsThreadDetail(threadId)`,
  `agentsThreadUpdate(threadId, title?, pinned?)` (rename ≤120 chars /
  pin; ownership-scoped, merges `metadata.pinned`, publishes
  `agentsThreadsChanged`), `agentsThreadRemove` (same errors, same
  publish), `agentsTools` (capabilities catalog: sorted by plugin then
  path, `requiresApproval` shared with the approval predicate,
  `allowed` per `ctx.checkPermission(action)`, failures → plugin names
  only, never `inputSchema`), `agentsSettings`, `agentsSettingsUpdate`.
- Subscription `agentsThreadsChanged { userId }` in
  `src/apollo/subscription.ts` — **plain JavaScript only** (the gateway
  parses the file as .js; no TS syntax).
- Permissions (`src/meta/permissions.ts`): module `agents`, scope `all`,
  actions `showAgents` (always), `agentsChat`, `manageAgentsSettings`;
  defaults — `core:admin` all three, `core:user` showAgents+agentsChat,
  `core:viewer` showAgents.

## Key files

- `agent.ts` — instructions (incl. the References contract + `[Page context]`
  sentence), `AGENTS_MAX_STEPS` (32), thinking-level → per-provider options,
  BYOK model resolution with construction-safe fallback, `buildBaseAgentsAgent`.
- `memory.ts` — per-subdomain runtime `{ memory, mastra, agent }` cache;
  `MongoDBStore` (`core-agents-store`) on the dedicated `{db}_agents_memory`
  sub-database via the shared mongoose `connectorHandler`; installs the
  MongoDB 4.4 workflow-snapshot codec; `Mastra({ logger:false, workers:false,
  pubsub })`.
- `pubsub.ts` — process-wide `RedisStreamsPubSub` (key prefix `core-agents`,
  `REDIS_HOST`/`REDIS_PORT`/`REDIS_PASSWORD`) for cross-replica `observe`
  replay.
- `tools.ts` — `searchTools`/`callTool`, manifest cache (60s), exported
  `requiresApproval` predicate (shared by `callTool`'s approval gate and
  the `agentsTools` catalog), `ALWAYS_CONFIRM_TOOLS` (`frontline.trpc.inbox.conversations
  .changeStatus` — declared as a query so it escapes the manifest's
  mutation→destructive flag; keep entries as full `${plugin}.trpc.${path}`
  ids).
- `references.ts` — token grammar, toolId→type table, label pickers, result
  walking, sanitization (max 25 tokens, label ≤80 chars).
- `requestContext.ts` — JSON-safe per-run snapshot
  (subdomain/userId/provider/model/thinkingLevel/codeModeEnabled/
  approvalMode/threadId/attachmentUrls); never secrets.
- `agentTools.ts` — `/agent-tools/manifest` + `/agent-tools/call` HTTP client.
- `codeMode.ts`, `askUser.ts`, `readFile.ts`, `fileBinding.ts`,
  `fileTimeout.ts`, `fileValidation.ts`, `toolContracts.ts`,
  `toolSchemaCompatibility.ts`, `mongo44Compatibility.ts`,
  `providerModels.ts`, `providers.ts`, `threadsEvents.ts`.
- `db/` — `AgentsConnection` + `AgentsSettings` models (registered in
  `src/connectionResolvers.ts`); `graphql/` — schemas + thin resolvers.

## Invariants (carry over)

- Never introduce env-var secrets; BYOK keys live only on the per-user
  document — sealed `enc:v1:` envelopes only, never plaintext — and never
  appear in responses, errors, or logs. `sealSecret` throws when
  `JWT_TOKEN_SECRET` is unset (fail closed).
- Threads/messages/approvals live in `{db}_agents_memory` only — never the
  base DB's legacy `mastra_*` collections.
- Tool identity is never model-controlled; `/agent-tools/call` is the
  permission gate. Never add a GraphQL/raw-Mongo fallback tool.
- ESM-only packages (`ai`, `@mastra/*`, `@ai-sdk/anthropic`) load via
  `await import(...)` at point of use; type-only imports carry
  `with { 'resolution-mode': 'import' }`. core-api compiles
  `module/moduleResolution: nodenext` — do not narrow it (plain `commonjs`
  would downlevel `import()` to `require()` and break the ESM packages).
- MongoDB 4.4 compat: `installMongo44WorkflowCompatibility` wraps the
  workflows store until encoded suspended runs have drained; every touch
  point carries a `// MongoDB 4.4.25 compatible` marker.
- `agentsThreadsChanged` publishes stay transient per-user `{ userId }`
  events from Mastra `onFinish`/`onTitleGenerated` hooks,
  `agentsThreadUpdate`, and `agentsThreadRemove` — no other publish
  points.
- The resume routes share `findSuspendedToolCall` (kind-aware: approval vs
  ask_user, newest suspended run, ownership re-checked, wrong-kind → 409).
- Every run entry point passes `maxSteps: 32`; resumes restore the original
  run's RequestContext snapshot (selection fields in the body are accepted
  but ignored).

## Validation

- `pnpm nx build core-api` (tsc + tsc-alias, nodenext)
- `pnpm nx test core-api` — jest with
  `NODE_OPTIONS=--experimental-vm-modules` (QuickJS WASM loader);
  `ts-blank-space` is mapped to a callable CJS stub in `jest.config.ts`.
- `pnpm nx lint core-api` — repo has pre-existing lint errors outside this
  module; keep this module's files clean.
- Smoke: `POST /agents/chat` without a `user` header returns 401.
