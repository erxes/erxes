# SPEC: Dynamic Cross-Plugin Workflows (erxes-agent)

**Status:** Draft v2 (v1 was overfit to the customer-support example; this revision
derives the design from first principles and demotes that example to an appendix)
**Owner:** erxes-agent plugin (`backend/plugins/erxes-agent_api`)
**Depends on:** `@mastra/core` 1.x workflows, live operation registry, erxes automations service

---

## 1. First principles — what this actually is

> "User just wants to automate their business with a simple chat."

A business is processes. Every process, in any domain, decomposes into the same
five primitives:

| Primitive        | Meaning                         | Realized by                                                                   |
| ---------------- | ------------------------------- | ----------------------------------------------------------------------------- |
| **Events**       | something happened              | triggers (any plugin event, time, webhook, manual, another workflow)          |
| **Capabilities** | something can be done           | the live operation registry — every GraphQL operation of every enabled plugin |
| **Judgment**     | a decision needs intelligence   | agent steps (LLM with structured output)                                      |
| **Time**         | processes span hours/days/weeks | durable runs, wait/sleep, schedules                                           |
| **Humans**       | some decisions belong to people | approval/input steps (suspend → notify → resume)                              |

**A workflow is data that composes these five primitives. Nothing else exists in
the kernel.** Customer support, lead nurturing, inventory reordering, invoice
chasing, onboarding, weekly report digests — all userland, all expressible without
touching kernel code. The kernel must never contain a concept that belongs to one
domain (this is the v1 mistake the `reply` step made — see §4.4).

**The spectrum this fills.** erxes today has two poles:

- **erxes automations** — deterministic if-this-then-that, hand-configured in a UI.
  Reliable, but rigid and limited to what the UI exposes.
- **the chat agent** (this plugin today) — fully autonomous judgment, but
  ephemeral: it acts only while someone is chatting, and its behavior is
  reconstructed from scratch every turn.

Workflows are the continuum between them: each _part_ of a process sits where it
belongs — deterministic rails where reliability matters, judgment steps where
intelligence matters, human gates where accountability matters. And position on
the spectrum is not fixed: **workflows are crystallized agent behavior**. A
process can start agent-heavy ("figure out what to do with this event") and
harden over time — the master agent observes run history and proposes replacing
judgment steps with deterministic ones where the decision has become predictable
(cheaper, faster, auditable). The reverse also holds: a brittle deterministic
branch can be relaxed into a judgment step.

**The full loop is conversational, not just authoring.** "Automate my business by
chatting" means all four phases happen in chat:

```
  BUILD ──▶ RUN ──▶ OBSERVE ──▶ IMPROVE ──▶ (back to RUN)
  "set up X"        "why did      "make it also
                     run #14       handle Y"
                     fail?"
```

The master agent authors definitions, but equally reads run history, explains
failures, and proposes patches. A system that only builds is a code generator;
this is an operator.

---

## 2. What already exists (foundation inventory)

| Capability                             | Where                                                        | Kernel role                                                                                                                                                            |
| -------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Live operation registry                | `src/mastra/tools/operationRegistry.ts`                      | **Capabilities.** Every operation of every enabled plugin, introspected at runtime. New plugin enabled → instantly composable. Zero per-plugin integration code, ever. |
| Policy-scoped execution                | `src/mastra/tools/scope.ts`, `metaTools.ts`                  | Capability governance — allowlists enforced at search _and_ execute.                                                                                                   |
| Agent runtime + providers              | `src/mastra/agentRuntime.ts`, `providers.ts`                 | **Judgment.** Any DB-configured provider/model powers judgment steps.                                                                                                  |
| erxes automations service              | `backend/services/automations`, plugin `meta/automations.ts` | **Events.** The existing tenant-wide event bus: entity create/update events from every plugin, plus plugin-specific triggers. We consume it; we do not rebuild it.     |
| Mastra 1.x workflows + Mongo snapshots | verified live (§7)                                           | **Time + Humans.** Durable runs, suspend/resume across process restarts.                                                                                               |
| Thread/session ownership, bot bridge   | `src/modules/session/*`, `src/routes.ts`                     | Run provenance; conversational entry point.                                                                                                                            |
| Knowledge RAG + memory                 | `src/mastra/knowledge/*`, `src/mastra/memory/*`              | Judgment steps ground decisions in company data with existing permission filters.                                                                                      |

**Gap:** Mastra workflows are _code_; ours must be _data_ an LLM can author,
inspect, and patch. That mismatch is the core design problem.

---

## 3. Architecture overview

```
            ┌──────────────────────────────┐
  admin ───▶│  Master agent                 │  BUILD / OBSERVE / IMPROVE
            │  draft·validate·simulate·     │  (chat)
            │  save·inspect-runs·patch      │
            └──────────────┬───────────────┘
                           │ reads/writes
                           ▼
            ┌──────────────────────────────┐
            │  Workflow Definitions (Mongo) │  declarative JSON, versioned
            └──────────────┬───────────────┘
                           │ compiled per version
                           ▼
 EVENTS ──────────────▶┌──────────────────────────────┐    ┌──────────────────┐
 automations bus       │  Workflow kernel (Mastra)     │◀──▶│ MongoDBStore      │
 schedule / webhook    │  run · suspend ⇄ human · time │    │ (dedicated dbName)│
 manual / workflow     └──────────────┬───────────────┘    └──────────────────┘
                                      │ CAPABILITIES: execute_erxes_operation
                                      ▼
            ┌──────────────────────────────┐
            │  erxes gateway → any plugin   │
            └──────────────────────────────┘
```

**The pivotal decision: the LLM authors a declarative definition, never code.**
A compiler turns definitions into Mastra 1.x workflow graphs at load time.
Definitions are versioned Mongo documents → editable in chat, auditable,
tenant-scoped, portable. No `eval`, no arbitrary code execution, ever.

---

## 4. Workflow Definition DSL

### 4.1 The trigger envelope (normalization layer)

Every trigger source — automations event, schedule tick, webhook call, manual
run, parent workflow — is normalized into one envelope before the run starts:

```jsonc
{
  "source": "automation | schedule | webhook | manual | workflow",
  "type": "frontline:facebook.messages", // source-specific event type
  "payload": {
    /* the full target document / webhook body / parent input */
  },
  "actor": { "kind": "customer|user|system", "id": "..." }, // when known
  "channelRef": {
    // OPTIONAL — only conversational sources
    "kind": "frontline:conversation",
    "id": "<conversationId>",
  },
}
```

Workflows reference it as `{{trigger.payload.*}}`, `{{trigger.actor.*}}` etc.
This is what keeps the kernel domain-agnostic: a workflow triggered by a Facebook
message and one triggered by a nightly cron see the same shape. `channelRef` is
the _only_ concession to conversational sources, and it is optional metadata —
not a kernel concept (see 4.4).

### 4.2 Top level

```jsonc
{
  "name": "...",
  "description": "...",
  "version": 3,
  "isEnabled": true,
  "trigger": { "type": "...", "filter": {} }, // §6
  "policy": { "mode": "custom", "allowed": [] }, // scope.ts grammar, mandatory
  "bindings": {
    // named refs → tenant-local ids
    "supportAgent": { "kind": "agent", "id": "<mongo-id>" },
  },
  "limits": { "maxLlmCalls": 10 },
  "steps": [],
}
```

Bindings exist so definitions never embed raw tenant ids inline → portable as
templates across tenants (§11.6).

### 4.3 Step types (the complete kernel set)

Outputs referenced as `{{ steps.<id>.output.<path> }}`; refs resolve data only,
never structure. Unknown refs are compile errors.

| type        | Primitive   | Compiles to                                                   | Config                                          |
| ----------- | ----------- | ------------------------------------------------------------- | ----------------------------------------------- |
| `operation` | Capability  | policy-checked `execute_erxes_operation`                      | `operation`, `args`                             |
| `agent`     | Judgment    | configured Agent with enforced `structuredOutput`             | `agentRef`, `prompt`, `outputSchema`            |
| `branch`    | —           | `.branch()`                                                   | `branches: [{when, steps}]`, `else`             |
| `parallel`  | —           | `.parallel()`                                                 | `steps`                                         |
| `foreach`   | —           | `.foreach({concurrency})`                                     | `items`, `steps`, `concurrency` (≤8)            |
| `loop`      | —           | `.dountil()` with mandatory `maxIterations`                   | `steps`, `until`, `maxIterations`               |
| `approval`  | Human       | suspend + notify + resume; decision in `output`               | `message`, `assignee?`, `timeout?`, `onTimeout` |
| `input`     | Human       | suspend awaiting structured human data (not just yes/no)      | `message`, `schema`, `assignee?`                |
| `wait`      | Time        | `.sleep()` / `.sleepUntil()`                                  | `duration` \| `until`                           |
| `workflow`  | composition | run another definition as a sub-step (Mastra nested workflow) | `workflowRef`, `input`                          |
| `end`       | —           | `bail(payload)`                                               | `output?`                                       |

Composition closes the loop in both directions: a workflow can invoke a workflow
(`workflow` step), and **any workflow can be exposed to agents as a tool**
(Mastra's `workflows:{}` on `Agent` auto-converts using the definition's I/O
schemas) — so the chat agent can _run_ automations mid-conversation, and the
master agent can build workflows out of workflows.

### 4.4 Where did `reply` go? (the v1 overfit, corrected)

v1 had a `reply` step — a conversational concept living in the kernel. Wrong
altitude. Replying _is_ an `operation` (a frontline message-add, an email send, a
notification — all already in the registry). What remains in the kernel is only
sugar: when an `operation` step's args contain `{{trigger.channelRef}}`, the
compiler resolves it to the concrete target. The builder agent knows the idiom
"if the trigger is conversational and the user asked for a response, add the
appropriate send-message operation targeting `channelRef`." Support bots get
their replies; the kernel stays domain-free.

### 4.5 Conditions — deterministic by default, judgment by exception

`when` expressions: refs, `== != > < >= <=`, `&&`, `||`, `!`, `in`, literals.
Tiny safe evaluator — no `Function`, no prototype access. When routing needs
intelligence, the canonical shape is an `agent` step emitting an enum, then a
deterministic `branch` on it. Classification is LLM; routing is code; an
injected customer message can never rewrite control flow.

---

## 5. Master agent — builder _and_ operator

A distinguished agent (`role: "builder"` on the Agent model) in the existing chat
UI, covering the whole BUILD → OBSERVE → IMPROVE loop:

**Build:** `search_erxes_operations` (exists) · `inspect_operation` ·
`list_workflow_triggers` · `draft_workflow` (validates DSL schema + ops exist +
args type-check + refs resolve + policy covers every op; returns structured
errors the model iterates on) · `simulate_workflow` (dry-run trace with stubbed
operations) · `save_workflow` (new version).

**Observe:** `list_workflows` · `get_workflow_runs` (statuses, per-step results,
errors, token usage) · `explain_run` (step-by-step narrative of one run) —
powering "why did my workflow do X?".

**Improve:** `propose_patch` (diff against current version, human-readable) ·
crystallization analysis: detect judgment steps whose outputs have become
predictable across runs (e.g. an intent classifier returning `order` for 95% of
messages matching a pattern) and propose hardening them into deterministic
branches; flag deterministic branches that frequently dead-end as candidates for
judgment.

**Conversation contract:** restate the understood process → present the draft as
a human-readable step list (never raw JSON) → call out every destructive
operation and where approval gates were auto-inserted → explicit confirmation
before saving enabled. Edits follow the same loop.

---

## 6. Triggers

The kernel consumes events; it never defines domain-specific ones.

| Trigger type            | Mechanism                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Phase |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----- |
| `manual`                | UI / master agent / `simulate_workflow`                                                                                                                                                                                                                                                                                                                                                                                                                            | 1     |
| `automation:*`          | **One generic action** — "Run agent workflow" — registered in `meta/automations.ts`. Inherits the _entire_ existing trigger ecosystem: every entity create/update event from every plugin, frontline fb/ig/inbox messages, ticket events, segment entry. Contract verified (§11.4): `action.config.workflowId` selects the definition; `execution.target` becomes `trigger.payload`; fire-and-forget v1, `waitCondition` reserved for a "wait for workflow" toggle | 2     |
| `schedule`              | BullMQ repeatable job per definition (same pattern as knowledge sweep) — time is a first-class event source, not an afterthought: digests, reconciliations, SLA checks                                                                                                                                                                                                                                                                                             | 2     |
| `webhook`               | `POST /workflow/:id/hook` + per-workflow secret                                                                                                                                                                                                                                                                                                                                                                                                                    | 3     |
| `workflow` / agent-tool | composition (§4.3)                                                                                                                                                                                                                                                                                                                                                                                                                                                 | 3     |

The direct frontline bot bridge (`/bot/:conversationId`) remains as a
low-latency _conversational agent_ path; conversational _workflows_ ride the
automations bus like everything else.

Positioning: erxes automations = deterministic, UI-configured. Agent workflows =
NL-authored, judgment-capable, durable. They compose: an automation starts a
workflow; a workflow does anything any plugin exposes.

---

## 7. Runtime & durability

- **Mastra instance:** lazily-created per subdomain (mirrors `generateModels`
  tenancy). Compiled-workflow cache keyed `workflowId:version`.
- **Storage:** `@mastra/mongodb` (`MongoDBStore`) — **verified live 2026-06-10**
  (adapter 1.9.1 against installed core 1.41.0, CJS `require()`, Atlas): suspend
  in one process → resume in a _fresh_ process → `success`. Snapshots in
  `mastra_workflow_snapshot` keyed by `run_id`.
  - ⚠️ **MUST use a dedicated `dbName`** (e.g. `erxes_mastra_runtime`): the
    adapter auto-creates ~31 collections including `mastra_threads`,
    `mastra_messages`, `mastra_agents` — identical names to this plugin's own
    collections. Same-db = collision/corruption.
  - Constructor: `new MongoDBStore({ id, uri, dbName })`; `disableInit` /
    `skipDefaultIndexes` available for controlled migrations.
- **Run lifecycle:** `createRun({ runId })` → `start({ inputData: envelope })`.
  Statuses: `running / suspended / success / failed / canceled`.
- **Humans:** `approval`/`input` steps `suspend()` with payload → `WorkflowApproval`
  record + erxes notification → approve/respond mutation rehydrates by `runId`
  from any process and `resume({ resumeData })`.
- **Retries:** workflow-level `retryConfig` (default `{attempts: 2, delay: 2000}`),
  per-step override.
- **Observability:** `MastraWorkflowRun` document per run (status, envelope,
  per-step results/errors, token usage, duration) — the substrate for the master
  agent's OBSERVE/IMPROVE tools, not just a UI nicety. Live runs stream via
  `run.stream()` over GraphQL subscriptions. Later: `timeTravel` replay-debugging.

---

## 8. Security & governance

1. **Policy is mandatory** per definition (scope.ts grammar); compiler refuses
   out-of-policy ops; runtime re-checks (defense in depth).
2. **Auto-inserted human gates** before destructive patterns (`*Remove`,
   `*Delete`, `*Merge`, payment-creating ops above a threshold). Removing one
   requires explicit admin override, recorded on the definition (audit trail).
3. **Auth principal:** runs execute as a dedicated per-workflow credential
   (settings `erxesApiToken` v0; scoped tokens later). Never the triggering
   actor's identity implicitly.
4. **Tenant isolation:** definitions, runs, snapshots, approvals, the Mastra
   instance, storage dbName, and the operation registry are all per-tenant.
5. **Injection containment:** trigger payloads are untrusted. They reach LLMs
   only inside `agent` steps with schema-enforced output; they can never appear
   in operation names, policy, or `when` expressions. Knowledge-sourced content
   keeps the existing data-notice labeling.
6. **Limits:** per-tenant caps (enabled workflows, runs/hour), per-run caps
   (`maxLlmCalls` default 10, max steps 30, foreach fan-out ≤8), and `loop`
   requires `maxIterations`. Runaways are structurally impossible.

---

## 9. Data model (new `workflow` module)

```
MastraWorkflow         name, description, definition (JSON), version, isEnabled,
                       policy, trigger{type,config}, bindings, limits,
                       createdByUserId, approvalOverrides[], timestamps

MastraWorkflowRun      workflowId, version, runId, status, triggerEnvelope,
                       stepsSummary, error?, usage{tokens,llmCalls},
                       startedAt, finishedAt

MastraWorkflowApproval runId, stepId, kind(approval|input), message, payload,
                       schema?, assignee?, status, decidedByUserId?, decidedAt?

(+ Mastra-managed snapshot collections in the dedicated storage dbName)
```

GraphQL (existing naming convention): `mastraWorkflows`, `mastraWorkflow`,
`mastraWorkflowRuns`, `mastraWorkflowCreate/Update/Remove/SetEnabled`,
`mastraWorkflowRunStart`, `mastraWorkflowApprovalRespond`,
subscription `mastraWorkflowRunChanged`.

---

## 10. Phased roadmap — kernel completeness, not a demo

Each phase completes kernel capability; acceptance tests deliberately span
_different domains_ so nothing overfits to one scenario.

| Phase                              | Kernel capability delivered                                                                                                         | Acceptance (cross-domain)                                                                                                                                     |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **0. Foundations**                 | Mastra instance + MongoDBStore (dedicated db); workflow module CRUD; DSL zod schema; trigger envelope                               | hand-written definition compiles; `run.start()` works                                                                                                         |
| **1. Capabilities + linear flow**  | compiler: `operation`, `agent`, `wait`, `end`; ref resolution; `manual` trigger; run records                                        | one linear flow touching ≥2 different plugins runs end-to-end                                                                                                 |
| **2. Events + judgment + builder** | `branch`/`parallel`; `automation:*` + `schedule` triggers; master agent BUILD tools                                                 | (a) event-driven: support flow drafted entirely in chat (appendix A); (b) time-driven: scheduled digest/reorder flow (appendix B) — both from the same kernel |
| **3. Humans + time at scale**      | `approval`/`input` suspend-resume; notifications + approval UI; retries; `webhook` trigger                                          | a run pauses for a human decision and survives a server restart (verified primitive, now productized)                                                         |
| **4. Operate & improve**           | OBSERVE/IMPROVE tools (`explain_run`, `propose_patch`, crystallization); `foreach`/`loop`/`workflow` composition; limits dashboards | "why did run X fail?" answered in chat; a judgment step hardened into a branch via proposed patch                                                             |

---

## 11. Open questions — RESOLVED (2026-06-10)

1. **Mongo storage adapter — ✅ verified working.** Live cross-process
   suspend/resume test against Atlas; details in §7. Dedicated-dbName constraint
   discovered (collection-name collision with this plugin's own collections).
2. **Reply channel — superseded by §4.4:** replying is an `operation`;
   `channelRef` on the trigger envelope is optional metadata + compiler sugar.
   Frontline conversation is the first `channelRef` kind.
3. **Versioning — decided:** runs pin the definition version they started with;
   suspended runs resume against the pinned version's compiled graph; edits
   create new versions; in-flight runs never migrate.
4. **Automations action payload — ✅ spiked, contract documented.**
   `receiveActions` receives `{ subdomain, data: { moduleName, actionType,
collectionType, action, execution } }`; `action.config` → our `workflowId`;
   `execution.target` → `trigger.payload`; `execution.triggerType` →
   `trigger.type`; `execution.actions[].result` available. Return `{ result }`
   fire-and-forget, or `{ result, waitCondition }` (`CHECK_OBJECT`) so the parent
   automation can await the workflow (reserved for later). Zod types:
   `erxes-api-shared/src/core-modules/automations/zodTypes.ts`.
5. **Cost control — decided (v1):** per-run `maxLlmCalls` (default 10) +
   per-tenant daily budget; on breach fail the run with a clear error + owner
   notification. Degradation/queueing deferred.
6. **Portability — decided:** `bindings` map (named refs, §4.2) instead of raw
   tenant ids → definitions are shareable templates (future marketplace, Phase 5).

---

## Appendix A — worked example: social-media customer support (event-driven)

_The original motivating scenario — now just userland data on the kernel._
Trigger `automation:*` on frontline fb/ig message → `agent` step classifies
intent into an enum (`question | order | payment | complaint`) and drafts a
grounded reply → deterministic `branch`: order → `operation` product lookup +
`approval` + `operation dealsAdd`; payment → `operation` qpay invoice
(`payment_api` `qpay`/`qpayQuickqr` — verified present) → final `operation`
sends the reply to `{{trigger.channelRef}}`.

## Appendix B — worked example: inventory reorder (time-driven, zero conversation)

Proof the kernel isn't conversational at heart. Trigger `schedule` (nightly) →
`operation` list low-stock products → `foreach` product: `agent` step judges
reorder quantity from sales velocity (judgment) → `input` step asks the
purchasing manager to confirm quantities (structured human data, suspends until
morning) → `operation` create purchase order / operation tasks → `operation`
notify the team. No customer, no chat, no channelRef — same five primitives.

## Appendix C — worked example: invoice chasing (long-running, weeks-scale)

Trigger `automation:*` on invoice overdue → `wait` 3 days → `branch` on payment
status (`operation` re-check) → polite reminder (`operation` email) → `wait` 7
days → `agent` step drafts escalation tone-matched to customer history →
`approval` by account owner → final notice or write-off task. Demonstrates Time
as a primitive: one run alive for weeks, surviving restarts via snapshots.
