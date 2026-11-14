# create-erxes

Creates an erxes plugin for the new core (Postgres): an Express 5, oRPC and Drizzle API, and a
React Module Federation remote that core-ui loads.

```sh
pnpm create erxes inventory
```

The first question is a new plugin or a migration of an old erxes plugin. A migration adds a kit
that reads the old plugin from an erxes checkout (`--from <path>`) or a fresh clone (`--clone`)
and writes `MIGRATION.md`, one checklist section per module.

| Flag                        | Does                                        |
| --------------------------- | ------------------------------------------- |
| `--migrate`, `--no-migrate` | migrate an old plugin, or start a new one   |
| `--plugin <name>`           | the old plugin to migrate, e.g. `operation` |
| `--from <path>`, `--clone`  | read a local erxes checkout, or clone one   |
| `--ref <ref>`               | the git ref to read (`origin/main`)         |
| `-n`, `-t`, `-d`            | the plugin's name, title and description    |
| `--no-install`, `--no-git`  | skip `pnpm install`, skip `git init`        |
| `-y`                        | take the default for every other question   |

The generated repo's `AGENTS.md` says how to run and change it.
