# Base UI migration: `packages/ui` off Radix

`packages/ui` (`erxes-ui`) moves from Radix to [Base UI](https://base-ui.com)
(`@base-ui/react`, pinned at `1.9.0`). This is the Phase 2 rewrite of the copied
design system, done component by component, with core-ui and old plugin UIs
working after every step.

## Why

Measured 2026-11-12.

|                     | Radix (`radix-ui` 1.8.1)                                             | Base UI (`@base-ui/react` 1.9.0)                                               |
| ------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Owner               | WorkOS                                                               | MUI                                                                            |
| Original Radix team | Last commits 2023–2024; Colm Tuite (co-creator) now works on Base UI | Colm Tuite (product), Vlad Moroz (2024–2026), atomiks (Floating UI) leads code |
| Maintainers now     | One engineer: 236 of ~245 human commits since May 2026               | MUI team: atomiks 1,069 commits, Michał Dudak 539, ~6 others                   |
| Activity            | 6 commits Nov 2025–Apr 2026, bursts in Jun–Jul and Oct 2026          | 110–190 commits every month for 18 months                                      |
| Last 90 days        | 41 PRs merged                                                        | 442 PRs merged                                                                 |
| Releases            | 1.8.1 on 2026-10-12                                                  | A minor every month; 1.9.0 on 2026-10-09                                       |
| Components we lack  | —                                                                    | Combobox, Autocomplete, NumberField, OTPField, Drawer, Field/Form, Menubar     |

It supports React 17–19, so it does not wait for the React 19 upgrade.

## Ground rules

1. **Our API stays.** Consumers keep `Popover.Trigger`, `Popover.Content`,
   `Dialog.Content`, `Select.Item` … A wrapper maps our part names to Base UI's
   (`Popover.Content` = `Portal` + `Positioner` + `Popup`). core-ui changes only
   where it used Radix-specific props or attributes.
2. **`render` replaces `asChild` in this repository.** Our own code moves to
   `render={<Link … />}`. A lint rule bans `asChild` in `apps/` and `packages/`
   once the codemod has run.
3. **Plugins move with it, no shim.** Plugin UIs receive the host's `erxes-ui`
   through Module Federation (`SHARED` in `apps/core-ui/rsbuild.config.ts`), so
   this is a breaking change for them: an `asChild` the wrapper no longer reads
   renders a nested element instead of failing. HR, the only plugin on this core
   today, has 81 `asChild` uses and 4 `data-[state=…]` classes. Per `AGENTS.md`
   there is no compatibility layer. Instead the codemod from step 2 ships in
   `.agents/skills/plugin-migrate` as an `ast-grep` rule, HR is converted in the
   same release, and the release notes mark `erxes-ui` as breaking.
4. **Base UI is shared too.** Add `@base-ui/react` to `SHARED` as a singleton,
   so a plugin that imports it directly shares contexts with the host.
5. **Pinned version, one place.** Only `packages/ui` imports `@base-ui/react`. A
   lint rule bans it, `radix-ui` and `@radix-ui/*` everywhere else.

## What changes, mechanically

| Radix                                                         | Base UI                                                         | Count today (packages/ui + core-ui) |
| ------------------------------------------------------------- | --------------------------------------------------------------- | ----------------------------------- |
| `asChild`                                                     | `render={<El />}`                                               | 102 + 103                           |
| `Slot` (in our own components that take `asChild`)            | `useRender` + `mergeProps`                                      | 8 imports                           |
| `data-[state=open]` / `closed`                                | `data-open:` / `data-closed:` (Tailwind 4 boolean variant)      | 191 + 25 (all states)               |
| `data-[state=checked]` / `unchecked`                          | `data-checked:` / `data-unchecked:`                             | included above                      |
| `data-[state=active]` / `inactive` (tabs)                     | `data-active:` / `not-data-active:`                             | included above                      |
| `data-[side=…]`                                               | `data-[side=…]` (unchanged)                                     | 44                                  |
| `animate-in` / `animate-out` on state (`tailwindcss-animate`) | transitions on `data-starting-style:` / `data-ending-style:`    | most overlay files                  |
| `--radix-popover-trigger-width` and similar                   | `--anchor-width`                                                | 13 (all `--radix-*`)                |
| `--radix-…-content-available-height`                          | `--available-height`                                            |                                     |
| `--radix-…-content-transform-origin`                          | `--transform-origin`                                            |                                     |
| Accordion content height variable                             | `--accordion-panel-height`                                      |                                     |
| `Content` / `Overlay`                                         | `Positioner` + `Popup` / `Backdrop`; `Portal` is explicit       | every overlay                       |
| `onOpenChange(open)`                                          | `onOpenChange(open, eventDetails)` (extra argument, compatible) | —                                   |

## Component map

Consumers = files that render the component in core-ui / in `packages/ui/src/modules`.

### Overlays and positioned popups (highest risk: focus, portals, animation)

| Ours            | Radix today  | Base UI                                      | Consumers | Notes                                                                                                                  |
| --------------- | ------------ | -------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------- |
| `popover`       | Popover      | Popover                                      | 28 / 13   | 26 `Popover.Trigger asChild` in core-ui. Width via `--anchor-width`.                                                   |
| `tooltip`       | Tooltip      | Tooltip (+ `Tooltip.Provider` for delay)     | 8 / 6     |                                                                                                                        |
| `dropdown-menu` | DropdownMenu | Menu                                         | 11 / 4    | Submenus: `Menu.SubmenuRoot` + `SubmenuTrigger`. `data-highlighted` unchanged.                                         |
| `context-menu`  | ContextMenu  | ContextMenu                                  | 1 / 0     |                                                                                                                        |
| `select`        | Select       | Select                                       | 19 / 3    | Base UI aligns the selected item over the trigger by default; set `alignItemWithTrigger={false}` to keep today's look. |
| `dialog`        | Dialog       | Dialog                                       | 10 / 4    |                                                                                                                        |
| `alert-dialog`  | AlertDialog  | AlertDialog                                  | 1 / 0     |                                                                                                                        |
| `sheet`         | Dialog       | Dialog (side panel); Drawer for mobile swipe | 8 / 1     | 20 state classes. Keep Dialog; Drawer only where swipe-to-close is wanted.                                             |
| `command-bar`   | Popover      | Popover                                      | —         |                                                                                                                        |
| `toasts`        | Toast        | Toast                                        | 47 / 8 HR | Used through `toast()`, which keeps its signature. Stacking uses `--toast-index`.                                      |

### Form controls

| Ours           | Radix today | Base UI                    | Consumers | Notes                                                                |
| -------------- | ----------- | -------------------------- | --------- | -------------------------------------------------------------------- |
| `checkbox`     | Checkbox    | Checkbox                   | 7 / 3     | `Checkbox.Indicator` for the tick.                                   |
| `switch`       | Switch      | Switch                     | 14 / 0    | `Switch.Thumb`.                                                      |
| `radio-group`  | RadioGroup  | RadioGroup + Radio         | 0 / 1     |                                                                      |
| `slider`       | Slider      | Slider                     | 0 / 1     | `Control` + `Track` + `Indicator` + `Thumb`.                         |
| `toggle`       | Toggle      | Toggle                     | 0 / 2     | `data-pressed`.                                                      |
| `toggle-group` | ToggleGroup | ToggleGroup                | 2 / 4     |                                                                      |
| `label`        | Label       | Field.Label (inside Field) | 13 / 2    | Plain `<label>` where there is no Field.                             |
| `form`         | Slot        | Field + Form               | 13 / 3    | Keep react-hook-form; Field gives ids, error and description wiring. |

### Layout and display

| Ours          | Radix today | Base UI     | Consumers | Notes                                                            |
| ------------- | ----------- | ----------- | --------- | ---------------------------------------------------------------- |
| `tabs`        | Tabs        | Tabs        | 6 / 3     | `Tabs.Trigger` → `Tabs.Tab`, `Content` → `Panel`; `data-active`. |
| `collapsible` | Collapsible | Collapsible | 4 / 1     | `Content` → `Panel`.                                             |
| `scroll-area` | ScrollArea  | ScrollArea  | 28 / 5    | `Scrollbar` + `Thumb`; check virtualised tables inside it.       |
| `separator`   | Separator   | Separator   | 4 / 9     |                                                                  |
| `avatar`      | Avatar      | Avatar      | 10 / 1    |                                                                  |

### Our components built on `Slot`

`button` (100 / 26 consumers), `badge`, `breadcrumb`, `sidebar` (10 files, 20
`Slot` uses, 17 `asChild`), and `RelativeDateDisplay` (15 `asChild` callers):
replace `Slot` with `useRender`, take `render`, drop `asChild`.

### Third-party libraries Base UI replaces

| Ours                               | Today          | Base UI                                   | Consumers |
| ---------------------------------- | -------------- | ----------------------------------------- | --------- |
| `command`                          | cmdk           | Autocomplete (inline) or Menu with filter | 22 / 9    |
| `combobox`                         | Popover + cmdk | Combobox                                  | 14 / 10   |
| number inputs (`input` with imask) | react-imask    | NumberField where the value is a number   | per field |

### Deleted, not ported

Nothing in core-ui, `packages/ui/src/modules` or the HR plugin uses these:
`hover-card`, `accordion`, `multiselect` (cmdk), `string-array` (emblor),
`input-otp` (input-otp) and `stepper`. They go in step 1. A plugin that needs one
later gets it built on Base UI then (PreviewCard, Accordion, Combobox with
`Chips`, OTPField).

### Unchanged

No Radix today, nothing to do beyond the shared lint and `render` work:
`alert`, `background-gradient-animation`, `card`, `charts` (recharts),
`calendar` and `date-picker` (react-day-picker; Base UI has no calendar),
`color-picker`, `copy-text`, `drag-handle`, `empty`, `erxes-logo-icon`,
`info-card`, `input`, `kbd`, `resizable` (react-resizable-panels),
`search-order-select`, `sidebar-tree-indicator`, `skeleton`, `spinner`,
`table`, `text-overflow`, `textarea`, `time-picker` (react-aria-components;
Base UI has no time field), `toaster`, `upload`, `upload-new`.

Three files outside `components/` import Radix directly and move with their
component: `modules/board/components/Board.tsx`,
`modules/record-table/components/RecordTableCellInline.tsx`,
`modules/record-table/components/RecordTableHotkeyCell.tsx`.

## Order

Each step ends green on `pnpm check`, plus a pass through the component gallery
(step 0) in the browser, light and dark.

0. **Groundwork.** Add `@base-ui/react@1.9.0` to `packages/ui` and to `SHARED`.
   Add a development-only gallery route in core-ui (`/dev/ui`) that renders
   every component in each state: open, closed, disabled, invalid, long content,
   inside a dialog. Add the lint rules from ground rules 2 and 5 (the `asChild`
   ban starts as a warning). Add interaction tests (vitest + Testing Library)
   for the overlay group: open with keyboard, focus moves in, Escape closes,
   focus returns to the trigger.
1. **Delete the unused six, then the simple primitives:** separator, label,
   avatar, switch, checkbox, radio-group, toggle, toggle-group, slider,
   collapsible, tabs, scroll-area.
2. **`Slot` → `useRender`:** button, badge, breadcrumb, form, sidebar,
   `RelativeDateDisplay`. Then the codemod (an `ast-grep` rule, kept for
   plugins): every `asChild` in core-ui and `packages/ui/src/modules` becomes
   `render`; the lint rule becomes an error. Run the same rule on HR.
3. **Overlays:** tooltip, popover, command-bar, dropdown-menu, context-menu,
   select, dialog, alert-dialog, sheet, toasts. One component per commit; each
   checked in the gallery and in the HR plugin UI.
4. **Replacements:** combobox and command move off cmdk.
5. **Clean-up:** remove `radix-ui`, `@radix-ui/*`, `cmdk`, `input-otp`,
   `emblor` and `tailwindcss-animate`. Run `knip` for dependencies nothing
   imports any more.

## Not in this change

- React 19: separate step; Base UI works on 18.
- `@apollo/client` stays in `SHARED`: plugin UIs built for old core-ui need the
  host's instance until they move to oRPC.
