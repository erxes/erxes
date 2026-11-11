---
name: core-endpoint
description: Add or change a core API endpoint under /core/v1. Use when editing a procedure in packages/contract/src, the handlers in apps/core-api/src/router.ts, a *.service.ts in apps/core-api/src/modules, or when core-ui calls a new endpoint.
---

Copy the tags endpoints, which touch every layer: `packages/contract/src/tags.ts`,
`apps/core-api/src/modules/tags/tags.service.ts`, the `tags:` block in `apps/core-api/src/router.ts`,
`apps/core-ui/src/modules/tags/useTags.ts`, and the `tags` tests in `apps/core-api/src/__tests__/contacts.test.ts`.

1. Declare the procedure in `packages/contract/src/<domain>.ts`:
   `oc.route({ method, path, successStatus, summary }).input(schema).output(schema)`. Input is one
   object (path params, query and body merged). Name each new error code in the summary. Reuse
   `Id`, `CursorQuery` and `cursorPageOf` from `common.ts`. A new group goes into `coreContract` in
   `src/index.ts`.
2. Write the service in `apps/core-api/src/modules/<feature>/<feature>.service.ts`. It takes
   `client: Db`, the `Actor` (or `Caller` for plugins) and the input, filters every query with
   `eq(table.orgId, actor.orgId)`, and returns a DTO without credentials or `org_id`. Owner or
   admin only: `requireManager(actor, message)`. Failures throw `HttpError(status, CODE, message)`.
3. Give it a policy in `ACCESS` (`apps/core-api/src/http/access.ts`): `MEMBER`, `MANAGER`, `OWNER`,
   `PUBLIC` or `{ plugin: '<scope>' }`; the type check fails until it has one. Add the handler in
   `router.ts`: `authed.<group>.<name>.handler(({ input, context }) => ...)` for members, `plugin`
   for plugin tokens, `anyone` for both. Wrap a write in `audited(context.actor, (tx) => ..., entry)`
   so the change and its audit entry share a transaction. Core events go out in that transaction
   with `publishCoreEvents(tx, ...)`.
4. Call it from core-ui with `api.<group>.<name>()` from `~/lib/api` inside `useQuery` or
   `useMutation`, and update or invalidate the module's query key.
5. Test it in `apps/core-api/src/__tests__/` through `useTestServer().client(token)` (plugins:
   `client({ plugin: HR_SECRET, org })`): the happy
   path, the error codes (`rejects.toMatchObject({ status, code })`), and a caller from another
   organisation who gets 404 or an empty list.
6. Run `pnpm openapi` and commit `packages/contract/openapi.json` with the change. If plugins already
   call the procedure, read `.agents/skills/plugin-contract/SKILL.md` first.

Done when `pnpm check`, `pnpm check:generated` and
`DATA_TEST_URL=postgres://erxes:erxes_local_dev@127.0.0.1:5434/erxes pnpm test` pass.
