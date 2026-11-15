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

## Page

- `PageContainer`, then `PageHeader`. `PageHeader.Start` holds the breadcrumb:
  the app's icon and name, then each level, as core's `AppBreadcrumb` draws it
  (ghost buttons, last one not a link). `PageHeader.End` holds the page's one
  primary action ("Add item") and nothing else.
- No titles, descriptions or stat cards between the header and the list. A
  dashboard is its own page.
- Several lists under one sidebar item are separate routes in the sidebar, not
  tabs on the page.

## List

- Under the header, one bar: the filter (below), the record count, and any
  view toggle at its right end. Nothing else sits above the table.
- The table is erxes-ui's `RecordTable` with `RecordTableColumnDef` columns:
  the name column sticky and opening the record, a `more` column with the row
  menu, members as `MemberInline`, dates and amounts through `useFormat()`.
  Not `Table`, not `<table>`, not cards.
- Lists load by cursor (`useInfiniteQuery` and the table's load-more), and
  show `Empty` with what the list is for and the add button when there is
  nothing yet; a filtered empty list says nothing matches.
- A board (kanban) is another view of the same list: same header, same filter
  bar, a toggle at the bar's right end.
- Records that move through stages (tasks by status) can also show as erxes-ui's
  `RecordList`: rows grouped under sticky headers that fold away, with a
  checkbox each and its `RecordList.useSelection` hook for the bulk command bar.
  It is another view, beside the table and the board.

## Filter

`ui/src/modules/items/ItemsFilter.tsx` is the pattern; copy it.

- One erxes-ui `Filter` per list. The filter button opens a menu: search
  first, then every field the list can be narrowed by, each with its icon.
- An applied filter is a chip in the bar: field name, value (click reopens
  that field's menu), ✕ to clear.
- Every filter lives in the address through nuqs (search is `searchValue`), so
  links, reloads and back keep it. No `useState` or `useSearchParams` for
  filters.
- Never: a search box, toggle buttons ("Mine", "Archived"), status tabs or a
  row of pickers above the table. Each of those is a field in the menu.

## Forms

- A new record, and any form of a few fields, opens in the side panel: an
  erxes-ui `Sheet` (`ui/src/modules/items/ItemSheet.tsx`), one row per field with its
  icon and label in the left column (`grid-cols-field`) and the control on the
  right, then Cancel and Save at the bottom. Nothing saves until Save; a
  field's error shows under that field.
- The panel's state is in the address (`?item=new`, `?item=<id>`), so it
  survives a reload and can be linked.
- A form gets its own page only when it has several sections or a live
  preview (a product editor, a page builder). That page keeps the same
  header and breadcrumb, puts sections in one column of the same rows, and
  has Save in `PageHeader.End`.
- `Dialog` is for confirming (`useConfirm`) and nothing else. Never a form in
  a dialog.

## Record detail

- Clicking a row opens the record in the side panel, at the same `?item=<id>`.
  Its title is the record's name; the panel shows its fields as the same rows
  (icon and label left, value right), grouped under small section headings.
- Values edit in place where core's do: erxes-ui's `RecordTableInlineCell`
  (click, Enter saves, Escape cancels) or `SelectMember.InlineCell`. Related
  lists (lines, activity, history) go below the fields or in the panel's tabs.
- A record big enough to need a page opens at `/<plugin>/<things>/:id` with
  the breadcrumb ending in its name and the same rows and sections.

## Related records

- A customer or company on a record (a deal's customer, an order's buyer) is
  always erxes-ui's `ContactLink`, given `contacts={contactQueries}` from
  `@erxes/core-contract/client`: its name, and a click opens it in core's side
  panel beside the page. Never its id, a name copied into the plugin's table,
  or a link to a URL. erxes-ui's `useOpenRecord` hook opens one from your own
  control.
- A plugin whose records belong to customers or companies adds a section to
  their panel: `recordSections` in `CONFIG` (`contentType: 'core:customer'`, a
  title, an icon, a component given `contentId`) listing that contact's
  records, as old erxes's sidebar did.

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
read as the same product. Check: a filter survives reload; a form in the
panel survives reload; no dialog holds a form; no control sits above the
table besides the filter bar.
