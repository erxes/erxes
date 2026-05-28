# Create Agent Assistant — Skill

## When to use

When a developer wants to add a new AI agent configuration to the agent-assistant plugin.

## Non-Negotiable Rules

1. Use `generateModels(subdomain)` for all data access
2. GraphQL mutations must validate required fields
3. Frontend form must use `erxes-ui` components
4. List queries must support pagination

## Goal Conditions

- [ ] New agent can be created via Settings UI
- [ ] New agent appears in the list immediately
- [ ] Backend model uses correct schema with enum constraints

## Mirror an existing feature

Mirror `AgentAssistant` CRUD in:
- `backend/plugins/agent-assistant_api/src/modules/agent-assistant/`
- `frontend/plugins/agent-assistant_ui/src/modules/agent-assistant/`

## Files to touch

### Backend
- `db/definitions/agent-assistant.ts` — add new field to schema
- `db/models/agent-assistant.ts` — add model method
- `@types/agent-assistant.ts` — update interface
- `graphql/schemas/agent-assistant.ts` — add GraphQL field
- `graphql/resolvers/mutations/agent-assistant.ts` — add mutation
- `graphql/resolvers/queries/agent-assistant.ts` — add query

### Frontend
- `components/AgentAssistantForm.tsx` — add form field
- `graphql/queries.ts` — add query field
- `graphql/mutations.ts` — add mutation field

## Verification

```bash
.agents/evals/run.sh agent-assistant
```
