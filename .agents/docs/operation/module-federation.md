# Operation UI — Module Federation

> How `operation_ui` is loaded into `core-ui` at runtime. Read this before you add a new page, change `module-federation.config.ts`, or touch shared libraries.

## Hosts and remotes

```
core-ui (host, port 3001)
├── loads remote: sales_ui (port 3005)
└── loads remote: operation_ui (port 3006)
```

The host is `core-ui`. The `operation_ui` is a **remote** running on port **3006**.

## `module-federation.config.ts` (operation_ui)

```ts
const config: ModuleFederationConfig = {
  name: 'operation_ui',
  exposes: {
    './config': './src/config.tsx',
    './operation': './src/modules/OperationMain.tsx',
    './operationSettings': './src/modules/OperationSettings.tsx',
    './relationWidget': './src/widgets/relation/RelationWidgets.tsx',
    './notificationWidget': './src/widgets/notifications/NotificationsWidgets.tsx',
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
- `./operation`: main operation router switch mounting tasks, projects, etc.
- `./operationSettings`: operation settings page.
- `./relationWidget`: integrations for context cards in details sidebars.

## Verifying

In dev: `http://localhost:3006/mf-manifest.json` returns the operation_ui federation manifest.
