# Agents module — AI chat agent (core)

The `agents` module is the AI assistant backend living **inside core-api** (not a
plugin; ported from the former private `erxes-agent` service). It provides:

- per-user **BYOK** multi-provider connections (`openai`, `grok`, `kimi`,
  `kimi-code`; `cloudflare-ai-gateway` resolves but is not offered on the BYOK
  surface) stored on `agents_user_connections` — one doc per user per tenant,
  one entry per provider, `hasKey`-only reads; an optional top-level
  `defaultProvider` names the entry an unselected turn runs on
  (`findDefaultConnection`: that entry while still saved, else the first; no
  migration); `config.apiKey` is sealed at rest (`secretBox.ts`, AES-256-GCM, `enc:v1:` envelope keyed from
  `JWT_TOKEN_SECRET`) — readers use `openSecret`, writers seal on upsert,
  `getConnections` lazily re-seals legacy plaintext;
- a Mastra **DurableAgent** chat over SSE with durable suspend/resume
  (destructive-tool approval, `ask_user` questions), per-turn provider/model/
  `thinkingLevel` selection, and generated thread titles;
- assistant text is semantic HTML reply content, without fences or file
  controls. Actual reports/documents use the `createArtifact` tool's structured
  result. Semantic HTML, responsive CSS and inline SVG render inline;
  scripts/external resources are unavailable. Record reference tokens belong
  verbatim in HTML text nodes, never attributes, links, styles or code;
- `skills/reportCreation.ts` is the built-in report skill, composed into every
  run's instructions by `buildAgentsInstructions`. Reports are dashboard-first
  static HTML: one-line scope, KPI row, inline SVG or CSS bar charts, tables,
  then two to four bullet takeaways; one-sentence captions. The agent computes
  every number from verified tool data (code mode when available). What-if
  questions get computed scenarios (e.g. baseline, −20%, +20%, the user's case)
  in a comparison table plus bars, assumptions stated once in the caption; new
  scenarios are asked for in chat. No scripts, controls or client-side
  formulas. The class vocabulary (`scope`, `kpis`/`kpi`, `bars`/`bar`/
  `baseline`, `legend`, `up`/`down`, `highlight`, SVG `mark`/`line`/`axis`/
  `gridline`) must match core-ui's `artifacts/htmlSandbox.ts` stylesheet.
  Reports have transparent backgrounds (no filled report, card, section, chart
  canvas or table surfaces), references beside data points, plain language
  with parenthetical explanations of technical terms, and no unsolicited
  next-step offers. Ordinary replies keep their existing presentation.
- GraphQL discovery (`searchGraphql`) and execution (`callGraphql`) through
  the gateway as the acting user, using a fresh HMAC-signed identity header.
  `graphqlPolicy.ts` denies authentication, credential and system-security
  operations. Its AST checks include nested canonical field/argument names,
  fragments, literal/default input objects and supplied variable object keys;
  aliases cannot rename a restricted field. Direct and code-mode calls share
  this policy before approval and execution. JSON-valued results are checked
  through the executed selection/alias/fragment paths before any tool result or
  reference manifest is emitted; credential-bearing JSON returns only a policy
  error. Standard `__type`/`__schema` introspection is allowed and follows
  gateway configuration. Other queries/mutations use existing resolver permissions;
- optional code mode exposes only `searchGraphql` and `callGraphql` in a
  QuickJS sandbox; approval-gated mutations must run interactively in chat.
  Its native output schema is Zod v4: extensions must import `zod/v4` too.
  Mixing v3 fields into that object breaks model-facing conversion and makes
  durable preparation discard the complete tool set. Regression coverage converts
  the complete extended output schema, beyond executing sandbox programs;
- **references**: successful native `callGraphql` and `findPages` outputs issue
  opaque `[[ref:<uuid>]]` handles with a versioned `referenceManifest`. Only
  schema-verified identities from the executed operation authorize handles;
  response aliases never rename identity fields. Code mode collects manifests
  from actual host GraphQL calls with invocation-local AsyncLocalStorage, outside
  the sandbox's returned JSON. The native `execute_typescript` result persists
  that authoritative manifest separately from untrusted `result` content.
  `POST /agents/references/resolve` accepts a record type/id and reads the live
  schema's matching Detail query as the signed-in user. It returns the current
  name and validated deal board/pipeline, or an unavailable response. It never
  calls a model, accepts a model URL, or bypasses normal resolver permissions;
- **pageContext**: `POST /agents/chat` accepts `pageContext: { path, record? }
  ` — strictly validated (path starts `/`, ≤200 chars, no control chars;
  record.type from the reference-type set; record.id matches
  `^[A-Za-z0-9_-]{1,64}$`; invalid parts silently dropped) and prepended to
  the newest user message as a `[Page context] ...` text part, which Mastra
  memory persists with the message (the UI strips the bracketed prefix on
  render — it is the agent's only page knowledge);
- selected page elements use `data-agents-page-selections`: validated bounded
  context (id/title/path/frame/visible text/bounds) and a PNG snapshot reference.
  `pageSelections.ts` validates up to three selections; `fileBinding.ts` reads
  snapshot bytes through tenant storage and builds model image/text parts.
  The context data part persists separately from uploaded-file metadata. It does
  not create downloadable files. Selection text is untrusted source data, never
  instructions or authorization. Snapshot keys enter the existing attachment URL
  admission set; chat permission/ownership checks apply before reading pixels.
  Thread detail reads normalize the former PNG/TXT pair only when its stored JSON
  context and matching snapshot validate, preserving ordinary attachments;
- **mentions** (`mentions.ts`): the newest user message may carry a
  `data-agents-mentions` part `{ mentions: [{ type, id, label }] }` (≤10,
  unique, reference types only, ids `^[A-Za-z0-9_-]{1,64}$`, sanitized labels).
  Each entry must appear as its exact `[[type:id:label]]` token in the text.
  After the `agentsChat` check and before any rewind or runtime work,
  `resolveAgentsMentions` re-reads every record through
  `resolveAgentsReference` as the acting user; missing, denied or failing
  records reject the turn with 400. The model text replaces tokens with
  `@Label` and appends a delimited `[Mentions] ...` JSON list; the stored data
  part keeps canonical `{ mentions, displayText }` for restore/edit. Mentions
  never grant permission; later reads still use resolver permissions;
- tenant-wide `AgentsSettings` on `agents_settings` (`codeModeEnabled`,
  `codeModeEnvironment: 'in-process'`, `approvalMode: 'writes' |
  'destructive'` — default `'writes'`, stamped per run into RequestContext;
  `'writes'` asks before every GraphQL mutation; `'destructive'` asks before
  deletes, merges, archives, publishes and customer-facing sends/replies.


## Surfaces

- HTTP (mounted in `src/routes.ts` via `src/modules/agents/routes.ts`):
  `POST /agents/chat` (SSE; optional `runId` UUID, `provider`, `model`,
  `thinkingLevel` (clamped to the selected model's levels by
  `normalizeThinkingLevel` before it is stamped), `pageContext`, mention parts
  in the newest message; without `provider`, `pickConnection` uses
  `findDefaultConnection`; `X-Agents-Thread-Id` response header),
  `POST /agents/approve` `{ threadId, toolCallId?, approved, reason? }`,
  `POST /agents/answer` `{ threadId, answer }`,
  `POST /agents/chat/reconnect` `{ threadId, runId }` (SSE replay or 204).
  All require the gateway `user` header and `agentsChat`, including plain text,
  approval, answer and reconnect requests. Permission denial precedes credential,
  runtime and attachment access. Chat then resolves the connection and checks
  its key opens (400 with the key-free reason otherwise) before any mention
  lookup through the gateway. Identity is stamped from the header into Mastra
  RequestContext — never from the body or the model.
- Chat accepts optional `editMessageId`, matching the newest user message id
  and an owned existing thread. `messageEditing.ts` checks active
  and suspended runs, finds the exact stored user turn, removes that turn and
  its suffix via Mastra Memory, then starts the edited turn in the same thread.
  The route checks permission/ownership and validates attachments before any
  rewind. Failed stream startup restores the removed messages. Editing does
  not reverse business operations already executed by tools.
- GraphQL (wired into `src/apollo/schema/schema.ts` + resolvers):
  `agentsConnections`, `agentsModels` (server-side provider /models fetch,
  filtered by `modelCatalog.ts`; per provider `models` = usable ids in rank
  order, additive `catalog: [AgentsModelInfo { id, family, recommended, name,
  thinking: AgentsModelThinking { kind, levels } }]` (`modelThinking.ts`; null
  name/thinking = not in the snapshot), and
  a key-free `error` that says why when the stored key cannot be opened
  (missing vs changed `JWT_TOKEN_SECRET`, or no key) or the listing fails
  (OpenAI keys without Models: Read / `api.model.read`, 401, 403, 429, 5xx);
  every saved provider is returned, never silently dropped),
  `agentsModelVerify(provider: String!, model: String!): AgentsModelVerification
  { provider model ok error }` (`agentsChat`; own saved connection only;
  `modelProbe.ts` sends one minimal request through `providers.ts` +
  Mastra `resolveModelConfig` — 16 output tokens, kimi-code with the
  `MIN_ANTHROPIC_THINKING_BUDGET` (1,024) thinking budget because `k3.1-pro`
  rejects thinking off; ok only after an output, metadata or finish chunk,
  otherwise a "no response" error; id shape and `isUsableProviderModel` are
  checked first; nothing is persisted; like
  `agentsConnectionSetDefault`, denied to the agent by `graphqlPolicy.ts`),
  `agentsConnectionUpsert`/`agentsConnectionRemove` (BYOK; key never read
  back; `AgentsConnectionEntry.isDefault` is the effective default),
  `agentsConnectionSetDefault(provider: String): [AgentsConnectionEntry]`
  (`agentsChat`; own document only; the write is conditional on the provider
  being saved, unknown providers are a VALIDATION_ERROR, empty clears; a
  document still in the old single-`connection` shape is written as the
  sealed array with the default; `removeConnection` unsets a removed default),
  `agentsThreads(page, perPage, pinned)` (`pinned: true` →
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

- `createArtifact.ts` — local deliverables with bounded, validated HTML/CSV/
  Markdown content. Returns `{ kind: 'artifact', version: 1, artifact }` with
  type/title/safe filename/content; Mastra persists this as a normal tool result.
  No CRM mutation or separate artifact database. Assistant text always remains
  reply content; reports/files are delivered through this tool only.
- `agent.ts` — instructions (incl. the References contract, `[Page context]`
  and `[Mentions]` sentences; the prompt asks the model to reference every
  mentioned person and record, to select `_id` plus display fields — including
  nested authors/senders/assignees — in GraphQL queries, and to make one more
  narrow query rather than fall back to plain text; guidance only, evidence
  verification is unchanged), `AGENTS_MAX_STEPS` (32), model settings
  (thinking translation lives in `modelThinking.ts`),
  BYOK model resolution with construction-safe fallback, `buildBaseAgentsAgent`.
- `memory.ts` — per-subdomain runtime `{ memory, mastra, agent }` cache;
  `MongoDBStore` (`core-agents-store`) on the dedicated `{db}_agents_memory`
  sub-database via the shared mongoose `connectorHandler`; installs the
  MongoDB 4.4 workflow-snapshot codec; `Mastra({ logger:false, workers:false,
  pubsub })`.
- DurableAgent explicitly persists all workflow statuses. Reconnect and
  concurrent-turn guards require stored running snapshots; Mastra's default skips
  them with automatic crash recovery off. Terminal snapshots prevent completed
  runs appearing active. Browser stream cancellation detaches observation and
  never aborts backend execution. Automatic crash replay remains off.
- `runLiveness.ts` uses native workflow ownership or the native Redis thread
  lease to distinguish live producers from orphaned running snapshots. Suspended
  human-interaction gates remain live. Idle observation settles abandoned runs
  as failed through native storage (with ownership fencing when supported and an
  expected-running status guard), without replaying tools. Backend probe errors
  preserve the observer; terminal discovery no longer blocks message editing.
- `pubsub.ts` — process-wide `RedisStreamsPubSub` (key prefix `core-agents`,
  `REDIS_HOST`/`REDIS_PORT`/`REDIS_PASSWORD`) for cross-replica `observe`
  replay.
- `graphqlTools.ts` — live schema discovery, capabilities catalog (each root
  operation retains its owning service/plugin from that service’s SDL) and bounded
  GraphQL execution; `tools.ts` — request identity and error helpers.
- `mentions.ts` — user @ mention validation, verification and model/display
  text; `fileBinding.ts` admits its data part without media.
- `references.ts` — token grammar, toolId→type table, label pickers, result
  walking, sanitization (max 25 tokens, label ≤80 chars).
- `requestContext.ts` — JSON-safe per-run snapshot
  (subdomain/userId/provider/model/thinkingLevel/codeModeEnabled/
  approvalMode/threadId/attachmentUrls); never secrets.
- `modelCatalog.ts` — data-driven per-provider usability rules (shared
  non-chat deny patterns: embeddings, tts/whisper/transcribe/audio/realtime,
  image/video, moderation, search; OpenAI also drops legacy completion/GPT-3.5/
  GPT-4 lines, chat-latest aliases, o1-mini/preview, codex, computer-use,
  deep-research; Kimi drops `kimi-thinking-preview`). Dated snapshots collapse
  behind a listed alias, otherwise to the newest snapshot. Ranking: family tier,
  version, alias before variants, `created`. Up to four `recommended`: the
  stored connection model and `PROVIDER_DEFAULTS` model when listed, then the
  leading generation line minus slow/preview variants. Model knowledge has
  one source, the bundled snapshot (`modelsDevSnapshot.ts`): a model it knows
  is usable only when it calls tools, takes text and answers in text only;
  the deny patterns decide only for ids the snapshot lacks (dated snapshots,
  newer models). Never hardcode model lists. `SNAPSHOT_CATALOG_PROVIDERS`
  (kimi-code) takes its fixed plan catalog from the snapshot, merged with
  whatever the endpoint returns; a 404 listing is then not an error. Kimi Code
  ids use the `k3.1-pro` / `k3-256k` family form.
  `providerModels.ts` fetches raw entries and turns failures into sanitized
  messages (`sanitizeProviderMessage` strips the key, `sk-`/`xai-` fragments
  and long tokens; `describeUnreadableKey`).
- `modelThinking.ts` + `data/modelsDevSnapshot.json` — display names and
  thinking options per model from a bundled models.dev snapshot (MIT, source
  URL/licence/date in the file; never fetched at runtime). Only `id`, `name`,
  `reasoning`, `reasoning_options`, `tool_call` and `modalities` of four
  providers, mapped to the endpoint we
  call: openai → `openai`, grok → `xai`, kimi → `moonshotai`, kimi-code →
  `kimi-code-plan-cn` (`api.kimi.com`). A name that only repeats the id
  (ignoring case) is null. Kinds: `effort` (models.dev `none` = Off), `toggle`
  (Off/High = on), `budget_tokens` (Off only when min is 0; Low/Medium/High =
  25/50/100% of max), `fixed` (reasoning without options) and `none`.
  Levels: `off` < `minimal` < `low` < `medium` < `high` < `xhigh` < `max`;
  clamping picks the nearest, deeper on ties; each call resolves a model's
  snapshot entry once. Translation is the only thinking path (`agent.ts`
  delegates): openai native `reasoning.effort`;
  grok/kimi OpenAI-compatible `reasoning_effort` under the provider's own
  options key (the client ignores `xai`/`openaiCompatible` keys for unknown
  fields), Kimi toggles as `thinking: { type }`; kimi-code Anthropic
  `thinking.budget_tokens` (1,024–24k, never below Anthropic's documented
  1,024 minimum; output capped at 32,768). Models not in the
  snapshot keep the original five levels and mapping (openai effort, kimi-code
  budgets, nothing for grok/kimi). Refresh:
  `node backend/core-api/src/modules/agents/data/refreshModelsDevSnapshot.mjs`
  (plain fetch + fs; fails if a mapped provider's endpoint changes).
- `readFile.ts` — the `readFile` tool for this turn's or the thread's stored
  attachments. Text/CSV/JSON/Markdown return text and images return model image
  data (≤2 MiB). Documents (PDF, DOCX, XLSX, PPTX, ODT, ODS, ODP, RTF) return
  text through `documentText.ts`, which delegates parsing to `officeparser`.
  The format comes from the bytes (`sniffAgentsDocumentType`: PDF/RTF magic, the
  stored ODF `mimetype` entry, OOXML part names), never the name or declared
  type. Spreadsheets become CSV per sheet with formatted dates and formula
  results; other documents become text with `|` table rows. Output is capped at
  128 KiB with a truncation notice. Parsing never runs on the event loop: each
  document (Office and PDF alike) is parsed in a fresh `node:worker_threads`
  worker (`documentTextWorker.ts`, which must stay free of path aliases) with a
  capped heap. pdf.js runs inside that worker (`separateProcess: false`), so
  officeparser starts no child processes. One gate limits parses per process:
  `AGENTS_DOCUMENT_PARSE_CONCURRENCY` (default 2), `AGENTS_DOCUMENT_PARSE_QUEUE`
  (default 4 waiting; beyond that "busy, try again") and
  `AGENTS_DOCUMENT_PARSE_MEMORY_MB` (default 384 heap per parse). The 20s
  timeout covers waiting and parsing and terminates the worker; a worker out of
  memory reports "too large or complex". The parser config is part of the
  security contract: `allowRemoteAssets: false` (no CDN worker/OCR/font
  fetches), OCR, attachments and raw XML off, and decompression limits of
  32 MiB / 250k XML elements, matched to the default heap (measured: the
  largest admitted DOCX needs >320 MB). Raise the heap together with the
  element limit. Password-protected and corrupt files return actionable
  `readFile` errors. Legacy binary `.doc/.xls/.ppt` are not accepted.
  `__tests__/documentParsingResources.test.ts` is the operational gate
  (event-loop delay, termination CPU, limits, busy, no child processes).
- `codeMode.ts`, `askUser.ts`, `fileBinding.ts`, `fileTimeout.ts`,
  `fileValidation.ts` (allowed MIME types, including
  `AGENTS_DOCUMENT_MIME_TYPES`; keep aligned with core-ui `agentsFiles.ts`),
  `toolSchemaCompatibility.ts`, `mongo44Compatibility.ts`, `providers.ts`,
  `threadsEvents.ts`.
- `db/` — `AgentsConnection` + `AgentsSettings` models (registered in
  `src/connectionResolvers.ts`); `graphql/` — schemas + thin resolvers.

## Invariants (carry over)

- Never introduce env-var secrets; BYOK keys live only on the per-user
  document — sealed `enc:v1:` envelopes only, never plaintext — and never
  appear in responses, errors, or logs. `sealSecret` throws when
  `JWT_TOKEN_SECRET` is unset (fail closed).
- Threads/messages/approvals live in `{db}_agents_memory` only — never the
  base DB's legacy `mastra_*` collections.
- GraphQL is the only CRM execution path. Identity is never model-controlled;
  the gateway resolves the signed acting user and existing resolvers authorize
  every call. Do not reintroduce tRPC metadata, allowlists or raw-Mongo tools.
- GraphQL execution uses `gatewayUrl`: `GATEWAY_URL` takes precedence over
  `DOMAIN/gateway`; without either, local development uses `REACT_APP_API_URL`
  or `http://localhost:4000`. Server-side fetches require an absolute URL.
- ESM-only packages (`ai`, `@mastra/*`, `@ai-sdk/anthropic`) load via
  `await import(...)` at point of use; type-only imports carry
  `with { 'resolution-mode': 'import' }`. core-api compiles
  `module/moduleResolution: nodenext` — do not narrow it (plain `commonjs`
  would downlevel `import()` to `require()` and break the ESM packages).
- MongoDB 4.4 compat: `installMongo44WorkflowCompatibility` wraps the
  workflows store until encoded suspended runs have drained; every touch
  point carries a `// MongoDB 4.4.25 compatible` marker.
- `agentsThreadsChanged` publishes stay transient per-user `{ userId }`
  events after an accepted new thread is created through native Memory,
  from Mastra `onFinish`/`onTitleGenerated` hooks, `agentsThreadUpdate`, and
  `agentsThreadRemove`. Creation persists and publishes before model generation,
  with an absent title so native asynchronous auto-titling still applies.
- The resume routes share `findSuspendedToolCall` (kind-aware: approval vs
  ask_user, newest suspended run, ownership re-checked, wrong-kind → 409).
  Approval requests carry the answered `toolCallId`, checked against the current
  suspension; stale ids return 409 rather than deciding another call. Legacy
  callers without an id retain server discovery. Invalid/denied GraphQL inputs
  return tool errors without approval or network execution; human approval never
  grants an exception to GraphQL policy.
- Session removal verifies ownership, aborts and cancels scoped running/suspended
  native workflows before deleting thread memory, preventing late completion from
  recreating a closed session. This is explicit deletion, not browser detachment.
- Every run entry point passes `maxSteps: 32`; resumes restore the original
  run's RequestContext snapshot (selection fields in the body are accepted
  but ignored).

## Runtime dependencies

Core-api declares its own Mastra dependencies in `backend/core-api/package.json`;
updating the workspace root alone does not upgrade the running service. Keep both
manifests aligned: core 1.78.0, memory 1.38.0, MongoDB 1.23.1, Redis Streams 0.6.3,
AI SDK adapter 1.11.1 and QuickJS 0.1.3. Verify package resolution from core-api.

`officeparser` is pinned exactly (8.2.0, MIT) in `backend/core-api/package.json`
only: the runtime image installs core-api's and `erxes-api-shared`'s manifests,
not the root. It brings `pdfjs-dist` (pinned by officeparser), `tesseract.js`
(never loaded while `ocr` is off) and the optional prebuilt `@napi-rs/canvas`
(not needed for text; parsing works without it). It needs Node ≥22.13.

## Validation

- `pnpm nx build core-api` (tsc + tsc-alias, nodenext)
- `pnpm nx test core-api` — jest with
  `NODE_OPTIONS=--experimental-vm-modules` (QuickJS WASM loader);
  `ts-blank-space` is mapped to a callable CJS stub in `jest.config.ts`.
- `pnpm nx lint core-api` — repo has pre-existing lint errors outside this
  module; keep this module's files clean.
- Smoke: `POST /agents/chat` without a `user` header returns 401.
