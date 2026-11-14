---
name: core-endpoint
description: Add or change a core API endpoint under /core/v1. Use when editing a procedure in packages/contract/src, the handlers in apps/core-api/src/modules/<feature>/<feature>.router.ts, a *.service.ts in apps/core-api/src/modules, or when core-ui calls a new endpoint.
---

Copy the tags endpoints, which touch every layer: `packages/contract/src/tags.ts`,
`apps/core-api/src/modules/tags/tags.service.ts`, `apps/core-api/src/modules/tags/tags.router.ts`,
`apps/core-ui/src/modules/tags/useTags.ts`, and the `tags` tests in `apps/core-api/src/__tests__/contacts.test.ts`.

1. Declare the procedure in `packages/contract/src/<domain>.ts` by the rules in
   `packages/contract/AGENTS.md`. A new group goes into `coreContract` in `src/index.ts`.
2. Write the service in `apps/core-api/src/modules/<feature>/<feature>.service.ts`. It takes
   `client: Db` and the input; who is calling is `caller()` from `@erxes/core-db`. It returns the row, with Dates; the output schema drops the columns it doesn't pick and
   encodes dates with `isoDate`. Add only the fields the row lacks (`{ ...row, actor: { type, id } }`).
   A body that leaves outside oRPC (webhook, plugin delivery, job payload) goes through the
   schema's `.parse(row)` instead. The handler runs inside `withOrg`, so
   queries carry no org filter and inserts leave out `orgId` (lint `erxes/no-org-filter`).
   Failures throw `HttpError(status, CODE, message)`.
3. Give it a policy in `ACCESS` (`apps/core-api/src/http/policies.ts`): `MEMBER`,
   `needs('<permission>')`, `PUBLIC`, `CUSTOMER` or `{ plugin: '<scope>' }`; the type check fails
   until it has one. Add the handler to `modules/<feature>/<feature>.router.ts` with a builder from
   `src/orpc.ts` (`apps/core-api/AGENTS.md` says which). A new group's router goes into `coreRouter`
   in `src/router.ts`. Wrap a write in `audited((tx) => ..., entry)` so the change
   and its audit entry share a transaction.
4. Call it from core-ui with `orpc.<group>.<name>.queryOptions({ input })` or `.mutationOptions()`
   from `~/lib/api`, and invalidate with `orpc.<group>.key()`.
5. Test it in `apps/core-api/src/__tests__/` through `useTestServer().client(...)`: the happy path,
   each error code (`rejects.toMatchObject({ status, code })`), and a caller from the other
   organisation of `useTwoOrgs()`, who gets 404 or an empty list.
6. Run `pnpm openapi` and read the `packages/contract/openapi.json` diff: every difference is a
   change plugins see, except properties moving within an object. If plugins already call the
   procedure, follow `.agents/skills/plugin-contract/SKILL.md`.

Done when `vp run check`, `pnpm check:generated` and `vp run test` (with `DATA_TEST_URL`) pass, and the
cross-organisation case is among the tests.
