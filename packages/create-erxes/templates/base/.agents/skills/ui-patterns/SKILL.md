---
name: ui-patterns
description: Make a plugin page look and behave like core's own pages (contacts, products, settings). Use when adding or changing any list, filter, form, record detail or settings page in ui/, and when reviewing one.
---

A member moves between core and plugins without noticing the seam. Core's
web app (erxes repo, branch `postgre`, `apps/web/src/modules`) is the
reference: `contacts/customers` and `products` for lists and records,
`settings/tags` for settings. This repo's `ui/src/modules/items` is the same shape,
built only from what plugins can import. When a page has to differ, say why in
a comment.

Read `ui/node_modules/erxes-ui/CATALOG.md` before writing a component: it lists
what erxes-ui already has, and the screen each kind of page copies.

## Page

- `PageContainer`, then `PageHeader`. `PageHeader.Start` holds erxes-ui's
  `AppBreadcrumb`: the app's icon and name, then each level; the last is the page.
  Don't build a breadcrumb of your own. `PageHeader.End` holds the page's one
  primary action ("Add item") and nothing else.
- erxes-ui sizes the icons inside its components (buttons, tabs, selects, badges,
  input addons, the header). Don't add `size-*` or `[&_svg]` classes to make them
  fit; if one draws wrong, fix it in erxes-ui.
- No titles, descriptions or stat cards between the header and the list. A
  dashboard is its own page.
- Several lists under one sidebar item are separate routes in the sidebar, not
  tabs on the page.

## List

- Under the header, one bar: erxes-ui's `ViewBar` (`allLabel="All items"`) with
  the list's `ListFilter` inside it, as `ui/src/modules/items/ItemsPage.tsx` has it. The
  bar shows the filter's chips, the record count and the filter button. Nothing
  else sits above the table.
- The table is erxes-ui's `RecordTable` with `RecordTableColumnDef` columns:
  the name column sticky and opening the record, a `more` column with the row
  menu, members as `MemberInline`, dates and amounts through `useFormat()`.
  Not `Table`, not `<table>`, not cards.
- Lists load by cursor (`useInfiniteQuery` and the table's load-more), and
  show `Empty` with what the list is for and the add button when there is
  nothing yet; a filtered empty list says nothing matches.
- A board (kanban) is another view of the same list: same header, same bar.
  erxes-ui's `DisplayMenu list="<plugin>-<things>"` inside the `ListFilter`
  switches table and board, and erxes-ui's `useListDisplay`, given the same list, reads the
  choice, remembered in the browser.
- Records that move through stages (tasks by status) can also show as erxes-ui's
  `RecordList`: rows grouped under sticky headers that fold away, with a
  checkbox each and its `RecordList.useSelection` hook for the bulk command bar.
  Give `DisplayMenu` and `useListDisplay` the same `displays`, such as
  `['list', 'board', 'table']`; the first shows until the member picks another.
- A display core doesn't have, such as a cards grid or a chart, is the list's
  own entry in those `displays`, an erxes-ui `TListDisplayOption`:
  `[{ key: 'cards', label: t('cards', 'Cards'), icon: IconLayoutGrid }, 'table']`.
  It shows in the Display menu beside the built-in ones and is remembered the
  same way; `useListDisplay` returns `'cards'` and the page draws the cards
  under the same header and bar. A display only some members may see is left
  out of `displays` for the others.

## Filter

erxes-ui's `ListFilter` is core's own filter bar; `ui/src/modules/items/ItemsPage.tsx`
gives it its fields, and `FILTER_FIELDS` in `api/src/modules/items/items.ts` applies them.

- Give it every field the list can be narrowed by: `{ path: 'subject.<column>',
  label, type, options?, icon? }`, type `text`, `number`, `date`, `boolean`,
  `select` (with `options`) or `member`. The menu (`F`) offers search, each
  field and the advanced filter; each condition is a chip.
- The conditions (core's `ConditionGroup`, rules on those paths; a `member`
  rule's `me` is the member asking) and the search live in the address.
  `useListFilterParams()` gives them to the list's query as `filter` (JSON) and
  `search`; the API parses `filter` with `FilterParam` and compiles it with
  `compileFilter` from `@erxes/plugin-sdk/filter`, which refuses a path it has
  no column for.
- Never: a search box, toggle buttons ("Mine", "Archived"), status tabs, a
  ToggleGroup for table, board, cards or chart, or a row of pickers above the
  table. Each of those is a field in the menu or an entry in the Display menu.
- Saved views (the tabs core's contacts lists have) come from the record type:
  `<ViewBar recordType="<plugin>:<thing>" allLabel>` and the same `recordType`
  on `ListFilter`. Core stores the member's views of that list and draws their
  tabs and the filter's save; opening one puts its conditions and search in the
  address, so the API applies it through the `filter` and `search` it already gets.

## Records in core's side panel

- The plugin's records open in core's own side panel, exactly as a customer
  does. Core draws the panel (header, Back, expand, close, tabs, resizing,
  drafts, the address `?panel=/detail/<type>/<id>`); the plugin fills slots.
  Register each type in `CONFIG.recordTypes` (`ui/src/config.tsx`):
  `contentType: '<plugin>:<thing>'`, `title`, `icon`, `detailPath(id)`, and the
  slots `Title` (the header's title), `Actions` (its menu), `Detail` (the
  Detail tab), `tabs` (more tabs, after Detail or after Activity) and `New`
  (the draft). `contacts`, given an id, gives the record's customers and companies as
  query options, so other plugins' relation tabs show on it; `activity` names
  a manifest `timelines` type for core's Activity tab.
- Every record type has an Activity tab, as customers do: declare the type in
  the manifest's `timelines`, set `activity`, and publish what happens to the
  record (created, changed fields, moved, assigned) as events with
  core's core_publish_event SQL function in the change's transaction: a `summary`, a flat
  payload, `entityType` (that `timelines` type) and `entityId` (the record's
  id). Core puts each on the record's Activity tab, styled by the manifest's
  `activityTypes`; `activities.create` is only for entries that are not
  events. Notes come from core's tab itself. The panel opens on Detail; the record's own page opens on Activity, with
  Detail beside it.
- Each slot gets `contentType` and `contentId` and reads the record itself; the
  slots share one query (`ui/src/modules/items/ItemPanel.tsx`). The Detail
  tab is `PanelSection`s of `PanelField` rows. Never an erxes-ui `Sheet`, a
  header or tabs of the plugin's own, or a `?item=` param.
- Open a record with `useOpenRecord().open({ contentType, contentId })` and a
  draft with `openNew(contentType, defaults)`. `tab` opens the record on one of
  its tabs, a `tabs` entry's `value`, `detail` or `activity`:
  `open({ contentType: 'hr:employee', contentId, tab: 'leave' })` from a leave
  list or a dashboard tile. A tab the record lacks opens its default, and
  expanding the panel keeps the tab. `detailPath(id)` is a route of
  the plugin's that renders `<RecordPage contentType contentId />`
  (`ui/src/__Pascal__.tsx`): the expanded record.
- A plugin whose records belong to customers or companies lists them on those
  customers' and companies' panels with `CONFIG.relationTabs`:
  `{ name, title, icon, hosts?, component }`. The component gets the host record
  and its `customerIds` and `companyIds`; a record clicked there opens with
  `useOpenRecord().open` on top in the same panel, and Back returns. Another
  plugin's record (an order, a task) shows the tab only when `hosts` names its
  type and the type gives `contacts`: name it only when a member working on that
  record needs the list, never by default.

## Forms

- A new record, and any form of a few fields, is the type's `New` in core's
  side panel, under core's "New item" header: `PanelFormLayout` with one
  `PanelFormRow` per field (icon and label left, control right), then Cancel
  and Save at the bottom. Nothing saves until Save; a field's error shows
  under that field. Call `onCreated(id)` after Save, and the record takes the
  draft's place.
- `PanelFormRow` takes `htmlFor` (the control's id, so the label focuses it
  and toggles a switch) and `hint` (a line under the control). Long labels wrap
  to two lines; never draw a row of your own with `grid-cols-field`.
- A form gets its own page only when it has several sections or a live
  preview (a product editor, a page builder). That page is laid out like a
  settings page (below), not with the side panel's rows: cards with a title
  and a line about them, labels above the fields in responsive grids, one
  form, and the sticky Discard / Save bar at the bottom. A live preview or a
  summary sits in a narrower column beside the cards (`lg:grid-cols-[1fr_20rem]`);
  a body editor (rich text, blocks) takes a card's full width.
- The side panel's rows (`PanelFormRow`, `PanelField`) are only for the side
  panel: a record's `New` and `Detail`.
- `Dialog` is for confirming (`useConfirm`) and nothing else. Never a form in
  a dialog.

## Settings

Settings are not records, so they don't use the side panel's rows. A settings
page looks like core's Settings › Profile (`apps/web/src/modules/settings/profile`):

- `PageContainer`, `PageHeader` with the breadcrumb, then a `ScrollArea` with
  one centered column, `mx-auto w-full max-w-3xl flex flex-col gap-4 p-6`.
- The fields come in cards, one per topic: `section` with
  `rounded-lg border bg-background p-5 space-y-4`, a title
  (`text-base font-semibold`) and one line under it saying what the card is
  for (`text-sm text-muted-foreground`).
- Inside a card, each field is erxes-ui's `Form.Item` with `Form.Label` above
  the control and `Form.Message` under it, laid in `grid grid-cols-1 gap-4
  sm:grid-cols-2` (or `sm:grid-cols-3` for short fields). On/off settings are a
  `Switch` with its label and a hint beside it.
- One form for the page (react-hook-form with a zod schema), saved by a
  sticky bar at the bottom: `sticky bottom-0 flex justify-end gap-2 border-t
  bg-background/95 py-3 backdrop-blur` with Discard (ghost, off until
  something changed) and Save. Not a Save per card, and not Save in the header.
- A settings list (stores, pipelines, payment methods) is still a list:
  `RecordTable`, and each entry opens in core's side panel like a record.
- Several settings pages are separate routes in the plugin's settings
  sidebar, not tabs.

## Record detail

- Clicking a row's name opens the record in core's side panel. Its title is
  the record's name; the panel shows its fields as the same rows (icon and
  label left, value right), grouped under `PanelSection` headings.
- Values edit in place where core's do: `PanelField` with erxes-ui's
  `RecordTableInlineCell` (click, Enter saves, Escape cancels) or
  `SelectMember.InlineCell`. Related lists (lines, activity, history) go below
  the fields or in the panel's tabs.
- The expand button opens the record's own page, `detailPath(id)`: the same
  panel at full size, Detail beside the other tabs.

## Related records

- A customer or company on a record (a deal's customer, an order's buyer) is
  always erxes-ui's `ContactLink`, given `contacts={contactQueries}` from
  `@erxes/core-contract/client`: its name, and a click opens it in core's side
  panel beside the page. Never its id, a name copied into the plugin's table,
  or a link to a URL. `useOpenRecord()` opens one from your own control.
- In the record's panel the field is erxes-ui's `ContactRelationInput` in a
  `PanelField cell={false}`, given `contacts={contactQueries}` and
  `contactSearch={contactSearchQueries}`: the chip, then a small "Add customer"
  button, sized like core's. `multiple={false}` when the record keeps one.
- A plugin's records of a customer or company are a relation tab on its panel
  (`relationTabs`, above). `recordSections` still draws a section in the
  customer's Detail tab, for a summary that belongs beside its fields.

## Look

- erxes-ui components and tokens only: no raw colours, inline styles or
  hand-made buttons, badges or inputs. Text in rows is `text-xs`, labels
  `font-medium text-accent-foreground`, as core's panel has them.
- Icons are `@tabler/icons-react`, one per field, the same icon for a field
  everywhere it shows (column header, filter menu, form row).
- Text through `t(key, 'English default')`.

## Before calling it done

Open the page beside core's contacts list in the browser (the `verify` skill
starts both). Header, filter bar, table, side panel and empty state should
read as the same product. Check: a filter survives reload; a record open in
the panel survives reload and expands to its page; a new record's draft saves
into the record; no dialog holds a form; no control sits above the table
besides the bar.
