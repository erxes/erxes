# Plugin install flows — design

How runtime plugin install works on top of `ENABLED_PLUGINS` today, and what
the marketplace module in core adds. Env stays the static floor; everything
below is additive.

## Pieces

1. **Registry** — `plugin-registry/plugins.json` in this repo. The default catalog
   the marketplace shows. Submissions are PRs against this file: the entry is
   the plugin's name + `plugin.json` snapshot, so a merge = an approved
   listing we control. A hosted registry service can replace it later without
   changing the contract (it is just JSON over HTTP).
2. **Plugin repos** — standalone repos following `contract.md`, built on
   the `@erxes/*` plugin SDK packages; their CI
   publishes `remoteEntry.js` + a Docker image.
3. **Marketplace module in core-api** — `plugin_installs` model per
   tenant, GraphQL ops, and a unioned `/get-frontend-plugins`.
4. **core-ui Marketplace page** (main sidebar, `/marketplace`) — catalog cards, installed state,
   "Add plugin by GitHub URL".

## SaaS (`VERSION=saas`)

Unchanged mechanics — already runtime, already shared builds:

- UI bundles are served from `plugins.erxes.io/<version>/<name>_ui/` — one
  shared build for every tenant; tenants never build plugins.
- API services run once on erxes infra (`plugin-<name>-api`) and join the
  gateway via Redis discovery; `getAvailablePlugins(subdomain)` gates per
  organization through `charge` data (purchased vs free).
- External-repo plugins plug in at the same seams: their CI pushes the UI
  bundle to the CDN path and their API image to the registry erxes deploys
  from. `plugin.json` is what SaaS reads to know image + remote.

## Self-hosted (`VERSION` unset / `os`)

New: Marketplace (main sidebar).

- **Default options**: catalog from `PLUGIN_REGISTRY_URL` (defaults to
  `raw.githubusercontent.com/erxes/erxes/main/plugin-registry/plugins.json`). Bundled plugins resolve to the already
  published `plugins.erxes.io` entry + `erxes/erxes-next-<name>_api` image.
- **Add plugin**: paste a GitHub repo URL → core-api fetches `plugin.json`
  (`raw.githubusercontent.com/<owner>/<repo>/<ref>/plugin.json`, ref from the
  URL or `HEAD`), validates against the manifest schema, records the install.
  GitHub installs require `MARKETPLACE_ALLOW_GITHUB_INSTALL=true` and are
  disabled on SaaS; the UI's "Add plugin" button follows the
  `marketplaceGithubInstallEnabled` query.
- Install writes a `plugin_installs` document per tenant:
  `{name, version, source: catalog|github, repoUrl, api:{image,address}, ui:{remote,entry}, enabled}`.
- **Reserved names**: `core`, `gateway`, and anything already listed in
  `ENABLED_PLUGINS` / `ENABLED_PLUGINS_ONLY_API` cannot be installed — the
  manifest name is rejected before any Redis write.
- **API side**: the plugin API must be reachable at install time — either it
  self-registered in Redis service discovery on boot (`erxes-service-<name>`,
  e.g. via the template's docker-compose `LOAD_BALANCER_ADDRESS`), or the
  manifest sets `api.address`. The installer validates the address (http(s),
  POSTs a subgraph `_service { sdl }` probe to `<address>/graphql`) and only
  then writes discovery keys — manifest-declared addresses write
  `erxes-service-<name>` + `erxesservice:config:<name>`, self-registered
  plugins keep their own keys. Finally it SADDs `erxes-installed-plugins`
  and enqueues `gateway-update-apollo-router` — same path a booting plugin
  takes.
- **UI side**: `/get-frontend-plugins` unions env `ENABLED_PLUGINS` with
  enabled installs — installed entries carry their own `entry` URL so
  third-party CDNs work next to `plugins.erxes.io`. Newly installed UI
  remotes load on the next page boot.
- **Disable/uninstall**: only removes the name from the
  `erxes-installed-plugins` set and recomposes the router — a running
  plugin's `erxes-service-*`/config keys are left alone.

## Per-tenant gating

Same rule as SaaS charges: an install is per `subdomain`. Self-hosted is
single-tenant so it degenerates to a flag on the one tenant.

## Open decisions

- Registry storage: repo JSON now; swap for a service when listing/review
  tooling needs it.
