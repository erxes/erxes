# Checks

> What runs when you call [`./run.sh <plugin>`](./run.sh). Reference doc — the script is authoritative.

## What `run.sh <plugin>` does

1. Builds `erxes-api-shared` (prereq for any backend plugin)
2. Builds `<plugin>_api` via Nx
3. Runs `<plugin>_api` tests if a test target is configured
4. Builds `<plugin>_ui` via Nx (if it exists)
5. (with `--include-e2e`) Runs the Playwright suite in `.agents/plugins/<plugin>/tests/`

## Flags

```bash
.agents/evals/run.sh <plugin>                    # full default
.agents/evals/run.sh <plugin> --backend-only     # skip frontend (faster, for backend-only commits)
.agents/evals/run.sh <plugin> --frontend-only    # skip backend
.agents/evals/run.sh <plugin> --include-e2e      # full + Playwright
```

## Exit codes

| Code | Meaning |
|---|---|
| 0 | All checks passed — AI may declare "done" |
| 1 | A check failed — see `/tmp/run.sh.*.log` for details |
| 2 | Invalid arguments / unknown plugin |

## Manual checks that aren't in `run.sh`

Some things are too expensive or environment-dependent to run on every commit. The developer (or AI when explicitly asked) runs these separately:

### Federation composition
```bash
# Start the stack
pnpm dev:apis  # in one terminal
# Hit gateway introspection
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { types { name } } }"}'
```
A composition error means a federation directive is wrong somewhere. Restart the gateway first; if still broken, check recent typedef changes.

### Subdomain isolation
After adding a feature that touches data, manually verify:
- Create two test subdomains
- Write data under one
- Confirm the other can't read it

There's no automated check for this today — it lives in [`golden-tasks.md`](./golden-tasks.md) as a recurring item.

### Module Federation runtime
```bash
# Start <plugin>_ui
pnpm nx serve <plugin>_ui
# Check the manifest (check the plugin's port, e.g., 3005 for sales)
curl http://localhost:<port>/mf-manifest.json
```
If your new exposes aren't in the manifest, the Rspack build didn't pick them up.

## When `run.sh` is not enough

`run.sh` is the necessary condition for "done." It is not sufficient for every wish. Specifically, it does NOT catch:

- Federation composition errors (gateway-level)
- Runtime Module Federation errors (browser-level)
- Subdomain leaks (multi-tenant correctness)
- N+1 query regressions (performance)
- Race conditions in BullMQ workers

Skills note these explicitly when relevant. Phase 6 (VERIFY) should add a Playwright spec for the user-visible behavior; runtime checks may also be needed depending on the wish.

## Caching notes

Nx caches successful builds. If `run.sh` reports "✓ <plugin>_api built" instantly, the build was cached — no actual recompile happened. That's fine; the binary on disk is current.

If you suspect a stale cache:
```bash
pnpm nx reset       # clears Nx cache
.agents/evals/run.sh <plugin>
```
