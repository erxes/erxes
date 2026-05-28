# Sales UI — Module Federation

> How `sales_ui` is loaded into `core-ui` at runtime. Read this before you add a new page, change `module-federation.config.ts`, or touch a `shared:` library.

## Hosts and remotes

```
core-ui (host, port 3001)
├── loads remote: sales_ui (port 3005)
├── loads remote: operation_ui (port 3006)
├── loads remote: frontline_ui (...)
└── ...
```

The host is `core-ui`. Each plugin's UI is a **remote**. At runtime, the host fetches a remote's manifest from `<remote-host>:<port>/mf-manifest.json` and lazy-loads modules from it.

## `module-federation.config.ts` (sales_ui)

```ts
import { ModuleFederationConfig } from '@nx/rspack/module-federation';

const coreLibraries = new Set([
  'react', 'react-dom',
  'react-router', 'react-router-dom',
  'erxes-ui',                // shared component library
  '@apollo/client',
  'jotai',
  'ui-modules',              // cross-plugin UI modules
  'react-i18next',
]);

const config: ModuleFederationConfig = {
  name: 'sales_ui',            // ← federation handle; host references this
  exposes: {
    './config': './src/config.tsx',
    './sales': './src/modules/Main.tsx',
    './dealsSettings': './src/pages/SettingsPage.tsx',
    './Widgets': './src/widgets/Widgets.tsx',
    './relationWidget': './src/widgets/relation/RelationWidgets.tsx',
  },
  shared: (libraryName, defaultConfig) => {
    if (coreLibraries.has(libraryName)) {
      return defaultConfig;  // share as singleton
    }
    return false;            // bundle locally
  },
};

export default config;
```

### `exposes`
The paths the host can `import('sales_ui/<key>')`. To add a new module/widget that the host can mount, add an entry here.

### `shared`
Libraries that MUST be a single instance across host and all remotes. Adding/removing entries here is **dangerous** — if the host doesn't share a library that sales_ui expects, you get two React instances at runtime and the whole app silently breaks.

### `name`
The federation handle. Other apps (core-ui) reference this string. Changing it requires updating the host's `remotes:` config.

## How the host discovers sales_ui

`core-ui` reads each plugin's `config.tsx` (the `./config` export above) at runtime to learn:
- the plugin's display name and icon
- its navigation group + sub-navigation
- which modules to mount, with paths
- which widgets it provides (relation widgets, floating widgets, etc.)

```tsx
// src/config.tsx — sketch
export const CONFIG: IUIConfig = {
  name: 'sales',
  icon: IconBriefcase,
  navigationGroup: { name: 'sales', icon: IconBriefcase, content: ... },
  modules: [
    {
      name: 'sales',
      icon: IconBriefcase,
      path: 'sales',
      hasSettings: false,
      hasRelationWidget: true,
      hasFloatingWidget: false,
    },
  ],
  widgets: {
    relationWidgets: [{ name: 'deals', icon: IconBriefcase }],
  },
};
```

## Lazy loading

All federation imports must be lazy:

```tsx
const SalesMain = lazy(() => import('sales_ui/sales'));

<Suspense fallback={<Loading />}>
  <SalesMain />
</Suspense>
```

If you forget `Suspense`, the host crashes when the remote hasn't loaded yet.

## Adding a new exposed module

E.g., to add a new "Deal Analytics" page exposed to the host:

1. Create the component: `frontend/plugins/sales_ui/src/pages/DealAnalyticsPage.tsx`
2. Add to `module-federation.config.ts`:
   ```ts
   exposes: {
     // ...existing
     './dealAnalytics': './src/pages/DealAnalyticsPage.tsx',
   }
   ```
3. Add to `src/config.tsx` if it should appear in navigation
4. Host (`core-ui`) auto-discovers via `./config`; no host changes needed for navigation-only additions
5. Restart `sales_ui` so Rspack rebuilds the manifest

## Adding a new route inside sales_ui (not host-exposed)

If the new page is only navigated to from within sales_ui (e.g., a sub-page of deals):

1. Create the component
2. Add the route in the relevant `Main.tsx` (e.g., `modules/deals/Main.tsx`)
3. No `module-federation.config.ts` change needed
4. No host changes needed

## Shared library gotchas

### Two React instances
If `react` is in `shared` for the host but not for the remote (or vice versa), each app loads its own React, breaking hooks. Always `share: defaultConfig` for `react`.

### Version mismatch on `erxes-ui` or `ui-modules`
Singletons require identical versions across host + all remotes. If you bump a version in one place, bump everywhere.

### Adding a new shared lib
Don't, unless you're sure every plugin needs it as a singleton. Most libs should stay bundled per-remote.

## Common errors

### "Cannot read properties of undefined (reading 'createElement')"
Two React instances. Check `shared` config in both host and remote.

### "Loading chunk failed" in dev
The remote isn't running. Start it (`pnpm nx serve sales_ui`).

### "Federation runtime: module not found"
The expose key you're importing doesn't exist. Check `module-federation.config.ts` exposes.

### Hot reload doesn't pick up changes
Restart the remote. Module Federation's HMR is imperfect.

## Verifying

In dev: `http://localhost:3005/mf-manifest.json` returns the sales_ui federation manifest. Should contain your new exposes.

In the host browser console:
```js
import('sales_ui/sales').then(m => console.log(m));
```
If it returns the module, federation is wired. If it throws, check the manifest.
