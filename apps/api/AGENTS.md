# api

The `/core/v1` server: Express with oRPC's OpenAPI handler (plain REST and JSON), bundled by tsdown as ESM.

A request goes contract procedure → its policy in `ACCESS` (`src/http/policies.ts`) → handler in
`src/modules/<feature>/<feature>.router.ts` → service → row → the procedure's output schema, which
picks the fields and turns Dates into ISO strings. Copy `modules/tags` for a new feature.
`<feature>.http.ts` is only for Express routes the contract can't describe: byte and event streams,
OAuth's token and revoke endpoints, and callbacks from outside services (payments, SaaS).

## Rules

- Services take their input and nothing about who calls. `authenticate` (`src/http/auth.ts`) puts
  the `Caller` (a member, plugin, customer or `system`) and the organisation in the request's scope;
  a service that needs it calls `caller()` or `caller('user')` from `@erxes/core-db`, as it calls
  `db()`. Core acting on its own inside someone's request (a notice to the member, an alert to the
  owners) runs that part in `runAs(system('why'), fn)`; a job acting for a member (an import, an
  automation) runs in `runAs(member, fn)`, with the member from `memberOf`.
- Handlers are built from `src/orpc.ts`: `scoped` runs the handler inside `withOrg` for the
  caller's organisation, `unscoped` opens no transaction (public and customer procedures, and those
  that call out; their services open a short `withOrg(requestOrgId(), ...)`).
- Every procedure has a policy in `ACCESS`: `PUBLIC`, `MEMBER` (any member), `needs('<permission>')`
  (the member's role holds it), `CUSTOMER`, or `{ plugin: '<scope>' }` (`manifest` for the plugin's
  token without an organisation, `installed` for any token of an organisation that has the plugin).
  A procedure without an entry doesn't compile. That is the procedure's permission check: a service
  checks only a rule that depends on the record (an author's own note, a shared view), in a named
  helper built on `can()` or `callerCan()` (`erxes/no-service-permission`).
- No network call inside a transaction: a slow remote would hold it and its row locks.
  `postOutbound` (`src/lib/outbound.ts`) throws inside a tenant scope. A member procedure that
  calls out is `unscoped`, reads in a short `withOrg` and calls out after it (see
  `testStream`); a job reads, calls out, then writes in a second scope (`streamDelivery.ts`).
- A request or job is one transaction, its `withOrg` or `withSystem` scope, so services never open
  another (lint bans `.transaction`). When you catch an error and go on (a unique violation you
  answer with the existing record, an import row or recycle-bin item that fails alone), run the
  part that may fail in `savepoint(fn)` from `@erxes/core-db`.
- Row level security keeps every query to the scope's organisation, so no query filters on
  `orgId` and no insert in `withOrg` sets it (`orgIdColumn()` fills it). `erxes/no-org-filter`
  fails the filter. A `withSystem` job that needs one organisation's rows runs that part in
  `withOrg(orgId, ...)`, which narrows the system scope until it returns. Only inserts under
  `withSystem` (setup, plugin installs, audit, jobs, notifications) name `orgId`.
- A write and its audit entry share that transaction: `audited(run, entry)` in the router, or
  `recordAudit(tx, entry)` in the service. Core events go out in it too, with
  `publishCoreEvents(tx, ...)`. Both record the scope's caller.
- Services return rows, Dates and all. oRPC runs every answer through the output schema, which
  drops unpicked columns and encodes dates with `isoDate`, so there is no hand mapper and no
  `.toISOString()` for a response. A service adds only what the row lacks
  (`{ ...row, actor: { type: row.actorType, id: row.actorId } }`). A body sent outside oRPC
  (webhooks, plugin deliveries, event payloads, automation context) goes through the contract
  schema's `.parse(...)`, as `eventJson` and the product event payload do.
- Errors are `HttpError(status, code, message, data?)`, an `ORPCError`. Clients branch on `code`, so
  a new failure gets a new code and old codes keep their meaning.
- Lists of records that grow with use page with `keysetPage` (`cursorPageOf`; newest first, the
  cursor is a record id); small config lists use `wholeList` (`listOf`), which throws past
  `LIST_MAX` rather than cut the list. A growing list the UI reads in one go (a company's people)
  returns a window, its first N in the list's order, with `.max(N)` in the contract and N in the summary.
  `setup.test.ts` fails a list with neither paging nor a max.
- No query per item in a loop (`no-await-in-loop`): batch with `inArray` or a set-based update.
  Loops that are sequential on purpose go through `inOrder` or `repeatWhile` (`src/lib/sequence.ts`).
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
to `modules/files` updates its TLA+ model: `.agents/skills/verify-models/SKILL.md`. Tests that
need background work done call `settle()` (`__tests__/settle.ts`), which runs the pg-boss
workers until no job is due; `makeDue()` brings delayed and retried jobs forward.
