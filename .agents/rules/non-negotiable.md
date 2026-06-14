# Non-Negotiable Rules

## Severity: CRITICAL

These rules **MUST NOT** be broken under any circumstance. Breaking these rules will cause system failure, broken UX, or rejected PRs.

## 1. Component Usage (ZERO TOLERANCE)

### ONLY erxes-ui Components
- You MUST import and use ONLY components from `erxes-ui` library
- You MUST NOT import from `@radix-ui/*` directly
- You MUST NOT create custom UI primitives (buttons, inputs, labels, etc.)
- You MUST use composed components from erxes-ui (Form.Field, RecordTable.Provider, Sheet.Content, etc.)
- Using Button, Input, etc. from erxes-ui IS allowed when used within composed patterns

### Forbidden Patterns
```tsx
// ❌ NEVER DO THIS
import { Button } from "erxes-ui";
import { Label } from "erxes-ui";
import { Input } from "erxes-ui";
import * as Dialog from "@radix-ui/react-dialog";
```

### Required Patterns
```tsx
// ✅ ALWAYS DO THIS
import { RecordTable } from "erxes-ui";
import { Form } from "erxes-ui";
import { Sheet } from "erxes-ui";

// Use composed components only
<RecordTable.Provider>
  <RecordTable.Content>
    <RecordTable.Header />
    <RecordTable.Body />
  </RecordTable.Content>
</RecordTable.Provider>

<Form.Field>
  <Form.Label />
  <Form.Control />
  <Form.Message />
</Form.Field>

<Sheet.Trigger />
<Sheet.Content>
  <Sheet.Header />
  <Sheet.Body />
  <Sheet.Footer />
</Sheet.Content>
```

## 2. Real-Time Data (MANDATORY)

### ALL Data Operations Must Be Real-Time
After ANY mutation (create, update, delete):
- Lists MUST update immediately
- Detail views MUST update immediately
- Counters MUST update immediately
- Selectors/dropdowns MUST update immediately
- Related data MUST update immediately

### Forbidden Pattern
```tsx
// ❌ NEVER: "User must refresh to see changes"
// ❌ NEVER: "After mutation, show success toast but don't update list"
```

### Required Pattern
```tsx
// ✅ ALWAYS: Update Apollo cache or trigger refetch
// ✅ ALWAYS: Use cache updates, refetch, or subscribeToMore
// ✅ ALWAYS: Toast success AND update UI immediately
```

## 3. Completeness & Quality (MANDATORY)

### Every Feature Must Be Complete
- **NO button** is left without an `onClick` handler
- **NO page** renders empty without an empty state
- **NO form** submits without validation
- **NO mutation** fires without success/error toast
- **NO list** lacks create/edit/delete actions
- **NO table** lacks loading state
- **NO feature** is half-implemented (missing forms, missing mutations, etc.)
- **NO placeholder content** is allowed (e.g., "Coming soon", "Widget here", or generated "h1 Settings" without actual fields)

### Type Safety (ZERO TOLERANCE)
- **NO usage of `any`** in new or modified code
- **NO type casts** (`as any`, `as T`) unless strictly required by external library boundaries
- **NO missing types** on component props or hook returns

### Checklist Before Declaring Done
```
□ All buttons have actions
□ All pages have content or empty states
□ All forms have validation
□ All mutations show toast feedback
□ All lists update after mutations
□ All tables have loading states
□ All features have CRUD operations
□ All new routes are registered
□ All GraphQL operations are named correctly
```

## 4. Export Rules (ZERO TOLERANCE)

- **ONLY named exports**
- **NO default exports** under any circumstance
- This applies to ALL files: components, hooks, utils, configs

### Forbidden
```tsx
// ❌ NEVER
export default MyComponent;
```

### Required
```tsx
// ✅ ALWAYS
export const MyComponent = () => {};
```

## 5. GraphQL Rules (ZERO TOLERANCE)

- **NO duplicate operation names** across the entire repository
- **NO unnamed/anonymous operations**
- **ALWAYS prefix** with plugin/module name: `cmsPageList`, `salesDealCreate`
- **ALWAYS keep operations near feature** module

## 6. Backend Schema Rules (ZERO TOLERANCE)

- **NO new `schemaWrapper` usage**
- **ALWAYS use** `new Schema(...)` with explicit fields
- **ALWAYS preserve** existing ID conventions
- **NEVER modify** backend contracts from frontend-only work

## 7. Plugin Isolation (ZERO TOLERANCE)

- **NO cross-plugin imports**
- **NO importing** from `frontend/plugins/other_ui`
- **NO importing** from `backend/plugins/other_api`
- Shared code goes to `erxes-ui`, `ui-modules`, or `erxes-api-shared`

## 8. Testing & Validation (MANDATORY)

Before declaring any task complete:
1. `pnpm nx lint <plugin>` MUST pass
2. `pnpm nx build <plugin>` MUST pass
3. `pnpm nx test <plugin>` MUST pass (if tests exist)
4. TypeScript MUST compile without errors
5. No Sonar/lint warnings introduced

## 9. Code Quality (MANDATORY)

- **NO debug code** left in production (console.log, debugger, etc.)
- **NO commented-out dead code**
- **NO TODO comments** without ticket/issue reference
- **NO unused imports**
- **NO unused variables**

## Consequences of Breaking These Rules

If you break a non-negotiable rule:
1. The feature will not work correctly
2. The PR will be rejected
3. You must fix it before proceeding
4. If unsure, ASK rather than guess

## When in Doubt

**ASK.** Do not proceed if you're unsure whether something violates these rules.
