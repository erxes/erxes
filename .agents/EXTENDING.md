# EXTENDING — replicating the system for other plugins

> This system is sales-only today. When sales reliably ships features without slop, mirror the pattern to other plugins.

## Promotion gate

Don't expand to a new plugin until **all** of these are true for sales:

- [ ] At least 3 customer-facing features shipped via `/sales` end-to-end
- [ ] At least 1 entry in [`memory/lessons.md`](./memory/lessons.md) captured from a real failure
- [ ] The slop checklist is being updated (not static)
- [ ] `evals/run.sh sales` passes on every PR

Expanding before this is premature — you'll codify a pattern that doesn't work yet.

## How to add the next plugin (worked example: operation)

### 1. Plugin file map (mirror what already exists for sales)

```bash
# This part is already scaffolded in plugins/<plugin>/ for every plugin.
.agents/plugins/operation/
├── INDEX.md           ← already exists as placeholder; fill in
├── modules/
│   ├── task.md
│   ├── project.md
│   ├── milestone.md
│   └── ...            ← one per backend module
└── tests/
    └── ...            ← one Playwright spec per module
```

Use the [`plugins/sales/`](./plugins/sales/) shape verbatim. Spawn a fresh subagent (Explore type) to walk `backend/plugins/operation_api/src/modules/` and `frontend/plugins/operation_ui/src/modules/`, then fill in INDEX.md and modules/.

### 2. Plugin docs (deep dives)

```bash
.agents/docs/operation/
├── operation-plugin-map.md
├── data-model.md           ← Task ↔ Project ↔ Milestone ↔ Cycle
├── graphql-federation.md
└── module-federation.md
```

These mirror [`docs/sales/`](./docs/sales/) — same headings, same level of detail. AI uses them as the reference deep-dive while running skills.

### 3. Plugin skills (task playbooks)

```bash
.agents/skills/operation/
├── add-task-field.md
├── add-operation-graphql-query.md
├── add-operation-mutation.md
├── add-operation-ui-page.md
├── add-operation-automation.md
├── add-operation-segment-field.md
└── add-operation-trpc-procedure.md
```

Use [`skills/_template.md`](./skills/_template.md). The seven shapes above cover ~90% of customer-facing feature wishes; you may add more as needed.

**Every skill must:**
- Open with "Step 1: Mirror an existing feature" — name 1–2 sister features in the same plugin
- List exact files to touch (paths verified against the live repo)
- End with a runnable Verify block: `.agents/evals/run.sh operation`

### 4. Orchestrator command

Create `.claude/commands/operation.md` by copying `.claude/commands/sales.md` and swapping:
- `sales` → `operation`
- `.agents/skills/sales/` → `.agents/skills/operation/`
- `.agents/docs/sales/` → `.agents/docs/operation/`
- `.agents/plugins/sales/` → `.agents/plugins/operation/`

### 5. evals/run.sh handles it already

`evals/run.sh` accepts a plugin name: `evals/run.sh operation` runs `pnpm nx build operation_api` etc. No changes needed.

### 6. Update the README routing table

Add a row to the "How to start work" table in [`README.md`](./README.md):
```markdown
| `/operation "<wish>"` | Enter the workflow scoped to operation. Orchestrator at `.claude/commands/operation.md`. |
```

### 7. Validate with one wish

Same thin-slice discipline as sales: run `/operation "<small real wish>"` end-to-end before declaring the operation expansion done.

## What does NOT need to be replicated

These are **repo-wide** — they stay in `.agents/` root and apply to every plugin:

- `SYSTEM-PROMPT.md` (the constitution)
- `WORKFLOW.md` (the 7 phases — same shape for every plugin)
- `SLOP-CHECKLIST.md` (forbidden patterns are universal)
- `templates/` (phase artifact templates — same shape)
- `rules/` (atoms — repo-wide conventions)
- `memory/{stack,glossary,decisions,lessons}.md` (cells — repo-wide; lessons compound across plugins)
- `evals/{run.sh,checks.md,golden-tasks.md,smoke-tests.md}` (verification harness)
- `package.json` / `playwright.config.ts` (Playwright runner)

The `wishes/` directory accumulates feature folders from every plugin's workflow runs.

## Cross-plugin features

When a wish spans plugins (e.g., "deal completion should trigger an operation task"):

1. Pick the **primary** plugin (where the user-visible behavior lives)
2. Run `/<primary> "<wish>"`
3. In Phase 2 (SPEC), explicitly call out the cross-plugin contract — name the GraphQL/tRPC/event surface used
4. In Phase 3 (GROUND), find sister features that already cross the same boundary (e.g., the existing payment ↔ sales callback in `backend/plugins/sales_api/src/main.ts:71`)
5. Verify on both sides — extend `evals/run.sh` arguments to cover both plugins

If a wish has no clear primary, STOP. Split the wish into two.

## Anti-pattern: bulk replication

Don't sit down and replicate skills/docs/plugins for all 10 plugins at once. Each plugin has its own quirks; doing them in parallel produces shallow boilerplate that nobody trusts. **One plugin at a time, each validated with a real wish.**
