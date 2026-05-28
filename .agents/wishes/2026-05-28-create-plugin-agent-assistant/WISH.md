# Wish: Create fresh plugin: agent-assistant

**ID:** `2026-05-28-create-plugin-agent-assistant`
**Created:** 2026-05-28
**Status:** routed

## Original wish

> Create fresh new plugin "agent-assistant" with entity "agent"

## Clarifying questions (and answers)

None — wish was clear after briefing context.

## Disambiguated intent

Create a new erxes plugin named `agent-assistant` that provides an AI-powered chatbot assistant capable of performing agentic actions on behalf of users. The plugin exposes a primary entity `agent` (an AI agent configuration). Admin users configure API keys in Settings. End users interact with the AI assistant which uses the logged-in user's token and respects their permissions.

## Routing

**Skill:** `.agents/skills/create-plugin.md`

**Reasoning:** This is a fresh plugin creation request that maps directly to the create-plugin scaffolding playbook.

## Out-of-scope (developer confirmed)

- Actual LLM integration / AI model wiring (scaffold only)
- Natural language action parsing (scaffold only)
- Real-time chat UI (basic placeholder)
- Multi-tenant data migration tools

## Notes

- Ports allocated: Backend 33011, Frontend 3012
- Plugin scope: agent-assistant
- Primary entity: agent
- Complexity: LARGE
