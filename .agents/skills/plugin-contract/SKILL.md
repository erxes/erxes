---
name: plugin-contract
description: Breaking change or not, for what plugins depend on. Use when changing or removing a procedure, field or error code in packages/contract, an event schema, the core_publish_event, core_record_audit, core_live_signal or core_enqueue_job SQL functions, packages/plugin-sdk, the SHARED list in packages/ui/src/federation.ts, exports of packages/ui, or when releasing those packages.
---

Plugins live in their own repos and upgrade on their own schedule, so every change here is either
additive or a versioned breaking change. The HR plugin is the first consumer.

1. Say which surface changes:
   - the HTTP contract (`packages/contract/src/*.ts` and the OpenAPI document). Plugin UIs call it
     through `@erxes/core-contract/client`, which bundles `routes.json` into each plugin build, so
     a plugin built before a path moved keeps calling the old one;
   - event payloads (`src/events.ts`) and the SQL functions plugins call in their own transaction:
     `core_publish_event`, `core_record_audit`, `core_live_signal` and `core_enqueue_job`
     (`packages/db/drizzle/0060_plugin_jobs.sql`), which queues a job the manifest's `jobs` declares.
     Core's own events name the record (`entityId`, `subjectId`) and what changed, never the row:
     a subscriber reads the record from core. A plugin event with a `summary` goes on the
     timeline of the record it names: `entityType` (a type the plugin's manifest declares in
     `timelines`) and `entityId`, and the customer or company in `subjectType` and `subjectId`;
     one event can reach both (`timelineConsumer` in
     `apps/api/src/modules/events/coreConsumers.ts`). Another plugin's or an undeclared type is
     ignored. `activities.create` is for entries that are not events, and `activities.importNote`
     brings an old note in with its author and date, once per `dedupeKey`. A timeline with
     `recordAccess: true` asks the plugin before a member reads or notes on a record: core POSTs
     `{ orgId, userId, type, id }` to `/timelines/access` (checked by `verifyCoreAccessCheck`),
     and anything but `{ "allowed": true }` within 5 s is a 403;
   - `@erxes/plugin-sdk` and the plugin manifest (`PluginManifest`), with what core POSTs to a
     plugin's API: events to `/events`, actions to `/automations/actions/<type>`, and jobs to
     `/jobs/<name>` (`PluginJobDelivery` in `src/pluginJobs.ts`, checked by `verifyCoreJob`).
     An action field `{ type: 'plugin_record', recordType, dependsOn? }` (`ActionField` in
     `src/automationRuns.ts`) lets the member pick one of the plugin's records: web calls
     `GET <api.url>/automations/records/<recordType>?parent=<the dependsOn input's value>` with the
     member's session token and expects `[{ value, label }]`. Changing an input clears the inputs
     that depend on it. The route, the query key `parent` and the answer's shape are the contract;
   - segments (`packages/contract/src/pluginFields.ts`, `apps/api/src/modules/views/pluginViews.ts`):
     the manifest's `fields` (`PluginFields`: `code`, `contentType`, `label`, `type`, `options`)
     become read-only custom fields of each organisation that has the plugin, with `plugin` set
     (`syncPluginFields`). The plugin writes their values quietly with `fields.setPluginValues`
     (scope `fields:write`), and members filter, sort and save views by them; a plugin's
     filter fields come with `group: 'plugin'` and its title in `groupLabel`. With `views:read`
     a plugin lists the shared views (`views.list`) and asks which records one matches now
     (`views.matches`). The field shape, the codes `PLUGIN_FIELD` and `VIEW_NOT_SHARED`, and
     "a personal view never matches" are the contract;
   - Module Federation: `SHARED` in `packages/ui/src/federation.ts` lists the singletons the host
     provides, and plugins declare them with `import: false`. A plugin's `./config` exports
     `CONFIG` (`name`, `path`, `icon`, `modules`, `checkAccess`, `recordSections`, `recordTypes`,
     `relationTabs`, `settings`), and its first module renders under `/<path>/*`. `settings`
     (`{ path, label, icon? }`, each `path` under `/<path>/`) are links to the plugin's own
     settings pages, a group per plugin at the end of core's settings sidebar
     (`apps/web/src/modules/settings/components/SettingsSidebar.tsx`). `recordSections` are drawn
     in core's customer and company panel (`apps/web/src/modules/plugins/PluginRecordSections.tsx`).
     For `recordTypes` (`<name>:<thing>`) core draws the side panel and the plugin fills slots:
     `Title`, `Actions`, `Detail`, `tabs`, `New`, with `detailPath(id)` under `/<path>/` as the
     expanded page (where the plugin renders erxes-ui's `RecordPage`), `contacts(id)` for
     relation tabs and `activity` for core's timeline
     (`apps/web/src/modules/plugins/PluginRecordView.tsx`). `relationTabs` show on core's
     customers and companies, and on the record types with `contacts` that their `hosts` name
     (`apps/web/src/modules/plugins/PluginRelationTabs.tsx`). web validates all three when it
     loads the config (`apps/web/src/modules/plugins/pluginConfig.ts`) and drops a malformed
     entry. Core shows the config's words (the app's name, `title`s and `label`s) through
     `usePluginText` (`apps/web/src/modules/plugins/pluginText.ts`): the i18n namespace is the
     plugin's `name` and the key is the English text, which shows when no translation is there. A slot's props (`TRecordSlotProps`, `TRelationTabProps`) are the contract: a new
     optional slot or prop is additive, a renamed one a break. erxes-ui's `useOpenRecord` and `ContactLink` open records and drafts
     through the `RecordOpenerProvider` web mounts, so the panel's URL stays core's own; erxes-ui's
     `RecordTimeline` and `RecordPage` render what web registers at startup
     (`apps/web/src/bootstrap.tsx`). erxes-ui's `ListFilter` draws core's filter bar itself, in
     web or outside it; its props (`TListFilterProps`, `TListFilterField`) and
     `useListFilterParams()`'s address keys (`advanced`, `searchValue`) are the contract, and its
     `member` and `tags` fields read through the `members` and `tags` query options the plugin
     passes; a field's `groupLabel` lists it under that heading. A plugin list keeps saved views by giving `ViewBar` and `ListFilter` its record type
     (`recordType="sales:deal"`): web provides the tabs and the save through `ListViewsProvider`,
     core stores the view (`views.recordType` takes `<plugin>:<record>`), and the plugin's API
     applies its filter. The prop, the address key `view` and that type's shape are the contract.
     The API compiles the filter with `compileFilter` from `@erxes/plugin-sdk/filter`, the
     compiler core's own lists use (`apps/api/src/modules/views/recordFilter.ts` adds core's
     custom fields, tags and lookups on top). A field type or operator it accepts is the contract,
     and so is its 400 `INVALID_FILTER`.
     Core has no GraphQL and doesn't provide `@apollo/client`, so a plugin UI that declares it
     shared with `import: false` fails to load. A library goes in `SHARED` when erxes-ui hands
     plugin code its context or store: `nuqs` (web's `NuqsAdapter`) and `react-hook-form`
     (erxes-ui's `Form`).
2. Classify it. The packages are prereleases on npm's `v2-next` dist-tag (`0.1.0-v2.N` for the
   contract and SDK, `4.0.0-v2.N` for `@erxes/ui`); this policy holds from each one's first
   stable release.
   - Additive is a minor version: a new procedure, optional input field, output field or error code.
   - A breaking change is a major version: removing or renaming a procedure, path or field, making
     an input required or stricter, changing a field's type or meaning, reusing an error code.
     The old shape stays next to the new one, marked deprecated in the summary, for at least one
     minor release. An HTTP breaking change goes under `/core/v2`.
3. For the contract, diff the OpenAPI document from before and after the change
   (`packages/contract/AGENTS.md` says how to write both): every removed path,
   removed field or newly required field is a breaking change.
4. For federation, keep shared names and exported symbols: a removed `erxes-ui` export breaks
   plugin UIs at runtime, not at build time. `packages/ui/exports.txt` lists both, and
   `pnpm check:generated` fails until it is regenerated, so a removed line in its diff is a
   breaking change. Search the plugin repos (the HR plugin first) for a symbol before removing it.
   A new export needs a doc comment: `node tools/ui-exports.ts` fails without one, and its first
   sentence is the export's line in `packages/ui/CATALOG.md`, which ships in erxes-ui.
5. Check a consumer: load the HR plugin UI in web with `PUBLIC_PLUGINS=<remote>@<remoteEntry url>`
   (`.agents/skills/verify-feature/SKILL.md`), or call the changed procedure with a token from
   `POST /core/v1/plugins/token`, or through `@erxes/plugin-sdk`'s `createCoreClient`.
6. To release `@erxes/core-contract`, `@erxes/plugin-sdk` and `@erxes/ui`, bump their `version`
   in a PR, then run `.github/workflows/release.yml` (by hand, or push a `v2-*` tag). It publishes
   each version not yet on npm under `v2-next` only; `@erxes/ui` 3.x from old erxes owns `latest`
   and `next`.

Done when `pnpm check:generated` passes, the handoff names the versioning decision (additive or
breaking change, and the deprecation plan for a break), and a consumer was checked.
