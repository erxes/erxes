# `sales_ui` Plugin Guide

## Identity

- **Plugin:** `sales`
- **Project:** `sales_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/sales_ui`
- **Last synchronized:** `2026-11-22`

## Scope

### Owns

- Sales boards, pipelines, stages, deals, deal detail UI, deal products,
  payments, POS settings, POS management screens, and sales Module Federation
  route/widget registration.

### Does not own

- Sales persistence or GraphQL resolvers; those live in `sales_api`.
- Backend POS persistence, POS client runtime behavior, core property
  definitions, shared UI primitives, core settings infrastructure, or other
  plugin routes.

## Current Capabilities

- Deals and POS orders export to CSV through the shared `ui-modules`
  `Export` button: the deals action bar exports the current pipeline, stage
  and URL filters (`DealsExport`), the deals list command bar exports the
  selected rows, and the POS orders page exports the current order filters.
  Buttons render only with `dealsExportManage` / `posOrdersExportManage`.
- Pipeline Product config edits include products, include product tags, and exclude product tags; create/edit and detail documents carry all three arrays. Category, tag and explicit-product includes form a union; all exclusions override that union, even explicit products. Category/tag descendants are included by Core. Pipeline categories now scope products as well as prioritizing them. Pipeline edits evict `productsMain` and `productsTotalCount` so cached deal choosers reload the changed scope.

- The pipeline product filter uses a two-column layout whose rows pair category/exclude category, include tag/exclude tag, and include products/exclude products. The pipeline filter collapses to category and More on one row, the collapse button following the grid, and hidden fields retain their saved values. The POS product group form (`AddGroupForm`) always shows every field in an Include group and an Exclude group: POS settings tabs have no More options toggles.
- POS product-group settings edit and reload include products (`productIds`), include tags (`tagIds`), and exclude tags (`excludeTagIds`). React Hook Form with Zod validates selections. Saves project all six filter arrays into `GroupInput` and refetch the current POS groups.
- Product filters use OR between category/tag/product includes; all category/tag/product exclusions always win, including against explicit product ids. Category/tag filters include descendants. Product tag pickers use public `ui-modules` `SelectTags` scoped to `core:product`; English/Mongolian explanatory labels live in `modules/productFilters`.
- POS orders and covers open in the app's side panel (no sheets): the
  Orders and Items pages' bill number cells and row actions, and the Covers
  page's POS name cell and Edit action, call `openRecord`. An Items row's
  `_id` is `<order _id>_<item _id>` (set by `posOrderRecords`) and order ids
  may contain `_`, so the order id comes from `toPosItemOrderId`, which strips
  the item suffix; the automation
  history link and the API's automation `link` open the Orders page with the
  panel's `panel` query key. The old sheets' links are rewritten to the panel
  by `useOpenPosPanelFromQuery` (`modules/pos/hooks`): Orders and POS Loyalty
  `pos_order_id`, Covers `pos_cover_id`, and Items `pos_order_id`
  (`<order>_<item>`: both ids may contain `_`, even as their first character,
  and item ids have no fixed length, as the POS client may send its own, so
  `useResolvePosItemOrderId` tries each `_` split from `getPosItemRowIdSplits`
  and keeps the order whose items hold the rest; it never splits by position
  or at the first `_`). A GraphQL error marks a split as not the order; a
  network or parse failure without a match throws, so the legacy URL is kept
  and a reload retries instead of opening the composite id. Both
  detail views follow operation's layout (`PosPanelFields` / `PosPanelAside`):
  one column, two from the panel's `@3xl` width with the aside capped at
  `max-w-3xl`. An order shows its customer (opens the customer / company panel stacked; a
  `user` customer is text only), broker, POS, date, status, bill id, Ebarimt
  date, accounting transaction link (accounting enabled), accounting
  response and Erkhet info (wrapped in full like the cover's closing note, never
  truncated), deal, every item (`DealCardProducts` with
  `maxVisible`); its payments form is the panel's `payments` tab
  (`PosOrderPanelPayments`; `usePosOrderPayments`: sums must equal
  `totalAmount`, shown as "Total Amount" above the form as the old sheet did,
  `return` orders are locked (inputs and Save disabled under a
  warning; `complete` orders stay editable, as the backend allows), saving refetches
  `salesPosOrderDetail` and evicts cached `posOrderRecords`,
  `posOrdersSummary` and `posOrdersGroupSummary` (JSON, not normalized), so
  the Items list, the Orders payment-type columns and the Summary report
  read again without a named refetch warning on other pages; list rows of
  `posOrders` update through the returned `PosOrder`). Only the order title
  reads `cache-and-network`; the detail view reads `cache-first`, so tab
  switches send no request. Lists ignore the `panel` query key, so opening or
  closing the panel does not refetch them. A cover shows its dates, user,
  POS, status, created/modified times and POS closing note as read-only
  fields, then a Payments section (each paid type's `paidSummary` rows as
  `DealCardProducts` with `icon={IconCreditCard}`: stored `kind` as the name,
  `value × kindOfVal`, `amount`, never derived or hard-coded per paid type, as
  the old sheet's Kind / Kind of val / Value / Amount columns; missing
  `value` / `kindOfVal` stay `null`, never `0`, and `DealCardProducts` then
  omits the quantity × price line, as compact rows hide absent meta; the
  total under them)
  and the Sales note form; its delete action
  closes the panel. Activity shows only the
  record's logs (`showInternalNotes={false}`, no note box), as POS had no
  notes before the panel.
- The order and cover panels' full view is a page (`src/pages/PosRecordDetailPage.tsx`): `detailPath` (`getPosOrderDetailPath` / `getPosCoverDetailPath` in `modules/pos/constants/posPanel.ts`) keeps the POS the panel was opened under (`/sales/pos/<posId>/orders/<id>`, `/sales/pos/<posId>/covers/<id>`) and falls back to `/sales/pos/orders/<id>` / `/sales/pos/covers/<id>` elsewhere (contacts, loyalty, automations); the static `orders`, `covers` and `loyalty` segments are never read as a POS id. Like operation's `TaskDetailPage`, each page renders `RecordSidePanel expanded expandedMode="page" expandable={false}` with a POS › POS name › record crumb (the record as plain `Breadcrumb.Page` text, capped at `max-w-md` and truncated) and `RecordSidePanel.Tabs` headed by the `common` `side-panel` `detail` label with its icon rather than the record title; like the deal page, `PosRecordPage` provides a memoized `SidePanelNavigatorContext` navigator whose `close` / `back` replace the page with the POS's orders or covers list (`/sales/pos` without a POS), so the cover delete action leaves a deleted cover's page: the order with Detail beside Payments (default; the form spans the detail grid and `PosOrderForm` lays its payment inputs in two columns from `@3xl/record-panel`, one column in a narrow panel) and Activity, the cover with Detail beside Activity and its delete action in the header. Detail wraps the panel view in its own `@container/record-panel`, so the 24rem column keeps the one-column layout; loading, errors and missing records use the panel's `PosPanelDetailLayout` states.
- The cover panel (`widgets/record-panel/PosCoverPanel.tsx`) displays the POS client's root `description` as a read-only `PanelField`
  (`closing-note`, "Closing note" / "Хаалтын тэмдэглэл", wrapped multi-line text; `components/CoverDescription.tsx` is no longer used by the panel) and edits
  Sales-owned `note` through `posCoversEdit`. The note form loads saved text,
  allows clearing it, gives save/error feedback, and refreshes active cover
  detail/list queries after saving.
- Cover terminal history is displayed only in each paid type card's `paidType` tip
  (`components/CoverPaidType.tsx`), with request times and formatted JSON or original
  text from `terminalResults` (`components/CoverTerminalResults.tsx`).
  The tip uses the public `Popover` so it stays open while a response textarea
  is focused for selection/copy. Hover, keyboard focus, or click opens it;
  Escape or clicking outside closes it. Response fields are read-only, styled
  muted, and allow Ctrl/Cmd+A/C without table shortcuts intercepting them.
  Cells without results retain their ordinary text display. There is no separate
  terminal-history section in the cover panel.
  Created/modified times and payment totals remain visible above the details.
  The general cover description and Sales note remain separate.
  Cover labels, feedback, empty/pending states, and accessible response labels
  use the `sales` namespace in the gateway's `locales/{en,mn}/sales.json`;
  request numbers and paidType labels use translation interpolation. Original
  bank responses and user-authored notes are never translated.
- Papa Logistic delivery (`modules/pos/papa`). The POS Delivery tab adds
  `PapaSettings` under the existing delivery form: `PapaAccountForm` saves the
  workspace's Papa credentials (`salesPapaConfigSave`; the secret is write-only,
  shown as saved through `hasSecret`) and `PapaPosForm` saves the POS's
  `deliveryConfig.papa` (`enabled`, pickup `addressId` with an inline
  `PapaAddressForm` that registers a new Papa address, `carTypeGroups`
  `car` / `light`, `categoryId`, `conditionId`, default `size`, and
  `stageIds`: the deal stage per delivery step `sent` / `inTransit` /
  `delivered` / `cancelled` / `failed`, picked by `PapaDealStages` from the
  delivery pipeline (`deliveryConfig.pipelineId`), each clearable). The POS order
  panel has a Delivery tab (`PapaDeliveryPanel`, record panel tab `delivery`):
  the full-page order view (`PosRecordDetailPage`) adds the same
  `delivery` tab after Payments; for `type: 'delivery'` orders it quotes (district, address, coordinates,
  size), sends (receiver phone normalized to 8 digits, driver note, receiver
  pays), shows status, price, pickup code, delivery code, driver and vehicle,
  approves the driver's photo, marks a started delivery as delivered
  (confirm dialog), refreshes and cancels. The account form shows staff
  phone/email/name fields while `salesPapaConfig.staffId` is empty, so saving
  can create the Papa staff member. It polls every 15s
  while the delivery can still change (`PAPA_ACTIVE_STATUSES`).
  `PapaWalletBalance` (`usePapaWallet`, `salesPapaWallet`) shows the
  business's Papa wallet on the account card and above Send, warning when it
  cannot cover the price (`isPapaWalletShort`): Papa takes the fee when the
  delivery ends. The Delivery tab shows the Papa fee as Paid / Unpaid for
  `END` and `COMPLETED`; an unpaid `END` delivery offers "Pay Papa fee from
  wallet" and "Paid outside Papa" (`posOrderPapaPay`, confirm dialogs,
  refetching the delivery and the wallet). It is the store's fee to Papa,
  never the customer's payment. When the delivery deal could not be moved,
  the tab shows `papaDeal.error` as a warning.
- POS Summary displays order aggregates from `posOrdersGroupSummary`, with
  filters, payment columns, and totals. Its table has no row selection or
  create/delete actions; summary rows are report groups, not stored records.
- The POS settings list (`/sales/settings/pos`, `PosSettingsPage`) switches
  between cards (`PosCardGrid`; the full POS name wraps, never truncated, and
  the card grows to fit it) and a table (`PosRecordTable`) with a
  `ToggleGroup` in the header, like CMS websites; the choice persists per
  browser in `posListViewAtom` (`localStorage` `salesPosListView`, default
  `card`). Table rows show logo, name (opens the POS panel), online
  status, description, branch, department, admin and cashier counts, creator
  and created date; the row menu edits (opens the POS panel) or deletes
  (confirm, toast; `usePosRemove` evicts `posList`). A card click also opens
  the POS panel. Both views share `usePosList` and `PosEmptyState`; every
  opener goes through `useOpenPosSettings` (`hooks/useOpenPosSettings.ts`).
- A saved POS is a side panel record (`sales:pos`, `POS_CONTENT_TYPE`), like
  a contact: its `recordPanels` entry (`properties: false`, `detailPath`
  `getPosSettingsPath`) adds every `POS_SETTINGS_TABS` entry but General
  information as a tab `after: 'detail'`, so the panel reads Detail (General
  information) · Permission · Customer registration · Product & Service ·
  Payments · Delivery · Sync Card · Slots · Brand Color & Logo · Screen ·
  Automations · Activity, the overflow behind core's More menu. `RecordPanel`
  draws `title` (`PosSettingsTitle`, the POS name), `detail` / `tab`
  (`PosSettingsTabContent compact`) and `activity` (`PosPanelActivity`).
  `PosSettingsTabContent` (`pos-edit/PosSettingsPanel.tsx`) owns the tab's
  save action state and renders `MainContent`; `compact` drops the `h2` and
  the `max-w-4xl` column and narrows the padding. Other plugins' relation
  tabs are dynamic, so they show only on the expanded page.
- POS settings forms open in the app side panel as drafts (`openNewRecord`;
  the Sync Card, mapping, Add field and Edit layout drafts pass
  `{ stack: true }`, so opened from the POS panel they show Back and return
  to its tab, like a contact's New ticket; `view: 'new'`, titled by `view: 'title'`; registered in `config.tsx`
  `recordPanels` with `properties: false, draftTitle: true` and drawn by
  `POS_FORM_PANELS` in `widgets/record-panel/RecordPanel.tsx`), laid out with
  `ui-modules` `PanelFormLayout` / `PanelFormRow` like contact drafts, every
  field borderless and shaded on hover: text inputs take
  `POS_PANEL_INPUT_CLASS_NAME`, and `RecordPanel` wraps each form in
  `POS_PANEL_FIELDS_CLASS_NAME`, which drops the shadow border of inputs,
  selects and comboboxes (`[role=combobox]`) as content's panels do:
  Create POS (`sales:pos.create`, `PosCreatePanel`; Save replaces the draft
  with the new POS's panel), Sync Card config (`sales:pos.cardConfig`, `PosCardConfigPanel`,
  draft `{ posId, configKey }`) and product & category mapping
  (`sales:pos.categoryMapping`, `PosCategoryMappingPanel`, draft
  `{ posId, mappingId }`), plus the customer form's Add field
  (`sales:pos.customerField`, `PosCustomerFieldPanel`, draft `{ posId }`)
  and Edit layout (`sales:pos.customerLayout`, `PosCustomerLayoutPanel`,
  draft `{ posId, layout }`).
  The first three panels save on their own Save through
  `posEdit` (`cardsConfig` keyed by unique title, or `catProdMappings`) and
  refetch `salesPosSettingsDetail`; the tabs list straight from `posDetail`
  and delete with a confirm, saving at once. The Products tab form no longer
  holds `catProdMappings` and resets with `keepDirtyValues`, so a panel save
  keeps its unsaved edits; the Sync Card tab has no save action. Draft
  defaults live only in memory: after a reload the panel shows
  `PosPanelMissing`. Create drafts have no expand button. Editing a sync
  card config or a mapping does: their `recordPanels` entries set core's
  `draftPath` (`getPosEditRecordPath`), which returns
  `/sales/settings/pos/:id/edit/:recordType/:recordKey` (`card-config` /
  `category-mapping`, the URL-encoded `configKey` / `mappingId`) only when
  the draft carries that key, and null while creating.
  `PosEditRecordPage` rebuilds the draft from the URL (a scoped
  `SidePanelDraftContext`, and `sidePanelDraftState` so minimize reopens the
  panel even after a reload), draws the same `RecordPanel` `new` view in a
  left `md:w-96` column under a POS › title crumb with
  `RecordPageMinimize`, and its `SidePanelNavigatorContext` sends Cancel,
  Save and minimize back to the POS page tab (`?tab=sync|product`).
  Values typed in the panel before expanding are not carried over.
  `PosCreate` (sheet, `usePosCreateForm`) remains only for
  callers that pick the new POS (automation template requirement).
- The POS page (`/sales/settings/pos/:id`, `pages/PosEditPage.tsx`) is the
  panel's expanded view, built like the POS order page: a
  `SidePanelNavigatorContext` (record `sales:pos`, `listPath`
  `/sales/settings/pos`, so `PageHeader.End` adds minimize; close and
  delete return to the list), `RecordSidePanel expanded expandedMode="page"`,
  a POS › name crumb with Remove POS, and `RecordSidePanel.Tabs` laid out
  like a contact's page: General information (`compact`) is the resizable
  overview column on the left, and the other `POS_SETTINGS_TABS`, other
  plugins' relation tabs and Activity are horizontal tabs on the right,
  selected by the `tab` query (default `permission`). Core's expand button
  carries no tab, so the panel's title view (`PosPanelHeaderTitle`) keeps
  `{ posId, tab }` in `posPanelTabAtom` (`states/posPanelTab.ts`), and the
  page, without a `tab` query, opens once on that tab (`plugin:<value>`
  mapped to the page's value, Detail to the default) and clears the atom. Without
  `overviewTab`, an expanded `RecordSidePanel.Tabs` draws a vertical tab
  column that looks like the old settings sidebar. Each tab is
  `PosSettingsTabContent`, whose `MainContent` draws the tab as a centered column in an erxes-ui `ScrollArea` (thin scrollbar)
  (`max-w-3xl` on every form tab, Product & Service included) with no title
  (the tab bar names it) and no `InfoCard` frames (`SourceAutomations` takes
  `framed={false}` here; pipeline settings keep its card). A tab with several
  parts splits them with `PosSettingsSection` (`pos-edit/PosSettingsSection.tsx`:
  an `h3` title, optional muted description, `separated` adds a top rule), as Product &
  Service does; every field shows at once, with no More options toggle
  (General information is three `PosFieldList` groups of panel rows: name,
  branch, department; the Online POS switch row whose rows below swap, with a short fade-in,
  between Allow types (offline) and Allow branches plus POS domain (online);
  then the advanced fields).
  The tab's `PosSaveAction` (`onSaveActionChange`) sits in a full-width
  footer pinned to the bottom of the tab, outside the scroll area, with the
  button at the right edge, so it stays in one place across tabs, Slots
  included: Save Changes always shown on form tabs, disabled until the
  form is dirty, with an "Unsaved changes" badge while it is. Every value in
  the deps of the effect that publishes the save action must be stable
  (`useCallback`/`useMemo`, as `usePosSlots`' `saveSlots` is): a handler
  recreated each render re-runs the effect, which re-renders the tab in a
  loop and starves router transitions, so the URL changes while the page
  stays on the old tab. `FULL_HEIGHT_TABS`
  (Slots) keep the footer but fill the full width and height
  without scrolling. `MainContent` is an `@container`, and the tab forms
  use `@2xl:` container breakpoints, never viewport `md:`, so they stack to
  one column in the panel (at most 600px) and split on the page.
- The Slots tab (`components/slots/Slots.tsx`, `modules/pos/slot`) is a floor
  plan editor: `SlotEditor` holds the layout in local state (`SlotNode`, an
  `@xyflow/react` node whose `width`/`height`/`position`/`zIndex` are the
  slot's box) beside an inspector column, `SlotList` until a slot is selected,
  then `SlotInspector` (name, colour, size, position, rotation, radius, layer;
  edits apply live). `SlotCanvas` keeps slots inside the 1000×1000 floor
  (`nodeExtent`, dashed `ViewportPortal` floor), snaps to 20px, resizes with
  `NodeResizer`, deletes with Backspace/Delete, and has an Add/Arrange
  toolbar and zoom/fit controls. Nothing saves until the tab's Save Changes,
  which is dirty when the layout's `posSlotBulkUpdate` input
  (`slot/slotNodes.ts` `toSlotInputs`) differs from the saved one; the save
  sends every slot (the API deletes missing ones) and refetches `posSlots`.
  `toSlotInputs` writes the `option` keys the POS client reads (`width`,
  `height`, `top`, `left`, `rotateAngle`, `borderRadius`, `zIndex`) plus
  `color`, spreading the saved `option` so keys such as `isShape` survive.
  New slots get a `nanoid` `_id` and the next free numeric `code`; an
  existing slot's `code` is read-only because orders reference it. The tabs
  come from `POS_SETTINGS_TABS` (`modules/pos/constants`: value, English
  `label`, `labelKey` in `sales.json`, icon) in General, Sales, Display,
  Plugins order; the Sales settings sidebar lists no POS tabs.
- POS product settings independently persist `isShowRemainder` for display and
  `isCheckRemainder` for preventing negative stock, with category exclusions.
- The Product & Service tab (`products/Products.tsx`) orders its sections as
  Initial product categories, Product groups, Kiosk exclusions, Remainder,
  Service charge, then Product & category mapping; all sit inside one form
  while product groups keep their own save state. Product groups split into
  an Include group above an Exclude group of panel rows (categories, tags,
  products), never side by side. Save
  remainder and the check-exclusion categories nest under Check remainder
  (the backend reads those categories only then); hidden values are kept.
- POS settings tabs use the side panel's look, like a contact's Detail: no
  bordered cards or inputs. `MainContent` adds `POS_PANEL_FIELDS_CLASS_NAME`
  (borderless inputs, selects and comboboxes, shaded on hover); text inputs
  take `POS_PANEL_INPUT_CLASS_NAME`, textareas
  `POS_PANEL_TEXTAREA_CLASS_NAME` (`constants/posPanel.ts`, shared with the
  create panel). Plugin-local building blocks in `pos-edit/`:
  `PosPanelRow` / `PosFieldRow` / `PosFieldList` (`PosFieldRow.tsx`:
  `PosPanelRow` is a 9rem single-line, truncated icon and label column (full
  label as `title`) then the value, `px-2` like the section headers and
  switch rows so everything shares one left edge; it replaces ui-modules
  `PanelFormRow` in the tabs, whose narrower label column wrapped long
  labels and drew a second icon inside empty inputs (draft panels keep
  `PanelFormRow`). `PosFieldRow` wraps it in a `Form.Item` with `required`,
  `description` and `after` under the value (`POS_VALUE_OFFSET_CLASS_NAME`)
  and `asControl={false}` when the caller places `Form.Control` itself),
  `PosSettingsSection` (title, description, optional `actions`, `separated`),
  `PosSwitchRow`/`PosSwitchList` (borderless label + description + `Switch`
  rows, shaded on hover, for any boolean form field; a row's children show
  in a muted rounded box only while it is on), and `PosItemList` (borderless
  hover rows with icon-only edit/delete buttons and a ghost add button
  below, or a muted empty state holding that button). Shared sales field
  components from `@/payments` (`PaymentIdsField`, `OtherPaymentsField`)
  keep their own look, as pipeline settings use them too.
  Single-or-multiple select values become id arrays through `toIds`
  (`modules/pos/utils/toIds.ts`), never an inline nested ternary. Every boolean setting on Product & Service,
  Permission, Payments (coupons), Screen and Customer uses `PosSwitchRow`;
  mappings and sync cards use `PosItemList`.
- Tab structure: Permission has Admins and Cashiers sections, both drawn by
  one `RolePermissions` (`kind` admin or cashier: members, then switch rows;
  cashier adds See reports and Create customers; Direct discount nests its
  limit). Payments has Payment methods
  (shared `@/payments` fields, unchanged), Loyalty (earn campaign, earn tier)
  and Coupons. Delivery has Deal stage (board, pipeline, stage, location
  field) and Deal users (watched, assigned, delivery product). Appearance has
  Logos, Main colors and Infos. Screen shows the kitchen and waiting screens
  as switch cards with their settings nested, then a Print section. Sync
  lists card configs. Customer starts with its two switch rows, then a Form
  fields section whose actions hold Add field and Edit layout.
- English/Mongolian section descriptions and sentence-case field labels for
  these tabs live in `hooks/usePosSettingsLabels.ts` as one table of
  `[en, mn]` pairs (the gateway locales only hold the older upper-case keys);
  add new tab copy there as a pair, never as a second per-language block.
- The sync card and mapping panels share `renderPosPanelStatus`
  (`components/PosPanelMissing.tsx`: missing draft, loading, load error) and
  `usePosPanelSave` (`hooks/usePosPanelSave.ts`: `posEdit`, refetch
  `salesPosSettingsDetail`, toasts, then back/close).

- Runs as the sales Module Federation remote.
- Development Rspack serving ignores generated dependency/cache/output folders
  to keep local file watchers bounded.
- The deals list's bulk bar opens an "Actions" menu. Duplicate and Archive ask
  for confirmation with the count when more than one deal is selected.
- Pipeline create/edit supports general settings, stages, product
  configuration, and grouped selection of Core `sales:deal` properties.
- "Score earn configuration" (`deals/loyaltyRules`, button beside Add
  pipeline, dialog state in `loyaltyRulesDialogOpenAtom`) edits the whole
  `salesLoyaltyRules` list at once in three groups — every board and every
  pipeline of a board by probability, specific stages of one pipeline by id —
  the campaign field is loyalty's picker (`RecordPickerWidget` for
  `loyalty:score.campaigns`, with New and Edit; absent without loyalty),
  validated per row (zod, translated issue keys), warning where a row replaces
  a wider rule of its campaign and when active deal automations already give
  points in the same campaigns (`useLoyaltyRuleNotes`), and on rows whose
  campaign is not active (`SalesScoreCampaignOptions`; only active campaigns
  give points). Each stage of the
  pipeline being edited shows what the saved rules make of it
  (`PipelineStageLoyaltyBadge`, query `SalesStageLoyaltyPoints`, only asked by
  the editor) with a link back to the dialog; stages no longer carry a refund
  setting. With loyalty enabled (`isEnabled('loyalty')`) the dialog has a
  Points and a Tier tab (`useLoyaltyRulesDialog`): the Tier tab edits
  `salesLoyaltyTierRules` in the same three groups (`LoyaltyTierRuleRow`,
  `useLoyaltyTierRulesForm`), each row a customer wallet with tiers
  (`SalesLoyaltyTierWallets` → loyalty `loyaltyAccountTypes`), where the
  tier is set, a From/To band per tier and "only upgrade"
  (`TierBandsFields`, `tierBands.ts`); changing the wallet clears its bands,
  and a narrower row is flagged since one tier rule decides a stage. Stage
  badges also show the tier a stage sets (`SalesStageLoyaltyPoints.tier`).
  With loyalty on, deals show the net points they moved: a "Loyalty points"
  column in the list table (`DealLoyaltyPointsCell`) and a line at the foot of
  a board card (`DealLoyaltyPointsBadge`, only when non-zero). One
  `DealLoyaltyTotalsProvider` per view (around `DealsRecordTable`, and around
  `GenericBoard` in `DealsBoard` with every loaded card's id) asks
  `loyaltyScoreTargetTotals` once and keeps the last answer while columns load
  (`previousData`); a card dragged outside the provider shows none.
  With loyalty on, the deals Display menu has a third view, Points
  (`dealsViewAtom` `'points'`, `DealScoreLogsTable`): the point movements of
  the deals the page's filters match, one row per loyalty entry (deal, stage,
  action, points, campaign, customer, date). Actions are named by what
  they did (`scoreLogActions.ts`): a refund reads "Points taken back" when
  negative and "Points given back" when positive, a reversal with
  `replacedByScoreLogId` reads "Recalculated"; each explains itself on hover
  and the Action header's info button lists them all
  (`ScoreLogActionHelp.tsx`). `useDealScoreLogs` pages
  `SalesDealScoreLogs` (50 per page, infinite scroll) and asks
  `SalesLoyaltyScoreLogsByIds` once per new id, at most 100 per request; the
  deal and the customer show as text with an open icon on hover
  (`OpenableCell`): the deal's opens the deal sheet, the customer's goes to
  `/contacts/customers?contactId=` (core's customer sheet is not shared). The stage filter shows in every view but
  the board. Without loyalty a stored `'points'` view shows the board.
  The same page for POS orders is `/sales/pos/loyalty`
  (`PosLoyaltyPointsPage`, `modules/pos/loyalty-points`), linked as
  "Loyalty points" above the POS list (`PosOrderNavigation`, loyalty only,
  after a `Sidebar.Separator`): filters POS (multiple), cashier and
  customer; rows are orders (`#number`, opening the order panel through
  `openRecord` with `POS_ORDER_CONTENT_TYPE`), POS and branch; insights group by POS and rank orders,
  customers, cashiers and branches. Both pages share
  `modules/loyalty-points` (`summary.ts`, `useScoreLogsByIds`,
  `ScoreLogsTable` cells, columns and view, `LoyaltyInsightsView`,
  `LoyaltyTimelineView`, `scoreLogActions`, `ScoreLogActionHelp`); a source
  only maps its own GraphQL answers and record columns. The views compose
  section components shared with the home dashboard widgets:
  `LoyaltyInsightSections` (`LoyaltyKpiTiles`, `LoyaltyGroupTable`,
  `LoyaltyRankedRows`, `LoyaltyPanel`) and `LoyaltyTimelineSections`
  (`LoyaltyIntervalToggle`, `LoyaltyFlowChart`, `LoyaltyRunningNetChart`).
  A section drills only under a `LoyaltyDrillProvider`; without one its
  figures, rows and bars are plain (not clickable).
  The Sales Pipeline module menu has "Loyalty points" above Boards, set
  apart from the plugin menu above it by a `Sidebar.Separator`
  (`SalesSubNavigation`, loyalty only) opening `/sales/deals/loyalty`
  (`SalesLoyaltyPointsPage`): the same table with Board and Pipeline columns
  (`DealScoreLogsTable scope="all"`) over every pipeline the user may see,
  narrowed by its own filters (`DealLoyaltyFilter`: search, `board` and
  `pipeline` multi-select, stage once one pipeline is chosen, assignee,
  customer). The page is `DealLoyaltyInsights` (no tabs), loyalty's sums
  for the same filters
  (`SalesDealScoreLogInsights`): earned, spent, refunded, net, spend and
  refund rate (% of earned), deals and customers tiles, expired/reset when
  non-zero; `DealLoyaltyTimeline` (`SalesDealScoreLogTimeline`, browser time
  zone, Day / Week / Month toggle, Week by default; the flow two thirds wide,
  the running net one third): points moved per period
  (earned up, spent and refunded down, net as a line) and the deals' running
  net as an area, titled as not a wallet balance; recalculated purchases
  show apart (a "Recalculated" series and a line under the tiles), and the
  spend and refund rates divide by what is earned now; a per-pipeline table
  (earned, spent, refunded, recalculated, net, refund rate) when more than one
  pipeline is in view; then one grid of ranked lists, each as tall as its own
  rows and shown only with data: the ten deals that earned most, customers
  who earned or spent most, assignees and branches (names via ui-modules
  `MembersInline`, `BranchesInline`, `CustomersInline`). Every figure drills:
  the earned / spent / refunded tiles, the recalculated and expired lines, a
  timeline bar, a pipeline row and a ranked row open `LoyaltyDrillSheet` (from the bottom, 75% of the screen high, so the figure stays in sight)
  (`loyalty-points/drill.tsx`, `LoyaltyDrillProvider` on the page) with the
  movement table narrowed to it; "All movements" opens it unnarrowed. Record
  fields map to the source's own filters (deals: `pipelineIds`,
  `customerId`, `assignedUserIds`, `branchIds`, `_ids`; POS: `posIds`,
  `customerId`, `userId`, `branchIds`, `orderIds`); a kind or period goes to
  the query as `kind` / `period` for loyalty to match. The count beside the
  filter is the insights' `entryCount`; the deals' Points view, outside a
  drill provider, still counts its own list. Only `/sales/deals` fills a missing board and pipeline into the
  URL; elsewhere in the module a board or pipeline click opens `/sales/deals`.
  Loyalty's settings tab on a pipeline or POS gets what sales already does
  there as `context.config.loyalty` (`loyaltyBuiltInConfig`: a pipeline's
  stages' earning campaigns and tier wallets via `usePipelineLoyaltyBuiltIn`,
  a POS's `earnScoreCampaignId` and `earnTier` wallet via `usePosDetail`). Save
  validates and saves only the changed forms, switches to the tab holding
  an error, and closes once both are saved.
- With loyalty on, a deal's Products tab shows one voucher line
  (`modules/deals/loyaltyVouchers`: `DealVoucherRow`, `DealVoucherDialog`,
  `useDealVouchers`) for the first customer: the chosen voucher and coupon as
  removable chips, one usable voucher applied in a click, and a dialog listing
  the customer's vouchers (`loyaltyOwnerSaleVouchers`, grouped by campaign and
  value, unusable ones greyed with the reason) and a coupon input checked with
  `loyaltyCouponCheck` before it is saved. A choice is saved as
  `extraData.voucherId` / `couponCode` together with the products, so the
  backend holds the voucher and prices the deal again. Once loyalty reports
  the pick `settled` (used in an earning stage), the line is read-only: chips
  without remove, no picks or dialog, and a "used on this deal" note.
- The POS Payment tab's `AcceptCouponsField` turns on the till's coupon
  input (`Pos.acceptCoupons`, off by default).
- The POS Payment tab picks the score campaigns paid orders earn in
  (`EarnScoreCampaignsField`, `Pos.earnScoreCampaignId`): one campaign only,
  since two would both earn on the same order; chosen with loyalty's picker
  (`RecordPickerWidget`, New/Edit included), clearable, with warnings when
  inactive. Payment types'
  score campaign field (`OtherPaymentsField`, POS and deal product config) is
  the same picker. A chosen campaign that an active POS-order automation (this POS or
  any) also gives points in is flagged (`usePosEarnAutomations`). Below it,
  with loyalty enabled, one wallet's tier set by the paid amount
  (`PosEarnTierField`, `Pos.earnTier` JSON `{accountTypeId, bands,
onlyUpgrade}`, clearable to `null`; saving refuses a wallet without bands). Both come from the `posDetail` query (`graphql/queries.ts` `posCommonFields`), which the tab loads and saves back; a field missing there is saved as empty. The POS
  Automations tab is listed last, beside the Loyalty tab.
- Home dashboard widgets (`widgets.dashboardWidgets`, remote
  `./dashboardWidget` → `src/widgets/dashboard/DashboardWidgets.tsx`, export
  `DashboardWidget`, switching on `module`): the deals Loyalty points
  sections as seven tiles — `loyaltyKpis` (earned, spent, refunded, net,
  spend/refund rate, deals, customers), `loyaltyFlow` (points moved per
  period), `loyaltyRunningNet`, `loyaltyByPipeline`, `loyaltyTopDeals`,
  `loyaltyTopEarners`, `loyaltyTopSpenders`. All are `configurable`: the
  config form (`SalesLoyaltyConfigForm`, React Hook Form + Zod
  `salesLoyaltyWidgetConfigSchema`) stores
  `{ boardId?, pipelineIds, interval }`; no board sums every pipeline the viewer may see, and the
  Period (Day / Week / Month) field shows only for the two timeline tiles.
  View mode reads `useDealScoreLogInsightsQuery` /
  `useDealScoreLogTimelineQuery` (the page hooks wrap these with URL
  filters and the record count) inside `SalesLoyaltyWidgetCard`
  (`DashboardWidgetCard` with an Open link to `/sales/deals/loyalty`,
  loyalty-off, loading, error-with-retry and empty states). Tiles with the
  same pipelines share one cached query. Each entry sets `preview` (erxes-ui
  `TDashboardWidgetPreview`) for the catalog schematic: KPIs `kpi`, flow
  `bar`, running net `area`, by pipeline `table`, the three rankings
  `progress`. Labels and descriptions are
  `sales` namespace keys (`dashboard-loyalty-*`, reused `loyalty-insight-*`).
  The insights contract has no score log date range, so only the timeline
  tiles take a period; the others always cover all time.
- In a deal's Payments tab a payment type with a score campaign asks loyalty's `loyaltyScoreSpendLimit` (`DealPointPaymentLimit` / `useDealPointLimit`) and shows the customer's points and the most it may pay; the row stays disabled without a customer, while loading, or when loyalty blocks spending, and typed amounts are capped at the limit. There is no hand refund: refunds follow stages.
- The deals filter bar filters by one customer and one company (`customerId` / `companyId` URL keys, single-select pickers), passed straight to `deals` / stage queries.
- The deals filter bar filters by deal tags (`tagIds` URL key, multi-select `SelectTags` picker scoped to `sales:deal`), passed straight to the `deals` query.
- Deal detail renders only the properties selected on the deal's pipeline;
  legacy pipelines continue showing all deal properties until their selection is
  saved for the first time.
- The deal sheet header's icon-only buttons carry an `aria-label`: Close, and
  Collapse or Expand sidebar, with the `sales` keys `close`, `collapse-sidebar`
  and `expand-sidebar`.
- Deal detail chips (priority, assignee, dates, labels, tags, branch,
  department, broker) render as a field group: a muted label segment, then the
  value and a chevron, e.g. `Broker | None ⌄`; the stage chip has no label.
  The broker entity selector that follows is
  labelled by its type (`Customer`, `Company`, `User`) with a `Select broker`
  placeholder. Customers and Companies follow tags (`DealContactsField`:
  ui-modules `ContactsRelationField` with `variant="chip"`); inside the
  deal sheet a linked contact opens in the sheet's own Customers / Companies
  rail tab (`onOpen` → `setActiveSideTab(RELATION_CONTACT_SIDE_TABS[kind])`,
  the app's side panel sits behind the modal sheet), elsewhere (a
  notification) in the side panel; the chevron opens the picker, and changes
  are saved on the deal's own single `customerId` / `companyId` through
  `dealsEdit` (no core relation). The board card's customer / company chips
  save the same way (the latest pick replaces the one before). The add form
  and the detail rail use one customer and one company too.
- The deal sheet's right rail (`DealSideWidgets` →
  ui-modules `RelationWidgetSideTabs`, given the deal's customers / companies)
  holds Customers and Companies icons; each opens the side panel's view of the
  deal's contacts inside the sheet (`EmbeddedRecordPanel`), where their other
  records are. After them come, as `extraTabs`, only the relation widgets
  registered with `contentTypes` containing `sales:deal` (accounting
  `transactions`, mongolian `ebarimt`), rendered through
  `useRelationWidgetTabs` with `contentType: 'sales:deal'` and the deal's
  `_id`, so they read records linked to the deal itself. Widgets without
  `contentTypes` (contact-linked, e.g. tickets, deals) are not listed beside a
  deal.
- Deal detail header shows a `⋯` actions menu (`DealsActions`
  `variant="menu"`) with watch/unwatch, duplicate, print (shared
  `PrintDocument` sheet), archive/unarchive, and remove for archived deals.
  These actions appear only there, not in the detail overview body.
- Deal detail overview lays fields out in three rows: stage, start date, close
  date, assignee and priority; then labels, tags, branch, department and
  broker; then checklist and attachment upload.
- Deal product management supports filtering, advanced product fields, tax
  fields, row editing, duplication, deletion, product bulk add, footer totals,
  save feedback, and an expanded dialog view for working with dense product
  tables.
- Deal product rows default their UOM to the selected product's base UOM when
  adding or replacing a product. Normal view edits UOM, unit price, and quantity
  through `uomInfo: { uom, ratio, unitPrice, quantity }` immediately after the
  product column. Advanced groups base unit price, base quantity, then the fixed
  52px read-only base UOM immediately after the entry columns, including saved
  table orders, and also shows the saved ratio. Entry info is filled from base
  fields when empty or partial; updates preview base-unit calculations locally.
  The selector includes saved units even when removed from the product.
  Deal detail fetches product `uom` and `subUoms` so these choices remain
  available after reload without opening the product chooser.
  Empty row UOMs use the product's base UOM in the table and save payload.
  Empty row currencies use the first configured `dealCurrency` (or `MNT`
  without a configured currency) in local state, table totals, and save payloads.
- Deal product bulk add passes the deal pipeline id into the shared product
  chooser so enabled plugin remainder providers can resolve pipeline-scoped
  stock without sales importing those plugins.
- Deal product advanced view manages only product-level manual `hand` discounts
  while preserving automatic discount sources in `discountInfos`.
- Deal product tax controls live behind a separate Tax view toggle; Advanced
  view no longer owns tax columns or footer total tax controls.
  The `VAT applied` row column is present only with Tax view enabled.
- POS permission settings assign admins and cashiers and persist cashier temp
  bill, report visibility, customer creation, and direct discount controls
  through `permissionConfig`.
- POS "Customer registration" tab (`CustomerCreate` /
  `useCustomerCreateConfig`) enables cashier-side customer creation, picks
  whether the cashier becomes owner, toggles which system fields and Core
  `core:customer` properties show, and arranges them with the shared
  `ui-modules` `LayoutEditor` (`layout="record"` in `PosCustomerLayoutPanel`).
  Properties deleted or archived since saving
  show a warning and are stripped on the next save. "Add field" (gated by
  `fieldsManage`) opens `PosCustomerFieldPanel` in the app side panel: the
  shared `ui-modules` `PropertyForm` (`layout="panel"`: `PanelFormRow` rows for icon, name, code, description, group, type and show in card, then the type-specific sections; its Group row's `+` opens
  `PropertyGroupForm` in a popover) adds a
  `core:customer` property. Both panels hand their result to the tab through
  `posCustomerFormEditAtom` (`modules/pos/states/posCustomerField.ts`):
  `{ posId, kind: 'field', fieldId }` places the new property on the open
  POS's form, visible, and `{ posId, kind: 'layout', layout }` applies the
  edited rows (`null` resets to the default); both stay unsaved until Save
  Changes.
- The Create deal action form (`CreateDealActionConfigForm`) adds `productIds`
  (product suggestions) and `items` (JSON lines, attribute placeholders) like
  the POS order form, reusing its `products` / `order-items` translations;
  `salesActionConfigFormSchema` keeps both, so saving does not strip them.
- POS and pipeline "Automations" tabs (`PosAutomations`, `PipelineAutomations`)
  share `modules/automations` (`SourceAutomations` / `useSourceAutomations`,
  query `SalesSourceAutomations`): they list the automations whose trigger runs
  on this record or on every record of its kind (no `posId` / `pipelineId`,
  "All POS" / "All pipelines" badge), open new ones through
  `buildAutomationSeedLink` ("Other automation"), and carry `returnTo` on seeds
  and edit links; each row deletes its automation after a confirm
  (`SalesSourceAutomationRemove`, evicted from the Apollo cache so every list
  showing it drops it).
- Other plugins' sections (`relationSettingsWidgets`, from `ui-modules`
  `useRelationSettingsModules`) become their own tabs: POS page tabs keyed
  `relation.<pluginName>.<name>` (`POS_RELATION_TAB_PREFIX`, saved POS only)
  and pipeline form tabs (saved pipeline only). Each renders
  `RelationSettingsWidget` (`PosRelationSettings` / `PipelineRelationSettings`)
  with a purchase context from `usePosPurchaseContext` /
  `usePipelinePurchaseContext`: the trigger a plugin may use (POS paid order
  event; `sales:sales.deals.probability` Won — registered deal trigger types
  are plural, the Automations list also matches legacy singular ones), scopes
  (this record / all), how the trigger names the buyer, and `returnTo`. Each
  scope also carries `history`: how the buyer's past purchases there read as
  a customer segment (deals: `customer.deals`, `stageProbability` Won, the
  pipeline when scoped, dated by `stageChangedDate`; POS: `customer.posOrders`,
  not returned, the POS when scoped, dated by `paidDate`; both sum
  `totalAmount`). Sales never names those plugins; tab labels come from their
  config.

## Architecture

| Area                | Path                                                                                                  | Responsibility                                                                                                             |
| ------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| App sidebar         | `frontend/plugins/sales_ui/src/Sidebar.tsx`                                                           | `SalesSidebar` (app sidebar) and `SalesSidebarFooter` (Settings link), rendered by the `./sales` entry through `AppLayout` |
| Registration        | `frontend/plugins/sales_ui/src/config.tsx`                                                            | Sales routes, navigation, and remote registration                                                                          |
| Dev server          | `frontend/plugins/sales_ui/rspack.config.ts`                                                          | Module Federation development serving and watch ignore rules                                                               |
| Pipeline editor     | `frontend/plugins/sales_ui/src/modules/deals/pipelines`                                               | Pipeline form, stages, product config, and property selection                                                              |
| Settings boards nav | `frontend/plugins/sales_ui/src/modules/deals/boards/components/settings/BoardsSettingsNavigation.tsx` | BOARDS settings sidebar group and `useSettingsActiveBoard`                                                                 |
| Export buttons      | `src/modules/deals/actionBar/components/DealsExport.tsx`, `src/pages/OrdersPage.tsx`                  | Start `sales:sales.deals` and `sales:pos.posOrders` exports with the page filters                                          |
| Deal detail         | `frontend/plugins/sales_ui/src/modules/deals/cards/components/detail`                                 | Deal overview, properties, activity, products, and payments                                                                |
| Product management  | `frontend/plugins/sales_ui/src/modules/deals/cards/components/detail/product`                         | Deal product table, filters, expanded view, row actions, footer totals, and save                                           |
| Product discounts   | `frontend/plugins/sales_ui/src/modules/deals/cards/components/detail/product/utils/discountInfos.ts`  | Reconciles advanced-view row/footer discount edits into `hand` discount metadata                                           |
| Dashboard widgets   | `frontend/plugins/sales_ui/src/widgets/dashboard`                                                     | `./dashboardWidget` remote: loyalty points tiles, their config form and states                                             |
| Loyalty sections    | `frontend/plugins/sales_ui/src/modules/loyalty-points/components`                                     | Insight/timeline sections shared by the Loyalty points pages and the dashboard widgets                                     |
| Deal vouchers       | `frontend/plugins/sales_ui/src/modules/deals/loyaltyVouchers`                                         | Voucher and coupon line on a deal's Products tab, saved with the products                                                  |
| POS settings list   | `frontend/plugins/sales_ui/src/modules/pos/components/PosRecordTable.tsx`                             | Table view of the POS settings list; cards stay in `PosItemList.tsx`                                                     |
| POS settings shell  | `frontend/plugins/sales_ui/src/modules/pos/components/pos-edit`                                       | POS settings tab content (`MainContent`, `PosSettingsPanel.tsx`) for the panel and the POS page                            |
| POS slots editor    | `frontend/plugins/sales_ui/src/modules/pos/slot`                                                      | Slots tab floor plan: canvas, slot list, inspector, slot ⇄ `posSlotBulkUpdate` input mapping                               |
| POS permission form | `frontend/plugins/sales_ui/src/modules/pos/components/permission`                                     | Manages admin and cashier POS permission controls                                                                          |
| POS customer form   | `frontend/plugins/sales_ui/src/modules/pos/components/customerCreate`                                 | POS customer registration settings and side panels                                                                         |
| POS GraphQL         | `frontend/plugins/sales_ui/src/modules/pos/graphql`                                                   | Provides POS queries and mutations used by settings screens                                                                |
| POS types           | `frontend/plugins/sales_ui/src/modules/pos/types`                                                     | Describes POS configuration data consumed by the UI                                                                        |
| Record panel        | `frontend/plugins/sales_ui/src/widgets/record-panel`                                                  | POS order and cover views drawn in the app side panel                                                                      |
| GraphQL tooling     | `frontend/plugins/sales_ui/codegen.ts`                                                                | Validates documents against the composed gateway schema                                                                    |

## Contracts

### Provides

- `widgets.recordPanels: [{ contentType: 'sales:pos.orders', properties: false, tabs: [{ value: 'payments', label: 'Payments', labelKey: 'payments', after: 'detail' }] }, { contentType: 'sales:pos.covers', properties: false }]` (`modules/pos/constants/posPanel.ts`) with `./recordPanel` (`src/widgets/record-panel/RecordPanel.tsx`): order views `title` (`#<number>`), `detail`, `activity`, `tab` `payments` (core labels it with `t(labelKey)` in the plugin's `i18nNamespace` (`sales`), so the config passes `labelKey: 'payments'`, and draws it between Detail and Activity); cover views `title` (POS name), `actions` (delete), `detail`, `activity`. `sales:pos.orders` is the order content type the backend already uses (segments, automations, payment callbacks); covers have no backend content type, so `sales:pos.covers` names them for the panel only.
- `widgets.recordPanels: [{ contentType: 'sales:pos', properties: false, detailPath: getPosSettingsPath, tabs: POS_SETTINGS_TABS without properties, each after: 'detail' }]`: the saved POS's settings in the side panel (see Current Capabilities); the backend has no `sales:pos` content type, it names the POS for the panel only.
- `widgets.contactWidgets: [{ name: 'posOrders' }]` (`src/widgets/contact/PosOrdersContactSection.tsx`): the POS orders section of a customer's / company's Relations overview, from `posOrders(customerId, customerType)` (`salesContactPosOrders`; companies are kept on orders as `customerId` with `customerType: 'company'`), rows (`#number`, total · date) opening the order panel stacked on the contact's panel. Users without the `posOrderRead` action get no section and no query: `usePermissionCheck().getModuleActions('pos')` must hold `*` or `posOrderRead`, since a module `*` grant reaches the frontend unexpanded and `hasActionPermission` misses it while the API allows it; a failed query shows the translated `failed-to-load-pos-orders` text, never the raw server message (the header count still reads 0: `ContactWidgetSection` has no error state). Same name as the `posOrders` relation widget, so core lists this section instead of that widget under More; that widget reads orders by `dealId` and has no host beside a deal any more.
- Starts core `exportStart` jobs for entity types `sales:sales.deals` and
  `sales:pos.posOrders` (served by `sales_api`) through `ui-modules` `Export`.
- `widgets.contactWidgets: [{ name: 'deals' }]` with `./contactWidget` (`src/widgets/contact/ContactWidgets.tsx`): the Deals section of a customer's / company's side panel overview (ui-modules `ContactWidgetSection`): the contact's deals from `deals(customerId | companyId)` (`salesContactDeals`), rows opening the deal on its board in a new tab, `+` opening `AddDealSheet` with `contacts` (`customerId` / `companyId`), which prefill the form's Customers / Companies saved on the deal by `dealsAdd`; `AddCardForm` evicts the cached `deals` lists so contact sections read again.
- Deal trigger forms' optional stage fields (`SalesTriggerStageField`) pass
  `autoSelectFirst={false}`: `SelectStage` otherwise picks the first stage and
  silently narrows the trigger.
- POS order event trigger form: the POS field (`SelectPos.FormItem` with
  `emptyLabel`) lists "Any POS" first; choosing it clears `posId` so the
  trigger matches every POS (single-mode `SelectPos` otherwise cannot be
  unselected).
- `widgets.dashboardWidgets` (seven `loyalty*` modules, all `configurable`)
  with `./dashboardWidget` (`src/widgets/dashboard/DashboardWidgets.tsx`,
  named export `DashboardWidget`, which core's remote resolver finds by
  name), taking ui-modules `IDashboardWidgetProps`.
- Sales routes and Module Federation UI entries registered by `src/config.tsx`.
- Product table view state through local React state only; no backend contract
  changes are required for expanded product management.

### Consumes

- `sales_api` GraphQL pipeline, deal, product, and POS contracts, including `salesDealScoreLogs`; loyalty `loyaltyScoreLogsByIds` and `loyaltyScoreTargetTotals`.
- For type-generation tooling, `codegen.ts` consumes only `backend/gateway/generated/schema.graphql`, generated by `gateway:schema:compose`. It includes the public POS client types and queries Sales reads through the default gateway client.
- `sales_api` `salesLoyaltyRules`, `salesLoyaltyRulesSave`, `salesLoyaltyTierRules`, `salesLoyaltyTierRulesSave`, `SalesStage.loyaltyPoints`, `Pos.earnTier`; loyalty `loyaltyAccountTypes` (tier wallets); core `automations` (competing-writer warning); `ui-modules` score campaign list (`useLoyaltyScoreCampaign`).
- Core properties through public `ui-modules` property hooks with
  `contentType: 'sales:deal'` and, for the POS customer form,
  `contentType: 'core:customer'`.
- `ui-modules` `LayoutEditor`, `PropertyForm` and `useAddProperty` for the POS
  customer form.
- `erxes-ui` and `ui-modules` public React components, including
  `DashboardWidgetCard`, `DashboardWidgetEmptyState`,
  `DashboardWidgetListSkeleton`, `IDashboardWidgetProps` and
  `TDashboardWidgetConfig`.

## Data and State

- The `salesItemId` URL key alone decides whether the deal sheet is open.
  `SalesItemDetail` copies it into `dealDetailSheetState`, so browser Back and
  Forward close and reopen the sheet. Its not-found and error states have a
  Close button.
- Apollo Client owns pipeline/deal/POS server state; React Hook Form owns
  pipeline and POS settings forms.
- Product table filters, Advanced view, Tax view, expanded view, and edit sheet
  open state are local React state inside the deal product detail surface.
- `propertyIds` is submitted with pipeline create/edit and reloaded from
  `salesPipelineDetail`.
- Product advanced-view discount edits are stored as `discountInfos` entries
  with `type: 'hand'`; pricing/voucher/score entries remain automatic data.
- POS report access persists as `permissionConfig.cashiers.seeReport` in the
  POS document.
- Cashier customer creation persists as
  `permissionConfig.cashiers.createCustomer`; admins are always allowed.
- `customerCreateConfig` = `{ enabled, assignCashierAsOwner, layout }`, where
  `layout` rows hold system field codes and `property:<fieldId>` entries.
  Placement is visibility: a field not in `layout` is hidden.

## Local Invariants

- The deals list `stage` column uses `SelectStage.InlineCell` with the row's own pipeline and `autoSelectFirst={false}`, and ignores auto selections. Never use the shared `StageSelect` there: it auto-selects the first stage when the deal's stage is not in the loaded list (archived deals, other pipelines) and its `onChange` would move the deal.
- Dashboard widget `module` names (`SALES_DASHBOARD_MODULES`) are stored in
  users' saved layouts as `sales:<module>`: renaming one orphans placed tiles.
  Keep them aligned with the `config.tsx` entries; an unknown module renders
  "This widget is no longer available". A stored config that no longer parses
  reads as every pipeline, by week.

- Export filters are the list query variables without paging or sorting
  (`getDealsQueryVariables` plus `pipelineId` / `stageId`; `useOrdersVariables`
  minus `perPage` / `page`), so an export matches what the page lists. With
  selected rows the export sends `ids` and no filters.
- RecordTable sets `leading-0`: a cell's text goes straight into the cell's
  flex span; a wrapping element (a tooltip trigger, a link) needs
  `leading-normal` and no `overflow-hidden`, or it renders with no height.

- recharts is not a shared Module Federation library: inside a chart take
  `Tooltip`, `Legend` and every other recharts part from `recharts`, never
  erxes-ui's `ChartTooltip` / `ChartLegend` (another copy's store; the page
  crashes with `activeIndex` of undefined). erxes-ui's `ChartContainer` and
  `Chart*Content` components are safe.
- Deal unit price (base and entry UOM), row discounts, and footer manual discounts
  require `dealsProductsEdit`; restricted numeric cells remain readable. Row and bulk
  product deletion controls require `dealsProductsDelete`.

- The Sales Pipeline breadcrumb links to `/sales/deals` with the current
  `boardId` and `pipelineId`. `SalesSubNavigation` fills a missing board or
  pipeline with history `replace`, so Back can leave a bare `/sales/deals`.
- Relation widgets go only through contacts: each lists the records whose
  own `customerId` / `companyId` is the host's customer or company
  (ui-modules `getHostContacts`: the host itself when it is a contact, else
  the first of `customerId(s)` / `companyId(s)` from `IRelationWidgetProps`),
  read with this plugin's own list query, the host left out. "+" creates a
  record with those contacts through its create mutation. No core relation
  is created or read for record ↔ record or record ↔ contact links, and there
  is no "choose existing" picker.
- The plugin owns its whole app sidebar. `src/modules/Main.tsx` (the `./sales`
  expose) wraps its routes in `erxes-ui` `AppLayout` (`id="sales"`) with
  `SalesSidebar`. Core-ui draws only the top `CoreTab` bar; `navigationGroup` in
  `src/config.tsx` supplies just the tab name, icon and `defaultPath` and takes
  no `content`/`subGroup`.
- `SalesSidebarFooter` pins a Settings link to the bottom of the app
  sidebar. The plugin owns its settings at `/sales/settings/*`, served by its
  own entry: the entry's top-level `<Routes>` sends `settings/*` to
  `SalesSettingsLayout` (`src/Sidebar.tsx`, an `AppLayout` titled
  "<Plugin> settings" whose sidebar starts with a sticky core-style "Exit settings" row linking back to the app; no footer link) and `*` to the app
  `AppLayout`. Settings pages render inside `PluginSettingsRoutes`
  (`ui-modules`), which also serves `tags` and `properties/*` scoped to
  this plugin's types; the settings sidebar appends
  `PluginSharedSettingsNavigation`, which lists Tags/Properties only when the
  plugin registers those types. Core organization settings never list
  plugin settings, `config.tsx` has no `settingsNavigation`, and there is
  no `./salesSettings` expose; old `/settings/sales/…` URLs are redirected
  by core. The settings navigation renders no `Sidebar.GroupLabel`.
- Below the shared Tags/Properties items, `SalesSettingsLayout` renders two
  route-scoped `NavigationMenuGroup`s, and neither page has a side panel:
  `BoardsSettingsNavigation` (BOARDS, only on `/sales/settings/deals`, matched
  with `useIsMatchingLocation` so a trailing slash still counts, titled
  `Boards (N)` with the board count as before) lists every board (archived
  ones badged); a row links to `?activeBoardId=<id>`,
  its `⋯` menu edits (`boardId`), archives or deletes the board, and the group
  `+` sets `createBoard=1`. The settings sidebar has no POS group: a POS's
  tabs live in its panel and page.
- `DealsSettings` calls `useSettingsActiveBoard`, which keeps
  `activeBoardId` on an existing board (the first one by default, clearing
  `pipelineId` and `tab` when it moves) and runs the board archive
  subscription. It renders the single `BoardForm` in its `SettingsHeader`;
  `BoardForm` has no trigger of its own: the dialog opens only from `boardId`
  (edit) or `createBoard` (add, the BOARDS group `+`), and closing clears
  both. Keep one instance: a second copy stacks two dialogs.
  Edit fills the form once per opened board (`loadedBoardIdRef`) with
  `reset(values, { keepDefaultValues: true })`, so an unchanged name saves,
  add still opens empty, and an archive-triggered detail refetch keeps typed
  edits; Save is disabled while the board loads.
- Money and product text on board cards and column totals is `text-xs` (12 px)
  or larger with `tabular-nums`. Column headings are `text-base`, the same size
  as card titles.
- All Sales documents use `gql()` from `~/gql`; hooks and cache/subscription updates
  infer their results from those documents. `eslint.config.js` enforces this
  with Operation's rules: `graphql-tag` and `gql` from `@apollo/client` are
  restricted imports, and Apollo hooks and `subscribeToMore` reject type
  arguments. Derive row/detail aliases from
  generated query types and keep local form types separate.
  Keep only aliases with consumers; selector context, pagination, drag state,
  attachment state, and Zod form types remain UI contracts.
- Source-automation trigger `config` and deal relation POS `paidAmounts` are
  JSON, narrowed in `automations/utils/sourceTriggers.ts` and
  `widgets/relation/utils/posOrderPaidAmounts.ts`. Only object trigger configs
  are read; the relation panel lists array payment entries only (legacy maps
  stay hidden) and skips non-object entries. Payment selector rows alias the
  generated `Payments` query. The automation board/pipeline/stage text skips its
  query until all three ids are present.
- Deal `productsData`, `paymentsData`, pipeline payment types, voucher results,
  and event payloads remain JSON in the public API. Validate consumed structure
  in Sales UI (`deals/utils/dealJson.ts` and the owning hook); preserve extra
  JSON keys on round trips. Invalid editable data must show an error and block
  saving, rather than becoming an empty form.
  Legacy product rows can omit `_id`; preserve them without inventing row IDs
  or rejecting the whole deal. Product mutation identifiers follow the existing
  nullable GraphQL arguments.
  Legacy `paymentsData.totalAmount` may be a finite number: preserve it on
  save and exclude it from editable payment entries and paid totals. Other
  payment keys must still contain validated payment objects.
- List and detail deal subscriptions select the fields used by their respective
  queries. Pipeline order events carry stored JSON, so move an existing card
  immediately and refetch active lists for complete computed data.
- `deals/utils/cursorList.ts` follows Operation's adapter for nullable PageInfo
  booleans. Filter nullable list members before passing rows to UI components.
  Keep the previous total when a later page returns a null count; accept an
  explicit zero as the new total.
  Memoize filtered query collections by the source array; form synchronization
  and board effects rely on stable references when Apollo data is unchanged.
- Memoize overview attachment inputs by the server attachment array so unrelated
  rerenders cannot discard pending uploads. Relation-card section visibility
  must use the same filtered collection passed to its renderer. Label forms
  report a missing pipeline before attempting either add or edit.
- Deal printing owns typed documents for the public Core document service;
  their tooling snapshot does not change that service's runtime contract.

- GraphQL documents are literal strings so codegen can read their complete
  variables, arguments, and selections. Do not reintroduce JavaScript string
  interpolation into query, mutation, or subscription documents.
- Deal watch responses include the persisted `_id` and `isWatched` state;
  preserve the optimistic update and cache handling when adopting generated
  types. Watch/unwatch requests are idempotent and update only the acting user.
  Empty archives provide list/count/page metadata; successful label
  assignment and empty-stage sorting return success strings.
- POS JSON configuration and report fields are narrowed in `pos/utils/posJson.ts`
  and `pos/utils/posOrderJson.ts`; preserve extension keys and legacy numeric
  screen timers. Payment amounts support both arrays and legacy maps. An order
  payment's `type` may be null or missing; retain the entry in save payloads and
  balance checks while excluding it from named payment inputs.
  Summary pagination keeps its previous cache
  result when either JSON page cannot be parsed.
  An unchanged structured payment configuration retains its original JSON type;
  nullable payment fields and numeric screen values retain their stored types
  until edited.
  Memoize parsed query objects before using them to reset forms. Invalid JSON
  must be reported; never enable saving an empty replacement for failed data.
- Order detail `items` is an array; `posOrderRecords.items` is the unwound row
  object. Keep these two report shapes distinct.
- A Cover's `user` is its assignee, while `createdUser` resolves `createdBy`.
  Do not substitute one for the other when deriving display data. Covers list
  rows keep the selected `user` for the assignee column.
- The Covers list reads its total from `posCoversCount` (same filter
  arguments, same document as `posCovers`) so `hasNextPage` loads pages past
  the first 30; it writes that count on every result, including
  0, and resets it to `null` while a new result loads; the header shows the
  skeleton only while the query loads (`posCoverTotalCountLoadingAtom`) and no
  count after a failure, including a failed refetch while Apollo keeps the
  previous data; a failed `posCovers` request shows the error alert
  like Orders, never the empty state. A fetched page is appended only when it
  matches the current filter (otherwise dropped) and keeps the loaded count
  with no row overlap; a page whose `posCoversCount` differs or that repeats a
  loaded `_id` (covers added or deleted meanwhile) is dropped and the list
  refetches from page 1, so the length-based next page never loops.
- POS report list documents (Orders, Items, ByItems, Summary, Covers) declare
  `$posId` and pass it to the field so the `:posId` route scopes each list;
  `posOrderCustomers` and `posOrderBySubscriptions` have no backend `posId`
  argument and are not POS-scoped.
- Product-group saves project only `GroupInput` fields and refetch that POS's
  groups before completing. Cover deletion removes each successfully deleted
  id from every cached `posCovers` filter variant; `useRemovePosCover`, once
  in `finally` after the whole loop (also after a partial failure), evicts
  `posCoversCount` and refetches the active `posCovers` query with
  `refetchQueries`. An evict alone is dropped by Apollo while a fetchMore or
  refetch is in flight, which left loaded rows short of the count. The list
  returns to the first page after a delete: page-number fetchMore would skip
  rows that shifted after local removals.
- POS product-group saves use `productGroupsBulkInsert`. The Sales API has
  no `productGroupsAdd` or `cpSalesPipelineDetail` field; use implemented
  contracts rather than declaring documents for unsupported aliases.
- Pipeline number configuration is literal prefix text with supported date
  placeholders (`{year}`, `{month}`, `{day}`); send the original text and let
  the API escape it for number lookup. The API matches that prefix at the
  start of the stored number, followed only by digits. Do not pre-escape it
  in the UI.
- Send deal, POS, and address search text unchanged; the API owns regex
  escaping and case-insensitive matching. Formatted-phone matching and the
  shared stage/archive fuzzy-search behavior remain supported.
- POS edit, product-group/slot saves, and deal-watch documents already declare
  required target ids matching the backend's non-null arguments. Other legacy
  documents still declare nullable inputs even where the backend validates a
  required value at runtime (deal products, checklists, and POS bulk arrays).
  Update and deploy caller variable declarations before tightening those SDL
  arguments; supplying a non-null value does not make a nullable variable
  declaration valid at a non-null GraphQL argument. Keep explicit empty arrays
  for clearing POS groups/slots and for an empty deal-product selection.
- Give distinct GraphQL operations unique Sales-prefixed names, including
  queries selecting the same backend field for different screens. Before
  renaming an operation, check repository-wide string references such as
  Apollo `refetchQueries` and `include`; preserve the document's exports,
  variables, arguments, and selections.
  Check generated TypeScript names too: operation names differing only in
  letter case can generate the same PascalCase identifiers.
- The Orders and Summary payment-type columns (`generateOtherPaymentColumns`)
  are keyed `payment_<title>`, never by position: `RecordTable` keeps saved
  column order, visibility and widths by id per `tableId` (shared by every
  POS) and appends unknown ids at the end, so a positional id moves columns
  whenever a POS's payment types differ or change (as `useFieldsColumns`
  keys property columns by `field._id`).
- POS report operations use their report context in their names (Orders,
  ByItems, Covers, Items, or Summary), even when their selections are identical.
  Keep document exports stable for their existing hooks and selectors.
  Identical POS list behavior lives in `pos/hooks/usePosSelector.ts`; each
  report passes its own typed document and options. Its next page continues from
  the request's effective `page`/`perPage` and the unfiltered row count
  (`pos/utils/posSelectorPage.ts`). `posList` returns no total, so selectors
  report the loaded length as their total and do not offer load-more.
  Shared company/user selector row aliases in `pos/types/posSelector.ts`
  follow the generated Orders selections.
  Keep those selections compatible when reusing the aliases in another report.
- Follow the `operation_ui` reference for codegen changes; inspect its existing
  implementation and, when needed, its merged migration diff before introducing
  a different pattern. Keep explicit Apollo refetch target names at their
  callers. When splitting a reused operation name, retain every intended target
  and update those names with the renamed operations. Legacy names
  `Deals`, `SalesStages`, `posList`, and `posDetail` still target shared or
  other-plugin queries; do not remove them solely because Sales uses new names.
- Keep public-contract snapshots faithful to their owning SDL, including
  arguments and nullability. Do not add fields to the snapshot to make an
  unsupported operation validate. Including a contract does not register its
  service with the runtime gateway.
- Product tags use Core's `tags(limit: ...) { list { ... } }` contract. Sales
  board counts take no arguments; assigned-user counts take `pipelineId` and
  `stackBy`.
  Stage conversion statistics select `compareNextStage` and the
  `initialDealsTotalCount`, `stayedDealsTotalCount`, and
  `inProcessDealsTotalCount` fields provided by Sales.
- Before removing an unsupported document, verify its hook, named or object
  exports, and federation entry points have no consumers. Follow Operation's
  migration pattern of removing an unused hook together with its unsupported
  document; do not invent a backend operation to keep unused frontend code.
- POS Summary row `_id` values come from the report's `paidDate` group key.
  Do not pass them to POS configuration or order deletion mutations.
- POS settings do not receive a `Pos.type` field: the Sales SDL and settings
  query do not expose one. Do not derive settings tabs or badges from it.
- POS item detail forms use `pos-items/types/posItemType.ts`; the Items report
  does not mount a separate POS selector. Orders hooks import their named
  documents directly from `orders/graphql/queries`.
- POS By Items displays product sales aggregates and does not own catalog
  product deletion. Do not wire its report rows to Core's `productsRemove`.
- Codegen scans all Sales UI TypeScript documents, excluding only its generated
  `src/gql/` output. Generated files are ignored by Git and ESLint. Its scalar
  mapping is `Date` input `string | Date`, output `string`, and `JSON` as `unknown`.
- `build` and `serve` depend on `codegen`, which depends on `gateway:schema:compose`. Codegen hashes the composed SDL, its config, and authored TypeScript documents. Build inputs include generated TypeScript through `dependentTasksOutputFiles` so backend changes invalidate the bundle.
- `codegen:watch` has no dependencies and must not be a dependency of `serve`:
  the watcher never exits. With Sales enabled, `pnpm dev:uis` generates types,
  starts the watcher, then starts the host and Sales remote.

- Papa JSON (`papaDelivery`, `papaDeal`, `deliveryConfig.papa`, `salesPapaReferences`,
  `salesPapaAddresses`, the photo proof) is narrowed in
  `pos/papa/utils/papaJson.ts`. Papa does not document its reference row
  shape, so rows need only an `id`; labels fall back from `name` to `title`,
  `code`, then `id`, and unreadable rows are skipped rather than failing the
  form.
- `PapaPosForm` re-reads `salesPosSettingsDetail` network-only and spreads
  the saved `deliveryConfig` before writing `papa`, because the delivery form
  above saves the same JSON field without refetching. Never save
  `deliveryConfig.papa` from cached POS detail.
- The POS Papa form unlocks once `salesPapaConfig.staffId` is set (the
  credentials worked), even when no callback was registered; the account
  card then warns that live updates need an https gateway domain.
- The quote form's map (`PapaLocationMap`, `react-leaflet` with
  OpenStreetMap tiles and a `divIcon` pin, so no bundled marker images) sets
  latitude/longitude by click or drag and follows typed coordinates. Address
  search (`usePapaAddressSearch`) asks OpenStreetMap Nominatim once per click,
  limited to Mongolia, retrying once without the last address part after a
  one-second pause: Nominatim forbids search-as-you-type and more than one
  request per second. Never wire it to keystrokes. A map click or pin drag
  fills the address from Nominatim reverse (`findAddressAt`, Mongolian, one
  request per pick) only while the address is empty or still the last
  map-filled text; typed addresses are never overwritten. A typed or pasted
  address with no valid pin is looked up by itself when the field loses
  focus, and Get price waits for that lookup (`fillFromAddress`); each
  address is asked once, so a miss is not retried until the text changes
  ("Find on map" always asks again).
- Papa mutations refetch `salesPosOrderPapaDelivery` for that order; the tab
  never reads Papa state from `salesPosOrderDetail`.
- The Delivery tab pre-fills from `posOrder.deliveryInfo` (`orderDeliveryDefaults`):
  `address` / `phone` / `marker`, or the ecommerce (dts.mn) parts `city`,
  `district`, `street`, `detail` joined as the address, `haveBaby`,
  `callBefore`, `onlyAfternoon` written into the driver note, and `district`
  matched to a Papa location by name or short name (`matchPapaDistrict`,
  only when exactly one matches). These checkouts send no coordinates.
- Papa labels use `t(key, 'English default')`; their Mongolian strings are
  not yet in the gateway `sales.json` locales.
- Page header breadcrumbs follow the shared pattern: crumbs are default ghost `Button`s (no `font-semibold`), the first crumb carries a 16px icon in the default text color, crumbs are separated by `Separator.Inline` or `Breadcrumb.Separator`, and settings pages carry no favorite toggle.
- Whether loyalty is on is read at runtime (`useLoyaltyEnabled`, the loaded `pluginsConfigState`), never with `isEnabled('loyalty')`: that reads a build-time env that deployments such as SaaS do not set, which hid the Tier tab, the deal list's points column and the board card badge.
- Expandable navigation rows end in the host sidebar's chevron:
  `IconChevronRight` (`size-3.5`, muted) inside a span that rotates 90° when
  open, never a filled caret, so the rotation stays on the compositor and
  matches the main sidebar.
- Expandable group rows (boards, POS) use `rounded-lg`; an active board row is
  gray (`bg-foreground/5 text-foreground`) while its active pipeline item keeps
  the purple `Sidebar.MenuButton` active tint, so the two never stack purple.
- Page-level side menus render `Sidebar.Panel` from `erxes-ui`, which keeps its own open state (`sidebarPanelOpenState`), separate from the plugin's `AppLayout` sidebar. The panel sits beside the page header, never under it: the page is a row of the panel and a column holding the header and content. The panel passes its heading as `label`, which renders a 40px title row with optional `actions` and the collapse toggle on the right, level with the page header; when collapsed, the toggle moves into the header's panel slot. Do not add a second heading or an in-panel `Sidebar.PanelTrigger` row. Keep `<Sidebar collapsible="none">` for sidebars inside sheets and dialogs. `LeftSidebarLoading` renders the same panel with the trigger beside its first placeholder row. Settings pages use the settings sidebar groups instead of a panel; the POS page uses ui-modules `PageHeader` like other record pages.
- Property choices must come only from Core `sales:deal` fields.
- Deal detail chips render through erxes-ui `Combobox.ChipTrigger`; every chip except stage
  passes a translated `label` by default so the field is named.
- Deal property detail must filter by the deal's `pipelineId` selection.
- Pipeline and POS mutations must refresh or update Apollo state immediately.
- Pipeline archive keeps optional hook variables intact; the row action supplies
  the required `_id` when it invokes the mutation.
- POS category mappings use `SelectCategory`'s `value`/`onValueChange` contract
  in single mode, normalizing string/array values and clearing to an empty id.
- Stage name inputs use a mutable nullable ref so React Hook Form registration
  and autofocus both receive the same input element. Sortable drag overlays stay
  portaled to `document.body`; its React 18 portal assertion is confined to the
  React DOM boundary where installed type packages resolve different versions.
- POS creation refetches the explicit POS query names that are currently active,
  preserving each query's variables. Unmounted report queries must not produce
  Apollo unknown-query warnings.
- An enabled POS customer form must keep `primaryEmail` or `primaryPhone`;
  the last one placed cannot be hidden. Featured (plugin-owned) customer
  properties are not offered.
- Deal product create, update, and delete flows must keep the table responsive
  without requiring a manual refresh.
- Root row `uom`, `unitPrice`, and `quantity` remain in base units for totals
  and integrations. `uomInfo` holds input values: base price is info price
  multiplied by ratio, base quantity is info quantity divided by ratio.
  Backend repeats this calculation before persistence. Never refresh a saved ratio from current catalog
  data; a new selection takes the current product ratio. Base units use 1.
- UOM choices in both views include the product base and sub-UOMs, the cached base
  UOM, and saved selection. Invalid catalog ratios are disabled.
- Replacing a product resets its base UOM, price, and entry info; duplication
  preserves the info. Advanced base price/quantity edits update entry values.
  UOM entry defaults and selection changes use `utils/productUom.ts`; table
  filtering and saved ordering share the same entry/base column-id groups.
- `uomInfo` is the only entry-unit metadata field; missing info is filled from
  base-unit fields rather than an alternate metadata format.
  Backend omits info for base-unit selections. Acknowledgements compare such
  saves with root price/quantity, and the UI reconstructs editable base info.
- The product replacement chooser keeps its cached initial selection. Its
  `IProduct` assertion is limited to the shared `initialProducts` prop, which
  reads only `_id`, `name`, and `code`; selected replacements come from the
  shared chooser's full product query. Do not widen the Sales query types.
- When subscription data temporarily lacks computed pipeline metadata, detail
  views retain the last resolved metadata for the same deal only. Newer stored
  fields (including archive status and explicit null/empty clears) must not be
  replaced by the older complete snapshot (`utils/resolveDealDetail.ts`).
- Deal product selectors may pass sales context such as `pipelineId` into
  shared `ui-modules` selectors, but must not import another plugin directly.
- Expanded product view must render the same product workspace as the inline
  view so filters, table edits, add products, totals, and save behavior remain
  identical.
- Editing a row discount sets `hand` to the difference between requested total
  discount and existing automatic discount.
- Editing the footer total discount clears current `hand` for each matching
  currency row and adds the footer amount/percent on top of automatic
  discounts.
- Empty row discount inputs are treated as canceled edits; entering explicit
  `0` is still a real manual edit.
- Footer handle percent and amount drafts are mutually exclusive per currency;
  editing one clears the other so both inputs derive from the same `hand`
  discount state.
- Advanced view controls discount metadata and extended product fields; Tax view
  controls only product tax percent/amount columns and footer total tax.
- Deal start/close date selects: every variant opens a popover holding
  `DatePicker` in `inline` mode (typed input above the calendar). The `input`
  variant (used by deal detail) renders a labelled `Combobox.ChipTrigger` showing
  the date (red plus an "Ended N days ago" badge for a past close date) and an
  X button that clears it; `Combobox.ChipTrigger` swaps its chevron for that X only
  when `onClear` is passed. Other variants keep their own trigger, with the
  "Ended" badge as the trigger for a past close date. A padded `YYYY-MM-DD` or
  a calendar pick commits immediately; unpadded `YYYY-M-D` commits on Enter or
  blur; clearing sends `null` so the backend unsets the date.
- `Sheet.Header` is a fixed 40px row. A header with a visible second line (subtitle, record number, description) adds `h-auto py-2` so it sizes to its content; detail-page title rows are `h-10`, level with `PageHeader`.
- The POS list filter (`modules/pos/pos/PosFilter.tsx`) renders `PosFilterPopover` as the first child of `Filter.Bar`, so the filter icon stays fixed while selected filter chips appear after it; the total count stays last.
- Deal mutations send no `sourceConversationIds`; a deal is linked to a conversation only through its customer (`customerId`), which the conversation rail's Deals tab lists by.

## Validation

- `pnpm nx test sales_ui` (jsdom Jest with `~/*` and `@/*` mappers; `DealSideWidgets` rail scenarios)
- Deal rail smoke: open a deal synced to accounting and issued an eBarimt; the
  rail lists Customers, Companies, Transactions and eBarimt, and the
  Transactions / eBarimt tabs show only that deal's records.

- POS product filters smoke: add/edit/clear all six group filter selections, save and reopen; verify persistence, immediate list refresh, tag descendants, and OR/global-exclusion behavior after sync.

- Permission smoke: without `dealsProductsEdit`, base/entry prices and row/footer
  discounts remain read-only; without `dealsProductsDelete`, row and bulk delete actions
  are hidden. Grant each action independently and verify only its controls become
  available.

- `node --test frontend/plugins/sales_ui/src/modules/pos/pos-covers/components/__tests__/coverDetail.test.cjs`

- Cover note smoke: open a cover, edit and save its note, reopen and verify the
  saved text; clear and save, switch covers, and verify each one's own note.
  A failed save must show the error and retain the draft for retry.
- `node --test frontend/plugins/sales_ui/src/modules/pos/utils/__tests__/*.test.cjs`
- `node --test frontend/plugins/sales_ui/src/modules/automations/utils/__tests__/*.test.cjs`
- Smoke POS settings save/reopen, product-group add/remove, order and item
  rows opening the order panel (payments save and refetch), Cover rows opening
  the cover panel (delete closes it), filtered Cover deletion, Cover assignee
  display, and all POS report routes; two POSes' Covers lists show only their
  own covers, a POS without covers shows 0 records, an unknown `posId` shows an
  error, and a POS with more than 30 covers loads the rest on scroll.
- Integrations smoke: POS/pipeline Automations tab list and remove, payment
  selectors, deal relation POS orders panel, and the automation
  board/pipeline/stage text.

- `pnpm nx lint sales_ui`
- `pnpm exec tsc -p frontend/plugins/sales_ui/tsconfig.app.json --noEmit`:
  no diagnostics may point into `frontend/plugins/sales_ui`. Report diagnostics
  in shared libraries separately; do not suppress them or change those libraries
  as part of a Sales migration layer.
- Compose the codegen schema with `pnpm nx run gateway:schema:compose --skip-nx-cache --parallel=2`.
- `pnpm nx run sales_ui:codegen --skip-nx-cache`
- Papa smoke: connect the Papa account on a POS's Delivery tab, add a pickup
  address, enable Papa and save; on a delivery order's Delivery tab get a
  price, send it, and confirm status, codes and driver update as the dev
  driver requests accept, start and finish it.
- `pnpm nx build sales_ui`
- Codegen startup smoke: with `src/gql/` absent, both the production build and
  `ENABLED_PLUGINS=sales pnpm dev:uis` must generate it before booting. During
  development, editing a GraphQL document must trigger the codegen watcher.
- `node --test frontend/plugins/sales_ui/src/modules/deals/utils/__tests__/dealJson.test.cjs frontend/plugins/sales_ui/src/modules/deals/cards/components/detail/product/utils/__tests__/productUom.test.cjs`
- `node --test frontend/plugins/sales_ui/src/modules/deals/utils/__tests__/dealReviewRegressions.test.cjs`
- Deals migration smoke: create/edit/watch a deal; move stages, edit labels and
  checklists, and add/edit/remove products. Verify immediate list/detail updates
  and subscription updates with no Apollo cache or missing-field warnings.
- Deal UOM smoke scenario: in normal view select a sub-UOM, edit its price and
  quantity, save and reload; verify Advanced shows base price/quantity and the
  saved ratio. Switching units alone preserves totals; changing catalog ratios
  must not change a saved ratio. Duplicate a row and replace its product to
  verify info preservation and reset, respectively.
- Deal product smoke scenario: open a deal's Products tab, toggle expanded view,
  filter products, edit a row, add products, save, close the expanded view, and
  verify the inline table shows the same state.
- POS settings smoke scenario: in the POS list choose Edit, open the panel's
  Permission tab, toggle cashier "SEE REPORT", save, expand to the page and
  verify the value persists after reload.
- POS customer smoke scenario: open the "Customer registration" tab, enable it,
  hide e-mail (phone stays locked on), add a property, rearrange in Edit
  layout, save, and verify the layout persists after reload.
- Loyalty points page smoke scenario: open Sales Pipeline → Loyalty points
  and verify rows from several pipelines with no board chosen and no
  `pipelineId` added to the URL; filter by two boards, then one pipeline and
  a stage; click a board in the sidebar and verify it opens the deals page.
  As a user outside a private pipeline, verify its deals are not listed.
- Dashboard widgets smoke scenario: with loyalty enabled, on Home add each
  Loyalty tile, pick a board and two pipelines (and a period for the
  timeline tiles), save, and verify the figures match the Loyalty points page
  filtered the same way; edit a tile's settings and verify it reloads; with
  loyalty disabled verify the tiles show the loyalty-off state.
- Points view smoke scenario: with loyalty enabled, move a deal with a
  customer into an earning stage, open Display → Points and verify the
  earned row; filter by stage and assignee, scroll to load more, open a
  deal from its name, then move it to a refund stage and verify the refund row.
- Tier rules smoke scenario: open "Score earn configuration", switch to Tier,
  add an every-board row, pick a wallet, set bands, save, reopen and verify
  the row; set a POS's tier in its Payment tab, save and verify after reload.
- Source automations smoke scenario: open a POS's or a pipeline's
  "Automations" tab, connect a score campaign in the loyalty section, save in
  the builder, use the back link, and verify the automation is listed.
