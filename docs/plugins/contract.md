# erxes plugin contract

Version: 1. Plugins build against the published SDK packages (section 7).

A plugin repo is standalone code that satisfies the contracts below. If it
does, erxes can run it without forking the monorepo:

- the **API** is an Express service exposing an Apollo Federation subgraph that
  registers itself in Redis service discovery;
- the **UI** is a Module Federation remote whose `remoteEntry.js` the host
  (`core-ui`) loads at runtime;
- `plugin.json` at the repo root tells the marketplace where both live.

`npx create-erxes-plugin` (source: `tools/create-erxes-plugin`) scaffolds a
repo implementing every MUST below. Use it rather than hand-rolling.

## 1. Naming

| Token | Rule | Example |
| ----- | ---- | ------- |
| plugin name | lowercase letters/numbers/dashes, starts with a letter | `loyalty`, `tourism-ex` |
| API service | `<name>_api` | `loyalty_api` |
| UI remote | `<name>_ui`, dashes → underscores (MF container names cannot contain `-`) | `loyalty_ui` |
| GraphQL operation names | camelCase, prefixed by plugin/module, unique platform-wide | `loyaltyPointList` |
| Mongo collections | `<name>_<entity>` — namespace every collection | `loyalty_points` |

## 2. `plugin.json` (required)

Root manifest, validated by `plugin-registry/schema/plugin-manifest.schema.json`:

```json
{
  "name": "loyalty",
  "version": "0.1.0",
  "description": "Loyalty points",
  "icon": "IconGift",
  "api": {
    "image": "ghcr.io/<owner>/plugin-loyalty-api",
    "port": 3401,
    "health": "/health",
    "env": ["MONGO_URL", "REDIS_HOST", "REDIS_PORT"]
  },
  "ui": {
    "remote": "loyalty_ui",
    "entry": "https://<cdn>/<version>/loyalty_ui/remoteEntry.js",
    "exposes": ["./config", "./points"]
  }
}
```

- `api.image` — a pullable OCI image (ghcr, docker hub). Self-hosted installs
  run it next to their erxes deployment; SaaS runs it on erxes infra.
- `ui.entry` — a fetchable `remoteEntry.js` URL. Publish per version from CI
  (the template workflow pushes `dist/<version>/<name>_ui/` to GitHub Pages).
- For plugins published to `plugins.erxes.io`, `ui.entry` follows the existing
  convention `https://plugins.erxes.io/<version>/<name>_ui/remoteEntry.js`.

## 3. API contract (`<name>_api`)

Built on `@erxes/api-shared` (imported as `erxes-api-shared`); `startPlugin`
from `erxes-api-shared/utils` implements everything in this section. The
plugin itself depends on `mongoose` and `graphql` (peers).

### 3.1 Endpoints

| Path | Required | Purpose |
| ---- | -------- | ------- |
| `GET /health` | yes | load balancer health check, body `ok` |
| `POST /graphql` | yes | Apollo Federation subgraph (`buildSubgraphSchema`) |
| `/trpc` | optional | tRPC router for service-to-service calls |
| `GET /subscriptionPlugin.js` | only if `hasSubscriptions` | browser subscription bundle |

### 3.2 Service discovery (Redis)

On boot the API MUST register in Redis — this is how the gateway finds the
subgraph. `startPlugin` does exactly this:

- `SET erxes-service-<name>` → the plugin's reachable base URL
  (`LOAD_BALANCER_ADDRESS` env if set, else `http://plugin-<name>-api:<port>`
  in production, `http://localhost:<port>` in dev).
- `SET erxesservice:config:<name>` → JSON
  `{dbConnectionString: <MONGO_URL>, hasSubscriptions, meta, releaseVersion}`.
  `meta` is the plugin's serialized capability declaration (permissions,
  notifications, tags, documents, properties, automations, segments…). Meta
  values must be JSON-serializable — strip functions.
- Enqueue BullMQ job on queue `gateway-update-apollo-router`, job name
  `service-discovery-updated`, payload `{pluginName}`, `delay: 10000`,
  `attempts: 3`, exponential backoff — guarded by
  `SET gateway:update-apollo-router:pending 1 EX 30 NX`. This makes the
  gateway recompose the Apollo Router supergraph within seconds of boot.

`releaseVersion` is read back by `/get-frontend-plugins` to build the UI CDN
URL — set `RELEASE_VERSION=3.x` in production so the UI resolves to the same
release the API is running.

### 3.3 Request context

The gateway forwards identity headers; the API MUST honor:

| Header | Content |
| ------ | ------- |
| `nginx-hostname` / `hostname` | first DNS label = tenant `subdomain` |
| `user` | base64 JSON of the authenticated user (`context.user`) |
| `cpuser` / `clientportal` | base64 JSON client-portal principal |
| `x-erxes-process-id` | correlation id to propagate |

Tenant isolation rule: **every** model/query is scoped by `subdomain`.
Self-hosted (`VERSION` unset/`os`) shares one `MONGO_URL` database. On erxes
SaaS (`VERSION=saas`) resolve the org in `CORE_MONGO_URL` and
`useDb("erxes_<organizationId>")` — `createGenerateModels` from `erxes-api-shared/utils` does this.

### 3.4 Meta contract (optional capabilities)

`startPlugin({ meta })` serializes this object into the Redis config where
core reads it via `getPlugin(name).config.meta`:

- `permissions: IPermissionConfig` — permission modules/actions for Settings.
- `notifications`, `tags`, `documents`, `properties` — JSON declarations.
- `automations`, `segments`, `references`, `afterProcess`, `beforeResolvers`,
  `importExport`, `payments` — these also imply POST endpoints the core
  worker calls back (`/automations`, `/segments`, `/references`, …, tRPC
  middleware) that `startPlugin` mounts automatically.

## 4. UI contract (`<name>_ui`)

Rspack (or webpack 5) + `@module-federation/enhanced` remote.

- `name` = `<name>_ui` (underscores only), `filename: 'remoteEntry.js'`.
- MUST expose `./config` → a module exporting `CONFIG: IUIConfig`
  (`name`, `path`, `navigationGroup`, `modules`, `widgets`, `i18n`,
  `settingsNavigation`). The host calls `loadRemote('<name>_ui/config')` at
  boot to register routes/navigation — **this is the entry point**.
- Additional exposes are loaded on demand through the host's
  `loadRemote('<name>_ui/<expose>', { from: 'runtime' })`.
- `shared` MUST singleton the host-provided libraries and nothing else:
  `react`, `react-dom`, `react-router`, `react-router-dom`, `erxes-ui`,
  `@apollo/client`, `jotai`, `ui-modules`, `react-i18next`. Returning `false`
  for anything else keeps the remote bundle self-contained.
- The host owns the Apollo client instance — query/mutate through
  `@apollo/client` hooks; traffic goes to the gateway which routes to the
  plugin's subgraph.
- Named exports only on exposed modules. The host loader never accepts
  `default`.
- Assets: derive URLs from the remote entry (`remote.entry.replace(
  'remoteEntry.js', 'assets')`) like `getPluginAssetsUrl` does.

## 5. Dev loop (self-hosted erxes)

```bash
docker compose up -d          # mongodb + redis + plugin api (joins gateway)
cd ui && pnpm dev             # remoteEntry.js at :<ui-port>
ENABLED_PLUGINS=changeme      # on the erxes deployment — unions into
                              # /get-frontend-plugins and gateway
```

For runtime install instead of env: Marketplace → Add plugin →
paste this repo's URL (manifest must validate; see install-flows.md).

## 6. Versioning

- Bump `plugin.json#version` with every release; CI publishes
  `ui/dist/<version>/` so installs can pin.
- `RELEASE_VERSION` on the API should equal the erxes release line (`3.x`)
  when the plugin ships with an erxes release, or `latest` otherwise.

## 7. Plugin SDK packages

Published from this repo by `.github/workflows/publish-plugin-sdk.yml` (tag
`plugin-sdk-v<version>`), all four at the same version:

| Package | Source | Install in a plugin as | Runtime |
| ------- | ------ | ---------------------- | ------- |
| `@erxes/api-shared` | `backend/erxes-api-shared` (preconstruct build) | `"erxes-api-shared": "npm:@erxes/api-shared@^<v>"` | bundled in the api |
| `@erxes/ui` | `frontend/libs/erxes-ui` (declarations only) | `"erxes-ui": "npm:@erxes/ui@^<v>"` (dev) | host core-ui via MF |
| `@erxes/ui-modules` | `frontend/libs/ui-modules` (declarations only) | `"ui-modules": "npm:@erxes/ui-modules@^<v>"` (dev) | host core-ui via MF |
| `create-erxes-plugin` | `tools/create-erxes-plugin` | `npx create-erxes-plugin` | — |

The npm aliases keep the monorepo import specifiers (`erxes-api-shared/utils`,
`erxes-api-shared/core-modules`, `erxes-ui`, `ui-modules`), so plugin source
is identical inside and outside the monorepo.

- `mongoose` and `graphql` are **peer dependencies** of `@erxes/api-shared`:
  the plugin owns the single copy. Two mongoose instances make every second
  request throw `OverwriteModelError` (`conn.model(name, schema)` compares
  schemas by instance) — `pnpm why mongoose` must show exactly one version.
- The UI packages contain only `.d.ts` files. `module-federation.config`
  keeps `erxes-ui`/`ui-modules` as `{ singleton: true, import: false }`, so
  the remote never bundles them.
- Build locally: `pnpm nx build erxes-api-shared && node
  scripts/plugin-sdk/build.mjs --version <v>` → `dist/plugin-sdk/*`.
  Declaration emit needs a hoisted install
  (`pnpm install --config.node-linker=hoisted`) so transitive Radix/imask
  types are nameable.

## 8. Migrating an existing monorepo plugin

- Move `backend/plugins/<name>_api` → `api/` and `frontend/plugins/<name>_ui`
  → `ui/` of a repo scaffolded by `create-erxes-plugin`; imports stay as-is.
- Keep the scaffold's `erxes-api-shared`/`erxes-ui`/`ui-modules` aliases and
  add the plugin's own deps with the monorepo's versions.
- **Aliases**: keep `~/* → src`, `@/* → src/modules` in both
  `tsconfig.json#paths` and rspack `resolve.alias`.
- **`api.address`** in `plugin.json` skips the image requirement — use it for
  self-hosted/dev installs where the api is already running.
- **Remove the monorepo copies** once the standalone repo is live. Until
  then the dev MF server still tries to serve the stale remote on the same
  port — `pnpm nx serve core-ui --skipRemotes=<name>_ui` bypasses it (dev
  only; prod hosts fetch `/get-frontend-plugins`, unaffected).
- **Compose in dev**: the gateway reads `erxes-installed-plugins` once at
  boot — install the plugin, start the api, then restart the gateway (or
  `touch backend/gateway/src/main.ts`) and rover recomposes the supergraph
  with the new subgraph.

