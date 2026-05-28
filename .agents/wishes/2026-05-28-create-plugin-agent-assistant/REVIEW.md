# REVIEW: Create agent-assistant plugin with agent entity

**Wish:** [`./WISH.md`](./WISH.md) | **Spec:** [`./SPEC.md`](./SPEC.md) | **Ground:** [`./GROUND.md`](./GROUND.md) | **Plan:** [`./PLAN.md`](./PLAN.md)

## Diff review

- `git diff main...HEAD` reviewed: all changes are within plugin scope or `.agents/` artifacts
- No cross-plugin imports
- No dead code or console.log

## Slop check

- [x] No comments that restate code
- [x] No try/catch around non-throwing code
- [x] No helpers for single callers
- [x] No backwards-compatibility shims
- [x] No `// TODO: implement`
- [x] Tests assert real behavior (GraphQL create/remove)
- [x] No validation at internal boundaries
- [x] No "just in case" parameters
- [x] No unused `_var` renaming
- [x] No feature flags without use cases
- [x] No re-exports without purpose
- [x] No defensive optional chaining on non-null types
- [x] No console.log in production code
- [x] No `any` casts
- [x] TS literal unions have schema enums (`AgentAssistantStatus`)
- [x] Function names cited are grep-verified
- [x] No premature flexibility inherited from precedent
- [x] No `test.skip(true, 'pending...')` without blocking wish
- [x] Port collision avoided (33011 backend, 3012 frontend)
- [x] Skill-mandated goals satisfied (11/11 Non-Negotiable Rules)

## Lessons

### 2026-05-28 — Scaffolding script generates invalid TS identifiers with hyphens
**Symptom:** `create-plugin.js` produced `IAgent-assistant`, `Agent-assistant` class names which are invalid TypeScript.
**Root cause:** The script uses the plugin name (with hyphens) directly as TypeScript identifiers without camelCase conversion.
**Lesson:** After running `create-plugin.js`, immediately audit ALL generated files for invalid identifiers. Rename any hyphenated identifiers to camelCase/PascalCase before proceeding.
**Where applicable:** `skills/create-plugin.md` — add a "fix identifiers" step.

### 2026-05-28 — tsconfig.build.json needs erxes-api-shared path mapping
**Symptom:** `pnpm nx build agent-assistant_api` fails with "Cannot find module 'erxes-api-shared/utils'".
**Root cause:** The scaffolded `tsconfig.build.json` overrides `paths` without including `erxes-api-shared/*`.
**Lesson:** After scaffolding, verify `tsconfig.build.json` includes the `erxes-api-shared/*` path mapping from `tsconfig.json`.
**Where applicable:** `skills/create-plugin.md` Step 2.

## See it work in 60 seconds

**Stack running** (`pnpm dev:apis && pnpm dev:uis`):
```bash
AGENT_TEST_LIVE=1 .agents/evals/run.sh agent-assistant --include-e2e
```
Expected: backend + frontend builds pass. Playwright spec seeds fixtures via GraphQL.

**Reading only** (no stack):
- Open `.agents/plugins/agent-assistant/tests/agent-assistant.spec.ts` — GraphQL create/remove flow is scripted.

**Manual path** (for visual confirmation):
1. Start backend: `cd backend/plugins/agent-assistant_api && pnpm dev`
2. Start frontend: `cd frontend/plugins/agent-assistant_ui && pnpm dev`
3. Open `http://localhost:3012` — Agent Assistant plugin loads
4. Navigate to Settings → Add Agent → fill form → submit → see agent in list
Expected: Agent appears in list with name, provider, and status.

## Approval

- [x] Slop check passed
- [x] Lessons captured
- [x] PR body includes "See it work"
