import {
  type ActionField,
  type ActionInfo,
  type AutomationStep,
  type DataField,
  isAppEvent,
} from '@erxes/core-contract';
import type { StartingEvent } from './BuilderContext';
import { armsOf } from './flowModel';
import type { FieldInfo } from './useAutomationFields';

export const isEmpty = (value: unknown) =>
  value === undefined || value === null || value === '' || (Array.isArray(value) && !value.length);

/** The action's required inputs the step leaves empty. */
export const emptyRequired = (input: Record<string, unknown>, action: ActionInfo | undefined) =>
  (action?.fields ?? []).filter((field) => field.required && isEmpty(input[field.key]));

/** What an empty required input says, under the input and on the canvas card. */
export const fillIn = (field: ActionField) => `Fill in ${field.label.toLowerCase()}`;

const NEEDS = {
  customer: 'a customer',
  company: 'a company',
  any: 'a customer or company',
} as const;

export const REPLY_ACTION = 'core.webhook.reply';

const missingAction = (type: string, known: ActionInfo[]) => {
  const elsewhere = known.find((item) => item.type === type);

  if (elsewhere && type === REPLY_ACTION)
    return `“${elsewhere.label}” works only when a webhook starts the automation`;

  if (elsewhere?.subject)
    return `“${elsewhere.label}” needs ${NEEDS[elsewhere.subject]}, and this trigger is not about one`;

  return 'This action is not available (its plugin may be uninstalled)';
};

/** What keeps a step from working, before the server says so. */
const stepProblems = (
  step: AutomationStep,
  actions: ActionInfo[],
  known: ActionInfo[],
): string[] => {
  switch (step.type) {
    case 'action': {
      const action = actions.find((item) => item.type === step.action);

      if (!action) return [missingAction(step.action, known)];

      return emptyRequired(step.input, action).map(fillIn);
    }

    case 'branch':
      return step.conditions.rules.length ? [] : ['Add a condition'];
    case 'switch':
      return step.cases.some((item) => !item.conditions.rules.length)
        ? ['Every case needs a condition']
        : [];
    case 'delay':
      return step.until === '' ? ['Choose the date to wait until'] : [];
    default:
      return [];
  }
};

/** Every problem in the flow, by step id. */
export const flowProblems = (
  steps: AutomationStep[],
  actions: ActionInfo[],
  known: ActionInfo[] = actions,
  into = new Map<string, string[]>(),
) => {
  for (const step of steps) {
    const problems = stepProblems(step, actions, known);

    if (problems.length) into.set(step.id, problems);

    for (const arm of armsOf(step)) flowProblems(arm.steps, actions, known, into);
  }

  return into;
};

export const countSteps = (steps: AutomationStep[]): number =>
  steps.reduce(
    (sum, step) => sum + 1 + armsOf(step).reduce((inner, arm) => inner + countSteps(arm.steps), 0),
    0,
  );

type EventFields = { type?: string; label: string; source?: string; fields?: DataField[] };

const pickedFrom = (event: EventFields | undefined) =>
  event?.type && isAppEvent(event.type) ? { integration: event.source } : { source: event?.source };

/**
 * An event's own values as fields (`event.payload.<key>`), under the event's name. One that holds
 * a record id (`recordType`) is picked from its plugin's records, or an app event's from the app's.
 */
export const eventDataFields = (event: EventFields | undefined): FieldInfo[] =>
  (event?.fields ?? []).map((field) => ({
    path: `event.payload.${field.key}`,
    label: field.label,
    type: field.type,
    group: 'event',
    groupLabel: event?.label,
    recordType: field.recordType,
    ...pickedFrom(event),
  }));

type OutputContext = {
  events: (EventFields & { type: string })[];
  actions: ActionInfo[];
  /** The trigger event's own values, as its plugin declares them. */
  trigger?: StartingEvent;
  learned?: Map<string, DataField[]>;
};

const withLearned = (declared: DataField[], learned: DataField[] = []) => {
  const listed = new Set(declared.map((output) => output.key));

  return [...declared, ...learned.filter((output) => !listed.has(output.key))];
};

const outputsOfStep = (step: AutomationStep, context: OutputContext): FieldInfo[] => {
  if (step.type === 'action') {
    const action = context.actions.find((item) => item.type === step.action);
    const title = step.label || action?.label || step.action;

    return withLearned(action?.outputs ?? [], context.learned?.get(step.id)).map((output) => ({
      path: `steps.${step.id}.output.${output.key}`,
      label: `${title}: ${output.label}`,
      type: output.type,
      ...(output.recordType && action
        ? {
            recordType: output.recordType,
            ...(action.source === 'core' && action.integration
              ? { integration: action.integration }
              : { source: action.source }),
          }
        : {}),
    }));
  }

  if (step.type === 'wait_for') {
    const event = context.events.find((item) => item.type === step.event);
    const label = step.label || (event?.label ?? step.event);

    return [
      {
        path: `steps.${step.id}.output.matched`,
        label: `${label} within the wait`,
        type: 'boolean',
      },
      ...(event?.fields ?? []).map((field) => ({
        path: `steps.${step.id}.output.event.payload.${field.key}`,
        label: `${label}: ${field.label}`,
        type: field.type,
        recordType: field.recordType,
        ...pickedFrom(event),
      })),
    ];
  }

  return [];
};

const collectOutputsBefore = (
  list: AutomationStep[],
  id: string | null,
  context: OutputContext,
): { found: boolean; fields: FieldInfo[] } => {
  const fields: FieldInfo[] = [];

  for (const step of list) {
    if (step.id === id) return { found: true, fields };

    fields.push(...outputsOfStep(step, context));

    const branchOutputs: FieldInfo[] = [];

    for (const arm of armsOf(step)) {
      const inside = collectOutputsBefore(arm.steps, id, context);

      if (inside.found) return { found: true, fields: [...fields, ...inside.fields] };

      branchOutputs.push(...inside.fields);
    }

    fields.push(...branchOutputs);
  }

  return { found: false, fields };
};

/**
 * What the steps before `id` can use besides the record: the trigger event's values
 * ("Deal" of "Deal created") and earlier steps' outputs ("Create a deal: Deal",
 * "Customer updated within the wait").
 */
export const stepOutputFields = (
  steps: AutomationStep[],
  id: string | null,
  context: OutputContext,
): FieldInfo[] => [
  ...eventDataFields(context.trigger),
  ...collectOutputsBefore(steps, id, context).fields,
];
