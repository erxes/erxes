---
name: verify-feature
description: Show that a behaviour change works in the running app, not only in tests. Use after changing anything a member or plugin can see in core-ui or through /core/v1, before the handoff.
---

Use synthetic data only. Never point the app at a copy of production data.

1. Start Postgres and the app from the repo root: `docker compose up -d` (Postgres on
   127.0.0.1:5434), `cp .env.example .env` once, then `pnpm dev` (API on 3400, UI on 3500). On a
   shared machine pick free ports with `PORT=<api> pnpm dev:api` and
   `WEB_PORT=<ui> CORE_API_URL=http://localhost:<api> pnpm dev:ui`, and a fresh database name in `DATA_URL`.
2. Create an organisation: the UI shows "Initial Configuration Steps" on an empty database, or run
   `pnpm bootstrap -- --subdomain acme --name "Acme" --email owner@acme.mn --password '<password>'`,
   which prints an access token for API calls.
3. For permission changes, invite a member in Settings › Team members and set their password there,
   then repeat the journey as that member.
4. Walk the journey the change touches in a browser (the agent-browser skill, or your browser
   tool), as old core-ui would: the page, the action, the result. Reload and check the change
   persisted. Try it as someone who must be refused and check they are.
5. For API-only changes call the endpoint:
   `curl -H "authorization: Bearer <token>" http://localhost:3400/core/v1/<path>`.
6. Keep screenshots and logs in `.scratch/` (git ignores it), never in the repo.

Future (Phase 1 and 2): a seeded, isolated stack per run and Playwright journeys in CI replace the
manual steps.

Done when the handoff lists the journey, what you saw at each step (including the refusal), and
where the screenshots are.
