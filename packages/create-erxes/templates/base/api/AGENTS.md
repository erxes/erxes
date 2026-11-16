# api

Node 26 runs the TypeScript directly; imports carry `.ts` and `#/` is `src/`.

- `src/main.ts` starts in this order: migrations, `core.registerManifest(manifest)`,
  then the server. Core installs the plugin itself in development
  (`PLUGINS_AUTO_INSTALL`).
- `src/core.ts` holds the core client and the manifest. Every permission, event
  and kind in the manifest starts with `__id__.`. A new scope waits for the
  owner's approval, so ask for one only when a procedure needs it. Owners and
  admins hold every permission; a permission set with `defaultRoles: ['member']`
  is what members get on install, and owners change it from there.
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
  adds nothing. `activities.create` is for entries that are not events. Tests
  run on core's own `core_publish_event` (`src/test/core-calls.sql`): assert an
  event by reading `core_events` in `withOrg`, and an audit entry in `core_audit_logs`.
- Background work is a job in `src/jobs.ts`, which the manifest declares
  (`jobs`, with an optional `cron` in UTC, `onInstall` and `retry`). Queue one inside the
  change that needs it, `enqueueJob(context.tx, { orgId, name, payload })` from
  `@erxes/plugin-sdk`, so it exists only if the change commits. Core POSTs it
  to `/api/jobs/<name>`, which `src/server.ts` checks with `verifyCoreJob`, and
  retries until it answers 2xx. A job may run twice: key its effect by `jobId`.
- An automation action is an entry in the manifest's `actions`; core POSTs
  each run to `/api/automations/actions/<type>`, checked with `verifyCoreCall`.
  A field that picks one of the plugin's records is
  `{ key: 'pipelineId', label: 'Pipeline', type: 'plugin_record', recordType: 'pipeline' }`,
  and `dependsOn: 'pipelineId'` on another narrows it to that pipeline's. Web
  fills the list from `GET /api/automations/records/<recordType>?parent=<value>`,
  sent with the member's session token like `/api/rpc/*`; answer
  `[{ value, label }]` with the records that member may see. Never ask a member
  to type an id. Name what the action answers in `outputs`
  (`[{ key: 'dealId', label: 'Deal', type: 'text' }]`) and what an event's
  payload holds in its `fields`: later steps insert them from "Insert data".
- A fact the plugin computes about a customer or company (total spent, last
  order) is a field in the manifest's `fields` (`code`, `contentType`, `label`,
  `type`: number, date, text, select or multiselect). Core shows it read-only
  and members filter and save views by it. Write values with
  `core.forOrg(orgId).fields.setPluginValues({ contentType, values })` (scope
  `fields:write`, up to 500, `value: null` clears) after the change commits; it
  adds nothing to the timeline and sends no event. Members see the fields only
  while the plugin has `fields:write` there, so fill the values that existed
  before in a job with `onInstall: true`: core runs it once when an
  organisation installs the plugin or approves its new scopes.
- A segment (a price list's audience, a campaign's) is a shared view members
  build in core. Store its id; `views.list({ recordType })` lists the shared
  ones and `views.matches({ viewId, recordIds })` says which records it
  matches now (scope `views:read`, up to 500 ids).
- Tests: `vite-plus/test`, run with `call(procedure, input, { context: { member } })`.
  `src/test/setup.ts` gives each file its own database, owned by a role without
  BYPASSRLS, so row-level security is real in tests.
