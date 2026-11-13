# core-api

The `/core/v1` server: Express with oRPC's OpenAPI handler (plain REST and JSON), bundled by tsdown as ESM.

A request goes contract procedure → its policy in `ACCESS` (`src/http/policies.ts`) → handler in
`src/modules/<feature>/<feature>.router.ts` → service → DTO. Copy `modules/tags` for a new feature.
`<feature>.http.ts` is only for Express routes the contract can't describe: byte and event streams,
OAuth's token and revoke endpoints, and callbacks from outside services (payments, SaaS).

## Rules

- Handlers are built from `src/orpc.ts`: `authed` for members (`context.actor`), `plugin` for plugin
  tokens (`context.plugin`), `anyone` for both (`context.caller`), `customer` for signed-in
  customers, `pub` for public. The first three run the handler inside `withOrg` for the caller's
  organisation; `customer` services and the `*Unscoped` builders open their own.
- Every procedure has a policy in `ACCESS`: `PUBLIC`, `MEMBER` (any member), `needs('<permission>')`
  (the member's role holds it), `CUSTOMER`, or `{ plugin: '<scope>' }` (`manifest` for the plugin's
  token without an organisation, `installed` for any token of an organisation that has the plugin).
  A procedure without an entry doesn't compile.
- No network call inside a transaction: a slow remote would hold it and its row locks.
  `postOutbound` (`src/lib/outbound.ts`) throws inside a tenant scope. A member procedure that
  calls out uses `authedUnscoped`, reads in a short `withOrg` and calls out after it (see
  `testStream`); a job reads, calls out, then writes in a second scope (`streamDelivery.ts`).
- A write and its audit entry share one transaction: `audited(...)` in the router, or
  `recordAudit(tx, ...)` in the service. Core events go out in the same transaction with
  `publishCoreEvents(tx, ...)`.
- Errors are `HttpError(status, code, message, data?)`, an `ORPCError`. Clients branch on `code`, so
  a new failure gets a new code and old codes keep their meaning.
- Lists use keyset paging (`keysetPage` in `src/lib/keyset.ts`, `CursorQuery` in the contract),
  newest first; the cursor is a record id.
- Tokens core signs get their own JOSE `typ` (`signJwt`); `verifyJwt` checks it and parses the claims.
- Settings are read only in `src/config.ts`. Secrets also read `<NAME>_FILE`.
- `src/lib/crypto.ts` is the only file that imports `node:crypto`: `safeEqual`, `sha256`,
  `hmacSha256`, `randomToken`, password hashing and sealing. Add a missing helper there.
  `src/lib/secrets.ts` seals with keys derived from core's secret.
- Log through pino, `log.info({ fileId }, 'file removed')`, errors under `err`: `context.log` in
  procedures, `req.log` in Express routes, `logger.child({ component })` in background work, and
  `traced('name', run)` around a job. Thrown 4xx `HttpError`s are answers, logged at info. A new
  secret field name goes in `redact` in `src/logger.ts`.

## Tests

`useTestServer()` (`src/__tests__/support.ts`) serves the app and gives the typed client:
`client({ user, org })`, `client(token)` or `client({ plugin: HR_SECRET, org })`. `useTwoOrgs()`
sets up two organisations for cross-tenant cases, and `currentToken` (`__tests__/db.ts`) is a
member's token for raw requests. Errors assert as `rejects.toMatchObject({ status, code })`. Raw
`fetch` with `url()` and `headers()` is only for cookies, CSRF, signed links and exports. A change
to `modules/files` or `modules/jobs` updates its TLA+ model: `.agents/skills/verify-models/SKILL.md`.
