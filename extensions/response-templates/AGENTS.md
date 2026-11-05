# `response-templates` Extension Guide

## Identity

- **Extension:** `response-templates` (permission and remote name `responseTemplates`, remote `responseTemplates_ui`)
- **Project:** `response-templates` (pnpm workspace package, Nx application)
- **Layer:** erxes extension: worker server (`server/`) and UI remote (`ui/`)
- **Path:** `extensions/response-templates`
- **Last synchronized:** `2026-11-04`

## Scope

### Owns

- Response templates kept in the extension's own collection `ResponseTemplates` (`ext.response-templates.ResponseTemplates` per tenant).
- The Frontline > Response templates page and the composer's "Insert a response template" action.
- Importing frontline's own templates into that collection.

### Does not own

- Frontline's `response_templates` collection. The import reads it only through frontline's `responseTemplates` query as the caller.
- Channels, conversations and tickets. They're read through persisted GraphQL operations, never stored.
- The composer itself. `rs/frontline-composer` mounts `ComposerActions`; this extension only supplies the component.

## Current Capabilities

- List templates newest first, filtered by channel and by a case-insensitive search on name and content, 20 per page.
- Create, edit and delete templates (name, channel, editor content) with form validation, toasts and confirm on delete.
- Import from frontline: one page of 100 per call, repeated by the UI until the last page. Upserts by frontline `_id` (`sourceId`), so importing again updates the copies and overwrites edits made to them here.
- Composer picker: scoped to the open conversation's or ticket's channel until another channel or "All channels" is picked, server search, up to 50 results, click inserts `content`.

## Architecture

| Area        | Path                                                               | Responsibility                                                                                                 |
| ----------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Extension   | `server/index.ts`                                                  | `defineExtension`: schema, resolvers, collection, index, permissions, `fieldPermissions`                       |
| Collections | `server/connectionResolver.ts`                                     | `ResponseTemplates` and `IContext`                                                                             |
| Data        | `server/db/definitions/responseTemplates.ts`                       | Stored fields (frontline's, plus `createdBy`, `sourceId`) and `ResponseTemplateInput`, shared with the UI form |
| SDL         | `server/graphql/schema.ts`                                         | `types`, `queries`, `mutations`                                                                                |
| Queries     | `server/graphql/responseTemplateQueries.ts`                        | `responseTemplatesList`, `Detail`, `Channels`, `ComposerChannel`                                               |
| Mutations   | `server/graphql/responseTemplateMutations.ts`                      | `responseTemplatesAdd`, `Edit`, `Remove`, `ImportFromFrontline`                                                |
| Permissions | `server/meta/permissions.ts`                                       | `responseTemplates.{view,add,edit,remove}`                                                                     |
| Operations  | `server/operations/*.graphql`                                      | Persisted erxes reads, typed by `erxes-ext codegen` into `server/gql/`                                         |
| UI config   | `ui/src/config.tsx`                                                | Host `frontline`, page `response-templates`, composer action `insert`, each an `extensionComponent`            |
| UI GraphQL  | `ui/src/graphql.ts`                                                | `gql()` documents for the extension's schema, typed into `ui/src/gql/`                                         |
| Page        | `ui/src/ResponseTemplates.tsx`, `ui/src/ResponseTemplateSheet.tsx` | List, filters, import, create/edit sheet                                                                       |
| Picker      | `ui/src/ResponseTemplatePicker.tsx`                                | Composer action component                                                                                      |

## Contracts

### Provides

- GraphQL at `/pl:extensions/graphql/response-templates`: queries `responseTemplatesList`, `responseTemplatesDetail`, `responseTemplatesChannels`, `responseTemplatesComposerChannel`; mutations `responseTemplatesAdd`, `responseTemplatesEdit`, `responseTemplatesRemove`, `responseTemplatesImportFromFrontline`.
- UI remote `responseTemplates_ui` exposes only `./config`. Its `CONFIG` carries the page and picker components.

### Consumes

- `erxes-sdk` (`defineExtension`, `collection`, `Context`, `ctx.db`, `ctx.gql`, `extensionComponent`, `permissionAction`) and the `erxes-ext` CLI.
- `useQuery`/`useMutation` from `erxes-sdk/react`: the host's Apollo hooks bound to the extension's own client.
- GraphQL as the caller: `getChannels`, `conversationDetail.integration.channelId`, `getTicket.channelId`, `responseTemplates`.
- `erxes-ui` and `ui-modules` (`Can`) from the host.

## Data and State

- One tenant collection, `ResponseTemplates`, with a unique sparse index on `sourceId`: one copy per frontline template, any number of templates written here.
- `content` is the editor's blocks as JSON, the format frontline stores and the composer inserts.
- UI state is local React state and the extension's Apollo cache. Add, edit and remove refetch `extResponseTemplatesList`; the import refetches it once, after its last page.

## Local Invariants

- Every persisted operation is a named read and passes the runtime's shared deny checks at install.
- UI `<Can>` actions come from `can()` in `ui/src/utils.ts`, typed by the extension's permissions: `responseTemplates.responseTemplates.<action>`.
- Every root field has a `fieldPermissions` entry. The import needs `add`.
- The server is imported by the UI only as a type, except `ResponseTemplateInput`.

## Validation

- `pnpm nx run gateway:schema:compose` once, for codegen's schema. `pnpm nx build response-templates` runs it first on its own.
- `pnpm --filter response-templates codegen`, then `pnpm --filter response-templates check` (tsc over `server/` and `ui/src/`).
- `pnpm --filter response-templates build` writes `dist/response-templates-<version>.erxext.json`.
- Install on a running stack: `pnpm --filter response-templates exec erxes-ext install --owner=<ownerUserId>` with the stack's Redis env, or `ERXES_TOKEN` and `--url`, or upload the `.erxext.json` in Settings > Extensions. `pnpm --filter response-templates exec erxes-ext dev --owner=<ownerUserId>` reinstalls on every change when the runtime has `EXT_DEV_MODE=true`.
