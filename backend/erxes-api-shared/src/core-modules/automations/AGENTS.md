# Automations contract (shared)

Rules for the automation node contract that core and every plugin declare
through `meta.automations.constants`. Read with the root guide; it adds no
exception to plugin isolation.

## Node config contract

- A trigger or action declares what the engine reads from `node.config` as
  `configSchema`, a `zod/v4` schema placed next to its constant. It encodes the
  conditions its executor refuses or misbehaves on, not the builder form:
  form-only keys (placeholders, editor JSON) must stay allowed.
- Declaring the schema is all a service does. `normalizeAutomationConstantsForTransport`
  publishes it as `configJsonSchema` (input side, no `$schema`), and
  `startAutomations` keeps the live contracts (`buildConfigContractIndex`) and
  registers the `validateConfigs` producer once any schema exists. Never set
  `configJsonSchema` by hand and never send a zod schema over the wire.
- Every action type declares a schema: an action without one is added empty
  by authors and stops the flow there. Describe fields with
  `describeConfigField` (it attaches `.meta({ description })`, which must come
  last: zod drops metadata on every later chained call such as `.min()` or
  `.trim()`), and type branch links with `automationOptionalConnectsSchema`.
  A number field that may hold a `{{ }}` placeholder accepts strings too.
  Mark an id field with `.meta({ ref: '<plugin>:<record>' })` so authors look
  the id up instead of inventing it.
- A rule that needs the tenant's data (a verified sender, an existing record)
  goes in `validateConfig` next to the schema. It runs in the declaring service
  with the request's `subdomain`, only after the schema accepted the config, and
  returns issues with `config.`-prefixed paths. A validator that throws leaves
  the node `unchecked`. Like the schema, it never travels over transport.
- Mark credential fields with `builderOnlyConfigField`. `automationNodeSchema`
  leaves them out at any depth and names them in `builderOnlyFields`, since the
  assistant's credential policy refuses any result carrying such a key name;
  an unmarked credential field makes the whole node unreadable to it.
- Validators look records up only for literal values (`readLiteralConfigId`):
  a `{{ }}` variable, a `<< cond >>` token or a `[[ ]]` choice is filled at run
  time.
- The engine's own contracts live in `coreActionConfigSchemas.ts` (if, split,
  findObject, transform, setProperty, sendEmail, outgoingWebhook, messagePro,
  delay, waitEvent) and `aiAgentActionConfigSchema.ts`, which the AI agent
  executor parses with. Executors in `services/automations` derive their config
  types from them, so a schema change is an executor change. Core attaches
  their tenant rules in `core-api/src/meta/automations/configValidators.ts`
  (sendEmail: the reply-to, or the From field while it is aligned, must be a
  verified sender).

## Where schemas are enforced

core-api (`modules/automations/utils/automationGraph.ts`) judges every
`automationsAdd`/`automationsEdit`; `automationValidate` returns the same report
without saving.

- A save may not introduce a node of an undeclared type or a link (`actionId`,
  `nextActionId`, `targetActionId`, `if` `config.yes/no`,
  `config.optionalConnects[].actionId`) to a node the flow lacks. Untouched
  history is never re-judged; types of an unreachable service stay unjudged.
- Configs are checked against their owner's schema when a flow goes live
  (every node) and while it stays live (changed nodes only). A draft may be
  incomplete, but a node it adds or changes is refused for a malformed value
  (`malformed` on the issue): present but wrong, either of a shape nothing
  reads (a number where the builder writes text, an unknown option) or
  pointing at nothing (a record that does not exist, a segment of another
  record type, a step or branch the flow lacks). Validators set `malformed`
  on such findings and leave it off a value that is only missing. So no
  author, the assistant included, can store a wrong node; the builder's
  pickers never write one.
- Schemas follow what the builder writes. `__fixtures__/builderActionConfigs.json`
  and each plugin's `builderActionConfigs.json` hold configs the builder saved;
  `builderConfigContract.test.ts` fails when a schema calls one malformed. Add
  a config there when a form changes how it writes a field.
- Every trigger but a custom one must name an existing segment (`contentId`,
  or `segmentId` for a membership trigger); core checks it for triggers of every
  service, with the same draft/live policy as configs.
- A trigger's segment must be of the trigger's own record type: the engine
  looks the triggering record up in it.
- Core checks what a config refers to (`findFlowReferenceIssues`): every
  `{{ actions.<id>… }}` names a step of the flow, every `optionalConnectId` of
  an AI agent or split is one of its tools, topics or options (`fallback` for a
  split), and a split comparing values without a segment names the step it
  reads in `targetActionId` (unless the trigger is custom). These are reported
  as config issues, with the same draft and live rules.
- An owner that does not answer leaves its nodes `unchecked`, never valid.
- Nodes saved without `label`, `description` or `icon` get them from the
  catalogue before storing: the builder's form refuses nodes without them.
- A sendEmail body written outside the builder is stored as the editors
  store it (`core-api/src/meta/automations/configNormalizers.ts`): `{{ }}`
  text in blocks `content` becomes attribute chips and in maily `contentJson`
  variable nodes, code and links aside. A maily body needs `contentJson`, or
  the editor opens empty.
- An AI agent's `goalType: "generateText"` replies, fills `captureFields`
  (`attributes.*`) and routes through handoff `tools` in one run; its schema
  says so, since authors otherwise chain one agent per task. A split may read
  an earlier agent's output through its `targetActionId`.
- Every `{{ … }}` in a node config is stored as the builder writes it,
  `{{ key }}`, whoever authored it; every reader accepts any spacing, and a
  spacing-only difference is not a config change.
- Branch links are `if` `config.yes/no`, findObject `config.isExists/notExists`
  and `config.optionalConnects[].actionId` (AI agent topics and tools, split
  options, message buttons). An action no trigger reaches is reported as
  `unreachable`; it refuses neither the save nor going live.
- Every issue detail names its `check` (`schema`, `records`, `segment`,
  `references`). The report also groups all findings into `checks`, one per
  kind in a fixed order (types, links, reach, segment, settings, records,
  references, owners) with its time in ms; the builder's activation dialog
  shows them as its preflight. Reach and owners only warn.
- Nodes inside workflows are left to `validateWorkflowBindings`.

## Validation

- `pnpm nx test erxes-api-shared` (`configSchema.test.ts`,
  `coreActionConfigSchemas.test.ts`, `builderConfigContract.test.ts`)
- `pnpm nx test core-api` (`modules/automations/utils/__tests__`)
- After changing a schema: restart the declaring service, then core-api, which
  caches plugin meta until restart.
