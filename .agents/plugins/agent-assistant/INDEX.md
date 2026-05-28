# agent-assistant Plugin

## Overview

AI-powered chatbot assistant plugin for erxes. Provides agent configuration management with CRUD operations via GraphQL and tRPC.

## Backend (`agent-assistant_api`)

Port: **33011**

### Entry Point
- `src/main.ts` — `startPlugin` with GraphQL + tRPC

### Data Model
- **Entity:** `AgentAssistant`
- **Collection:** `agent_assistants`
- **Fields:** `name`, `description`, `modelProvider`, `apiKey`, `status`, `createdAt`, `updatedAt`

### GraphQL
- `agentAssistants(page, perPage): [AgentAssistant]`
- `agentAssistantDetail(_id): AgentAssistant`
- `agentAssistantsAdd(doc): AgentAssistant`
- `agentAssistantsEdit(_id, doc): AgentAssistant`
- `agentAssistantsRemove(_id): JSON`

### tRPC
- `agentAssistant.list` — placeholder

### Key Files
| File | Purpose |
|---|---|
| `src/connectionResolvers.ts` | Model registration with multi-tenancy |
| `src/modules/agent-assistant/db/definitions/agent-assistant.ts` | Mongoose schema |
| `src/modules/agent-assistant/db/models/agent-assistant.ts` | Model class with CRUD |
| `src/modules/agent-assistant/graphql/schemas/agent-assistant.ts` | GraphQL types |
| `src/modules/agent-assistant/graphql/resolvers/mutations/agent-assistant.ts` | Mutations |
| `src/modules/agent-assistant/graphql/resolvers/queries/agent-assistant.ts` | Queries |
| `src/meta/permissions.ts` | Permission config |

## Frontend (`agent-assistant_ui`)

Port: **3012**

### Routes
- `/agent-assistant` — Main page (IndexPage)
- `/agent-assistant/settings` — Settings page (AgentAssistantSettings)

### Module Federation Exposes
- `./config`
- `./agent-assistant`
- `./agent-assistantSettings`
- `./notificationWidget`

### Key Files
| File | Purpose |
|---|---|
| `src/config.tsx` | Plugin config |
| `src/modules/AgentAssistantMain.tsx` | Main routing |
| `src/modules/AgentAssistantSettings.tsx` | Settings page with CRUD |
| `src/pages/agent-assistant/IndexPage.tsx` | Main page |
| `src/modules/agent-assistant/components/AgentAssistantForm.tsx` | Add/Edit form |
| `src/modules/agent-assistant/components/AgentAssistantList.tsx` | List table |
| `src/widgets/notifications/NotificationRemoteEntries.tsx` | Notification widget |

## Tests

`.agents/plugins/agent-assistant/tests/agent-assistant.spec.ts`

## Skills

`.agents/skills/agent-assistant/create-agent.md`
