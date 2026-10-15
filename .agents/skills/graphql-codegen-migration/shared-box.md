# Running checks on a shared machine

Several agents share one dev box, and parallel builds have run it out of memory before. On a shared box:

- Wrap every heavy command (`nx build`, `tsc` over a project, `schema:compose`, `codegen`) in `flock /tmp/heavy-build.lock <cmd>`, so one heavy job runs at a time.
- Export `NODE_OPTIONS=--max-old-space-size=4096`.
- Pass `--parallel=2` to Nx when it fans out to the 11 `schema:print` tasks.
- Run targets for the projects you touched. Repo-wide `nx run-many` and `nx affected` builds stay with CI.
- When a run is done, stop any dev servers and containers you started.

```bash
export NODE_OPTIONS=--max-old-space-size=4096
flock /tmp/heavy-build.lock pnpm nx run <name>_ui:codegen --skip-nx-cache --parallel=2
```
