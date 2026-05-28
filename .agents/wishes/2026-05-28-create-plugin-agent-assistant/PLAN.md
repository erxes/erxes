# PLAN: Create agent-assistant plugin with agent entity

**Wish:** [`./WISH.md`](./WISH.md) | **Spec:** [`./SPEC.md`](./SPEC.md) | **Ground:** [`./GROUND.md`](./GROUND.md)

## Commits (in order)

### Commit 1 — Scaffold plugin with create-plugin.js
- **Files:**
  - `backend/plugins/agent-assistant_api/` — entire scaffold
  - `frontend/plugins/agent-assistant_ui/` — entire scaffold
- **Why first:** Scaffolding must happen before any customization.
- **Verify:** `pnpm nx show project agent-assistant_api --json` and `pnpm nx show project agent-assistant_ui --json`

### Commit 2 — Fix ports to 33011 / 3012
- **Files:**
  - `backend/plugins/agent-assistant_api/src/main.ts` — port 33011
  - `frontend/plugins/agent-assistant_ui/project.json` — port 3012
- **Why next:** Immediate fix after scaffold to avoid collision.
- **Verify:** `grep "33011" backend/plugins/agent-assistant_api/src/main.ts`

### Commit 3 — Backend models, types, and GraphQL schema
- **Files:**
  - `backend/plugins/agent-assistant_api/src/modules/agent-assistant/db/definitions/agent-assistant.ts`
  - `backend/plugins/agent-assistant_api/src/modules/agent-assistant/db/models/AgentAssistant.ts`
  - `backend/plugins/agent-assistant_api/src/modules/agent-assistant/@types/agent-assistant.ts`
  - `backend/plugins/agent-assistant_api/src/modules/agent-assistant/graphql/schemas/agent-assistant.ts`
  - `backend/plugins/agent-assistant_api/src/modules/agent-assistant/graphql/resolvers/mutations/agent-assistant.ts`
  - `backend/plugins/agent-assistant_api/src/modules/agent-assistant/graphql/resolvers/queries/agent-assistant.ts`
  - `backend/plugins/agent-assistant_api/src/connectionResolvers.ts`
  - `backend/plugins/agent-assistant_api/src/apollo/resolvers/index.ts`
  - `backend/plugins/agent-assistant_api/src/apollo/resolvers/mutations.ts`
  - `backend/plugins/agent-assistant_api/src/apollo/resolvers/queries.ts`
  - `backend/plugins/agent-assistant_api/src/apollo/schema/schema.ts`
  - `backend/plugins/agent-assistant_api/src/apollo/typeDefs.ts`
  - `backend/plugins/agent-assistant_api/src/main.ts`
  - `backend/plugins/agent-assistant_api/src/meta/permissions.ts`
- **Why next:** Backend data layer before frontend.
- **Verify:** `.agents/evals/run.sh agent-assistant --backend-only`

### Commit 4 — Frontend routes, navigation, and basic pages
- **Files:**
  - `frontend/plugins/agent-assistant_ui/src/modules/AgentAssistantMain.tsx`
  - `frontend/plugins/agent-assistant_ui/src/modules/AgentAssistantNavigation.tsx`
  - `frontend/plugins/agent-assistant_ui/src/modules/AgentAssistantSettingsNavigation.tsx`
  - `frontend/plugins/agent-assistant_ui/src/pages/agent-assistant/IndexPage.tsx`
  - `frontend/plugins/agent-assistant_ui/src/config.tsx`
- **Why next:** Wire routing after backend exists.
- **Verify:** `.agents/evals/run.sh agent-assistant`

### Commit 5 — Frontend GraphQL hooks and settings CRUD
- **Files:**
  - `frontend/plugins/agent-assistant_ui/src/modules/agent-assistant/graphql/queries.ts`
  - `frontend/plugins/agent-assistant_ui/src/modules/agent-assistant/graphql/mutations.ts`
  - `frontend/plugins/agent-assistant_ui/src/modules/agent-assistant/components/AgentAssistantForm.tsx`
  - `frontend/plugins/agent-assistant_ui/src/modules/agent-assistant/components/AgentAssistantList.tsx`
  - `frontend/plugins/agent-assistant_ui/src/modules/AgentAssistantSettings.tsx`
- **Why next:** Wire CRUD after routes exist.
- **Verify:** `.agents/evals/run.sh agent-assistant`

### Commit 6 — Notification widget
- **Files:**
  - `frontend/plugins/agent-assistant_ui/src/widgets/notifications/NotificationRemoteEntries.tsx`
  - `frontend/plugins/agent-assistant_ui/module-federation.config.ts`
- **Why next:** Expose widget via Module Federation.
- **Verify:** Check expose entry exists.

### Commit 7 — Workspace registration
- **Files:**
  - `pnpm-workspace.yaml`
  - `nx.json`
- **Why next:** Register in monorepo workspace.
- **Verify:** `pnpm install` and nx show commands

### Commit 8 — Index.md and skills
- **Files:**
  - `.agents/plugins/agent-assistant/INDEX.md`
  - `.agents/skills/agent-assistant/create-agent.md`
- **Why next:** Make plugin discoverable.
- **Verify:** Files exist and are readable.

## Test commit (Phase 6)

### Commit 9 — Add behavioral test
- **Files:**
  - `.agents/plugins/agent-assistant/tests/agent-assistant.spec.ts` — CRUD flow + notification widget
- **Verify:** `cd .agents && pnpm test plugins/agent-assistant/tests/agent-assistant.spec.ts`

## LOC budget

Estimate total LOC of changes:
- Backend: ~250 LOC
- Frontend: ~350 LOC
- Tests: ~120 LOC
- **Total: ~720 LOC**

If total > 300 LOC, the wish is probably too big. Consider splitting.
→ This is a plugin scaffold; the LOC is distributed across many files. Acceptable.

## Risk + rollback

- **Riskiest commit:** Commit 5 (frontend CRUD wiring) — most integration surface.
- **If shipped and broken in production:** Revert commits 9→5 individually; scaffold (commits 1–2) is safe.

## Approval

- [x] Each commit is atomic
- [x] Each commit is independently buildable
- [x] LOC budget reasonable for scaffold
- [x] Test commit covers every SPEC acceptance criterion
