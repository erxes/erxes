import type {
  AutomationDefinition,
  AutomationFieldPath,
  AutomationStep,
  ConditionGroup,
} from '@erxes/core-contract';
import {
  CONTENT_TYPES,
  type ContentType,
  type Db,
  emailSenders,
  fields,
  pluginInstallations,
  plugins,
} from '@erxes/core-db';
import { compileGroup } from '@erxes/plugin-sdk/filter';
import { and, eq, inArray, isNotNull, sql } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { inOrder } from '~/lib/sequence';
import { integrationActions } from '~/modules/integrations/actions';
import { subjectFilterFields } from '~/modules/views/filterFields';
import { subjectCompiler } from '~/modules/views/recordFilter';
import { eventTypeCatalog } from '~/modules/webhooks/webhooks.service';
import { actionCatalog } from './actions/catalog';
import { render } from './templates';
import { dateConditions } from './conditions';

const installedPlugins = (client: Db) =>
  client
    .select({ name: plugins.name, manifest: plugins.manifest })
    .from(plugins)
    .innerJoin(pluginInstallations, eq(pluginInstallations.plugin, plugins.name))
    .where(and(eq(pluginInstallations.status, 'active'), eq(plugins.status, 'active')));

/** The triggers and actions an organisation's automations can use. */
export const automationCatalog = async (client: Db) => {
  const triggers = await eventTypeCatalog(client);
  const installed = await installedPlugins(client);

  return {
    triggers,
    actions: [...actionCatalog(installed), ...(await integrationActions(client))],
  };
};

type Catalog = Awaited<ReturnType<typeof automationCatalog>>;

type SubjectKind = Catalog['triggers'][number]['subject'];

const walk = (steps: AutomationStep[], visit: (step: AutomationStep) => void) => {
  for (const step of steps) {
    visit(step);

    if (step.type === 'branch') {
      walk(step.then, visit);
      walk(step.else, visit);
    }

    if (step.type === 'switch') {
      step.cases.forEach((item) => walk(item.steps, visit));
      walk(step.otherwise, visit);
    }

    if (step.type === 'split') step.paths.forEach((path) => walk(path.steps, visit));
  }
};

/** Which record runs are about, given the trigger (null: none). */
const subjectOfTrigger = (
  definition: AutomationDefinition,
  triggers: Catalog['triggers'],
): SubjectKind => {
  const trigger = definition.trigger;

  if (trigger.kind === 'event')
    return triggers.find((item) => item.type === trigger.event)?.subject ?? null;

  if (trigger.kind === 'date') return trigger.subject;

  return trigger.audience?.type ?? null;
};

const isBlank = (value: unknown) =>
  value === undefined ||
  value === null ||
  value === '' ||
  (Array.isArray(value) && value.length === 0);

/** Problems with one action step: unknown, missing fields, or the wrong kind of record. */
const actionProblems = (
  step: Extract<AutomationStep, { type: 'action' }>,
  catalog: Catalog,
  subject: SubjectKind,
) => {
  const action = catalog.actions.find((item) => item.type === step.action);

  if (!action) return [`Step ${step.id}: unknown action ${step.action}`];

  const problems = action.fields
    .filter((field) => field.required && isBlank(step.input[field.key]))
    .map((field) => `Step ${step.id} (${action.label}): ${field.label} is required`);

  if (action.subject && action.subject !== 'any' && subject && action.subject !== subject)
    problems.push(
      `Step ${step.id} (${action.label}) needs a ${action.subject}, but runs are about a ${subject}`,
    );

  if (action.subject && !subject)
    problems.push(
      `Step ${step.id} (${action.label}) needs a customer or company, but runs aren't about one`,
    );

  return problems;
};

/** A sender a step names must be one of the organisation's confirmed senders. */
const senderProblems = async (client: Db, definition: AutomationDefinition, catalog: Catalog) => {
  const named: { step: string; label: string; email: string }[] = [];

  walk(definition.steps, (step) => {
    if (step.type !== 'action') return;

    const action = catalog.actions.find((item) => item.type === step.action);

    action?.fields
      .filter((field) => field.type === 'email_sender')
      .forEach((field) => {
        const value = step.input[field.key];

        if (typeof value === 'string' && value.trim())
          named.push({ step: step.id, label: action.label, email: value.trim().toLowerCase() });
      });
  });

  if (!named.length) return [];

  const confirmed = await client
    .select({ email: emailSenders.email })
    .from(emailSenders)
    .where(
      and(
        inArray(
          emailSenders.email,
          named.map((item) => item.email),
        ),
        isNotNull(emailSenders.confirmedAt),
      ),
    );

  const emails = new Set(confirmed.map((row) => row.email));

  return named
    .filter((item) => !emails.has(item.email))
    .map((item) => `Step ${item.step} (${item.label}): ${item.email} is not a confirmed sender`);
};

/** Problems with one step of any kind. */
const stepProblems = (step: AutomationStep, catalog: Catalog, subject: SubjectKind) => {
  if (step.type === 'delay' && !step.until && !step.amount)
    return [`Step ${step.id}: how long to wait?`];

  if (step.type === 'wait_for')
    return [
      ...(subject
        ? []
        : [`Step ${step.id} waits for an event about the record, but runs aren't about one`]),
      ...(catalog.triggers.some((item) => item.type === step.event)
        ? []
        : [`Step ${step.id}: unknown event ${step.event}`]),
    ];

  if (step.type === 'action') return actionProblems(step, catalog, subject);

  return [];
};

const triggerProblems = async (client: Db, definition: AutomationDefinition, catalog: Catalog) => {
  const trigger = definition.trigger;

  if (trigger.kind === 'event' && !catalog.triggers.some((item) => item.type === trigger.event))
    return [`Unknown trigger ${trigger.event}`];

  if (trigger.kind !== 'date' || trigger.field === 'birthDate') return [];

  const [field] = await client
    .select({ type: fields.type })
    .from(fields)
    .where(and(eq(fields.id, trigger.field), inArray(fields.contentType, CONTENT_TYPES)))
    .limit(1);

  return field?.type === 'date' ? [] : ['The date trigger needs a date field'];
};

/** Templates may only use filters that exist. */
const templateProblems = (definition: AutomationDefinition) => {
  try {
    walk(definition.steps, (step) => {
      if (step.type === 'action') render(step.input, {});
    });

    return [];
  } catch (error) {
    return [error instanceof Error ? error.message : String(error)];
  }
};

const COMMON_FIELDS: AutomationFieldPath[] = [
  { path: 'event.type', label: 'Event type', type: 'text', group: 'event', groupLabel: 'Event' },
  {
    path: 'event.actorType',
    label: 'Who did it (user, plugin, system)',
    type: 'text',
    group: 'event',
    groupLabel: 'Event',
  },
  {
    path: 'event.payload',
    label: 'Event details',
    type: 'text',
    group: 'event',
    groupLabel: 'Event',
  },
];

/**
 * What conditions and placeholders read: the event's fields, and the record's fields as its
 * lists filter them (built-in, lead, custom, the company's, plugins' relations), so a condition
 * means the same as in a saved view. Placeholders insert only what the record itself holds.
 */
export const automationFields = async (client: Db, subject?: ContentType) => {
  const types = subject ? [subject] : CONTENT_TYPES;
  const seen = new Set<string>();
  const record: AutomationFieldPath[] = [];

  // Both types' fields when the trigger names none, each path once.
  await inOrder(types, async (type) => {
    for (const spec of await subjectFilterFields(client, type)) {
      if (seen.has(spec.path)) continue;

      seen.add(spec.path);
      record.push({
        path: spec.path,
        label: spec.label,
        type: spec.type,
        options: spec.options,
        group: spec.group,
        groupLabel: spec.groupLabel,
        currency: spec.currency,
        relation: spec.relation,
        conditionsOnly:
          Boolean(spec.related) || spec.viaCompany === true || spec.group === 'company',
      });
    }
  });

  return { data: [...COMMON_FIELDS, ...record] };
};

/** Every condition group of a definition: the trigger's, the goal, and its steps'. */
const conditionGroups = (definition: AutomationDefinition) => {
  const { trigger } = definition;

  const groups: (ConditionGroup | undefined)[] = [
    trigger.kind === 'event'
      ? trigger.conditions
      : trigger.kind === 'date'
        ? dateConditions(trigger)
        : trigger.audience?.conditions,
    definition.goal,
  ];

  walk(definition.steps, (step) => {
    if (step.type === 'branch' || step.type === 'wait_for') groups.push(step.conditions);

    if (step.type === 'switch') groups.push(...step.cases.map((item) => item.conditions));
  });

  return groups.filter((group): group is ConditionGroup => Boolean(group?.rules.length));
};

const subjectPaths = (group: ConditionGroup): string[] =>
  group.rules.flatMap((rule) =>
    'match' in rule ? subjectPaths(rule) : rule.path.startsWith('subject.') ? [rule.path] : [],
  );

/**
 * Conditions a run couldn't check: on a field the record doesn't have, an operator or value its
 * field can't take, groups nested too deep. Compiled as runs compile them, so what saves runs.
 */
const conditionProblems = async (
  client: Db,
  definition: AutomationDefinition,
  subject: SubjectKind,
) => {
  const groups = conditionGroups(definition);

  if (!groups.length) return [];

  const problems: string[] = [];

  if (!subject) {
    // Rules on the record read empty without one: only how deep the groups go matters.
    groups.forEach((group) => {
      try {
        compileGroup(group, () => sql`true`);
      } catch (error) {
        problems.push(error instanceof Error ? error.message : String(error));
      }
    });

    return problems;
  }

  const compiler = await subjectCompiler(client, subject);

  await inOrder(groups, async (group) => {
    const unknown = subjectPaths(group).filter((path) => !compiler.fields.has(path));

    problems.push(...unknown.map((path) => `Conditions: unknown field ${path}`));

    try {
      await compiler.compile(group, () => true);
    } catch (error) {
      problems.push(`Conditions: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  return problems;
};

/**
 * What would make a definition fail at run time, found before it runs:
 * unknown triggers or actions, missing required fields, a step that needs a
 * customer when the event isn't about one, delays without a length, repeated
 * step ids.
 */
export const definitionProblems = async (client: Db, definition: AutomationDefinition) => {
  const catalog = await automationCatalog(client);
  const subject = subjectOfTrigger(definition, catalog.triggers);
  const problems = await triggerProblems(client, definition, catalog);
  const ids = new Set<string>();

  walk(definition.steps, (step) => {
    if (ids.has(step.id)) problems.push(`Two steps share the id ${step.id}`);
    ids.add(step.id);
    problems.push(...stepProblems(step, catalog, subject));
  });
  problems.push(...templateProblems(definition));
  problems.push(...(await conditionProblems(client, definition, subject)));
  problems.push(...(await senderProblems(client, definition, catalog)));

  return problems;
};

export const checkDefinition = async (client: Db, definition: AutomationDefinition) => {
  const problems = await definitionProblems(client, definition);
  const [first] = problems;

  if (first) throw fail('INVALID_AUTOMATION', first, { problems });
};
