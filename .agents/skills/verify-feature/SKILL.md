---
name: verify-feature
description: Show that a behaviour change works in the running app, not only in tests. Use after changing anything a member or plugin can see in core-ui or through /core/v1, before the handoff. Runs the Playwright daily flows with their axe checks, then the journey the change touches.
---

Use synthetic data only. Never point the app at a copy of production data.

1. Start Postgres and the app on a fresh database, from the repo root: `docker compose up -d`
   (Postgres on 127.0.0.1:5434), `cp .env.example .env` once, then
   `docker compose exec postgres createdb -U erxes erxes_e2e_<n>` and
   `DATA_URL=postgres://erxes:erxes_local_dev@127.0.0.1:5434/erxes_e2e_<n> pnpm dev` (API on 3400,
   UI on 3500; development migrates the new database on start). On a shared machine pick free
   ports with `PORT=<api> pnpm dev:api` and `WEB_PORT=<ui> CORE_API_URL=http://localhost:<api> pnpm dev:ui`.
2. Run the daily flows: `pnpm exec playwright install chromium-headless-shell` once, then
   `E2E_BASE_URL=http://localhost:<ui> pnpm e2e`. The setup project creates the organisation
   (owner `owner@e2e.test`, password `E2e-owner-pass-1`, in `e2e/fixtures.ts`), and every spec
   seeds its own records through the API, so the specs run in parallel. Every spec runs in the
   light and the dark theme (the `light` and `dark` projects). Each page a spec visits goes
   through `expectAccessible(page)`, which fails on serious or critical axe violations and
   lists each rule with the element and the measured contrast. Primary-coloured text
   is `text-primary-text`, readable in both themes; `--primary` itself is for fills and
   borders (`bg-primary`, `border-primary`), and reads at 2.6:1 as text in dark. A failure leaves a trace:
   `pnpm exec playwright show-trace e2e/test-results/<spec>/trace.zip`.
   - Fix a violation where it is caused: the core-ui component, or the erxes-ui part if every
     consumer shows it. Never disable an axe rule or filter it out of `expectAccessible`.
   - A new screen in a daily flow gets a step and an `expectAccessible` in its spec
     (`e2e/*.spec.ts`; CI's `e2e` job runs them against the built images).
3. For permission changes, invite a member in Settings › Team members and set their password there,
   then repeat the journey as that member.
4. Walk the journey the change touches in a browser (the agent-browser skill, or your browser
   tool), as old core-ui would: the page, the action, the result. Reload and check the change
   persisted. Try it as someone who must be refused and check they are.
5. For a render crash, in development run
   `dispatchEvent(new CustomEvent('erxes:crash', { detail: 'page' }))` (or `'app'`) in the browser
   console: the page (or the whole app) shows what failed with Try again and Reload, and Try again
   brings it back with the top bar's state kept. A page inside a module keeps the module's
   sidebar, since every layout renders its route through `PageOutlet`.
6. For API-only changes call the endpoint:
   `curl -H "authorization: Bearer <token>" http://localhost:3400/core/v1/<path>`
   (`pnpm bootstrap --subdomain acme --name "Acme" --email owner@acme.mn --password '<password>'`
   prints a token).
7. Keep screenshots and logs in `.scratch/` (git ignores it), never in the repo.

Done when `pnpm e2e` passes and the handoff lists the journey, what you saw at each step
(including the refusal), and where the screenshots are.
