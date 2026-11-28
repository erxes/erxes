# @erxes/integrations

erxes's official integrations, built into core. Private: only core imports it.

- One folder per service: `server.ts` (`defineIntegration` from `@erxes/plugin-sdk/integrations`),
  `ui.ts` (a `TIntegrationUI` from erxes-ui) and its logo.
- List each in `src/server.ts` and `src/ui.ts`. Core reads those two lists
  (`apps/api/src/modules/integrations/registry.ts`, `apps/web/src/modules/settings/integrations/logos.tsx`).
- Write only on the SDK, as an outside package would. A service gets its connection's values and
  the `fetch` in `ClientOptions`: lint refuses core, the database and any other way out.
- No tables. An integration that needs its own tables and page stays in core.
