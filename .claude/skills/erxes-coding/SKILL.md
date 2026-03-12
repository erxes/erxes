---
name: erxes-coding
description: Use this skill when writing or reviewing code for erxes frontend plugins (operation_ui, frontline_ui, etc.). Enforces the project's architecture, naming conventions, component size limits, and technology stack.
---

# Erxes Frontend Plugin Coding Standards

## Core Rules

- **Max 200 lines per component file.** If a component grows beyond this, split it into smaller components, extract hooks, or create sub-components in a `detail/` or sub-folder.
- **No logic in page components.** Pages are layout-only. Business logic belongs in hooks.
- **One hook per concern.** Each custom hook handles one data-fetching or state concern.

---

## Folder Structure

Every module follows this layout:

```
src/modules/[feature]/
├── components/           # React components (PascalCase.tsx)
│   ├── detail/           # Sheet/detail panel components
│   ├── add-[entity]/     # Create/add form components
│   └── [entity]-selects/ # Dropdown/select components
├── graphql/
│   ├── queries/          # Query files (camelCase.ts)
│   └── mutations/        # Mutation files (camelCase.ts)
├── hooks/                # Custom hooks (useFeature.tsx)
├── states/               # Jotai atoms ([feature]State.ts)
├── types/
│   ├── index.ts          # Interfaces + re-exports
│   └── validations.ts    # Zod schemas
└── constants.ts          # Module constants
```

Pages live at `src/pages/[Name]Page.tsx`.
Routes are defined in `src/modules/[Module]Main.tsx` or `[Module]Settings.tsx`.

---

## Naming Conventions

| Element         | Convention                    | Example                                         |
| --------------- | ----------------------------- | ----------------------------------------------- |
| Components      | PascalCase                    | `TaskBoardCard`, `SelectStatusTask`             |
| Component files | PascalCase.tsx                | `TaskBoardCard.tsx`                             |
| Hook files      | camelCase.tsx                 | `useGetCycles.tsx`                              |
| GraphQL queries | SCREAMING_SNAKE_CASE          | `GET_CYCLES`                                    |
| GraphQL files   | camelCase.ts                  | `getCycles.ts`                                  |
| Jotai atoms     | camelCase + `Atom` or `State` | `cycleDetailSheetState`, `taskCountByBoardAtom` |
| State files     | camelCase + `State.ts`        | `cycleDetailSheetState.ts`                      |
| Constants       | SCREAMING_SNAKE_CASE          | `CYCLES_PER_PAGE`                               |
| Interfaces      | `I` prefix                    | `ICycle`, `ITask`                               |
| Enums           | PascalCase                    | `SelectTriggerVariant`                          |
| Pages           | PascalCase + `Page` suffix    | `TasksPage`, `CyclesPage`                       |

---

## Import Path Aliases

```typescript
~  → src/                   // pages, types, root
@/ → src/modules/           // feature modules
```

Examples:

```typescript
import { TasksPage } from '~/pages/TasksPage';
import { GET_CYCLES } from '@/cycle/graphql/queries/getCycles';
import { useGetCycles } from '@/cycle/hooks/useGetCycles';
import { PageHeader } from 'ui-modules';
import { Breadcrumb, Button } from 'erxes-ui';
```

---

## Technology Stack

- **React Router v7** — `Routes`, `Route`, `Outlet`, `useParams`, `useLocation`
- **Apollo Client** — `useQuery`, `useMutation`, `subscribeToMore`
- **Jotai** — `atom`, `useAtomValue`, `useSetAtom`
- **Zod** — runtime validation, `z.infer<typeof schema>` for types
- **Tailwind CSS** — all styling via utility classes
- **date-fns** — date formatting
- **@tabler/icons-react** — icons
- **erxes-ui** — design system (Breadcrumb, Button, Badge, Combobox, Form, Popover, Separator, Filter, etc.)
- **ui-modules** — layout components (PageHeader, SettingsHeader, PageContainer)

---

## GraphQL Patterns

### Query file

```typescript
import { gql } from '@apollo/client';

export const GET_ITEMS = gql`
  query GetItems($teamId: String) {
    getItems(teamId: $teamId) {
      list {
        _id
        name
      }
      totalCount
    }
  }
`;
```

### Hook with query

```typescript
export const useGetItems = (options?: QueryHookOptions<...>) => {
  const { toast } = useToast();
  const { data, loading, error } = useQuery(GET_ITEMS, {
    ...options,
    onError: (e) => {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    },
  });

  const { list: items, totalCount } = data?.getItems || {};
  return { items, loading, error, totalCount };
};
```

### Mutation hook

```typescript
export const useUpdateItem = () => {
  const [updateItem, { loading }] = useMutation(UPDATE_ITEM, {
    onError: (e) => toast({ ... }),
  });
  return { updateItem, loading };
};
```

---

## State Management

### Jotai atom (simple)

```typescript
// states/itemDetailSheetState.ts
import { atom } from 'jotai';
export const itemDetailSheetState = atom<string | null>(null);
```

### Jotai atom (derived)

```typescript
export const itemByIdAtom = atom((get) => (id: string) => get(allItemsMapState)[id]);
```

### Usage in component

```typescript
const activeId = useAtomValue(itemDetailSheetState);
const setActiveId = useSetAtom(itemDetailSheetState);
```

---

## Component Patterns

### Page component (layout only, no business logic)

```typescript
export const ItemsPage = () => {
  const { teamId } = useParams();
  return (
    <>
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>...</Breadcrumb>
        </PageHeader.Start>
        <AddItemSheet />
      </PageHeader>
      <div className="flex overflow-hidden w-full h-full">
        <ItemsView />
      </div>
    </>
  );
};
```

### Variant-driven select component

```typescript
export enum SelectTriggerVariant {
  TABLE = 'table',
  CARD = 'card',
  DETAIL = 'detail',
  FORM = 'form',
  FILTER = 'filter',
}

export const SelectTriggerItem = ({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: `${SelectTriggerVariant}`;
}) => {
  if (variant === SelectTriggerVariant.TABLE) {
    return <RecordTableInlineCell.Trigger>{children}</RecordTableInlineCell.Trigger>;
  }
  if (variant === SelectTriggerVariant.CARD) {
    return (
      <Popover.Trigger asChild>
        <Badge variant="secondary" onClick={(e) => e.stopPropagation()}>
          {children}
        </Badge>
      </Popover.Trigger>
    );
  }
  // ... other variants
  return <Combobox.TriggerBase>{children}</Combobox.TriggerBase>;
};
```

### Context for shared data

```typescript
export const FeatureContext = createContext<IItem | null>(null);

export const FeatureProvider = ({
  value,
  children,
}: {
  value: IItem;
  children: React.ReactNode;
}) => <FeatureContext.Provider value={value}>{children}</FeatureContext.Provider>;

export const useFeatureContext = () => {
  const ctx = useContext(FeatureContext);
  if (!ctx) throw new Error('useFeatureContext must be used within FeatureProvider');
  return ctx;
};
```

---

## Routes Pattern

```typescript
const FeatureMain = () => (
  <Suspense fallback={<div />}>
    <Routes>
      <Route path="/" element={<Navigate to="items" replace />} />
      <Route path="items" element={<ItemsPage />} />
      <Route path="items/:itemId" element={<ItemDetailPage />} />
    </Routes>
  </Suspense>
);

export default FeatureMain;
```

---

## Type Definitions

```typescript
// types/index.ts
import { z } from 'zod';
import { addItemSchema } from './validations';

export interface IItem {
  _id: string;
  name: string;
  createdAt: string;
  teamId: string;
}

export type TAddItem = z.infer<typeof addItemSchema>;
export * from './validations';
```

---

## Do / Don't

**Do:**

- Keep components under 200 lines
- Extract all data fetching into custom hooks
- Use Jotai atoms for modal/sheet open state
- Use Tailwind for all styling
- Use `erxes-ui` components before creating new ones
- Type everything with TypeScript interfaces prefixed `I`
- Name query files after the operation (getCycles.ts → GET_CYCLES)

**Don't:**

- Put GraphQL queries directly in components
- Use local `useState` for data that belongs in atoms
- Mix layout and business logic in the same component
- Create utility helpers for one-time operations
- Add unnecessary comments — write self-documenting code
- Use CSS-in-JS or inline styles (use Tailwind)
