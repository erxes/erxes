---
name: plugin-contract
description: Change what plugins depend on. Use when changing or removing a procedure, field or error code in packages/contract, an event schema in packages/contract/src/events.ts, the core_publish_event, core_record_audit or core_live_signal SQL functions, packages/plugin-sdk, the SHARED list in apps/core-ui/rsbuild.config.ts, or exports of packages/ui and packages/ui-modules.
---

Plugins live in their own repos and upgrade on their own schedule, so every change here is either
additive or a versioned break. The HR plugin is the first consumer.

1. Say which surface changes:
   - the HTTP contract (`packages/contract/src/*.ts` and `openapi.json`),
   - event payloads (`src/events.ts`) and the SQL functions plugins call in their own transaction,
   - `@erxes/plugin-sdk` (`packages/plugin-sdk`) and the plugin manifest (`PluginManifest`),
   - Module Federation: the `SHARED` singleton names in `apps/core-ui/rsbuild.config.ts`, the
     `CONFIG` shape plugins export, and what `erxes-ui` and `ui-modules` export.
2. Classify it with the versioning policy in `packages/contract/AGENTS.md`. Additive is fine. A break
   keeps the old shape next to the new one through the deprecation window, and an HTTP break goes
   under `/core/v2`.
3. For the contract, run `pnpm openapi` and read the `packages/contract/openapi.json` diff: every
   removed path, removed field or newly required field is a break.
4. For federation, keep shared names and exported symbols. Old plugin UIs declare the shared
   libraries with `import: false` and import `erxes-ui` and `ui-modules` from the host, so a removed
   export breaks them at runtime, not at build time. `docs/inventory/old-erxes.json` lists which
   old plugins import which `ui-modules` symbols.
5. Check a consumer: load the HR plugin UI through `PUBLIC_PLUGINS`
   (`.agents/skills/verify-feature/SKILL.md`), or call the changed procedure the way a plugin does,
   with a token from `POST /core/v1/plugins/token` (client credentials and `org`), or through
   `@erxes/plugin-sdk`'s `createCoreClient`.

Future (Phase 2): a CI diff of `openapi.json` against the base branch, and a packed consumer build.

Done when `pnpm check:generated` passes, the handoff names the versioning decision (additive or
break, and the deprecation plan for a break), and a consumer was checked.
