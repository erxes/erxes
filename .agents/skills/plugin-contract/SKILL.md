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
     plugin's API: events to `/events`, actions to `/automations/actions/<type>`, jobs to
     `/jobs/<name>` (`PluginJobDelivery` in `src/pluginJobs.ts`, checked by `verifyCoreJob`), and
     transfer requests to `/transfer/export` and `/transfer/import` (below).
     An action field `{ type: 'plugin_record', recordType, dependsOn?, multiple? }` (`ActionField` in
     `src/automationRuns.ts`) lets the member pick one of the plugin's records: web calls
     `GET <api.url>/automations/records/<recordType>?parent=<the dependsOn input's value>` with the
     member's session token and expects `[{ value, label }]`. Changing an input clears the inputs
     that depend on it. An action's `outputs` and an event's `fields` (`DataField`: `key`, `label`,
     `type`, `recordType?`) name what its answer or payload holds, under the event's `record`
     ("The order"); `registerManifest` answers `warnings` for what is missing. The builder offers
     them in "Insert data" as
     `{{steps.<step id>.output.<key>}}` and `{{event.payload.<key>}}`, so renaming a key breaks
     saved automations. A field with `recordType` holds one of the plugin's record ids: conditions
     pick it from `GET <api.url>/automations/records/<recordType>` without `parent`, so that
     route answers every record of the type then ("Pipeline · Stage"), and that type's record
     pickers offer it. The route, the query key `parent` and the answer's shape are the contract.
     The manifest's `pluginReads` (`PluginRead`: `plugin`, `permissions`, `reason`, in
     `packages/contract/src/pluginReads.ts`) lets a plugin read another plugin's API for an
     organisation: the owner approves it like a scope (stored in the installation's granted scopes
     as `reads:<permission>`), and `plugins.callToken` (`apps/api/src/modules/plugins/pluginCalls.ts`)
     issues a 5-minute token, typ `erxes-plugin-call+jwt`, `aud` the plugin read, `sub`
     `plugin:<caller>`, claims `org`, `plugin`, `permissions` (approved and declared by the plugin
     read), `tier`, `access`, `saas` and `bundles` (as `saas.pluginPlan` answers them, also in
     member session tokens), while both are installed there. The SDK's `fetchPlugin` sends it
     to `<api.url><path>`, and `verifyPluginCall` gives the plugin read a `PluginMember` with
     `userId` `plugin:<caller>`. The scope prefix, the typ, the claims and the codes
     `READ_NOT_APPROVED`, `PLUGIN_NOT_INSTALLED` and `PLUGIN_UNREACHABLE` are the contract.
     The manifest's `search` (`PluginSearchSource`: `label`, `path`) adds groups to global search:
     web calls `GET <api.url><path>?q=<text>&limit=<n>` with the member's session token and
     expects `PluginSearchResults` (`{ data: [{ id, title, subtitle?, recordType?, path? }] }`,
     `src/values.ts`); a hit opens in the side panel by `recordType`, else at `path`.
     The assistant offers the routes of the `member` document in the manifest's `api.docs`
     (`apps/api/src/modules/assistant/tools/pluginDocument.ts`): core reads `<api.url><path>`,
     names each route `<plugin>:<operationId>` and calls it under the document's server, on
     `api.url`'s origin, with the member's session token and no step in between. After a call
     to a route that is not a GET, web reads the page's data again, and a route whose input
     or answer names a credential is never offered. A route's `operationId`, method and path
     are the contract;
   - import and export (`packages/contract/src/pluginTransfer.ts`,
     `apps/api/src/modules/transfer/pluginTransfer.ts`): the manifest's `transfer` names record
     types (`<plugin>:<record>`) with their `columns` and an `exportPermission` and
     `importPermission` from its own `permissions`. Core's transfer runs them like customers:
     `transfer.types` lists them for members who hold a permission while the plugin is installed
     and active, and the file, the mapping, the check, the jobs and the history stay core's
     (Contacts › Settings › Import & export). Core POSTs `PluginExportRequest` (a page after
     `cursor`, answered `PluginExportPage`) and `PluginImportRequest` (a batch of rows, `dryRun`
     for the check, answered `PluginImportResult`), signed with an `erxes-core-transfer+jwt`
     token over the body's digest and checked by `verifyCoreTransfer`. A plugin's imports can't
     be undone. The shapes, the token `typ` and the two paths are the contract;
   - integrations (`packages/contract/src/pluginIntegrations.ts`, `apps/api/src/modules/integrations`):
     the manifest's `integrations` (`PluginIntegration`: `key`, `name`, `summary`, `category`,
     `permission`, `accounts` kinds, `connect`, `pick`, `setup`, `hooks`) put an outside service on
     Settings › Integrations while the plugin is installed and active. Core draws connecting,
     choosing, the accounts and the setup form, and keeps each account's secret. Core POSTs
     `IntegrationHookCall` to `<api.url>/integrations/<key>/<hook>`, signed with an
     `erxes-core-integration+jwt` token over the body's digest and checked by
     `verifyCoreIntegration`: `start` (a `redirect` connect, answered `{ url }`), `connect` (a
     `form` connect, answered `{ candidates }`), and the `hooks` the integration lists:
     `connected` (before an account is saved), `check` (answered `{ error }`, null while the
     service takes the account) and `disconnect`. A 4xx answer's `{ message }` is shown to the
     member. A sign-in page ends with `pluginAccounts.offer` and a redirect to the `url` it
     answers. The plugin's server reads its accounts with `pluginAccounts.list`, `open` (the
     secret and the organisation's setup), `update`, `report` and `setup`; a plugin reaches only
     the accounts of its own integrations (`<plugin>.<key>`). An action with `integration`
     (and `accountKind`) gets an account input: its POST carries `account` (`id`, `kind`,
     `externalId`, `name`, `config`, `secret`) and `setup`, and `input` leaves the pick out. A
     `DataField` with `integration` holds an account id: triggers and conditions pick it from the
     organisation's accounts, and the account input offers it. In the plugin UI's `./config`,
     `integrations` (`TPluginIntegration`: `key`, `icon`, `tabs`) adds the mark and tabs of its
     own. The hook paths, the token `typ`, the shapes, the `account` and `setup` keys of an
     action's call and the codes `INTEGRATION_REFUSED` and `PICK_EXPIRED` are the contract;
   - segments (`packages/contract/src/pluginFields.ts`, `apps/api/src/modules/views/pluginViews.ts`):
     the manifest's `fields` (`PluginFields`: `code`, `contentType`, `label`, `type`, `options`)
     become read-only custom fields of each organisation that has the plugin, with `plugin` set
     (`syncPluginFields`). The plugin writes their values quietly with `fields.setPluginValues`
     (scope `fields:write`), and members filter (unless `filterable: false`), sort and save
     views by them while the
     plugin is installed there with `fields:write` (`fieldShown`); a job with `onInstall`
     runs once when an organisation installs the plugin or approves its scopes; a plugin's
     filter fields come with `group: 'plugin'` and its title in `groupLabel`. With `views:read`
     a plugin lists the shared views (`views.list`) and asks which records one matches now
     (`views.matches`). The field shape, the codes `PLUGIN_FIELD` and `VIEW_NOT_SHARED`, and
     "a personal view never matches" are the contract;
   - relations (`packages/contract/src/pluginRelations.ts`, `apps/api/src/modules/views/relationFilter.ts`):
     the manifest's `relations` name a view `<plugin>_*` its role owns and grants to
     `erxes_core_reader`, with `record_id` and a column per field. Contact lists get
     `subject.related.<plugin>.<key>.count` and, per number field, `sum`/`avg`/`min`/`max`
     (`min`/`max` per date field), or the field's own `measures`, as filter fields with
     `relation`, and a rule on one may carry `where` on `subject.<field>`; a `product` field holds
     core product ids and picks products. No related rows count 0 and total 0, so "fewer than 3" includes
     them. Core reads only a view the plugin's role owns and has granted; otherwise the rule is
     `INVALID_FILTER`. The path shape, the view's columns and the measures are the contract;
   - Module Federation: `SHARED` in `packages/ui/src/federation.ts` lists the singletons the host
     provides, and plugins declare them with `import: false`. A plugin's `./config` exports
     `CONFIG` (`name`, `path`, `icon`, `modules`, `checkAccess`, `recordSections`, `recordTypes`,
     `relationTabs`, `settings`, `integrations`, `dashboardWidgets`, `floatingWidget`), and its first module
     renders under `/<path>/*`. `settings` (`{ path, label, icon? }`, each `path` under `/<path>/`) are the
     plugin's own settings pages, drawn in its layout; core's settings sidebar links each plugin
     once, to its first page, else to its Properties, in "Plugin settings"
     (`apps/web/src/modules/settings/components/SettingsSidebar.tsx`). `integrations`
     (`TPluginIntegration`: `key`, `name`, `summary`, `icon`, `category` from erxes-ui's
     `INTEGRATION_CATEGORIES`, `countries`, `permission`, `tabs` of `{ value, label, component }`)
     are tiles in core's Settings › Integrations next to core's own, for members with
     `integrations.manage` and the tile's `permission` (one the manifest declares). Its page is
     `/settings/integrations/<name>.<key>`: core draws the header and tabs (`?tab=<value>`), each
     tab's `lazy` component its content (`apps/web/src/modules/settings/integrations/catalog.ts`).
     A tile has no connected state, and renaming its key or a tab's value breaks links to it.
     `dashboardWidgets`
     (`TDashboardWidget`: `name`, `title`, `icon`, `preview`, `size`, and the `component` core
     draws as the tile's body under its title) join core's home dashboard catalog under the
     plugin's name; a placed tile is saved as `<name>:<widget name>`
     (`apps/web/src/modules/home/dashboard/widgets/homeWidgets.tsx`), so renaming one drops it
     from members' dashboards. `floatingWidget` is one component web mounts once beside the app
     shell, on every page, and keeps across navigation, inside the providers pages get and its own
     crash boundary (`apps/web/src/modules/plugins/PluginFloatingWidgets.tsx`), in the
     bottom-right corner above the page. `recordSections` are drawn in core's customer and
     company panel (`apps/web/src/modules/plugins/PluginRecordSections.tsx`).
     For `recordTypes` (`<name>:<thing>`) core draws the side panel and the plugin fills slots:
     `Title`, `Actions`, `Detail`, `tabs`, `New`, with `detailPath(id)` under `/<path>/` as the
     expanded page (where the plugin renders erxes-ui's `RecordPage`), `contacts(id)` for
     relation tabs and `activity` for core's timeline
     (`apps/web/src/modules/plugins/PluginRecordView.tsx`). A type's `properties`
     (`TRecordProperties`: `type` as `<name>.<thing>`, `values(id)` query options, `save(id, patch)`)
     give it custom fields: core keeps their definitions (`fields.*` and `fieldGroups.*` take
     `<plugin>.<type>` while that plugin is installed, else 400 `PLUGIN_NOT_INSTALLED`), draws a
     Properties tab and their settings page at `/settings/properties/<plugin>.<type>`, which a
     plugin with settings pages links from its own settings, and the plugin keeps
     the values, checking a patch with `fields.check` (its own types only) before it saves. `relationTabs` show on the
     record types their `hosts` name (`core:customer`, `core:company`, a plugin type with
     `contacts`), and on customers and companies when they name none
     (`apps/web/src/modules/plugins/PluginRelationTabs.tsx`). web validates these and `dashboardWidgets` when it
     loads the config (`apps/web/src/modules/plugins/pluginConfig.ts`), as it does `integrations`, and drops a malformed
     entry. Core shows the config's words (the app's name, `title`s and `label`s) through
     `usePluginText` (`apps/web/src/modules/plugins/pluginText.ts`): the i18n namespace is the
     plugin's `name` and the key is the English text, which shows when no translation is there.
     The manifest's `translations` (`PluginTranslations`, `packages/contract/src/pluginTranslations.ts`)
     add words to that namespace per language, for what core shows from the manifest (the title,
     activity and timeline labels) as well as from the config. A notification is read in the
     member's language the same way when the plugin sends `data.text` (`NotificationText`,
     `packages/contract/src/pluginTranslations.ts`): the English title and body with their values left
     out, which are the keys, and the values
     (`apps/web/src/modules/notifications/notificationText.ts`). Its `title` and `body` stay ready
     to read in English, for email. An event's `notify` takes the same as `text`. A slot's props (`TRecordSlotProps`, `TRelationTabProps`) are the contract: a new
     optional slot or prop is additive, a renamed one a break. erxes-ui's `useOpenRecord` and `ContactLink` open records and drafts
     through the `RecordOpenerProvider` web mounts, so the panel's URL stays core's own. `open`'s
     `tab` (a type's tab `value`, `detail` or `activity`; anything else opens the default) and a
     record page's address key `tab` are the contract. erxes-ui's
     `RecordTimeline` and `RecordPage` render what web registers at startup
     (`apps/web/src/bootstrap.tsx`). erxes-ui's `ListFilter` draws core's filter bar itself, in
     web or outside it; its props (`TListFilterProps`, `TListFilterField`) and
     `useListFilterParams()`'s address keys (`advanced`, `searchValue`) are the contract, and its
     `member` and `tags` fields read through the `members` and `tags` query options the plugin
     passes; a field's `groupLabel` lists it under that heading. A plugin list keeps saved views by giving `ViewBar` and `ListFilter` its record type
     (`recordType="sales:deal"`): web provides the tabs and the save through `ListViewsProvider`,
     core stores the view (`views.recordType` takes `<plugin>:<record>`), and the plugin's API
     applies its filter. The prop, the address key `view` and that type's shape are the contract.
     The prop's type (`TCheckedListType`) fails the plugin's type check on a type core can't
     store (`sales:sale-return`, or one typed only as `string`), and web shows such a list with
     "All …" alone and names the type in the console.
     `DisplayMenu` and `useListDisplay` take built-in displays and the list's own
     (`TListDisplayOption`: `key`, `label`, `icon`), and keep the chosen key per `list` in the
     browser: a list's name and its displays' keys are the contract.
     The API compiles the filter with `compileFilter` from `@erxes/plugin-sdk/filter`, the
     compiler core's own lists use (`apps/api/src/modules/views/recordFilter.ts` adds core's
     custom fields, tags and lookups on top). A field type or operator it accepts is the contract,
     and so is its 400 `INVALID_FILTER`.
     Core has no GraphQL and doesn't provide `@apollo/client`, so a plugin UI that declares it
     shared with `import: false` fails to load. A library goes in `SHARED` when erxes-ui hands
     plugin code its context or store: `nuqs` (web's `NuqsAdapter`) and `react-hook-form`
     (erxes-ui's `Form`). `recharts` is not shared, since sharing it would add its 145 kB to
     every web route: erxes-ui's `ChartContainer` takes nothing from recharts, and a plugin's
     chart from its own copy sizes itself with `responsive`.
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
