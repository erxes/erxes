# React State Management

## State Choices

Use the smallest state mechanism that fits the behavior:

- Local `useState` or `useReducer` for component-local UI state.
- React Hook Form for form state.
- Apollo Client for server data, loading state, cache updates, and refetching.
- URL query state for filters, search, view modes, cursors, and table controls
  when the existing page does.
- Jotai for shared sibling/page state, global app state, persisted UI state, and
  established table/detail state patterns.

## Jotai Patterns

erxes uses raw Jotai atoms and Jotai utilities.

```typescript
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export const taskCreateSheetState = atom(false);

export const tasksViewAtom = atomWithStorage<'list' | 'grid'>(
  'tasks-view',
  'list',
);
```

Guidelines:

- Keep atoms near the feature in a `states` or `state` file unless they are
  shared library state.
- Use `useAtomValue` for read-only access.
- Use `useSetAtom` for write-only access.
- Use `useAtom` only when the component both reads and writes.
- Do not create global atoms for state that is only used by one component.

## Apollo State

- Let Apollo own fetched server data.
- Prefer existing hook wrappers for queries and mutations.
- Keep mutation side effects consistent with nearby code: toast, cache update,
  refetch, closing drawers, and resetting forms.
- After create, update, delete, convert, or bulk actions, update the visible UI
  without requiring a browser refresh. Use the local Apollo pattern:
  `cache.modify`, mutation `update`, `refetchQueries`, `client.refetchQueries`,
  or an existing subscription flow.
- Prefer targeted cache updates for simple single-record changes and
  `refetchQueries` for filtered, aggregated, paginated, or permission-scoped
  data where manual cache updates would be fragile.
- For cursor lists, reuse existing `RecordTable.CursorProvider`,
  `useRecordTableCursor`, and `validateFetchMore` patterns where present.

## Context and Providers

- Use React context for scoped component trees, compound components, relation
  widgets, editor integrations, selectors, or provider composition.
- Keep contexts near the feature unless they are exported from `erxes-ui` or
  `ui-modules`.
- Prefer a local hook such as `useFeatureContext` when nearby code uses that
  pattern.
- Use `*ProviderEffect` components for host-level side effects only when the
  surrounding provider setup already follows that pattern.

## Avoid

- Duplicating Apollo data into Jotai or local state without a clear reason.
- Storing form values in global atoms.
- Hidden effects that mutate unrelated atoms when rendering.
- Replacing established table/page state patterns with one-off state logic.
