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
- The erxes assistant can use the plugin when the manifest in `src/core.ts` has
  `assistant`: `skills` (a name, a one-line description, Markdown instructions
  about the plugin's data) and `operations` (a procedure path such as
  `items.list`, a summary, `changes: true` for writes, and
  `input: z.toJSONSchema(Input)`). Core calls an operation at
  `<api.url>/rpc/<path>` with the member's session token, so `reads` and
  `writes` check the member's permission as they do for the UI.
- Tests: `vite-plus/test`, run with `call(procedure, input, { context: { member } })`.
  `src/test/setup.ts` gives each file its own database, owned by a role without
  BYPASSRLS, so row-level security is real in tests.
