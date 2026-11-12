# erxes core (Postgres)

The new thin erxes core. It owns only what every plugin shares: organisations, team members,
sign-in, customers and companies, tags and custom fields, files, notifications, activity, audit
and events. Business features belong to plugins, each in its own repo. `docs/design.md` has the
decisions, `docs/porting-map.md` what exists and what old erxes code it replaces.

## Packages and import direction

| Path                        | Package                   | Owns                                                                                        |
| --------------------------- | ------------------------- | ------------------------------------------------------------------------------------------- |
| `apps/core-api`             | `@erxes/core-api`         | Express + oRPC server for `/core/v1`. Guide: `apps/core-api/AGENTS.md`                      |
| `apps/core-ui`              | `@erxes/core-ui`          | React app and Module Federation host for plugin UIs. Guide: `apps/core-ui/AGENTS.md`        |
| `packages/contract`         | `@erxes/core-contract`    | zod + `@orpc/contract` API contract and event schemas. Guide: `packages/contract/AGENTS.md` |
| `packages/db`               | `@erxes/core-db`          | Drizzle schema, client, migrations. Guide: `packages/db/AGENTS.md`                          |
| `packages/ui`               | `erxes-ui`                | Design system shared with plugin UIs through Module Federation                              |
| `packages/plugin-sdk`       | `@erxes/plugin-sdk`       | Typed core client and token verification for plugin servers                                 |
| `packages/payment-gateways` | `@erxes/payment-gateways` | Payment gateway adapters used by core's payments module                                     |

Apps import packages. Packages never import apps. `apps/core-ui` and `packages/ui` never import `@erxes/core-db`, `pg`, `drizzle-orm` or `node:*`. Only
`apps/core-api/src/router.ts` uses `implement`/`os` from `@orpc/server`. `no-restricted-imports`
in `vite.config.ts` enforces all three.

## Setup from a fresh clone

```sh
pnpm install                 # Node 24 (.node-version), pnpm from packageManager; installs the pre-commit hook
docker compose up -d         # Postgres 16 on 127.0.0.1:5434
cp .env.example .env
pnpm dev                     # API http://localhost:3400, UI http://localhost:3500
```

## Commands

- `pnpm check`: oxfmt, type-aware oxlint, the TypeScript 7 type check (tsgolint) and knip. Config
  in `vite.config.ts` and `knip.ts`. Vite+ docs: `node_modules/vite-plus/docs`.
- `pnpm fix`: formats and applies lint autofixes.
- `pnpm test`: every vitest project in `vite.config.ts`. The API tests need `DATA_TEST_URL` and fail
  without it, e.g. `DATA_TEST_URL=postgres://erxes:erxes_local_dev@127.0.0.1:5434/erxes pnpm test`.
- `pnpm build`: the API bundle (tsup) and the UI (Rsbuild).
- `pnpm check:generated`: regenerates migrations and `packages/contract/openapi.json` and fails on drift.
- `pnpm db:generate`, `pnpm openapi`, `pnpm bootstrap` (an organisation and owner from the command line),
  `pnpm plugin:secret -- <name>` (registers a plugin or rotates its client secret; the old one works 24 h more).
- The pre-commit hook runs `vp staged` (`vp check --fix` on staged files). CI
  (`.github/workflows/ci.yml`) runs everything above; the `Check` job is the one to require.

## Task to skill

| Task                                                                   | Skill                                     |
| ---------------------------------------------------------------------- | ----------------------------------------- |
| Add or change an endpoint in the contract, router or a service         | `.agents/skills/core-endpoint/SKILL.md`   |
| Add or change a table, column, index or migration                      | `.agents/skills/schema-change/SKILL.md`   |
| Show a behaviour change works in the running app                       | `.agents/skills/verify-feature/SKILL.md`  |
| Change what plugins see: contract, events, OpenAPI, federation exports | `.agents/skills/plugin-contract/SKILL.md` |
| Build a new plugin on this core                                        | `.agents/skills/plugin-new/SKILL.md`      |
| Move an erxes 3.x plugin (HR, frontline …) onto this core              | `.agents/skills/plugin-migrate/SKILL.md`  |

## Invariants

- Thin core. If only one plugin needs a feature, it belongs in that plugin.
- Contract first. Every endpoint is declared in `packages/contract` and implemented in
  `apps/core-api/src/router.ts`. Types flow from the contract; never hand-write an API shape.
  `pnpm check:generated` fails when `openapi.json` is stale.
- Tenancy. Every table with an organisation's data has `org_id`. Every query filters by the caller's organisation
  (`context.actor.orgId`, or `context.plugin.orgId` from the plugin's token). Never trust an organisation id from input.
- Responses never carry credentials or `org_id`: services map rows to DTOs.
- Tables are `core_<name>` (the database is shared with plugins). Migrations are generated, never
  edited after release, and committed with the schema change.
- Ids are text (`newId()`, 17 characters), so records imported from old erxes keep their Mongo `_id`.

## Handoff

A handoff names: the commits, the tail of `pnpm check`, `pnpm test` (with the test count) and
`pnpm build`, `pnpm check:generated` when the schema or contract changed, what was checked in a
browser for UI changes, and anything deferred with the reason.

## How to work

Agents write and test every line here, and the next agent builds on what you leave.
Judge a change by the codebase it leaves behind: fewest concepts, files and moving parts.

- Build what the task asks and no more. Simple, direct code. No speculative options.
- Merge repeated code and fix nearby problems you find, even if the diff grows.
- No backward-compat shims or stopgaps inside this repo. Make the long-term choice.
  The published contract and SDK follow the versioning policy in `packages/contract/AGENTS.md`.
- Prefer an established, maintained library over writing your own.
- Start from the current `postgre` branch. Commit early and often.

### Lint and type rules are the spec

`pnpm check` is how this repo says what good code is. When a rule fires, fix the code.

- Never silence a rule to get green: no `oxlint-disable`, `eslint-disable`, `@ts-ignore`,
  `@ts-expect-error`, no new entries in `vite.config.ts` overrides or `ignorePatterns`, no
  `knip` ignores, no renaming to `_unused` to dodge `no-unused-vars`.
- The only exception: a rule that is wrong for one specific line (a false positive or a
  third-party API you can't change). Then use a single-line disable naming the rule and why,
  e.g. `// oxlint-disable-next-line typescript/no-unsafe-type-assertion -- <reason>`, and
  say so in the commit message. If you need it more than once, the rule's config is wrong:
  change it in `vite.config.ts` for everyone, with a comment, instead.
- Don't weaken a rule's options, downgrade to `warn`, or narrow its files to pass.
- Same for tests: never `.skip`, `.todo`, `.only`, loosen an assertion or delete a failing
  test to pass. Fix the code or the test's wrong expectation.

### TypeScript

- Types come from Drizzle → contract (drizzle-zod arrives in Phase 2). Never hand-write an API shape.
- No `any`, no `as` over a real mismatch, no `as unknown as` (`typescript/no-explicit-any`,
  `no-unsafe-*` and `no-unsafe-type-assertion` in `pnpm check`). Parse unknown input with zod.
- No `unknown` or `Record<string, unknown>` where the shape is known. Use the contract's or the
  schema's type (`z.infer`, Drizzle `$inferSelect`, a JSONB column's `$type<…>()`), a
  discriminated union, or a zod schema at the boundary. `unknown` is for values that really are
  arbitrary (a plugin's JSON payload), and is narrowed with zod before use.
- No `!` non-null assertions: check, narrow, or restructure so the value can't be missing.
- Lean on inference. Explicit return types only on exported contract and SDK functions. No one-line cast wrappers.
- Add packages with `pnpm add`, never by editing package.json (CI installs with `--frozen-lockfile`).
- Run `pnpm check` before you say you're done (CI `static` job). `pnpm fix` formats and autofixes.
- No `console`. The API logs through pino (`apps/core-api/AGENTS.md`),
  CLI scripts write to `process.stdout`, and `apps/core-ui` may use `console.warn` and `console.error`.

### Tests

- Test observable behavior through the public caller: HTTP, the typed contract client, the rendered page.
  API tests use `useTestServer()` from `apps/core-api/src/__tests__/support.ts`.
- Never assert source strings, implementation shapes, or that a test exists.
- Run the existing suites before adding new ones (CI `integration` job runs them all on Postgres).

### Shell and edits

- Search with `rg -n` and `fd`. Cap output with `--max-count` or `head`.
- Change code with your editor tool, or `ast-grep` when many matches change the same way. Never rewrite source with `sed -i`, python or `cat >`.
- Put `set -o pipefail` before any piped command that gates a commit.
- Throwaway scripts go in `.scratch/`, which git ignores.

### Writing (docs, PRs, product copy)

- Plain words, short sentences, active voice. Say what it does or give the number.
- No em dashes, no filler, no puffery.
