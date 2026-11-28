import type {
  AutomationDefinition,
  AutomationFieldPath,
  AutomationStep,
  ConditionGroup,
} from '@erxes/core-contract';
import { isAppEvent } from '@erxes/core-contract';
import {
  CONTENT_TYPES,
  type ContentType,
  type Db,
  fields,
  integrationConnections,
} from '@erxes/core-db';
import { compileGroup } from '@erxes/plugin-sdk/filter';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { inOrder } from '~/lib/sequence';
import { subjectFilterFields } from '~/modules/views/filterFields';
import { manages } from '~/modules/integrations/connectable';
import { allowsPersonal, usable } from '~/modules/integrations/scopes';
import { INTEGRATIONS } from '~/modules/integrations/registry';
import { resolveAppTrigger } from '~/modules/integrations/subscriptions';
import { subjectCompiler } from '~/modules/views/recordFilter';
import { coreAction } from './actions/catalog';
import { REPLY_ACTION } from './actions/reply';
import { automationCatalog } from './automationCatalog';
import { render } from './templates';
import { triggerConditions } from './conditions';
import { eachStep } from './cursor';
import { decisionProblems } from './decide';
import { triggerFields } from './hooks';
import { MAX_HOURS, MIN_MINUTES } from './schedule';

type Catalog = Awaited<ReturnType<typeof automationCatalog>>;

type SubjectKind = Catalog['triggers'][number]['subject'];

type Trigger = AutomationDefinition['trigger'];

/** Which record runs are about, given the trigger (null: none). */
const subjectOfTrigger = (trigger: Trigger, triggers: Catalog['triggers']): SubjectKind => {
  switch (trigger.kind) {
    case 'event': {
      const event = triggers.find((item) => item.type === trigger.event);

      return event && !('subjectGone' in event && event.subjectGone) ? event.subject : null;
    }

    case 'date':
      return trigger.subject;
    case 'webhook':
    case 'app':
      return trigger.subject?.type ?? null;
    case 'schedule':
    case 'manual':
      return trigger.audience?.type ?? null;
  }
};

const isBlank = (value: unknown) =>
  value === undefined ||
  value === null ||
  value === '' ||
  (Array.isArray(value) && value.length === 0);

const appsNotAllowed = (action: Catalog['actions'][number]) => {
  const integration = INTEGRATIONS.find((item) => item.key === action.integration);

  const own = integration?.keys
    ? integration.actions?.some((item) => `${integration.key}.${item.key}` === action.type)
    : false;

  return integration && own && !manages(integration) && !allowsPersonal(integration)
    ? [integration.name]
    : [];
};

/** Problems with one action step: unknown, missing fields, or the wrong kind of record. */
const actionProblems = (
  step: Extract<AutomationStep, { type: 'action' }>,
  catalog: Catalog,
  subject: SubjectKind,
  trigger: Trigger,
) => {
  const action = catalog.actions.find((item) => item.type === step.action);
  const owner = coreAction(step.action)?.integration;
  const notConnected = `Step ${step.id}: ${owner?.name} is not connected: connect it in Settings › Integrations`;

  if (!action) return [owner ? notConnected : `Step ${step.id}: unknown action ${step.action}`];

  const refused = appsNotAllowed(action).map(
    (name) => `Step ${step.id} (${action.label}): your role can't use ${name}`,
  );

  if (refused.length) return refused;

  const connection = action.fields.find((field) => field.type === 'connection');

  if (owner && connection && !connection.options?.length) return [notConnected];

  const problems = action.fields
    .filter((field) => field.required && isBlank(step.input[field.key]))
    .map((field) => `Step ${step.id} (${action.label}): ${field.label} is required`);

  for (const problem of coreAction(step.action)?.check?.(step.input) ?? [])
    problems.push(`Step ${step.id} (${action.label}): ${problem}`);

  for (const field of action.fields.filter((item) => item.type === 'connection')) {
    const value = step.input[field.key];

    if (!isBlank(value) && !field.options?.some((option) => option.value === value))
      problems.push(`Step ${step.id} (${action.label}): that connection is not active`);
  }

  if (step.action === REPLY_ACTION && trigger.kind !== 'webhook')
    problems.push(`Step ${step.id} (${action.label}) needs the webhook trigger`);

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

/** Problems with one step of any kind. */
const stepProblems = (
  step: AutomationStep,
  catalog: Catalog,
  subject: SubjectKind,
  trigger: Trigger,
) => {
  if (step.type === 'delay' && step.until === '')
    return [`Step ${step.id}: choose the date to wait until`];

  if (step.type === 'delay' && !step.until && !step.amount)
    return [`Step ${step.id}: how long to wait?`];

  if (step.type === 'wait_for') {
    const waited = catalog.triggers.find((item) => item.type === step.event);

    return [
      ...(subject
        ? []
        : [`Step ${step.id} waits for an event about the record, but runs aren't about one`]),
      ...(waited ? [] : [`Step ${step.id}: unknown event ${step.event}`]),
      ...(subject && waited && waited.subject !== subject
        ? [`Step ${step.id} waits for an event that is not about the ${subject} runs are about`]
        : []),
    ];
  }

  if (step.type === 'action') return actionProblems(step, catalog, subject, trigger);

  return [];
};

const scheduleProblems = (trigger: Extract<Trigger, { kind: 'schedule' }>) => {
  const { every, interval } = trigger;

  if (every === 'minute')
    return interval && interval >= MIN_MINUTES
      ? []
      : [`A schedule in minutes runs every ${MIN_MINUTES} minutes or more`];

  if (every === 'hour')
    return (interval ?? 1) <= MAX_HOURS
      ? []
      : [`A schedule in hours runs every 1 to ${MAX_HOURS} hours`];

  return interval ? ['Only schedules in minutes or hours take “every N”'] : [];
};

const appTriggerProblems = async (client: Db, trigger: Extract<Trigger, { kind: 'app' }>) => {
  const resolved = resolveAppTrigger(trigger);

  if (!resolved.ok) return [resolved.problem];

  if (!manages(resolved.app) && !allowsPersonal(resolved.app))
    return [`Your role can't use ${resolved.app.name} for the trigger`];

  const [connection] = await client
    .select({ key: integrationConnections.key, status: integrationConnections.status })
    .from(integrationConnections)
    .where(and(eq(integrationConnections.id, trigger.connectionId), usable(resolved.app)))
    .limit(1);

  if (connection?.key !== resolved.app.key)
    return [`Pick a ${resolved.app.name} connection for the trigger`];

  return connection.status === 'active' ? [] : [`The ${resolved.app.name} connection is off`];
};

const triggerProblems = async (client: Db, definition: AutomationDefinition, catalog: Catalog) => {
  const trigger = definition.trigger;

  if (trigger.kind === 'event' && !catalog.triggers.some((item) => item.type === trigger.event))
    return [`Unknown trigger ${trigger.event}`];

  if (trigger.kind === 'event' && isAppEvent(trigger.event))
    return ['An app’s event starts an automation under App, with its connection'];

  if (trigger.kind === 'schedule') return scheduleProblems(trigger);

  if (trigger.kind === 'app') return appTriggerProblems(client, trigger);

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
  const templates: unknown[] = [];

  eachStep(definition.steps, (step) => {
    if (step.type === 'action') templates.push(step.input);

    if (step.type === 'decide') templates.push(step.question, step.state);
  });

  try {
    templates.forEach((template) => render(template, {}));

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
export const automationFields = async (
  client: Db,
  query: { subject?: ContentType; automation?: string },
) => {
  const { subject } = query;
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

  const request = query.automation ? await triggerFields(client, query.automation) : [];

  return { data: [...COMMON_FIELDS, ...request, ...record] };
};

/** Every condition group of a definition: the trigger's, the goal, and its steps'. */
const conditionGroups = (definition: AutomationDefinition) => {
  const { trigger } = definition;

  const groups: (ConditionGroup | undefined)[] = [triggerConditions(trigger), definition.goal];

  eachStep(definition.steps, (step) => {
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
  const subject = subjectOfTrigger(definition.trigger, catalog.triggers);
  const problems = await triggerProblems(client, definition, catalog);
  const ids = new Set<string>();

  eachStep(definition.steps, (step) => {
    if (ids.has(step.id)) problems.push(`Two steps share the id ${step.id}`);
    ids.add(step.id);
    problems.push(...stepProblems(step, catalog, subject, definition.trigger));
  });
  problems.push(...templateProblems(definition));
  problems.push(...(await decisionProblems(client, definition.steps)));
  problems.push(...(await conditionProblems(client, definition, subject)));

  return problems;
};

export const checkDefinition = async (client: Db, definition: AutomationDefinition) => {
  const problems = await definitionProblems(client, definition);
  const [first] = problems;

  if (first) throw fail('INVALID_AUTOMATION', first, { problems });
};
