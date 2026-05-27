# Master Entrypoint — erxes AI Native Starter Skill

> **STOP. Read `.agents/SYSTEM-PROMPT.md` and `.agents/WORKFLOW.md` first. This is the absolute starting point for any incoming AI working on the erxes repo.**

This skill serves as the single orchestration center for incoming LLMs. Use this skill to initialize the context, understand the available tools, route wishes, rate task complexity, and boot the correct execution architecture.

---

# Master Skill Initialization

> **When to use:** Immediately upon starting a session or when receiving any user request/wish.

## Phase 1 — ROUTE & CLARIFY

### Step 1: Semantic Intent-to-Skill Routing Tree & Local RAG

> [!TIP]
> **Zero-Dependency Local Skill RAG Index:**
> All 77 pre-constructed playbooks are fully cataloged inside [**`.agents/skills/.index`**](file:///Users/Amaraa0404/Documents/projects/erxes-ai-native-org/.agents/skills/.index). To find the exact matching playbook without context bloat, **read the `.index` file first**, check the `skills` array, and load the corresponding playbook file directly!

Based on the developer's wish keywords and intent, you must route to the exact playbook file. Use the semantic classification tree below to determine the correct playbook:

```mermaid
graph TD
    Wish["Developer Wish"] -->|Contains: field, column, property, date| Field["add-[entity]-field.md"]
    Wish -->|Contains: trigger, action, automation, webhook, event| Auto["add-[plugin]-automation.md"]
    Wish -->|Contains: query, get, fetch, list, total| Query["add-[plugin]-graphql-query.md"]
    Wish -->|Contains: mutation, create, update, delete, remove| Mut["add-[plugin]-mutation.md"]
    Wish -->|Contains: filter, segment, condition, segment-field| Seg["add-[plugin]-segment-field.md"]
    Wish -->|Contains: trpc, rpc, procedure, internal-endpoint| TRPC["add-[plugin]-trpc-procedure.md"]
    Wish -->|Contains: ui, page, screen, form, view| UI["add-[plugin]-ui-page.md (or sync.md)"]
    Wish -->|Contains: --plugin, fresh plugin, new plugin| CreatePlugin["create-plugin.md"]
    Wish -->|Contains: settings empty, wire buttons, build settings, dead button, stub settings| BuildSettings["build-plugin-settings.md"]
    Wish -->|Contains: --fix, fix, bug, error, issue, broken, crash, wrong| FixIssue["fix-issue.md"]
```

| Developer Intent / Keywords | Targeted Skill File | Description |
|---|---|---|
| `"add X field to [entity]"`, `"database column"`, `"scalar property"`, `"enum"` | **`add-[entity]-field.md`** | Adds a persistent field/scalar to Mongoose, types, GraphQL, mutations, and Forms. |
| `"trigger action"`, `"when X happens do Y"`, `"webhook notification"`, `"broker"` | **`add-[plugin]-automation.md`** | Intercepts system events and registers automation triggers or event dispatchers. |
| `"fetch X"`, `"get [entities]"`, `"query list"`, `"dealsTotalCount"`, `"detail"` | **`add-[plugin]-graphql-query.md`** | Exposes read-only queries with cursor pagination, sorting, or custom loaders. |
| `"create X"`, `"update Y"`, `"delete Z"`, `"remove list"`, `"save mutation"` | **`add-[plugin]-mutation.md`** | Exposes write-side GraphQL mutations with input validation and write hooks. |
| `"segment filter"`, `"filter deals by X"`, `"search criteria"`, `"elastic"` | **`add-[plugin]-segment-field.md`** | Wires a Mongoose field into core auto-discovery/ElasticSearch segment queries. |
| `"tRPC route"`, `"internal procedure"`, `"cross-plugin RPC"`, `"router"` | **`add-[plugin]-trpc-procedure.md`** | Exposes high-performance internal procedures for other backend services. |
| `"render page"`, `"build form"`, `"new screen"`, `"UI component"`, `"fragment"` | **`add-[plugin]-ui-page.md`**<br>*(or `add-[plugin]-sync.md` for posclient)* | Builds front-end React views, routes, Zod schemas, and hooks. |
| `"--plugin"`, `"fresh plugin"`, `"new plugin"`, `"create plugin"` | **`create-plugin.md`** | Orchestrates creating an entirely new microservice plugin (`_api` & `_ui`) with strict verification rules. |
| `"settings empty"`, `"wire buttons"`, `"build settings"`, `"dead button"`, `"stub settings"`, `"Add button does nothing"` | **`build-plugin-settings.md`** | Post-scaffold skill. Wires CRUD buttons (Add/Edit/Delete) to existing GraphQL mutations, builds the form component, populates the Settings page. Uses Supervisor Model with Backend + Frontend specialist sub-agents. |
| `"--fix"`, `"fix"`, `"bug"`, `"error"`, `"issue"`, `"broken"`, `"crash"`, `"doesn't work"`, `"not working"`, `"wrong"` | **`fix-issue.md`** | 8-phase gated bug-fix workflow: REPORT → TRIAGE → BUG-SPEC → BUG-GROUND → PLAN → FIX → VERIFY → REVIEW. Produces `BUG-SPEC.md` and `BUG-GROUND.md` artifacts, enforces regression-test-first commit order. |

---

### Step 2: List of Available Playbooks by Plugin

| Plugin Name | Plural Entity | Core Skills File Map |
|---|---|---|
| **sales** | `deals` | `skills/sales/` `add-deal-field.md`, `add-sales-automation.md`, `add-sales-graphql-query.md`, `add-sales-mutation.md`, `add-sales-segment-field.md`, `add-sales-trpc-procedure.md`, `add-sales-ui-page.md` |
| **frontline** | `tickets` | `skills/frontline/` `add-ticket-field.md`, `add-frontline-automation.md`, `add-frontline-graphql-query.md`, `add-frontline-mutation.md`, `add-frontline-segment-field.md`, `add-frontline-trpc-procedure.md`, `add-frontline-ui-page.md` |
| **operation** | `tasks` | `skills/operation/` `add-task-field.md`, `add-operation-automation.md`, `add-operation-graphql-query.md`, `add-operation-mutation.md`, `add-operation-segment-field.md`, `add-operation-trpc-procedure.md`, `add-operation-ui-page.md` |
| **payment** | `invoices` | `skills/payment/` `add-invoice-field.md`, `add-payment-automation.md`, `add-payment-graphql-query.md`, `add-payment-mutation.md`, `add-payment-segment-field.md`, `add-payment-trpc-procedure.md`, `add-payment-ui-page.md` |
| **accounting** | `accounts` | `skills/accounting/` `add-account-field.md`, `add-accounting-automation.md`, `add-accounting-graphql-query.md`, `add-accounting-mutation.md`, `add-accounting-segment-field.md`, `add-accounting-trpc-procedure.md`, `add-accounting-ui-page.md` |
| **loyalty** | `vouchers` | `skills/loyalty/` `add-voucher-field.md`, `add-loyalty-automation.md`, `add-loyalty-graphql-query.md`, `add-loyalty-mutation.md`, `add-loyalty-segment-field.md`, `add-loyalty-trpc-procedure.md`, `add-loyalty-ui-page.md` |
| **posclient** | `orders` | `skills/posclient/` `add-order-field.md`, `add-posclient-automation.md`, `add-posclient-graphql-query.md`, `add-posclient-mutation.md`, `add-posclient-segment-field.md`, `add-posclient-trpc-procedure.md`, `add-posclient-sync.md` |
| **content** | `cmsList` | `skills/content/` `add-cms-field.md`, `add-content-automation.md`, `add-content-graphql-query.md`, `add-content-mutation.md`, `add-content-segment-field.md`, `add-content-trpc-procedure.md`, `add-content-ui-page.md` |
| **mongolian** | `ebarimts` | `skills/mongolian/` `add-ebarimt-field.md`, `add-mongolian-automation.md`, `add-mongolian-graphql-query.md`, `add-mongolian-mutation.md`, `add-mongolian-segment-field.md`, `add-mongolian-trpc-procedure.md`, `add-mongolian-ui-page.md` |
| **insurance** | `contracts` | `skills/insurance/` `add-contract-field.md`, `add-insurance-automation.md`, `add-insurance-graphql-query.md`, `add-insurance-mutation.md`, `add-insurance-segment-field.md`, `add-insurance-trpc-procedure.md`, `add-insurance-ui-page.md` |
| **tourism** | `tours` | `skills/tourism/` `add-tour-field.md`, `add-tourism-automation.md`, `add-tourism-graphql-query.md`, `add-tourism-mutation.md`, `add-tourism-segment-field.md`, `add-tourism-trpc-procedure.md`, `add-tourism-ui-page.md` |
| **system-wide** | N/A | `skills/create-plugin.md`, `skills/build-plugin-settings.md`, `skills/fix-issue.md` |

---

### Step 3: Confirming Logic & Strict Context Guards

> [!CAUTION]
> **Strict Context Guard to Prevent Planning Bloat:**
> 1. You must clarify the developer's exact wish before proceeding. Ask **as many clarifying or confirming questions as needed** directly in the chat window. Keep **each individual question strictly under 30 words**.
> 2. **STRICTLY FORBIDDEN:** Do NOT write, generate, or create any *extra* planning files or artifacts (such as `implementation_plan.md`, `task.md`, design documents, or task lists) on disk. 
> 3. **EXCEPTION:** You MUST follow the 7-phase workflow and create the mandatory `.agents/wishes/<id>/{WISH,SPEC,GROUND,PLAN}.md` files as defined in [`WORKFLOW.md`](../WORKFLOW.md).
> 4. Limit your *in-chat* planning to a simple, compact checklist (under 30 lines) directly in the chat UI.
> 5. **STOP** and wait for the developer to confirm their intent before doing any codebase analysis or coding.

---

## Phase 2 — CODEBASE ANALYSIS & SIZING

Once the developer confirms:
1. **Analyze the codebase first**: Use search tools to locate files related to the wish. Never write a plan on empty context.
2. **Rate the task complexity**: Assess the size of the required change:

| Complexity Rating | Criteria | Strategy |
|---|---|---|
| **Small** | Simple scalar field addition, typo fix, minor validation, single-file edit. | Proceed directly with single-caller simple atomic commits. |
| **Medium** | Simple GraphQL mutation, single UI form update, straightforward unit tests. | Standard 7-phase workflow without subagent orchestration. |
| **Large / Complex** | Multi-file changes spanning DB schema, GraphQL Federation, tRPC, React UI components, Webhooks, or Redis events. | **Orchestrate Hierarchical Centralized Orchestration (Supervisor Model)**. |

---

## Phase 3 — ORCHESTRATION BOOTSTRAP

If the complexity is rated **Large / Complex**, you must boot the Supervisor Model:

### Supervisor Model Architecture

```mermaid
graph TD
    Supervisor["Supervisor Agent (Incoming LLM)"] -->|Defines & Delegates Tasks| BackendSpecialist["Backend Specialist Agent"]
    Supervisor -->|Defines & Delegates Tasks| FrontendSpecialist["Frontend Specialist Agent"]
    Supervisor -->|Defines & Delegates Tasks| QATester["QA / Playwright Test Agent"]
    BackendSpecialist -->|Reports status & code| Supervisor
    FrontendSpecialist -->|Reports status & code| Supervisor
    QATester -->|Reports test runs & bugs| Supervisor
```

#### 1. Define Subagents
Define the specialist subagents using the `define_subagent` tool:
* **Backend Specialist**: Equipped with write tools to edit schemas, @types, resolvers, and internal tRPC routes.
* **Frontend Specialist**: Equipped with write tools to edit Zod schemas, React routes, hooks, components, and module-federation exposes.
* **QA / Playwright Specialist**: Focused solely on writing and verifying Playwright tests in `.agents/plugins/<plugin>/tests/`.

#### 2. Supervisor (Orchestrator) Responsibilities
* Spawns subagents using `invoke_subagent`.
* Coordinates the plan step-by-step and merges code contributions.
* Sets one-shot timers (`schedule` tool) to resume checks without busy polling.
* Runs verification tests via `evals/run.sh <plugin> --include-e2e`.

---

## Slop checklist before routing

- [ ] Clarification question is strictly < 30 words.
- [ ] Codebase analysis was performed before establishing the plan.
- [ ] Task rating matches the criteria.
- [ ] Large tasks spawn explicit subagents to maintain clean context windows.
