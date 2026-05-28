# SPEC: Create agent-assistant plugin with agent entity

**Wish:** [`./WISH.md`](./WISH.md)
**Status:** draft

## User-visible behavior

Admin users navigate to the agent-assistant plugin settings page to create and manage AI agent configurations. Each agent has a name, description, AI model provider, API key, and active/inactive status. Agents can be added, edited, and deleted from the settings list. End users see a notification widget introducing the plugin when it is active.

## API contract changes

### GraphQL
- New query: `agentAssistants(page: Int, perPage: Int): [AgentAssistant]`
- New query: `agentAssistantDetail(_id: String): AgentAssistant`
- New mutation: `agentAssistantsAdd(doc: AgentAssistantInput): AgentAssistant`
- New mutation: `agentAssistantsEdit(_id: String, doc: AgentAssistantInput): AgentAssistant`
- New mutation: `agentAssistantsRemove(_id: String): JSON`
- New type: `AgentAssistant { _id, name, description, modelProvider, apiKey, status, createdAt, updatedAt }`
- New input: `AgentAssistantInput { name, description, modelProvider, apiKey, status }`

### tRPC
- New procedure: `agentAssistant.find` — list with pagination
- New procedure: `agentAssistant.findOne` — get by id
- New procedure: `agentAssistant.create` — create agent
- New procedure: `agentAssistant.update` — update agent
- New procedure: `agentAssistant.remove` — remove agent

### REST (Express)
- None (GraphQL + tRPC only)

## Data model changes

- **Entity:** `AgentAssistant`
- **New fields:**
  - `name: String` — required, indexed
  - `description: String` — optional
  - `modelProvider: String` — required (e.g., 'openai', 'anthropic')
  - `apiKey: String` — required, encrypted
  - `status: String` — enum ['active', 'inactive'], default 'inactive'
  - `createdAt: Date` — auto
  - `updatedAt: Date` — auto
- **Schema definition file:** `backend/plugins/agent-assistant_api/src/modules/agent-assistant/db/definitions/agent-assistant.ts`

## UI changes

- **New / modified components:**
  - `frontend/plugins/agent-assistant_ui/src/pages/agent-assistant/IndexPage.tsx` — main page with list + Add button
  - `frontend/plugins/agent-assistant_ui/src/modules/agent-assistant/components/AgentAssistantForm.tsx` — create/edit form modal
  - `frontend/plugins/agent-assistant_ui/src/modules/agent-assistant/components/AgentAssistantList.tsx` — table list
  - `frontend/plugins/agent-assistant_ui/src/modules/AgentAssistantSettings.tsx` — settings page content
  - `frontend/plugins/agent-assistant_ui/src/modules/AgentAssistantMain.tsx` — routing
  - `frontend/plugins/agent-assistant_ui/src/modules/AgentAssistantNavigation.tsx` — navigation
  - `frontend/plugins/agent-assistant_ui/src/modules/AgentAssistantSettingsNavigation.tsx` — settings nav
  - `frontend/plugins/agent-assistant_ui/src/widgets/notifications/NotificationRemoteEntries.tsx` — notification widget
- **New forms / schemas (Zod):**
  - `frontend/plugins/agent-assistant_ui/src/modules/agent-assistant/schemas/agent-assistant.ts`
- **New routes:**
  - `/agent-assistant` → `AgentAssistantMain`
  - `/agent-assistant/settings` → `AgentAssistantSettings`
- **Module Federation exposes:** `./notificationWidget`

## Acceptance criteria

1. Plugin scaffold runs successfully with unique ports (33011 backend, 3012 frontend)
2. Backend compiles and starts without errors; tRPC procedures respond correctly
3. Admin can navigate to agent-assistant settings page
4. Admin can click "Add Agent" and open a form with fields: name, description, model provider, API key, status
5. Admin can submit the form and see the new agent in the list
6. Admin can click "Edit" on an agent, modify fields, and see updates reflected
7. Admin can click "Delete" on an agent and confirm removal
8. Notification widget is exposed via Module Federation and renders onboarding content
9. Playwright spec seeds fixtures via GraphQL and tests CRUD flow end-to-end
10. `.agents/evals/run.sh agent-assistant` passes completely
11. `.agents/plugins/agent-assistant/INDEX.md` exists and documents the plugin
12. All 11 Non-Negotiable Rules from `create-plugin.md` are satisfied

## Out of scope

- LLM chat interface / conversation UI
- Real AI model integration and inference
- Natural language action execution
- User-level permissions beyond standard erxes permission system
- WebSocket / real-time updates
- Agent usage analytics

## Open questions

(Should be empty by the time SPEC is approved. If not, ASK.)

## Approval

- [ ] Developer reviewed acceptance criteria
- [ ] Out-of-scope confirmed
- [ ] No open questions
