# Frontline UI — Module Federation

> How `frontline_ui` is loaded into `core-ui` at runtime. Read this before you add a new page, change `module-federation.config.ts`, or touch shared libraries.

## Hosts and remotes

```
core-ui (host, port 3001)
├── loads remote: sales_ui (port 3005)
├── loads remote: operation_ui (port 3006)
└── loads remote: frontline_ui (port 3004)
```

The host is `core-ui`. The `frontline_ui` is a **remote** running on port **3004**.

## `module-federation.config.ts` (frontline_ui)

```ts
const config: ModuleFederationConfig = {
  name: 'frontline_ui',
  exposes: {
    './config': './src/config.tsx',
    './frontline': './src/modules/FrontlineMain.tsx',
    './frontlineSettings': './src/modules/FrontlineSettings.tsx',
    './knowledgebase': './src/modules/knowledgebase/Main.tsx',
    './automationsWidget': './src/widgets/automations/components/AutomationRemoteEntry.tsx',
    './notificationWidget': './src/widgets/notifications/NotificationRemoteEntries.tsx',
    './relationWidget': './src/widgets/RelationWidget.tsx',
    './floatingWidget': './src/widgets/FloatingWidget.tsx',
  },
  shared: (libraryName, defaultConfig) => {
    if (coreLibraries.has(libraryName)) {
      return defaultConfig;
    }
    return false;
  },
};
```

### `exposes`
- `./config`: auto-discovered by the host to learn about navigation elements, routes, and widgets.
- `./frontline`: main frontline router switch mounting inbox, tickets, etc.
- `./frontlineSettings`: frontline settings landing page.
- `./relationWidget` / `./floatingWidget`: integrations for context cards and quick-actions in details sidebars.

## Verifying

In dev: `http://localhost:3004/mf-manifest.json` returns the frontline_ui federation manifest.
