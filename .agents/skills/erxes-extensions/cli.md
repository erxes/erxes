# erxes-ext

The bin lives in `packages/sdk` and is linked into every extension, so `pnpm --filter <id> exec erxes-ext <command>` works from the repo root. Each extension's `package.json` also has `codegen`, `check`, `build`, `install-extension` and `dev` scripts. pnpm reserves `install`, which is why that one has a longer name. Run commands inside the extension's directory, except `create`.

| Command                                        | Does                                                                                                         |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `create <id> [--host <plugin>]`                | Scaffolds `./<id>`. The host defaults to `sales`                                                             |
| `codegen [--schema <file\|url>]`               | Types `server/operations/*.graphql` into `server/gql/`, then `ui/src` `gql()` documents into `ui/src/gql/`   |
| `check [--schema ...]`                         | Runs codegen, then tsc over `server/` and `ui/src/`                                                          |
| `build [--schema ...]`                         | Runs codegen, bundles the worker (300 KB budget) and the UI remote, writes `dist/<id>-<version>.erxext.json` |
| `install [--url <gateway>] [--owner=<userId>]` | Builds, then installs as an owner                                                                            |
| `dev [--url ...] [--owner ...]`                | Installs, then reinstalls on every change under `server/` and `ui/src/`                                      |

## Schema for codegen

`--schema`, else `ERXES_SCHEMA`, else `backend/gateway/generated/schema.graphql`. Create that file with `pnpm nx run gateway:schema:compose`. Run it again after pulling backend changes.

## Auth for install and dev

- `ERXES_TOKEN`: an owner's token, sent as a bearer token. Works against any gateway. Pass the gateway with `--url`, which defaults to `http://localhost:4000`.
- `--owner=<userId>`: mints a short session for that owner in the stack's Redis. Needs `REDIS_HOST`, `REDIS_PORT` and `REDIS_PASSWORD` of the local stack.

Uploading the `.erxext.json` in Settings > Extensions does the same install.

## Dev mode

`dev` needs the runtime started with `EXT_DEV_MODE=true`. The runtime refuses it when `NODE_ENV=production`. In dev mode, reinstalling the same version with a different build replaces it, and the runtime serves UI files uncached.

Reload is manual. After `dev` logs the reinstall, reload the browser page. There is no HMR.

Bump `version` in `package.json` for a real release. Outside dev mode, the runtime refuses a version number it already has with a different build.
