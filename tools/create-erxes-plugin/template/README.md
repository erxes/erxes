# changeme — erxes plugin

Standalone erxes plugin following the [plugin contract](https://github.com/erxes/erxes/blob/main/docs/plugins/contract.md).

- `api/` — `changeme_api`: Express + Apollo Federation subgraph, registers in
  Redis service discovery so the erxes gateway composes it.
- `ui/` — `changeme_ui`: Rspack Module Federation remote; core-ui loads
  `remoteEntry.js` at runtime and mounts `./config` (navigation/routes) plus
  `./changemodule`.
- `plugin.json` — marketplace manifest (image, entry, ports).
- SDK: `erxes-api-shared` (`@erxes/api-shared`) in `api/`, type-only
  `erxes-ui` / `ui-modules` (`@erxes/ui`, `@erxes/ui-modules`) in `ui/`;
  the host core-ui provides the UI runtime through Module Federation.
- `docker-compose.yml` — run the API next to a self-hosted erxes deployment.

## Setup checklist

Search for `changeme` — the scaffold already replaced the token family, but
confirm:

- [ ] `plugin.json` `name` = your plugin name; `api.image`/`ui.entry` point at
      your registry/CDN (uses `__GITHUB_OWNER__` replacements).
- [ ] `api/` env: `cp api/.env.example api/.env` and set `MONGO_URL`, `REDIS_*`.
- [ ] Exposes in `ui/module-federation.config.ts` match real named exports.
- [ ] GraphQL operation names are prefixed `changemec*` — unique repo-wide.

## Dev

```bash
pnpm --dir api install && pnpm --dir ui install
docker compose up -d          # mongo + redis + api on :__API_PORT__
pnpm --dir ui dev             # remoteEntry.js on :__UI_PORT__
```

On the erxes side: `ENABLED_PLUGINS=changeme`, or install at runtime via
Marketplace → Add plugin → this repo's URL.

## Release

`git tag v0.1.0 && git push --tags` — the publish workflow builds the UI
remote into `dist/<version>/changeme_ui/` on GitHub Pages and pushes
`ghcr.io/<owner>/plugin-<repo>:<version>` + `:latest`. Bump
`plugin.json#version` and point `ui.entry` at the new versioned path.

## Submit to the marketplace

Open a PR adding an entry to `plugin-registry/plugins.json` in
`erxes/erxes` — `source: "github"`, your `repoUrl`, and the
`api`/`ui` block copied from your released `plugin.json`.
