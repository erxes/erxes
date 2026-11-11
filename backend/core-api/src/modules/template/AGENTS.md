# Template module (core)

Installs a solution, such as an AI employee, in one go. Not the content
templates core used to have: that module was removed; this one owns the name.

- Templates are declared in plugin code, `startPlugin({ meta: { templates } })`
  (`TTemplate`, `erxes-api-shared/core-modules/templates`). Nothing about a
  template is stored except installations.
- `registry.ts` lists what enabled plugins declare and hides a template whose
  trigger or step types automations does not know, or whose requirement kind
  has no enabled owner (`core` and `automations` kinds always do).
- `installTemplate` (`db/models/Installations.ts`): every requirement answered
  or it refuses; an `automations:aiAgent` answer is resolved server side to
  that agent's connection, so a key never travels through the wizard and the
  stored answer is the agent id; parts are created first, then one draft
  automation per journey; a failure removes what was created. Activating stays
  a person's act.
- Journey steps may carry `connects` (AI agent tool or split option id → step
  order, becomes `optionalConnects`) and `target` (the step a split reads, its
  `targetActionId`). A `core:text` answer can sit inside a longer text as
  `{{ answers.<key> }}`. Core answers `core:text`, `core:emails.sender`,
  `core:team.members` (`[[ user.<id> ]]` tokens joined by commas, the builder
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
- An installation (`template_installations`) records template id, version,
  answers, part ids and automation ids. Installed copies never follow later
  template versions. Removing one deletes its automations and agent only while
  none of the automations is active.
- A template card is drawn from the flow, not by hand: `buildJourneyPreview`
  (`preview.ts`) gives each journey's trigger, entry step and up to three
  branches (the journey's `highlights` with short tile names, else the steps
  after the entry step); `Template.icon` is a Tabler icon name.
- GraphQL: `templates`, `templateDetail`, `templateInstallations`,
  `templateInstall`, `templateInstallationRemove`; permissions `templatesRead`
  (always) and `templatesInstall`.
- Tests: `__tests__/templateInstall.test.ts`.
