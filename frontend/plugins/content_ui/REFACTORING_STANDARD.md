# content_ui Refactoring Standard

## 1. Purpose

This document defines the target engineering standard for reorganizing and
refactoring `frontend/plugins/content_ui`.

The standard is derived from:

- the strongest repeatable patterns in `frontend/plugins/operation_ui`
- repository rules in `AGENTS.md` and `.agents/rules/`
- current React, TypeScript, Apollo, and feature-oriented architecture
  practices

It is not a request to copy `operation_ui` literally. `operation_ui` is a useful
reference plugin, but it also contains legacy code that does not meet current
repository rules. The standard below adopts its sound architecture and rejects
its known exceptions.

Normative terms:

- **MUST**: required for refactored or new code
- **SHOULD**: expected unless there is a documented local reason not to
- **MAY**: optional

## 2. What Standard Does operation_ui Follow?

`operation_ui` does not follow one formally named public standard such as Clean
Architecture, Atomic Design, or Feature-Sliced Design in full.

It follows a hybrid model:

1. **Feature-oriented vertical slices** — broadly known industry practice
2. **Thin route/page composition** — broadly known React practice
3. **Container/hooks/presentation separation** — broadly known React practice
4. **Apollo Client as server-state owner** — library-recommended practice
5. **URL state for shareable filters** — broadly known web application practice
6. **Schema-based form validation** — broadly known type-safe form practice
7. **erxes plugin architecture** — erxes-specific
8. **erxes RecordTable cursor conventions** — erxes-specific
9. **erxes Module Federation contracts** — erxes-specific
10. **erxes permission, hotkey, import/export, and widget conventions** —
    erxes-specific

The closest general description is:

> Feature-oriented React architecture with vertical slices, adapted to the
> erxes micro-frontend and plugin platform.

It resembles Feature-Sliced Design at the feature level, but it does not use
the formal FSD layer model (`app`, `pages`, `widgets`, `features`, `entities`,
`shared`). Do not claim that erxes strictly implements Feature-Sliced Design.

## 3. operation_ui Patterns to Adopt

| Concern | operation_ui reference | Standard to adopt |
| --- | --- | --- |
| Route entry | `src/modules/OperationMain.tsx` | Central route composition with feature internals outside the route file |
| Route pages | `src/pages/TasksPage.tsx`, `ProjectsPage.tsx` | Thin page wrappers that compose headers, filters, actions, and feature views |
| Feature ownership | `src/modules/task`, `project`, `cycle`, `team` | Keep components, hooks, GraphQL, state, types, and constants with their feature |
| Cursor tables | `task/components/TasksRecordTable.tsx` | Use the complete `RecordTable` cursor pattern |
| Query variables | `task/hooks/useGetTasks.tsx` | Build route, URL, cursor, and caller variables in a dedicated variables hook |
| Pagination | `project/hooks/useGetProjects.tsx` | Use `validateFetchMore` and `mergeCursorData` |
| Live data | task/project subscriptions | Keep lists and details current through subscriptions, cache writes, or targeted refetch |
| Forms | `task/components/add-task` | Separate sheet state, form UI, validation schema, and mutation hook |
| UI state | `task/states` | Use small feature-local atoms for cross-component UI state only |
| Filters | `task/components/TasksFilter.tsx` | Persist shareable filters in URL query state |
| Permissions | `Can`, `usePermissionCheck` | Hide or disable protected actions based on permission metadata |
| Translation | `useTranslation('operation')` | Use a plugin namespace instead of hardcoded user-facing text |
| Import/export | `TasksLayout.tsx` | Use shared `ui-modules` integration instead of feature-specific implementations |
| Module Federation | `module-federation.config.ts` | Expose only host-facing entries and widgets |

## 4. operation_ui Patterns Not to Copy

The following are legacy defects, not standards:

- Hooks called inside column factory callbacks
- `eslint-disable react-hooks/rules-of-hooks`
- `any` types and broad `MutationHookOptions`
- default exports in application code
- unprefixed GraphQL operation names such as `GetTasks`
- empty `Suspense` fallbacks
- missing tests
- lint warnings accepted as normal
- large components that combine query, mutation, state, and rendering concerns
- `console.error` as user-facing error handling

Current repository rules override legacy operation code.

## 5. Initial Baseline Comparison

Measurements captured before the structural cleanup:

| Metric | operation_ui | content_ui | Interpretation |
| --- | ---: | ---: | --- |
| TypeScript source files | 374 | 278 | File count alone does not indicate organization quality |
| TypeScript source lines | about 26,000 | about 27,400 | Similar total size |
| Largest feature area | task: about 8,700 lines | cms: about 25,500 lines | Content concentrates nearly all behavior under one broad CMS area |
| Files using `useTranslation` | 167 | 1 | Content lacks systematic i18n |
| GraphQL operation definitions | 64 | 99 | Content has more fragmented documents |
| Duplicate GraphQL names | 0 | 23 | Content lacks one canonical operation owner |
| Feature subscription files | 4 | 0 | Content does not implement operation-style live updates |
| `any` occurrences | 45 | 153 | Both need improvement; content has materially more type erasure |
| Test files | 0 | 1 | Neither plugin is a testing reference |
| Current lint result | 1 error, 16 warnings | 7 errors, 23 warnings | Neither current plugin is a clean compliance baseline |
| Production build | passes | passes | Build success is weaker than lint and full type safety |

### 5.1 Post-cleanup validation

As of June 25, 2026:

- `pnpm nx lint content_ui --skip-nx-cache` passes with zero findings.
- `pnpm nx build content_ui --skip-nx-cache` passes.
- Module Federation exposes resolve to the current entry files.
- Route-level CMS components live under `src/pages/cms`.
- CMS feature internals live under their owning feature directories.
- No files outside `frontend/plugins/content_ui` were changed by the cleanup.

The important architectural difference is concentration:

- `operation_ui` divides behavior into bounded domains such as task, project,
  cycle, team, template, triage, and activity.
- `content_ui` has domain folders inside CMS, but a significant amount of
  ownership still leaks through shared GraphQL files, duplicated hooks,
  oversized drawers, generic components, and legacy entry points.

The refactor objective is not to increase file count. It is to establish one
clear owner for each behavior and dependency.

## 6. Target content_ui Architecture

### 6.1 Root layout

```text
src/
  config.tsx
  main.ts
  bootstrap.tsx
  modules/
    ContentMain.tsx
    navigation/
    cms/
      websites/
      posts/
      pages/
      categories/
      tags/
      menus/
      custom-types/
      custom-fields/
      settings/
      shared/
    web-builder/
  pages/
    cms/
    web-builder/
  widgets/                  # optional; create only for real widget exposes
```

### 6.2 Feature layout

Each substantial feature SHOULD use this shape:

```text
<feature>/
  components/
  graphql/
    queries/
    mutations/
    subscriptions/
    fragments/
  hooks/
  states/
  types/
  constants/
  utils/
  validations/
```

Only create folders that contain real behavior. Empty barrels and placeholder
folders MUST be removed.

### 6.3 Ownership rules

- A feature MUST own its GraphQL documents, hooks, types, state, and UI.
- `cms/shared` MUST contain only behavior reused by at least two CMS features.
- `src/widgets` MUST contain only Module Federation widget entry points.
- `src/pages` MUST contain route-level composition, not business logic.
- A shared file MUST NOT become a second home for feature-specific behavior.
- Cross-plugin imports are forbidden.

## 7. Dependency Direction

Allowed dependency direction:

```text
page/route
  -> feature components
    -> feature hooks
      -> feature GraphQL/types/utils
        -> erxes-ui / ui-modules
```

Rules:

- GraphQL files MUST NOT import React components.
- Types and constants MUST NOT import components.
- Shared CMS code MUST NOT import a concrete feature.
- Components MAY use feature hooks, but mutation and query details SHOULD stay
  outside large presentation components.
- Use `@/*` for `src/modules/*` and `~/*` for `src/*`.
- Deep relative imports crossing more than two directory levels SHOULD be
  replaced with aliases.

## 8. Routes and Pages

- The route entry MUST contain route definitions and lazy-loading only.
- Route parameters such as `websiteId`, `postId`, and `pageId` MUST remain
  explicit and typed.
- Pages SHOULD compose:
  - page header
  - breadcrumbs/navigation
  - filters or secondary actions
  - feature view
  - create/detail sheet when required
- Pages MUST NOT define GraphQL documents or domain mutations.
- Every lazy boundary MUST have a meaningful loading fallback.
- Invalid or missing required route parameters MUST render a safe state or
  redirect; they MUST NOT silently pass empty IDs into queries.

## 9. GraphQL and Apollo

### 9.1 Document ownership

- Every operation MUST live in the owning feature's `graphql` directory.
- The legacy `cms/graphql/queries.ts` and `cms/graphql/mutations.ts` MUST be
  decomposed during refactoring.
- There MUST be one canonical document per operation purpose.
- Duplicate operation names are forbidden.
- Refetching by an operation-name string SHOULD be replaced by document
  references.

### 9.2 Naming

New or renamed operations MUST use:

```text
contentCmsPostList
contentCmsPostDetail
contentCmsPostCreate
contentCmsPostUpdate
contentCmsPostRemove
contentCmsPageList
contentWebBuilderProjectList
```

Use this pattern:

```text
<plugin><domain><entity><purpose>
```

Legacy backend field names do not need to be renamed solely to satisfy frontend
document naming.

### 9.3 Hook structure

List features SHOULD separate:

```text
use<Feature>Variables
use<Feature>List
useCreate<Feature>
useUpdate<Feature>
useRemove<Feature>
use<Feature>Detail
```

A variables hook SHOULD combine:

- route parameters
- URL query state
- cursor state
- current user or permission context
- caller overrides

### 9.4 Server-state consistency

Apollo MUST own server data. Do not copy query lists into Jotai.

After mutation, all affected surfaces MUST update without browser refresh:

- list
- detail
- count
- selectors
- navigation
- related records

Use, in order of suitability:

1. normalized Apollo cache update
2. targeted `cache.modify` or `writeQuery`
3. feature subscription
4. document-based `refetchQueries`

Broad string-based refetches and full-page refresh patterns are forbidden.

### 9.5 Cursor pagination

Cursor lists MUST use:

- stable feature-specific cursor session key
- `useRecordTableCursor`
- `validateFetchMore`
- `mergeCursorData`
- `RecordTable.CursorProvider`
- backward and forward cursor skeletons

Manual pagination merge logic SHOULD be replaced with `mergeCursorData` unless
the response shape genuinely differs.

## 10. React State

Use the smallest correct state owner:

| State | Owner |
| --- | --- |
| Input and validation | React Hook Form |
| Query results and loading | Apollo Client |
| Search/filter/sort/cursor visible in URL | URL query state |
| Component-only UI | `useState` or `useReducer` |
| Shared sheet/detail/view/count UI state | feature-local Jotai atom |

Rules:

- Jotai atoms MUST be feature-local and specifically named.
- Form values MUST NOT be stored in global atoms.
- Query lists MUST NOT be duplicated in local state.
- `key={refetchTrigger}` remounting SHOULD be replaced with Apollo cache or
  explicit refetch behavior.
- Empty effects are forbidden.
- Effects MUST include correct dependencies or document a valid external
  synchronization reason.

## 11. Tables, Columns, and Bulk Actions

- Cursor-backed entities MUST use `RecordTable`.
- Column definitions MUST be typed with the entity type.
- Hooks MUST NOT be called inside a plain column factory or arbitrary cell
  callback.
- Stateful cells MUST be extracted into named React components:

```tsx
const PostTitleCell = ({ cell }: PostTitleCellProps) => {
  // hooks are valid here
};

export const createPostColumns = (): ColumnDef<Post>[] => [
  {
    id: 'title',
    cell: (context) => <PostTitleCell cell={context.cell} />,
  },
];
```

- Loading, empty, error, and pagination states MUST be distinct.
- Bulk actions MUST use `CommandBar`.
- Selection MUST clear after a successful bulk operation.
- Inline editing MUST show mutation feedback and preserve table consistency.

## 12. Forms and Drawers

- Create/edit flows SHOULD separate:
  - trigger/sheet component
  - form component
  - Zod schema
  - typed form values
  - mutation hook
- Every form MUST use validation.
- Submit buttons MUST show loading/disabled state.
- Success and error feedback MUST use the standard toast.
- Form close MUST reset local state.
- Editing forms MUST rehydrate safely when the selected record changes.
- A component above 300 lines SHOULD be reviewed for extraction.
- A component above 500 lines MUST have a documented reason or be split during
  the refactor.

## 13. TypeScript

- New or modified code MUST NOT use `any`.
- GraphQL results, variables, table rows, route params, form values, and hook
  returns MUST be typed.
- Type assertions MUST be limited to external-library boundaries.
- Do not use `as any` to satisfy React Hook Form or table generics.
- Use narrow domain unions for statuses, content types, and field kinds.
- Application code MUST use named exports.
- Tool-required config defaults are the only allowed default-export exception.
- Lint-rule suppression requires a documented external limitation and MUST NOT
  suppress Rules of Hooks.

## 14. UI, Accessibility, and Responsive Behavior

- Use `erxes-ui` and `ui-modules`; do not introduce new primitives or UI
  libraries.
- Use `@tabler/icons-react`.
- Interactive controls MUST use the appropriate shared component instead of a
  styled raw element where one exists.
- Icon-only controls MUST have accessible labels.
- Loading, empty, error, restricted, and success states MUST be visually
  distinct.
- Desktop tables and split panes MUST have a usable mobile fallback.
- A feature MUST preserve keyboard and focus behavior when using sheets,
  dialogs, popovers, and inline editing.

## 15. Translation

- User-facing text MUST use `react-i18next`.
- Content UI SHOULD use a dedicated `content` namespace.
- New keys MUST be added for both English and Mongolian.
- Feature keys SHOULD be grouped by domain:

```text
cms.posts.*
cms.pages.*
cms.categories.*
cms.settings.*
web-builder.*
```

- Hardcoded mixed-language placeholders are forbidden.
- Dynamic messages MUST use interpolation, not string concatenation.

## 16. Permissions

- Protected actions MUST use the established `Can` or permission-check pattern.
- Permission handling MUST occur before opening destructive or mutating UI when
  permission metadata is available.
- Parsing GraphQL error text MUST be a fallback, not the primary permission UI.
- Create, update, delete, import, export, publish, and settings actions SHOULD
  each map to explicit permission actions.

## 17. Real-Time Behavior

Real-time behavior is an erxes product requirement, not a generic React rule.

For screens where multiple users may edit content:

- list and detail subscriptions SHOULD be added when backend events exist
- event names MUST be content-prefixed
- create, update, and remove events MUST update both list and count
- detail updates MUST not overwrite active unsaved form input

Suggested event naming:

```text
contentCmsPostChanged
contentCmsPostListChanged
contentCmsPageChanged
contentCmsPageListChanged
```

If subscriptions are not available, mutations MUST use deterministic Apollo
cache updates or targeted refetches.

## 18. Error Handling

- Query errors MUST render an error state or actionable toast.
- An errored query MUST NOT appear as an empty successful list.
- Mutation errors MUST preserve user input where possible.
- `console.error` is not user-facing error handling.
- Error messages MUST avoid exposing credentials, tokens, internal URLs, or
  sensitive response payloads.
- Authentication or session credentials MUST NOT be placed in query strings.

## 19. Module Federation

- Exposes MUST remain small and host-facing.
- Internal feature components MUST not be exposed.
- Exposed modules MUST provide the named export expected by the host.
- Moving or renaming an expose requires updating every host reference.
- Shared dependencies MUST remain aligned with other active plugins.

## 20. Testing Standard

Each refactored feature MUST add focused tests for changed behavior.

Minimum expectations:

- utilities: unit tests
- variables hooks: filter/route/cursor mapping tests
- forms: validation and submit behavior
- mutation hooks: success/error and cache/refetch behavior
- tables: loading, empty, error, and row interaction behavior
- routing: required route parameter and return-path behavior

Tests SHOULD assert user-visible behavior rather than implementation details.

## 21. Validation Gates

Every refactoring batch MUST pass:

```bash
pnpm nx lint content_ui
pnpm nx build content_ui
pnpm nx test content_ui
```

Also run a focused TypeScript check when practical. Errors in shared libraries
must be separated from errors originating in `frontend/plugins/content_ui`.

Completion requires:

- zero new lint errors or warnings
- zero content-owned TypeScript errors
- no duplicate GraphQL operation names
- no new `any`
- no new default exports in application code
- no Rules-of-Hooks suppression
- no empty effects or placeholder implementations
- no unrelated diff

## 22. Refactoring Sequence

Refactor in bounded vertical slices. Do not perform a repository-wide rewrite.

Recommended order:

1. Establish passing lint and content-owned TypeScript baseline.
2. Remove dead Knowledge Base and placeholder widget/app code, or formally
   scope their implementation.
3. Split legacy shared CMS GraphQL documents into feature ownership.
4. Normalize types and mutation hooks.
5. Fix tables and stateful cell architecture.
6. Normalize Apollo cache/refetch behavior.
7. Add translation namespace and migrate user-facing strings feature by
   feature.
8. Add permissions at action boundaries.
9. Add tests for each refactored feature.
10. Address real-time subscriptions with backend coordination.
11. Optimize Web Builder assets and secure the builder authentication handoff.

Each step MUST leave the plugin buildable and must not combine unrelated feature
rewrites.

## 23. Definition of Done for a Refactored Feature

A feature is tidy only when:

- its files have a clear owner and location
- page files are thin
- GraphQL documents are feature-local and uniquely named
- queries, variables, and mutations are typed
- loading, empty, error, and permission states exist
- create/edit/delete behavior updates visible data immediately
- forms are validated
- user-facing text is translated
- hooks follow React rules without suppression
- tests cover the changed behavior
- lint, build, and tests pass

Folder reorganization alone does not satisfy this standard.
