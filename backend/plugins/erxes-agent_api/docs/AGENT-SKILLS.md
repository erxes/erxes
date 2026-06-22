# Agent Skills — teach the agent a task once, reliably

**Status:** Shipped (v1). **Module:** `src/modules/skill`. **Flag:** none — always on.

## The problem this solves

"I want to easily teach the agent anything, so it doesn't fail at specific
tasks." Before this, the only ways to steer an agent were:

| Mechanism            | What it is                                  | Why it isn't "teach a task" |
| -------------------- | ------------------------------------------- | --------------------------- |
| Agent `instructions` | one always-loaded system-prompt blob        | doesn't scale — every task you add bloats every prompt and the model loses focus |
| Company knowledge    | RAG over company **data** (deals, KB, …)    | retrieves *facts*, not *how-to procedures* |
| Learning             | auto-distilled lessons from past chats      | implicit & automatic — you can't deliberately author "do X this way" |
| Workflows            | declarative durable automations             | powerful but heavyweight; not "just tell it how" |

**Skills** add the missing piece: **procedural memory** — a named, authored
playbook for one task, retrieved only when relevant.

## What the research says (why it's built this way)

This design follows the current expert consensus, drawn from primary sources:

- **Anthropic — Agent Skills** ([engineering blog](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)):
  skills load via **progressive disclosure** in levels — at startup only each
  skill's **name + description** is in the prompt; the **full body** is read
  only when a task matches; deeper files load on demand. This keeps many skills
  available at a tiny context cost.
- **"Skills are procedural memory"** ([SoK: Agentic Skills, arXiv 2602.20867](https://arxiv.org/abs/2602.20867)):
  *"a curated skill that has been verified across multiple contexts is more
  reliable than an ad-hoc plan generated on the fly."* Reliability is the point,
  not convenience.
- **ACE — Agentic Context Engineering** ([arXiv 2510.04618](https://arxiv.org/abs/2510.04618)):
  contexts should be **detailed, structured playbooks**, not terse summaries
  (reject "brevity bias"); rewriting context monolithically causes **context
  collapse**. So a skill's body should be rich, and edits are independent rows —
  never a global rewrite.
- **LangChain — Context Engineering** ([blog](https://www.langchain.com/blog/context-engineering-for-agents)):
  memory splits into **procedural** (how-to), **episodic** (examples), and
  **semantic** (facts). A fixed always-loaded file (CLAUDE.md / Cursor rules) is
  the simplest procedural store, but for many procedures you **select** the
  relevant ones rather than loading all. Skills do exactly that.

## How it works (two levels of progressive disclosure)

```
Level 1 — ALWAYS in the system prompt (lean index):
  ## Skills — your verified playbooks (load before acting)
  - refund-order — when a customer wants money back on a paid order
  - close-deal   — when a deal is ready to be marked won
  → "call load_skill with the exact name BEFORE doing a matching task"

Level 2 — ON DEMAND (full body), via the load_skill tool:
  load_skill("refund-order")
  → { found: true, instructions: "<the full step-by-step playbook>" }
```

- The **index** (name + description only) is built per agent in
  `agentRuntime.ts` and injected by `instructions/routing.ts` (`SKILLS_BLOCK`).
- The **body** is fetched live from Mongo by the `load_skill` tool
  (`mastra/tools/skillTools.ts`) — so editing a playbook takes effect on the
  next use, and the lookup is **scoped to the asking agent** (an agent can never
  load another agent's private or disabled skill).
- The agent cache key includes a **skills fingerprint**
  (`modules/skill/skillScope.ts#skillsFingerprint`), mirroring the existing
  installed-services `inventory.fingerprint`: adding/editing/removing a skill
  rebuilds the agent and refreshes the index on the very next turn.

## Data model — `mastra_agent_skills`

| Field           | Meaning |
| --------------- | ------- |
| `name`          | kebab-case identifier the agent passes to `load_skill` (unique per tenant; normalised on save) |
| `title`         | human label for the UI |
| `description`   | **the "when to use" trigger — always loaded.** The single most important field for reliable matching |
| `body`          | the full playbook (markdown): steps, exact operations, gotchas, examples. Loaded on demand, so make it detailed |
| `tags`          | optional grouping |
| `agentIds`      | **empty = global** (every agent); otherwise scoped to the listed agents |
| `isEnabled`     | disabled skills neither index nor load |
| `usageCount` / `lastUsedAt` | best-effort telemetry (future curation) |

## GraphQL API

```graphql
# queries
mastraAgentSkills(agentId: String): [MastraAgentSkill]   # all, or those one agent can use
mastraAgentSkill(_id: String!): MastraAgentSkill

# mutations
mastraAgentSkillAdd(doc: MastraAgentSkillInput!): MastraAgentSkill
mastraAgentSkillEdit(_id: String!, doc: MastraAgentSkillEditInput!): MastraAgentSkill
mastraAgentSkillRemove(_id: String!): JSON
```

Permissions (`meta/permissions.ts`, module `skill`): `agentSkillsView` (always —
non-secret), `agentSkillsCreate`, `agentSkillsEdit`, `agentSkillsRemove`.

## Authoring a good skill

Following the research above:

1. **`description` is a trigger, not a summary.** Write *when* to use it, in the
   words a user would use: "when a customer wants a refund on an order they
   already paid for." This is what the agent matches against.
2. **`body` should be detailed and structured.** Numbered steps; name the exact
   operations to run and the arguments that matter; call out gotchas; include a
   worked example. Don't compress — the body only loads when needed.
3. **One task per skill.** Split unrelated procedures into separate skills so the
   agent loads only what applies (progressive disclosure).
4. **Scope deliberately.** Leave `agentIds` empty for company-wide playbooks;
   scope sensitive ones to specific agents.

## Files

```
modules/skill/@types/skill.ts                         types
modules/skill/db/definitions/skill.ts                 mongoose schema
modules/skill/db/models/Skill.ts                      model (CRUD + runtime lookups)
modules/skill/skillScope.ts                           pure scope + fingerprint rules (unit-tested)
modules/skill/graphql/...                             CRUD resolvers + schema
mastra/tools/skillTools.ts                            load_skill tool (Level 2)
mastra/instructions/routing.ts                        SKILLS_BLOCK (Level 1 index)
mastra/agentRuntime.ts                                fetch index, fingerprint cache, bind tool
```

Tests (real-oracle, no DB needed): `modules/skill/__tests__/skillScope.test.ts`
(scope + fingerprint + slug rules), `mastra/tools/__tests__/skillTools.test.ts`
(load_skill contract), `mastra/instructions/__tests__/routing.test.ts` (the
always-loaded index never inlines the body).
