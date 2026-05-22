# 10 — Code Style

> The conventions that govern every file you write or edit. Distilled from `CLAUDE.md`, `AGENTS.md`, `.cursorrules`. **This file is authoritative.**

## TypeScript

- **Strict null checks.** No `any` to silence the type checker.
- **Target ES2017.** Modules: CommonJS (backend), ESNext (frontend).
- **Naming:**
  - Interfaces / types: `PascalCase` (`IUser`, `DealInput`, `UserRole`)
  - Classes: `PascalCase` (`UserService`)
  - Functions / vars: `camelCase` (`getUserById`)
  - Constants (module-level globals): `UPPER_SNAKE_CASE` (`MAX_RETRY_COUNT`)
- **Files:**
  - Components: `PascalCase.tsx` (`UserProfile.tsx`)
  - Utils / services: `camelCase.ts` (`authService.ts`)
  - Configs: `kebab-case` (`module-federation.config.ts`)

## Prettier

```json
{ "singleQuote": true, "trailingComma": "all", "endOfLine": "auto" }
```

- Single quotes for strings
- Trailing commas in multi-line arrays/objects
- 2-space indentation (inferred)

## React (frontend)

- **Functional components with hooks.** No class components.
- **State**:
  - Local → `useState`
  - Global → Jotai atoms
  - Server → Apollo Client
  - Form → React Hook Form + Zod
- **Lazy-load Module Federation remotes**, always wrapped in `<Suspense>`.
- **Icons:** `@tabler/icons-react`
- **Charts:** `recharts`
- **Rich text:** Blocknote
- **Component primitives:** `erxes-ui` (Radix-based)

## File naming

- **Filenames are unique within a module.** Within a single plugin module (e.g. `frontend/plugins/sales_ui/src/modules/deals/`), no two files may share the same basename across sibling directories. `deal-selects/SelectX.tsx` AND `common/filters/SelectX.tsx` is forbidden — pick `SelectX.tsx` + `FilterX.tsx`, or namespace both surfaces under one file via `Object.assign(Root, { FilterBar, FilterView, FilterItem })`. See [`../SLOP-CHECKLIST.md`](../SLOP-CHECKLIST.md) "Two files with the same basename in sibling directories."
- This rule applies even when a sister field (e.g. `priority`) already violates it. The precedent is slop; do not inherit.

## Imports

- Absolute imports per `.cursorrules`:
  - `~/*` → service root (`./src/*`)
  - `@/*` → modules directory (`./src/modules/*`)
  - `erxes-api-shared/*` → shared lib (`../erxes-api-shared/src/*`)
- Group order: external → absolute (`~/`, `@/`) → relative (`./`)
- No deep relative chains (`../../../../`). If you need one, the file is in the wrong place.

## GraphQL

- **Types:** `PascalCase` (`User`, `Deal`)
- **Queries:** `camelCase`, descriptive (`users`, `userDetail`, `usersTotalCount`)
- **Mutations:** `camelCase` verb+noun (`usersAdd`, `usersEdit`, `usersRemove`)
- **Subscriptions:** noun + past-tense verb (`userChanged`)

## Comments

**Default to writing none.** Only add a comment when the *why* is non-obvious — a hidden constraint, a subtle invariant, a workaround for a specific bug.

**Never:**
- Restate what the code does (well-named identifiers do that)
- Reference the current task or PR (that belongs in commit message / PR description)
- Leave `// TODO` — finish or skip

See [`../SLOP-CHECKLIST.md`](../SLOP-CHECKLIST.md) for the full forbidden list.

## Errors

- Throw descriptive `Error` messages at system boundaries.
- For API responses, use custom error classes (`ValidationError`, etc.).
- **Do not catch-and-log** unless you also recover meaningfully.

## Logging

- No `console.log` in shipped code.
- Use the project's logger if present; otherwise leave it out.
