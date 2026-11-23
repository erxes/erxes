---
name: verify
description: Show a change works in erxes, not only in tests. Use before calling any change a member can see or do finished.
---

Use synthetic data only.

1. Run the gates: `vp run check`, `vp run test`, `pnpm build`.
2. In an erxes core checkout on branch `postgre`, run `core$ vp run dev:stack up <this repo's path>`,
   adding the paths of plugins this one works with. It starts core, gives each plugin a database
   role and a secret, starts its API and UI dev servers and installs it in the e2e organisation.
   It prints the addresses and the sign-in; core's `verify-feature` skill has the rest.
   `core$ vp run dev:stack status` prints where the logs are; a failed `registerManifest` there
   means the plugin could not reach core.
3. In web, open the plugin's tab, walk the change, reload, and check it
   persisted. Repeat as a member whose role lacks the permission and check
   they are refused.
4. Keep screenshots and logs in `.scratch/` (git ignores it).

Done when the handoff lists what you saw at each step, the refusal included,
and where the screenshots are.
