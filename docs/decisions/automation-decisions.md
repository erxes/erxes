# Automation Decisions

This file records product and architecture decisions for the automation system.
Use this as the shared source of truth when naming, designing, or implementing
automation capabilities.

## 001. Reusable Lifecycle Blocks Are Named Workflow

Date: 2026-07-14

### Decision

Reusable executable lifecycle blocks inside automation are named **Workflow**.

Use one term everywhere:

- UI
- API
- GraphQL schema
- code
- documentation
- support conversations

### Mongolian Product Term

Use **Урсгал** for Mongolian UI and product language.

Examples:

- POS захиалгын урсгал
- Ticket шийдвэрлэх урсгал
- Төлбөр хүлээх урсгал
- Хүргэлтийн мэдэгдлийн урсгал
- Гомдол шийдвэрлэх урсгал

### Technical Naming

Use `Workflow` consistently in technical names.

Preferred names:

- `Workflow`
- `WorkflowDefinition`
- `WorkflowRun`
- `StartWorkflow`

Example UI language:

- `Start workflow: POS Order Lifecycle`
- `Start workflow: Ticket Resolution`

Example Mongolian UI language:

- `Урсгал эхлүүлэх: POS захиалгын lifecycle`
- `Урсгал эхлүүлэх: Ticket шийдвэрлэх`

### Meaning

A Workflow is not just a visual group. It is a reusable executable business
lifecycle with inputs, actions, waits, branches, outputs, and its own run state.

Example:

```text
POS Order Workflow
  input: customerId, orderType, products, amount, sourceConversation
  -> create POS order
  -> send payment notification
  -> wait until paid
  -> send paid notification
  -> branch delivery / pickup
  -> send final instruction
  -> end
```

```text
Ticket Resolution Workflow
  input: customerId, title, description, sourceConversation
  -> create ticket
  -> send new ticket notification
  -> wait until ticket closed
  -> send closed notification
  -> end
```

### Rejected Terms

Do not use **Module** for this concept.

Reason: `moduleName`, plugin modules, Facebook module, POS module, and ticket
module already exist in the codebase and product language. Reusing "module" for
automation lifecycle blocks creates ambiguity.

Do not use **Component** for this concept.

Reason: it is too easily confused with UI/React components and makes the concept
sound like a small visual building block rather than an executable business
lifecycle.

Do not use **Section** for this concept.

Reason: it sounds like a visual/layout grouping, not executable logic.

Avoid **Subflow** as the primary product term.

Reason: it is technically close, but it makes the lifecycle block sound
secondary or smaller than it is. Use it only when describing implementation
details if absolutely necessary.

### Rule

One concept gets one name: **Workflow**.

Do not use one name in UI and another name in code for this concept.

## 002. Defer Typed Workflow Input Contracts

Date: 2026-07-15

### Decision

Do not introduce typed Workflow input contracts in the first implementation.

For now, a Workflow is a saved reusable automation block that uses the existing
execution context and placeholder system.

Examples:

```text
{{ trigger.customerId }}
{{ trigger.conversationId }}
{{ actions.ai_extract.attributes.products }}
{{ actions.ai_extract.attributes.orderType }}
```

Do not add first-version UI or backend requirements for:

- Workflow input schema design
- required Workflow variables
- variable mapping UI
- Workflow input validation
- Workflow input versioning or migration

### Reason

Typed input contracts make the product and implementation too heavy too early.

They would require schema editing, mapping, validation, migrations, and user
education before the core Workflow model has proven itself in real usage.

### Initial Rule

In the initial version:

- Workflow is a reusable automation block.
- Workflow can access parent trigger/action context.
- Workflow actions use placeholders directly.
- Action-level validation remains inside each action.
- Workflow-level input contracts are deferred.

### Later Reconsideration

Typed Workflow inputs can be reconsidered after real Workflow usage shows clear
repeated patterns that need safer contracts.

Possible later examples:

```text
POS Order Workflow inputs:
  customerId
  products
  orderType
  sourceConversationId

Ticket Workflow inputs:
  customerId
  title
  description
  sourceConversationId
```

These are intentionally not required in the first implementation.
