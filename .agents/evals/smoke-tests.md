# Smoke Tests

> Manual end-to-end paths to walk before declaring a major change shipped. Not run automatically (some need a running stack); developer or AI invokes them when relevant.

## When to use

After Phase 7 (REVIEW + SHIP) for any wish that:
- Adds a new federated GraphQL type
- Touches `module-federation.config.ts`
- Adds a new Express route
- Changes a BullMQ worker
- Adds a new automation trigger

Most field-additions don't need smoke tests — the Playwright spec in Phase 6 is sufficient.

## Prerequisites

Local stack running:
```bash
pnpm dev:core-api   # in one terminal — gateway + core-api
pnpm nx serve <plugin>_api  # plugin backend
pnpm nx serve <plugin>_ui   # plugin frontend
# Open core-ui in browser
```

Required env vars per `memory/stack.md`.

## Path 1 — UI → GraphQL → DB

For: any wish that adds/changes a GraphQL query/mutation reachable from the UI.

1. Open `http://localhost:3001/<plugin>` (or relevant route)
2. Navigate to the affected page
3. Trigger the user-visible action (e.g., edit a deal's new field)
4. Network tab — confirm the GraphQL request fires with the expected variables
5. Network tab — confirm the response contains the expected fields
6. Verify the change persists across reload

## Path 2 — Federation composition

For: any wish that touches `extensions.ts` or adds an `@key`.

1. Restart `<plugin>_api`
2. Restart the gateway (`pnpm dev:core-api`)
3. Watch the gateway startup logs for composition errors
4. Hit introspection:
   ```bash
   curl -X POST http://localhost:4000/graphql \
     -H "Content-Type: application/json" \
     -d '{"query":"{ __type(name: \"Deal\") { fields { name } } }"}' | jq
   ```
5. Confirm your new field appears

## Path 3 — Module Federation

For: any wish that touches `module-federation.config.ts`.

1. Restart `<plugin>_ui`
2. `curl http://localhost:<port>/mf-manifest.json | jq '.exposes'` (check stack.md for port)
3. Confirm your new expose appears
4. Open the host (`http://localhost:3001`)
5. Navigate to the page that consumes the new module
6. Browser console — confirm no "module not found" errors

## Path 4 — Subdomain isolation

For: any wish that adds a new persisted entity.

1. Start the stack
2. Create two tenants (subdomains): `t1`, `t2`
3. Through the UI logged in as `t1`, create the new entity
4. Switch to `t2` (relogin / different browser profile)
5. Confirm the `t1` entity is invisible to `t2`
6. Confirm `t2` can create its own with the same name without collision

If this fails, you have a multi-tenant leak. **Do not ship.** Re-read [`../rules/30-multi-tenancy.md`](../rules/30-multi-tenancy.md).

## Path 5 — BullMQ worker

For: any wish that adds a background job.

1. Verify the job is queued: `redis-cli` → `KEYS bull:*`
2. Confirm the worker picks it up (look at `pnpm dev:apis` stdout)
3. Confirm the side effect (DB write, email sent, etc.)
4. Visit `http://localhost:4000/bullmq-board` for the visual dashboard

## Path 6 — Automation flow

For: any wish that adds/changes an automation trigger or action.

1. In the UI, build an automation that uses the new trigger/action
2. Activate it
3. Manually fire the upstream event (e.g., move a Deal to a stage that should trigger)
4. Watch the automation runtime logs
5. Confirm the action ran

## Path 7 — REST endpoint

For: any wish that adds/changes a plugin REST route (e.g., `/pos-*`, `/ecommerce-*`).

```bash
# Replace <subdomain> with your test tenant
curl -X GET 'http://localhost:4000/pl:<plugin>/<route>' \
  -H 'X-Subdomain: <subdomain>' \
  -b 'auth-token=...' | jq
```

Confirm shape, status, and that auth/subdomain headers are respected.

## Recording outcomes

When a smoke test reveals a regression that the Playwright spec missed, **append a lesson to `memory/lessons.md`**: "Phase 6 spec passed but smoke test path N caught X. Lesson: add an assertion of shape Y to specs touching this surface."

The goal is that lessons accumulate so future Phase 6 specs are stronger and smoke tests become rarer.
