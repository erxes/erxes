# Files module (core-ui)

The `/files` app: My files (`/files`), Org drive (`/files/org`), Shared with
me (`/files/shared`), Trash (`/files/trash`). Backend rules live in
`backend/core-api/src/modules/files/AGENTS.md`; shared pieces (upload engine,
`FilePicker`, previews, GraphQL documents, `useFilesBrowser`) live in
`frontend/libs/ui-modules/src/modules/files` so plugins can reuse them.

## Layout

| Path                                                            | Responsibility                                                              |
| --------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `context/FilesPageContext.tsx`                                  | Page state: space, browser data, dialogs, selection                         |
| `components/FilesWorkspace.tsx`                                 | List alone, or list + preview in a resizable split                          |
| `components/FilesPreviewPanel.tsx`                              | Preview body used by both the sheet and the split                           |
| `components/FilesAccessDialog.tsx` / `FilesBulkShareDialog.tsx` | Edit one item's access / add people to many                                 |
| `components/FilesCommandBar.tsx`                                | Selection bar: move, share, appearance, pin, trash                          |
| `components/FilesDndProvider.tsx`                               | dnd-kit drag-to-move onto folder cards and breadcrumb                       |
| `hooks/`                                                        | All logic; components only render                                           |
| `states/`                                                       | Per-browser prefs (`filesLayout`, `filesPreviewMode`) via `atomWithStorage` |

## Rules

- Show actions by the server's `myRole` (`filesCanContribute` /
  `filesCanManage`), never by permission groups; the server enforces anyway.
- Selection: click opens; Cmd/Ctrl/Shift, or any active selection, toggles;
  Esc or empty-space click clears; it resets on folder, space or search change.
- Bulk share only adds grants; it never replaces an item's list.
- Pins are capped at 10 (`constants/filesLimits.ts`, mirrors the server).
- Internal drags use dnd-kit pointer events; OS file drops stay HTML5 for upload.
- Product forms attach through `ProductFilesUpload` (ui-modules products):
  the picker offers only files the user manages. A pick is pending (`fileId`,
  no url) until Save, where `useProductFileLinks().linkFiles` creates the
  public share links, so a cancelled form publishes nothing.
- Card `onKeyDown` opens only for events on the card itself, not ones bubbling
  from its menu or checkbox.
- Public link URLs are built client-side from `REACT_APP_API_URL`
  (`filesShareUrl`), like read-file links.
- After any mutation refetch the affected `Files*` queries; lists show
  `publicLink` and `sharedWith`, so link and access changes refetch lists too.
- Local core-ui HMR does not pick up changes: restart after editing.

## Validation

- `pnpm nx test core-ui --testPathPattern=modules/files`
- `NODE_OPTIONS=--max-old-space-size=8192 pnpm nx build core-ui`
- `npx eslint frontend/core-ui/src/modules/files`
