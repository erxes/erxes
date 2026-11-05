# Extension UI

## CONFIG

`ui/src/config.tsx` exports `CONFIG: IExtensionUIConfig` (from `erxes-ui`). It is the remote's only expose. Each placed component is `extensionComponent(() => import('./X').then((m) => m.X))`: a lazy chunk, loaded the first time the host renders it, inside the host's Suspense and error boundary.

| Placement         | Shape                                             | Component props                                                                               |
| ----------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `pages`           | `{ label, path, icon?, component }`               | none. Mounted at `/<host>/<path>/*` with a link in the host's sidebar. Not for `host: 'core'` |
| `sideTabs`        | `{ name, label, icon, contentTypes, component }`  | `{ contentType, contentId }`, also from `useRecordContext()`                                  |
| `recordActions`   | `{ [contentType]: component }`                    | none. Read the records with `useRecordSelection()` (`ui-modules`)                             |
| `recordColumns`   | `{ [contentType]: { name, label, component }[] }` | `{ contentType, contentId }`                                                                  |
| `composerActions` | `{ id, label, icon, component }`                  | `IComposerActionProps`: `insertText`, `contentType`, `contentId`, `isInternalNote`            |

`contentType` values are `RECORD_CONTENT_TYPES` from `erxes-ui`. `host` must be a loaded plugin (`sales`, `frontline`, ...) or `core`. core-ui logs a CONFIG that fails validation and skips it.

## Data

`extensionComponent` puts the extension's own client, pointed at `/pl:extensions/graphql/<id>`, in an SDK context. It is not an `ApolloProvider`: the host's client stays the default, so `erxes-ui` and `ui-modules` widgets inside the component (member or customer pickers) still query core. The extension's cache is separate from the host's.

```ts
// ui/src/graphql.ts
import { gql } from './gql';

export const NOTE_LIST = gql(`
  query dealInsightsNoteList {
    dealInsightsNotes { _id text }
  }
`);
```

- Import `useQuery`, `useLazyQuery` and `useMutation` from `erxes-sdk/react`, never from `@apollo/client`. They are Apollo's hooks with the extension's client and keep Apollo's signatures. `erxes-ext codegen` types the `gql()` documents against the extension's own SDL, so `data` is typed.
- Need the client itself, for `refetchQueries` after a loop of calls? Take `client` from the `useMutation` result. `useApolloClient()` returns the host's client.
- Prefix operation names with `pluginName`. Operation names must be unique across the repo.
- After a mutation, pass `refetchQueries: ['<operationName>']`, or update the cache, so the screen changes without a reload.
- The SDK hooks only work inside a component from `extensionComponent`. Outside one they throw.
- For core data your own resolvers combine with your collections, fetch it in a resolver through `ctx.gql` and return it.

## Permissions

```ts
// ui/src/utils.ts
import { permissionAction } from 'erxes-sdk/react';
import type { extension } from '../../server';

export const can = permissionAction<typeof extension>;
```

`<Can action={can('notes.add')}>` from `ui-modules` hides what the user can't do. The key is typed by the extension's `permissions`. The server enforces the same key through `fieldPermissions`.

## Rules the host's code follows too

- Components come from `erxes-ui` and `ui-modules`. Tailwind classes work, and the build ships only the rules the host's CSS lacks.
- Forms use React Hook Form with `zodResolver`. Import the zod schema from `server/db/definitions/` so client and server validate alike.
- Feedback is a `toast` on every mutation's success and failure. Deletes go through `useConfirm`.
- The UI imports the server only as types, plus zod schemas.
