---
name: plugin-contract
description: Breaking change or not, for what plugins depend on. Use when changing or removing a procedure, field or error code in packages/contract, an event schema, the core_publish_event, core_record_audit or core_live_signal SQL functions, packages/plugin-sdk, the SHARED list in apps/core-ui/rsbuild.config.ts, exports of packages/ui, or when releasing those packages.
---

Plugins live in their own repos and upgrade on their own schedule, so every change here is either
additive or a versioned breaking change. The HR plugin is the first consumer.

1. Say which surface changes:
   - the HTTP contract (`packages/contract/src/*.ts` and `openapi.json`);
   - event payloads (`src/events.ts`) and the SQL functions plugins call in their own transaction;
   - `@erxes/plugin-sdk` and the plugin manifest (`PluginManifest`);
   - Module Federation: `SHARED` in `apps/core-ui/rsbuild.config.ts` lists the singletons the host
     provides, and plugins declare them with `import: false`. A plugin's `./config` exports
     `CONFIG` (`name`, `path`, `icon`, `modules`), and its first module renders under `/<path>/*`.
     Core has no GraphQL, so a plugin UI that imports `@apollo/client` fails to load.
2. Classify it. The packages are `0.1.0-v2.N` prereleases on npm's `v2-next` dist-tag; semver
   starts at `1.0.0`.
   - Additive is a minor version: a new procedure, optional input field, output field or error code.
   - A breaking change is a major version: removing or renaming a procedure, path or field, making
     an input required or stricter, changing a field's type or meaning, reusing an error code.
     The old shape stays next to the new one, marked deprecated in the summary, for at least one
     minor release. An HTTP breaking change goes under `/core/v2`.
3. For the contract, run `pnpm openapi` and read the `openapi.json` diff: every removed path,
   removed field or newly required field is a breaking change.
4. For federation, keep shared names and exported symbols: a removed `erxes-ui` export breaks
   plugin UIs at runtime, not at build time. Search the plugin repos (the HR plugin first) for a
   symbol before removing it.
5. Check a consumer: load the HR plugin UI in core-ui with `PUBLIC_PLUGINS=<remote>@<remoteEntry url>`
   (`.agents/skills/verify-feature/SKILL.md`), or call the changed procedure with a token from
   `POST /core/v1/plugins/token`, or through `@erxes/plugin-sdk`'s `createCoreClient`.
6. To release `@erxes/core-contract`, `@erxes/plugin-sdk` and `@erxes/ui`, bump their `version`
   in a PR, then run `.github/workflows/release.yml` (by hand, or push a `v2-*` tag). It publishes
   each version not yet on npm under `v2-next` only; `@erxes/ui` 3.x from old erxes owns `latest`
   and `next`.

Done when `pnpm check:generated` passes, the handoff names the versioning decision (additive or
breaking change, and the deprecation plan for a break), and a consumer was checked.
