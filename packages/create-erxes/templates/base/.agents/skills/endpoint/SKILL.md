---
name: endpoint
description: Add or change an API procedure. Use when editing api/src/modules, api/src/router.ts or the manifest's permissions, or when the UI needs data the API doesn't serve yet.
---

1. Pick the permission from `PERMISSIONS` in `api/src/core.ts`. A new one goes
   there and into `manifest.permissions`, named `__id__.<record>.<verb>`.
2. Write the procedure in `api/src/modules/<module>/<module>.ts` on `reads(action)`
   or `writes(action)` from `api/src/orpc.ts`, with zod `.input()` and `.output()` schemas. Query
   through `context.tx` with no org filter: row-level security scopes it.
   Lists page by cursor, newest first, as `items.list` does.
3. Fail with `ORPCError` (`NOT_FOUND`, `FORBIDDEN`, `CONFLICT`, `BAD_REQUEST`);
   the UI shows its `message`.
4. Add the module to `router` in `api/src/router.ts`. The UI's types follow.
   Run `pnpm openapi` and commit the contract document.
5. In the UI, read with `orpc.<group>.<name>.queryOptions()` and write with
   `mutationOptions()`, invalidating `orpc.<group>.key()` on success.
6. Test it in the module's `__tests__`: the happy path, another organisation
   seeing nothing, and a member without the permission getting `FORBIDDEN`.

Done when that test passes in `vp run test` and `vp run check` is clean.
