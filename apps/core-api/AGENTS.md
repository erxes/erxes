# core-api

The `/core/v1` server: Express with oRPC's OpenAPI handler (plain REST and JSON), bundled by tsdown as ESM.

## Layout

- `src/main.ts` loads the signing keys, applies migrations, registers `CORE_PLUGIN_KEYS`, starts the
  server, the cleanup and audit checkpoints (`src/lib/maintenance.ts`), the live updates listener
  (`src/modules/live/hub.ts`) and the event processor (`src/modules/events/processor.ts`).
- `src/instrumentation.ts` starts OpenTelemetry (http, express, pg, oRPC). Node preloads it with
  `--import` (the `dev` and `start` scripts, the Dockerfile CMD): it registers the ESM loader hook
  that lets the instrumentations patch modules, so it must run before the app loads. Spans leave the process only when `OTEL_EXPORTER_OTLP_ENDPOINT` is set.
- `src/logger.ts` has the pino `logger`, its redaction list and `traced(name, run)`.
- `src/app.ts` builds the Express app: `authenticate`, the live stream, the signed file links, then
  `coreApi`.
- `src/rpc.ts` serves the contract (`coreApi`), maps invalid input to `INVALID_INPUT` and holds
  `generateOpenApi()`, which serves `/core/v1/openapi.json` and writes `packages/contract/openapi.json`.
- `src/orpc.ts` is the only file that may import `implement`/`os`. It holds the procedure builders
  (`pub`, `authed`, `plugin`, `anyone`, and `authedUnscoped`, `pluginUnscoped`, `anyoneUnscoped`
  for procedures that call out over the network), the access check and organisation scope every procedure
  passes, and `audited`.
- `src/modules/<feature>/<feature>.router.ts` implements that feature's procedures with those
  builders. `src/router.ts` only assembles the feature routers into `coreRouter`.
- `src/modules/<feature>/<feature>.service.ts` has the logic. `<feature>.http.ts` is only for
  Express routes that stream bytes, files or events (file links, audit export, `/core/v1/stream`).
- `src/http/` has auth (`actorOf`, `pluginOf`, `callerOf`, `requireManager`), the access map
  (`policies.ts`) and its check (`access.ts`), the sign-in, code, token and upload rate limits
  (`rateLimit.ts`), cookies and `HttpError`.
- `src/modules/customerAuth/` signs customers in for plugins' apps (decision 42): the app calls
  `/customer-auth/*` itself (codes by email or SMS through `modules/sms` drivers, one session per
  app sign-in, rotating refresh tokens), `/customer/me`, and `customerCors` for the apps' origins
  (`customerApps.ts`). `authenticate` lets only customer tokens (`customer+jwt`) into
  `/customer/*`, and customer tokens nowhere else.
- `src/lib/signing.ts` signs and verifies every token core issues (plugin tokens, plugin sessions,
  audit checkpoints) with core's ES256 key; `src/modules/plugins/` is the plugin registry.
- `src/lib/crypto.ts` is the only file that imports `node:crypto` (`no-restricted-imports`):
  `safeEqual`, `sha256`, `hmacSha256`, `randomToken`, password hashing and sealing. Add a missing
  helper there. `src/lib/secrets.ts` seals with keys derived from core's secret.
- `src/lib/` has keyset paging, change diffs, merge helpers, search and guards.
- `src/config.ts` is the only place that reads `process.env`.

## How a request flows

contract procedure (`packages/contract/src/<domain>.ts`) → its policy in `ACCESS`
(`src/http/policies.ts`) → handler in `src/modules/<feature>/<feature>.router.ts`
(`authed`, `plugin` or `anyone` builder) → service (`client: Db`, the `Actor` or `Caller`, input) →
DTO. Copy the `tags` procedures: `modules/tags/tags.service.ts` and `modules/tags/tags.router.ts`.

## Rules

- Every query filters by the caller's organisation: `eq(table.orgId, actor.orgId)`. The org comes
  from the member's or the plugin's token, never from input.
- Members use `authed` (`context.actor`), plugins use `plugin` (`context.plugin`), and `anyone` gives
  `context.caller` for both. Owner and admin checks are `requireManager(actor, message)` in the
  service.
- Every procedure has a policy in `ACCESS` (`src/http/policies.ts`): `public`, `member: any | manager |
  owner`, `plugin: <scope>` (`manifest` for the plugin's token without an organisation), or
  `customer` (the `customer` builder; its services open their own `withOrg`). One oRPC
  middleware checks it before the handler, and a procedure without an entry doesn't compile.
- Tokens core signs get their own JOSE `typ` (`signJwt`); `verifyJwt` checks it and parses the
  claims with a zod schema.
- No network call inside a transaction: a slow remote would hold it and its row locks.
  `postOutbound` (`src/lib/outbound.ts`) throws inside a tenant scope. A member procedure that
  calls out uses `authedUnscoped`, reads in a short `withOrg` and calls out after it (see
  `testStream`); a job reads, calls out, then writes in a second scope (`streamDelivery.ts`).
- A write and its audit entry share one transaction: `audited(...)` in the router, or
  `recordAudit(tx, ...)` in the service. Core events go out in the same transaction with
  `publishCoreEvents(tx, ...)`.
- Services return DTOs (`toTagDto`): no credentials, no `org_id`. Dates go out as ISO strings.
- Errors are `HttpError(status, code, message, data?)`, an `ORPCError`. Clients branch on `code`, so
  a new failure gets a new code and old codes keep their meaning.
- Lists use keyset paging (`keysetPage` in `src/lib/keyset.ts`, `CursorQuery` in the contract),
  newest first, the cursor is a record id.
- Settings have unprefixed names (`DATA_URL`, `PORT`, `CORE_JWT_SECRET`). Secrets also read
  `<NAME>_FILE`. Production throws on a missing secret.
- Values from outside (JWT claims, jsonb written by plugins, signed grants) are parsed with zod.

## Logs

- `console` is a lint error. Log through pino: one JSON line per call, the facts as fields and a
  short message, `log.info({ fileId }, 'file removed')`. Errors go under `err`:
  `log.error({ err: error }, 'could not delete a stored file')`.
- Procedures use `context.log`, Express routes `req.log`. Both carry `requestId`, then `orgId` and
  `actorId` once `authenticate` resolved the caller. A service that logs takes the logger as a
  parameter (`removeFile(..., context.log)`).
- Background work takes `logger.child({ component: 'events' })` and adds its ids per line
  (`consumer`, `eventId`). Wrap a job in `traced('name', run)` so its queries and lines share a trace.
- A caught error is rethrown or logged with context, never dropped. Thrown 4xx `HttpError`s
  are answers: oRPC's logging plugin writes them at info.
- Lines in a span carry `trace_id` and `span_id`. A new secret field name goes in `redact` in
  `src/logger.ts`.

## Tests

`src/__tests__/*.test.ts` run against a real Postgres. `useTestDatabase()` creates and drops a
database per file, and `useTestServer()` serves the app and gives the typed contract client
(`client({ user, org })`, which signs the member's token at their current session version on
every call; `client(token)`; or `client({ plugin: HR_SECRET, org })`, which first trades the test
plugin's client secret for a token). `accessToken(user, org)` is that token for raw requests.
Errors assert as
`rejects.toMatchObject({ status, code })`. Use raw `fetch` with `url()` and `headers()` only for
cookies, CSRF, signed links and exports.

## Models

`verify/tla` has TLA+ models of the file lifecycle (`modules/files`) and the job queue
(`modules/jobs`). Any change to those modules or their tables means updating the model in the
same PR and rerunning `pnpm verify:models`, which runs TLC with pinned Java. Every model action
names the `file:line` it stands for. Replay a counterexample against the code: a step the code
can't take is a modeling error, and a trace the code can follow is a product bug. Never weaken a
property to make it pass. `src/__tests__/concurrency.test.ts` replays each property on real
Postgres. Follow `.agents/skills/verify-models/SKILL.md`.

## Check

`pnpm check`, `DATA_TEST_URL=postgres://erxes:erxes_local_dev@127.0.0.1:5434/erxes pnpm test`,
`pnpm build`, and `pnpm check:generated` after a contract change.
