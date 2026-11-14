---
name: core-endpoint
description: Add or change a core API endpoint under /core/v1. Use when editing a procedure in packages/contract/src, the handlers in apps/api/src/modules/<feature>/<feature>.router.ts, a *.service.ts in apps/api/src/modules, or when web calls a new endpoint.
---

Copy the tags endpoints, which touch every layer: `packages/contract/src/tags.ts`,
`apps/api/src/modules/tags/tags.service.ts`, `apps/api/src/modules/tags/tags.router.ts`,
`apps/web/src/modules/tags/useTags.ts`, and the `tags` tests in `apps/api/src/__tests__/contacts.test.ts`.

1. Declare the procedure in `packages/contract/src/<domain>.ts` by the rules in
   `packages/contract/AGENTS.md`. A new group goes into `coreContract` in `src/index.ts`.
2. Write the service in `apps/api/src/modules/<feature>/<feature>.service.ts`. It takes
   `client: Db` and the input; who is calling is `caller()` from `@erxes/core-db`. It returns the row, with Dates; the output schema drops the columns it doesn't pick and
   encodes dates with `isoDate`. A field the row lacks is selected in the query
   (`select({ ...getTableColumns(table), editable })`, `editable` an `sql` expression), never
   mapped on after.
   A body that leaves outside oRPC (webhook, plugin delivery, job payload) goes through the
   schema's `.parse(row)` instead. The handler runs inside `withOrg`, so
   queries carry no org filter and inserts leave out `orgId` (lint `erxes/no-org-filter`).
   Failures throw `fail(CODE, message, data?)` (`~/http/errors`); the code lives in `ERRORS`
   (`packages/contract/src/errors.ts`) and in the module's `oc.errors({...})` map.
3. Give it a policy in `ACCESS` (`apps/api/src/http/policies.ts`): `MEMBER`,
   `needs('<permission>')`, `PUBLIC`, `CUSTOMER` or `{ plugin: '<scope>' }`; the type check fails
   until it has one. Add the handler to `modules/<feature>/<feature>.router.ts` with a builder from
   `src/orpc.ts` (`apps/api/AGENTS.md` says which). A new group's router goes into `coreRouter`
   in `src/router.ts`. Wrap a write in `audited((tx) => ..., entry)` so the change
   and its audit entry share a transaction.
4. Call it from web with `orpc.<group>.<name>.queryOptions({ input })` or `.mutationOptions()`
   from `@erxes/core-contract/client`, and invalidate with `orpc.<group>.key()`.
5. Test it in `apps/api/src/__tests__/` through `useTestServer().client(...)`: the happy path,
   each error code (`rejects.toMatchObject({ status, code })`), and a caller from the other
   organisation of `useTwoOrgs()`, who gets 404 or an empty list.
6. Diff the OpenAPI document from before and after the change (`pnpm openapi <file>`, as
   `packages/contract/AGENTS.md` says): every difference is a
   change plugins see, except properties moving within an object. If plugins already call the
   procedure, follow `.agents/skills/plugin-contract/SKILL.md`.

Done when `vp run check`, `pnpm check:generated` and `vp run test` (with `DATA_TEST_URL`) pass, and the
cross-organisation case is among the tests.
