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
- For cursor lists, reuse existing `RecordTable.CursorProvider`,
  `useRecordTableCursor`, and `validateFetchMore` patterns where present.

## Avoid

- Duplicating Apollo data into Jotai or local state without a clear reason.
- Storing form values in global atoms.
- Hidden effects that mutate unrelated atoms when rendering.
- Replacing established table/page state patterns with one-off state logic.
