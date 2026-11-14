---
name: endpoint
description: Add or change an API procedure. Use when editing api/src/modules, api/src/router.ts or the manifest's permissions, or when the UI needs data the API doesn't serve yet.
---

1. Pick the permission from `PERMISSIONS` in `api/src/core.ts`. A new one goes
   there and into `manifest.permissions`, named `__id__.<record>.<verb>`.
2. Write the procedure in `api/src/modules/<module>/<module>.ts` on `reads(action)`
   or `writes(action)` from `api/src/orpc.ts`, with a zod `.input()` and an `.output()` built
   from the table: `createSelectSchema(table).omit({ orgId: true })`, as `items` does
   (`erxes/procedure-output` fails a procedure without one). Query through `context.tx` with no
   org filter: row-level security scopes it. Lists page by cursor, newest first, as
   `items.list` does.
3. Return the rows as selected: flat, under their column names (`referenceType` and
   `referenceId`, never `reference: { type, id }`), with no `.map` that renames or strips
   fields. A value the row lacks comes from the query, a join or subquery in the `select`, and
   goes on the schema with `.extend()`.
4. Fail with `ORPCError` (`NOT_FOUND`, `FORBIDDEN`, `CONFLICT`, `BAD_REQUEST`);
   the UI shows its `message`.
5. Add the module to `router` in `api/src/router.ts`. The UI's types follow.
6. In the UI, read with `orpc.<group>.<name>.queryOptions()` and write with
   `mutationOptions()`, invalidating `orpc.<group>.key()` on success.
7. Test it in the module's `__tests__`: the happy path, another organisation
   seeing nothing, and a member without the permission getting `FORBIDDEN`.

Done when that test passes in `vp run test` and `vp run check` is clean.
