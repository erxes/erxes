# erxes core (Postgres)

The thin erxes core: organisations, team members, sign-in, customers and companies, tags and custom
fields, files, notifications, activity, audit and events. Business features are plugins, each in its
own repo, started with `npm create @erxes/plugin` (its migrate kit moves an erxes 3.x plugin over).
`docs/design.md` has the decisions, `docs/porting-map.md` what exists and the old code it replaces.
Each package's `AGENTS.md` has its rules.

```sh
pnpm install          # Node 26 (.node-version); installs the pre-commit hook
docker compose up -d  # Postgres 18 on 127.0.0.1:5434
cp .env.example .env
pnpm dev              # API http://localhost:3400, UI http://localhost:3500
DATA_TEST_URL=postgres://erxes:erxes_local_dev@127.0.0.1:5434/postgres pnpm test
```

`.github/workflows/ci.yml` lists the gates CI runs; `Check` is the job to require.

## Invariants

- Thin core. If only one plugin needs a feature, it belongs in that plugin.
- Contract first: every endpoint is declared in `packages/contract`, and core-ui and plugins call it
  through the typed client.
- Tenancy is row level security. `withOrg` runs a request in one transaction for its organisation,
  and Postgres hides every other organisation's rows, so queries carry no org filter and inserts
  leave `orgId` to the column default (lint rule `erxes/no-org-filter`). System work that needs one
  organisation's rows runs them in `withOrg(orgId, ...)` inside its `withSystem` scope. The org comes
  from the token, never from input. `pnpm check:rls` fails a table with `org_id` and no forced RLS.
- Services map rows to DTOs without credentials or `org_id`. Only a procedure that issues a token or
  secret returns one.
- Ids are text (`newId()`, 17 characters), so records imported from old erxes keep their Mongo `_id`.
- Start from the current `postgre` branch. Search with `rg -n` and `fd`; change code with your editor
  or `ast-grep`, never `sed -i`, python or `cat >`. Throwaway scripts go in `.scratch/`.
- A handoff names the commits, the tails of `pnpm check`, `pnpm test` (with the count), `pnpm build`
  and `pnpm check:generated`, what you saw in a browser for a UI change, and what you deferred and why.

<!-- quality:start -->

## Quality

Every erxes repo on the new stack has this section, unchanged. The brackets name the checks that
enforce a rule; `review` marks the part no tool can check. The rewrite keeps every feature and improves the
architecture. Agents write the code and the checks judge it, so a green check lets a change ship
without line-by-line review.

- `pnpm check` is the type check: oxfmt, type-aware oxlint on tsrs and knip in about 10 s. Run it after each edit and before each commit; it replaces `tsc`. `pnpm fix` formats and autofixes. [pnpm check]
- Port what a feature does, not its code. Fix what the old code got wrong instead of carrying it over. [review]
- Use a maintained library when one does the job. Keep dependencies near their latest release and off deprecated APIs. [typescript/no-deprecated, review]
- One way to do each job. Search for the existing helper before writing one, merge the repeats you find, delete what nothing uses. [knip, review]
- Types flow from the database schema to the contract to the UI. Infer them, so each shape is written once. [pnpm check:generated, review]
- Parse outside input with zod and narrow it, so the code needs no `any`, cast or `!`. [typescript/no-explicit-any, typescript/no-unsafe-type-assertion, typescript/no-non-null-assertion]
- Lint and type rules are the spec: when one fires, fix the code. Silencing it is never the fix, whether by a disable comment, `@ts-ignore`, an override, an ignore, a weaker option or a raised limit. A rule that is wrong changes in its own PR. [typescript/ban-ts-comment, review]
- Split a file or function that outgrows its limit by responsibility (router, service, queries). [max-lines, max-lines-per-function, review]
- Finish the work in the change, with no TODO or FIXME left in code. [no-warning-comments]
- Tests call the public interface (HTTP, the typed client, the rendered page) and assert what it does, never source strings or code shapes. [review]
- Every test runs: a skipped test or an empty suite fails the run. A failing test gets its code or its wrong expectation fixed, never loosened or deleted. [pnpm test, review]
- Log through the structured logger, with the facts as fields. A caught error is rethrown or logged with its context. [no-console, review]
- Make the long-term change in one go, with no backward-compatibility shim, stopgap or speculative option. [review]
- Docs, PRs and copy are short: plain words, active voice, what it does or the number. [review]

<!-- quality:end -->
