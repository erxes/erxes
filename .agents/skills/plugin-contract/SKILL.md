---
name: plugin-contract
description: Change what plugins depend on. Use when changing or removing a procedure, field or error code in packages/contract, an event schema in packages/contract/src/events.ts, the core_publish_event, core_record_audit or core_live_signal SQL functions, packages/plugin-sdk, the SHARED list in apps/core-ui/rsbuild.config.ts, exports of packages/ui, or how /pl:<plugin> requests reach a plugin's API (plugins.proxy.ts, the identity headers).
---

Plugins live in their own repos and upgrade on their own schedule, so every change here is either
additive or a versioned break. The HR plugin is the first consumer.

1. Say which surface changes:
   - the HTTP contract (`packages/contract/src/*.ts` and `openapi.json`),
   - event payloads (`src/events.ts`) and the SQL functions plugins call in their own transaction,
   - `@erxes/plugin-sdk` (`packages/plugin-sdk`) and the plugin manifest (`PluginManifest`),
   - Module Federation: the `SHARED` singleton names in `apps/core-ui/rsbuild.config.ts`, the
     `CONFIG` shape plugins export, and what `erxes-ui` exports.
2. Classify it with the versioning policy in `packages/contract/AGENTS.md`. Additive is fine. A break
   keeps the old shape next to the new one through the deprecation window, and an HTTP break goes
   under `/core/v2`.
3. For the contract, run `pnpm openapi` and read the `packages/contract/openapi.json` diff: every
   removed path, removed field or newly required field is a break.
4. For federation, keep shared names and exported symbols. Plugin UIs declare the shared libraries
   with `import: false` and import `erxes-ui` from the host, so a removed export breaks them at
   runtime, not at build time. Grep the plugin repos (the HR plugin first) for a symbol before
   removing it.
5. Check a consumer: load the HR plugin UI through `PUBLIC_PLUGINS`
   (`.agents/skills/verify-feature/SKILL.md`), or call the changed procedure the way a plugin does,
   with a token from `POST /core/v1/plugins/token` (client credentials and `org`), or through
   `@erxes/plugin-sdk`'s `createCoreClient`.

## How a browser reaches a plugin's API

Core-api forwards `/pl:<plugin>/<path>` to `<manifest api.url>/<path>`
(`apps/core-api/src/modules/plugins/plugins.proxy.ts`), so the browser only ever
talks to core's address. The same path works in development (core-ui's dev
server sends `/pl:` to core-api) and deployed (core-ui's nginx does).

- The session cookie stays first-party. Core removes `Cookie` and the
  plugin's `Set-Cookie`, and refuses a cookie-signed change from another site.
- A signed-in member's request gets `Authorization: Bearer <plugin session>`
  (`verifyPluginSession`: org, user, email, name, role, permissions, tier,
  access) in place of whatever the browser sent.
- Every request gets `x-erxes-org` (`PLUGIN_ORG_HEADER`, `verifyPluginOrg`):
  the member's organisation, or for a visitor the address's (subdomain, then
  `DEFAULT_SUBDOMAIN`, then the only organisation that installed the plugin).
  A visitor keeps their own `Authorization` (the plugin's mobile tokens).
- Both tokens are ES256, 5 minutes, `aud` the plugin, so neither works on core
  or for another plugin, and a browser can't choose either.
- Bodies stream through untouched (mounted before the JSON parser). A plugin
  not installed in the member's organisation answers 403 `NOT_INSTALLED`.
- Plugin UIs use `pluginUrl` / `pluginFetch` from erxes-ui. `/pl:<plugin>` is
  part of the contract: changing it breaks every plugin UI and mobile app.

Future (Phase 2): a CI diff of `openapi.json` against the base branch, and a packed consumer build.

Done when `pnpm check:generated` passes, the handoff names the versioning decision (additive or
break, and the deprecation plan for a break), and a consumer was checked.
