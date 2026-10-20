# Plugin scaffolding and host integration evidence

Captured on 2026-10-20 at 1280 × 800. The PNGs are original browser screenshots.

- [Landing route and dashed remote](landing-dashed-remote.png): `/inventory-tools`
  redirects to `/inventory-tools/stock-items`. The actual host config loader and
  router load the generated remote as `inventory_tools_ui`, preserving the public
  `CONFIG.name` of `inventory-tools`. The generated app sidebar and page render.
- [Direct nested settings route](nested-settings-direct.png): a fresh document
  navigation to `/inventory-tools/settings/stock-items` renders the settings page
  and its sidebar. The page's settings link, sidebar settings index redirect and
  back link were also exercised successfully.
- [Generator regressions](generator-regressions.png): the browser displays the raw
  Node test output from the initial five-case run, including service-port
  reservations for API and UI overrides. The current suite has seven passing
  cases after the review fixes; this original screenshot records the earlier run.

## Browser boundary and reproduction

Use a disposable workspace with this checkout's root configuration, dependencies
and shared frontend libraries; never generate test fixtures in real plugin folders.
Generate and build the remote with:

```sh
pnpm create-plugin --plugin-name=inventoryTools --module-name=stockItems --ui-port=4318 --api-port=4319
NX_DAEMON=false pnpm nx build inventory-tools_ui --configuration=development --skipNxCache
```

The isolated Nx/Rspack host used the actual core `PluginConfigsProvidersEffect`,
`getPluginsRoutes`, `PermissionRouteGuard`, `RenderPluginsComponent` and remote
loader, with real shared UI packages. Its bootstrap supplied a synthetic wildcard
permission, an in-memory Apollo link returning `isFavorite: false`, local empty
translation resources and a static federation discovery entry pointing to the
generated remote. The existing core stylesheet supplied the styles.

Serve the built host and remote, open `/inventory-tools`, follow **Go to settings**,
reload `/inventory-tools/settings/stock-items`, follow **Back to InventoryTools**,
then follow **App settings**. Confirm the URL, discovered remote key, rendered page
and sidebar shown in the screenshots. The fixture's 44 generated files were
byte-identical to regeneration from final source; the relevant host source copies
also matched the final checkout. Both temporary HTTP servers were stopped.

This verifies browser rendering and federation loading in an isolated harness.
It does not validate live HTTP discovery, login, server permissions, MongoDB,
Redis, CRUD or a full deployment. HTTP discovery and alternate `CONFIG.name`
normalization are covered by regression tests. A transient unmatched-route warning
occurs before asynchronous config discovery completes; the pages then render.

## Validation results

- `pnpm exec node --test scripts/__tests__/create-plugin.test.js`: **7 passed**.
- `NX_DAEMON=false pnpm nx test core-ui --runInBand`: **17 suites, 98 tests passed**.
- `pnpm nx test erxes-api-shared --runInBand`: **38 suites, 331 tests passed**.
- `pnpm nx build core-ui` and `pnpm nx build erxes-api-shared`: **passed**.
- Generated remote and isolated host development builds: **passed**.
- Focused ESLint/Prettier checks on changed source and `git diff --check`: **passed**.

The core/shared suite totals include existing tests. Their results and builds were
preserved after the generator-only review fixes; the generator suite was rerun.
The new port regressions failed before the fixes and pass afterwards. The app
expose test now asserts the exact Main mapping and renders its named export;
deliberately mapping it to Settings was confirmed to fail this regression.

Full `pnpm nx lint core-ui`, `pnpm nx lint erxes-api-shared` and TypeScript checks
remain blocked by existing diagnostics in untouched files, including shared UI and
automation types and missing lodash/nodemailer declarations. No touched-file type
errors were identified. These results do not mean all repository checks pass.
