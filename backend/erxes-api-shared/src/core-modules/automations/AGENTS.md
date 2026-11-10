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
  findObject, transform, setProperty, sendEmail, sendNotification,
  approval, pickMember, outgoingWebhook, messagePro, delay, waitEvent) and `aiAgentActionConfigSchema.ts`, which the AI agent
  executor parses with. Executors in `services/automations` derive their config
  types from them, so a schema change is an executor change. Core attaches
  their tenant rules in `core-api/src/meta/automations/configValidators.ts`
  (sendEmail: the reply-to, or the From field while it is aligned, must be a
  verified sender; sendNotification: named team members exist).
- `sendNotification` ("Notify team members") creates in-app notifications
  through core `notifications.create`: `kind: 'user'` from the run's
  `createdVia.actorId` (the automation owner; changing who it comes from means
  transferring ownership), `kind: 'system'` when the run has no actor. Each is
  stamped with the run's `createdVia` (plus `runId`) and points at
  `triggerType`/`targetId`. No email or push: it sets no notification `event`.
  Notifications store `createdVia` with the `schemaWrapper` shape
  (`core-modules/notifications/definitions/notifications.ts`).
- `approval` ("Ask for approval") branches through folks `approved` /
  `rejected` (config keys hold the next action ids; graph, canvas edges and
  insert-on-edge list them). The engine creates a change request through core
  `approval.createAutomationRequest` (type `core:automations.approvalStep`,
  content `core:automations.executions`/executionId, payload executionId +
  actionId, requester = `createdVia.actorId` or the owner, who may also
  approve), parks the run as `waiting`, and arms an `expireApproval` job
  (`timeoutHours`, default 72, max 720). Core's applier/rejecter call
  automations `resolveApproval`; the timeout resolves `expired` and cancels the
  request. `resolveApprovalAction` claims the waiting run atomically, writes
  `decision`/`decidedBy`/`reason` on the step's result and continues on the
  branch; a run whose automation is no longer active completes there. It is
  non-deferrable and cannot sit inside an AI helper tool.
- Approval change types may register `rejecters` beside `appliers`
  (`TApprovalConfig`); core's reject and cancel mutations call the owning
  plugin's `rejectChange` producer, best effort.
- `pickMember` ("Pick a team member") assigns nothing: it outputs `userId`
  (one available candidate), `userIds` (all available) and `fallback`, for
  later steps' assign fields. Availability is core's
  (`core-modules/users/availability.ts` `resolveMemberAvailability`, served by
  core tRPC `users.availability`): a member's declaration
  (`user.availability` status/until/reason, set by themselves or with
  `teamMembersSetAvailability`; absent or past `until` = not declared) and
  membership of the busy segment linked in config `TEAM_AVAILABILITY`
  (`segmentId` of a `core:organization.users` segment, `precedence`
  `segment` | `manual` when they disagree); neither speaking = available. A
  removed segment counts as not linked. The engine drops inactive and
  unavailable candidates, takes turns through an atomic counter per
  automation and step (`automations_pick_turns`, `n % sorted ids`) or picks at
  random, and gives `fallbackUserId` or skips `nobody-available`.
- `waitEvent` may carry `timeout` (`value` + `unit` minutes/hours/days,
  capped at 30 days by `readWaitEventTimeoutMinutes`; none waits until the
  event). With a timeout the node has two exits in config, `met` and
  `timedOut` (canvas folks, graph links, insert-on-edge), and no
  `nextActionId`; turning it off hands `met` back as `nextActionId`. The
  engine arms an `expireWait` job and both the event (segment resume and
  waiting webhook) and the timeout first claim the run atomically
  (`claimWaitEvent`: status `waiting` + `waitingActionId`), so only one resumes
  it; the step's result gets `outcome: met | timedOut`. A timeout without a
  `timedOut` link continues on `met` / the main path.
- Working hours come from a branch (Settings → Structure: `workhours` per
  weekday with lunch, `holidays` that close or shorten a period) in the
  organization's `TIMEZONE`. `workingCalendar.ts` holds the pure math
  (`nextWorkingMoment`, `addWorkingTime`, `isWorkingMoment`); a calendar with no
  working day means plain clock time. In delay, `workingTime` counts only open
  time for minutes and hours, lands days and longer on the next opening, and
  0 waits for opening; the branch is the record's `branchId` / first
  `branchIds`, else `branchId` in the config (`services/automations`
  `executions/workingTime.ts`, also used when a paused automation re-arms
  delays). The walk is bounded to 400 days; DST jumps are not modelled.

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
- Branch links are `if` `config.yes/no`, findObject `config.isExists/notExists`,
  approval `config.approved/rejected`, waitEvent `config.met/timedOut`
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
