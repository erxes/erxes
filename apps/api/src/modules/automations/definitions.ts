import type {
  AutomationDefinition,
  AutomationFieldPath,
  AutomationStep,
} from '@erxes/core-contract';
import {
  CONTENT_TYPES,
  type ContentType,
  type Db,
  type FIELD_TYPES,
  fields,
  pluginInstallations,
  plugins,
} from '@erxes/core-db';
import { and, eq, inArray } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { eventTypeCatalog } from '~/modules/webhooks/webhooks.service';
import { actionCatalog } from './actions/catalog';
import { render } from './templates';

const installedPlugins = (client: Db) =>
  client
    .select({ name: plugins.name, manifest: plugins.manifest })
    .from(plugins)
    .innerJoin(pluginInstallations, eq(pluginInstallations.plugin, plugins.name))
    .where(and(eq(pluginInstallations.status, 'active'), eq(plugins.status, 'active')));

/** The triggers and actions an organisation's automations can use. */
export const automationCatalog = async (client: Db) => {
  const triggers = await eventTypeCatalog(client);

  return {
    triggers: triggers.map((item) => ({
      type: item.type,
      label: item.label,
      description: item.description ?? null,
      source: item.source,
      subject: item.subject,
    })),
    actions: actionCatalog(await installedPlugins(client)),
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

/** How conditions compare a custom field's values. */
const KIND_OF_FIELD = {
  text: 'text',
  textarea: 'text',
  number: 'number',
  date: 'date',
  boolean: 'boolean',
  select: 'select',
  multiselect: 'select',
  radio: 'select',
  check: 'text',
  phone: 'text',
  list: 'text',
} satisfies Record<(typeof FIELD_TYPES)[number], AutomationFieldPath['type']>;

const COMMON_FIELDS: AutomationFieldPath[] = [
  { path: 'event.type', label: 'Event type', type: 'text' },
  { path: 'event.actorType', label: 'Who did it (user, plugin, system)', type: 'text' },
  { path: 'event.payload', label: 'Event details', type: 'text' },
];

const CUSTOMER_FIELDS: AutomationFieldPath[] = [
  { path: 'subject.firstName', label: 'First name', type: 'text' },
  { path: 'subject.lastName', label: 'Last name', type: 'text' },
  { path: 'subject.primaryEmail', label: 'Email', type: 'text' },
  { path: 'subject.primaryPhone', label: 'Phone', type: 'text' },
  { path: 'subject.state', label: 'State', type: 'select', options: ['lead', 'customer'] },
  { path: 'subject.ownerId', label: 'Owner', type: 'member' },
  { path: 'subject.tagIds', label: 'Tags', type: 'tags' },
  { path: 'subject.birthDate', label: 'Birthday', type: 'date' },
  { path: 'subject.createdAt', label: 'Created', type: 'date' },
];

const COMPANY_NAME: AutomationFieldPath = {
  path: 'subject.primaryName',
  label: 'Name',
  type: 'text',
};

const COMPANY_FIELDS: AutomationFieldPath[] = [
  COMPANY_NAME,
  { path: 'subject.ownerId', label: 'Owner', type: 'member' },
  { path: 'subject.tagIds', label: 'Tags', type: 'tags' },
  { path: 'subject.createdAt', label: 'Created', type: 'date' },
];

const builtInFields = (subject?: ContentType) => {
  if (subject === 'company') return COMPANY_FIELDS;

  if (subject === 'customer') return CUSTOMER_FIELDS;

  return [...CUSTOMER_FIELDS, COMPANY_NAME];
};

/** Built-in fields of customers and companies, and the organisation's custom fields. */
export const automationFields = async (client: Db, subject?: ContentType) => {
  const custom = await client
    .select({ id: fields.id, label: fields.label, type: fields.type, options: fields.options })
    .from(fields)
    .where(subject ? eq(fields.contentType, subject) : inArray(fields.contentType, CONTENT_TYPES));

  return {
    data: [
      ...COMMON_FIELDS,
      ...builtInFields(subject),
      ...custom.map((field) => ({
        path: `subject.customFields.${field.id}`,
        label: `${field.label} (custom)`,
        type: KIND_OF_FIELD[field.type],
        options: field.options,
      })),
    ],
  };
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

  return problems;
};

export const checkDefinition = async (client: Db, definition: AutomationDefinition) => {
  const problems = await definitionProblems(client, definition);
  const [first] = problems;

  if (first) throw fail('INVALID_AUTOMATION', first, { problems });
};
