---
name: verify
description: Show a change works in erxes, not only in tests. Use before calling any change a member can see or do finished.
---

Use synthetic data only.

1. Run the gates: `vp run check`, `vp run test`, `pnpm build`.
2. Start core from an erxes checkout on branch `postgre`, following its
   `verify-feature` skill. Give core
   `CORE_PLUGIN_KEYS=__id__:<32+ character secret>`, and core-ui
   `PUBLIC_PLUGINS=__id___ui@http://localhost:__uiPort__/remoteEntry.js`.
3. Give the plugin role a database: `pnpm db:plugin-role __id__` in core, then
   put its URL in this repo's `.env` as `DATA_URL`, with the same secret as
   `PLUGIN_SECRET`.
4. Run `pnpm dev:api` and `pnpm dev:ui`. The API log ends with its address; a
   failed `registerManifest` means the secret or `CORE_URL` is wrong.
5. In core-ui, open the plugin's tab, walk the change, reload, and check it
   persisted. Repeat as a member whose role lacks the permission and check
   they are refused.
6. Keep screenshots and logs in `.scratch/` (git ignores it).

Done when the handoff lists what you saw at each step, the refusal included,
and where the screenshots are.
