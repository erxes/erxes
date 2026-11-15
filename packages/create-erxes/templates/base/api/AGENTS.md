# api

Node 26 runs the TypeScript directly; imports carry `.ts` and `#/` is `src/`.

- `src/main.ts` starts in this order: migrations, `core.registerManifest(manifest)`,
  then the server. Core installs the plugin itself in development
  (`PLUGINS_AUTO_INSTALL`).
- `src/core.ts` holds the core client and the manifest. Every permission, event
  and kind in the manifest starts with `__id__.`. A new scope waits for the
  owner's approval, so ask for one only when a procedure needs it.
- `src/server.ts` verifies the session token on `/api/rpc/*` and hands
  procedures `context.member` (`PluginMember`: `orgId`, `userId`, `can()`,
  `canChange()`).
- `src/orpc.ts`: build every procedure on `reads(action)` or `writes(action)`.
  Both check the permission and run the handler in `withOrg(member.orgId)`, so
  row-level security shows `context.tx` one organisation's rows. Queries carry
  no org filter; only an insert sets `orgId`, from `context.member`.
- Call core (`core.forOrg(orgId)...`) outside `context.tx`; a failed core call
  must not roll back the plugin's own change.
- What happens to a record is an event: publish it with core's core_publish_event SQL function
  in `context.tx`, so it commits with the change, with a `summary`,
  a flat payload, `entityType` (a type in the manifest's `timelines`) and
  `entityId`. It appears on the record's Activity tab, and on the customer's or
  company's too when it names `subjectType` and `subjectId`. A retried event
  adds nothing. `activities.create` is for entries that are not events.
- Tests: `vite-plus/test`, run with `call(procedure, input, { context: { member } })`.
  `src/test/setup.ts` gives each file its own database, owned by a role without
  BYPASSRLS, so row-level security is real in tests.
