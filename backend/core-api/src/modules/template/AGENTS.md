# Template module (core)

Installs a solution, such as an AI employee, in one go. Not the content
templates core used to have: that module was removed; this one owns the name.

- Templates are declared in plugin code, `startPlugin({ meta: { templates } })`
  (`TTemplate`, `erxes-api-shared/core-modules/templates`). Nothing about a
  template is stored except installations.
- `registry.ts` lists what enabled plugins declare and hides a template whose
  trigger or step types automations does not know, or whose requirement kind
  has no enabled owner (`core` and `automations` kinds always do).
- `installTemplate` (`db/utils.ts`): every requirement answered
  or it refuses; an `automations:aiAgent` answer is resolved server side to
  that agent's connection, so a key never travels through the wizard and the
  stored answer is the agent id; parts are created first, then (with two or
  more journeys) an automation folder named after the template
  (`installationId` set), then one draft automation per journey filed in it;
  a failure removes what was created. Activating stays a person's act.
- A template's group is read, never declared (`templateGroupOf`, shared
  `templates/group.ts`): no journeys = `segment`, one = `automation`, more =
  `solution`. A journey-less template may only create `core:segments.segment`
  parts (`validateTemplate`). A segment part no journey reads
  (`templatePartKeysUsedByJourneys`) is created listed (no `ownedBy`), saved
  with `listed: true`, and stays when the installation is removed; one a
  journey reads stays automation-owned. A failed install removes either.
- A journey may declare `workflows` (key, inputs, output, flow): installed as
  the automation's workflow nodes, run by an AI agent helper tool whose
  `connects` value is the workflow key; empty inputs become tool parameters
  (`ticketId` and `attachmentIds` are enums from the conversation;
  `inputHints` give the others a description and allowed values; step
  references in `output` point to the workflow's own steps). Fills may
  target a workflow step (`target: 'workflow'`). `refs` writes another step's
  id into config (e.g. a set property's `targetActionId`).
- Journey steps may carry `connects` (AI agent tool or split option id → step
  order, becomes `optionalConnects`) and `target` (the step a split reads, its
  `targetActionId`). A `core:text` answer can sit inside a longer text as
  `{{ answers.<key> }}`. Core answers `core:text`, `core:emails.sender`,
  `core:team.member` (one `[[ user.<id> ]]` token), `core:team.members`
  (`[[ user.<id> ]]` tokens joined by commas, the builder
  member picker's own format, so the step shows names; the engine resolves them
  to ids), `core:emails.content` (an email
  step's subject and body, written in the builder's email editor) and
  `automations:aiAgent`.
- Built-in workflow templates (broadcast) use the same shared materializer:
  `automationBuiltInTemplateMaterialize` (automations queries) returns
  `{ actions, entryActionId, unanswered }` for both the preview and the
  install, which adds the actions to the campaign's flow. They have no
  `mustConfigure`: wording the organization writes is a requirement
  (`core:emails.content`, `core:text`) and keeps installing closed.
- Each installed workflow carries `automationId: ''`, as one drawn in the
  builder does: the builder form requires it, so without it the automation
  could never be saved or switched on.
- Installing copies each node's declared details from automation constants
  (`getTemplateNodeDetails`): a trigger's `isCustom`, label, icon and
  description, an action's label and icon. A trigger saved without
  `isCustom` is run and drawn as a segment trigger. Branch links carry
  `sourceId` (the step itself), which the builder draws edges from.
  Automation ids are stored as text.
- Installed nodes get positions (`layoutTemplateFlow`, the builder's
  500×300 step): the main path runs right from the trigger on one row and
  every other branch (tool, split option, `isExists`) takes a row of its own.
  The builder places only a plain chain by itself.
- Parts are created first, then journeys read their ids: an AI agent here,
  a `core:segments.segment` here too (owned by automations, so unlisted and
  never a name clash; removing its automations may remove it first),
  any other `plugin:type` part by that plugin's `templateParts` producer
  (`/templates` createPart/removePart, `createTemplatePartsApi`). A part may
  return `refs` (a desk's channel, pipeline, first status) read as
  `{{ parts.<key>.<ref> }}`. A failed install removes every part it made.
  Removing an installation asks each owner to remove its part; one holding
  data people made (a pipeline with tickets) stays and is reported in `kept`.
- An installation (`template_installations`) records template id, version,
  answers, part ids and automation ids. Installed copies never follow later
  template versions. Removing one deletes its automations and agent only while
  none of the automations is active; its folder goes too unless someone moved
  another automation into it. `src/commands/backfillAutomationFolders.ts`
  gives installations made before folders their folder (safe to rerun).
- A template card is drawn from the flow, not by hand: `buildJourneyPreview`
  (`preview.ts`) gives each journey's trigger, entry step and up to three
  branches (the journey's `highlights` with short tile names, else the steps
  after the entry step); `Template.icon`, part and tile icons are Tabler
  names the erxes-ui icon registry has (the keys of `ALL_ICONS` in
  `TablerIcons.ts`, not aliased imports), or they draw as
  a placeholder.
- The install wizard (core-ui `modules/template`) asks connections, then
  people, then wording, each step opening once those before it are answered;
  defaults are seeded once per template. A plugin's `templateRequirement`
  component gets `value`, `dependsOnValue`, `onChange` and `onLabel`
  (what the choice is called, shown when the step is collapsed); open steps
  stay mounted while collapsed so they can report it. Short choice lists use
  `ui-modules` `TemplateRequirementOptions` (cards, the last one makes a new
  record in place or in a new tab) and `useTemplateRequirementOptions` (picks
  the only option, or the one that appears after it was made).
- After installing, `installedPathOf` (core-ui `template/utils`) opens what a
  small template made: an `automation` in the builder, a `segment` on its
  page; a `solution` lands on `/templates/installations/:id?installed=1`. The
  gallery filters by `?group=` and `?plugin=`; Automations and Segments link
  "From template" to their group.
- The installation page
  reads the template again for journey icons and part names
  (`useTemplateInstallationView`; without it, names come from the record),
  says it was just installed, and lists each draft automation to review and
  switch on with how many are on.
- GraphQL: `templates`, `templateDetail`, `templateInstallations`,
  `templateInstall`, `templateInstallationRemove`; permissions `templatesRead`
  (always) and `templatesInstall`.
- Tests: `__tests__/templateInstall.test.ts`.
