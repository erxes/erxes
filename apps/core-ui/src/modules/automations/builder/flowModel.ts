import type {
  ActionInfo,
  AutomationStep,
  AutomationTrigger,
  ConditionGroup,
  ConditionRule,
} from '@erxes/core-contract';
import { zoneLabel } from './timezones';
import type { FieldInfo } from './useAutomationFields';

/** Where a list of steps lives: the top, or one arm (`then`, `case:1`, `path:0`, …) of a step. */
export interface ListAddress {
  parentId: string | null;
  arm: string | null;
}

export interface Arm {
  key: string;
  label: string;
  steps: AutomationStep[];
}

export const newStepId = () => Math.random().toString(36).slice(2, 10);

/** The lists of steps a branching step holds, in display order. */
export const armsOf = (step: AutomationStep): Arm[] => {
  switch (step.type) {
    case 'branch':
      return [
        { key: 'then', label: 'Yes', steps: step.then },
        { key: 'else', label: 'No', steps: step.else },
      ];
    case 'switch':
      return [
        ...step.cases.map((item, index) => ({
          key: `case:${index}`,
          label: item.label || `Case ${index + 1}`,
          steps: item.steps,
        })),
        { key: 'otherwise', label: 'Otherwise', steps: step.otherwise },
      ];
    case 'split':
      return step.paths.map((path, index) => ({
        key: `path:${index}`,
        label: `${path.label || String.fromCharCode(65 + index)} · ${path.weight}%`,
        steps: path.steps,
      }));
    default:
      return [];
  }
};

const withArm = (step: AutomationStep, arm: string, steps: AutomationStep[]): AutomationStep => {
  if (step.type === 'branch' && (arm === 'then' || arm === 'else'))
    return { ...step, [arm]: steps };

  if (step.type === 'switch') {
    if (arm === 'otherwise') return { ...step, otherwise: steps };

    const index = Number(arm.split(':')[1]);

    return {
      ...step,
      cases: step.cases.map((item, at) => (at === index ? { ...item, steps } : item)),
    };
  }

  if (step.type === 'split') {
    const index = Number(arm.split(':')[1]);

    return {
      ...step,
      paths: step.paths.map((path, at) => (at === index ? { ...path, steps } : path)),
    };
  }

  return step;
};

/** Applies `fn` to the list at `address` (deep), leaving everything else as is. */
export const updateList = (
  steps: AutomationStep[],
  address: ListAddress,
  fn: (list: AutomationStep[]) => AutomationStep[],
): AutomationStep[] => {
  if (address.parentId === null) return fn(steps);

  return steps.map((step) => {
    if (step.id === address.parentId && address.arm) {
      const arm = armsOf(step).find((item) => item.key === address.arm);

      return arm ? withArm(step, address.arm, fn(arm.steps)) : step;
    }

    return armsOf(step).reduce(
      (current, arm) => withArm(current, arm.key, updateList(arm.steps, address, fn)),
      step,
    );
  });
};

export const findStep = (steps: AutomationStep[], id: string): AutomationStep | null => {
  for (const step of steps) {
    if (step.id === id) return step;

    for (const arm of armsOf(step)) {
      const found = findStep(arm.steps, id);

      if (found) return found;
    }
  }

  return null;
};

/** The list a step is in, and its place there. */
export const locate = (
  steps: AutomationStep[],
  id: string,
  address: ListAddress = { parentId: null, arm: null },
): { address: ListAddress; index: number; length: number } | null => {
  const index = steps.findIndex((step) => step.id === id);

  if (index >= 0) return { address, index, length: steps.length };

  for (const step of steps) {
    for (const arm of armsOf(step)) {
      const found = locate(arm.steps, id, { parentId: step.id, arm: arm.key });

      if (found) return found;
    }
  }

  return null;
};

export const replaceStep = (steps: AutomationStep[], next: AutomationStep): AutomationStep[] => {
  const at = locate(steps, next.id);

  return at
    ? updateList(steps, at.address, (list) =>
        list.map((step) => (step.id === next.id ? next : step)),
      )
    : steps;
};

export const removeStep = (steps: AutomationStep[], id: string): AutomationStep[] => {
  const at = locate(steps, id);

  return at
    ? updateList(steps, at.address, (list) => list.filter((step) => step.id !== id))
    : steps;
};

export const moveStep = (steps: AutomationStep[], id: string, delta: -1 | 1): AutomationStep[] => {
  const at = locate(steps, id);

  if (!at || at.index + delta < 0 || at.index + delta >= at.length) return steps;

  return updateList(steps, at.address, (list) => {
    const moved = list[at.index];

    return moved ? list.toSpliced(at.index, 1).toSpliced(at.index + delta, 0, moved) : list;
  });
};

export const insertStep = (
  steps: AutomationStep[],
  address: ListAddress,
  index: number,
  step: AutomationStep,
) => updateList(steps, address, (list) => [...list.slice(0, index), step, ...list.slice(index)]);

/** A copy with fresh ids (arms included), for "duplicate". */
export const cloneStep = (step: AutomationStep): AutomationStep => {
  const copy = { ...step, id: newStepId() };

  return armsOf(copy).reduce(
    (current, arm) => withArm(current, arm.key, arm.steps.map(cloneStep)),
    copy,
  );
};

export const STEP_TYPES = [
  'action',
  'delay',
  'wait_for',
  'branch',
  'switch',
  'split',
  'stop',
] as const;

export type StepType = (typeof STEP_TYPES)[number];

/** A new action's starting inputs: an email goes to the record itself until told otherwise. */
export const actionDefaults = (action: ActionInfo | undefined): Record<string, unknown> =>
  Object.fromEntries(
    (action?.fields ?? [])
      .filter((field) => field.type === 'recipients')
      .map((field) => [field.key, 'subject']),
  );

export const newStep = (
  type: StepType,
  actions: ActionInfo[],
  subject: 'customer' | 'company',
): AutomationStep => {
  const id = newStepId();

  const firstAction =
    actions.find(
      (item) => item.subject === null || item.subject === 'any' || item.subject === subject,
    ) ?? actions[0];

  switch (type) {
    case 'action':
      return {
        id,
        type,
        action: firstAction?.type ?? 'core.note.add',
        input: actionDefaults(firstAction),
      };
    case 'delay':
      return { id, type, amount: 1, unit: 'hours' };
    case 'wait_for':
      return { id, type, event: 'core.customer.updated', amount: 3, unit: 'days' };
    case 'branch':
      return { id, type, conditions: { match: 'all', rules: [] }, then: [], else: [] };
    case 'switch':
      return {
        id,
        type,
        cases: [{ conditions: { match: 'all', rules: [] }, steps: [] }],
        otherwise: [],
      };
    case 'split':
      return {
        id,
        type,
        paths: [
          { label: 'A', weight: 50, steps: [] },
          { label: 'B', weight: 50, steps: [] },
        ],
      };
    default:
      return { id, type: 'stop' };
  }
};

// ─── Words ──────────────────────────────────────────────────────────────────

const OPS: Record<string, string> = {
  eq: 'is',
  neq: 'is not',
  gt: '>',
  gte: '≥',
  lt: '<',
  lte: '≤',
  contains: 'contains',
  not_contains: "doesn't contain",
  starts_with: 'starts with',
  in: 'is one of',
  not_in: 'is none of',
  exists: 'is set',
  not_exists: 'is empty',
};

const plural = (count: number, one: string, many = `${one}s`) =>
  `${count} ${count === 1 ? one : many}`;

const isRule = (rule: ConditionRule | ConditionGroup): rule is ConditionRule => !('match' in rule);

const countRules = (group: ConditionGroup): number =>
  group.rules.reduce((sum, rule) => sum + (isRule(rule) ? 1 : countRules(rule)), 0);

/** "State is lead", "+2 more". */
export const describeConditions = (
  group: ConditionGroup | undefined,
  fields: FieldInfo[],
): string | null => {
  if (!group || !group.rules.length) return null;

  const first = group.rules.find(isRule);
  const total = countRules(group);

  if (!first) return plural(total, 'condition');

  const field = fields.find((item) => item.path === first.path);

  // Until the field list loads (or for a hand-typed path): `subject.primaryEmail` → "primary email".
  const name =
    field?.label ??
    first.path
      .replace(/^(subject|event\.payload)\./, '')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[._]/g, ' ')
      .toLowerCase();

  const more = total > 1 ? ` ${group.match === 'any' ? 'or' : 'and'} ${total - 1} more` : '';

  // Yes/no fields read as a statement: "Customer updated within the wait" / "… didn't happen".
  if (field?.type === 'boolean' && (first.op === 'eq' || first.op === 'neq')) {
    const yes = (first.value === true || first.value === 'true') === (first.op === 'eq');

    return `${name}${yes ? '' : ': no'}${more}`;
  }

  const value =
    first.op === 'exists' || first.op === 'not_exists'
      ? ''
      : ` ${Array.isArray(first.value) ? first.value.join(', ') : String(first.value ?? '')}`;

  return `${name} ${OPS[first.op] ?? first.op}${value}${more}`;
};

const unitWord = (amount: number, unit: string) => plural(amount, unit.replace(/s$/, ''));

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const describeTrigger = (
  trigger: AutomationTrigger,
  events: { type: string; label: string }[],
  fields: FieldInfo[],
): { title: string; detail: string | null } => {
  switch (trigger.kind) {
    case 'event': {
      const label = events.find((item) => item.type === trigger.event)?.label ?? trigger.event;
      const only = describeConditions(trigger.conditions, fields);

      return { title: label, detail: only ? `Only if ${only}` : null };
    }

    case 'schedule': {
      const when =
        trigger.every === 'hour'
          ? 'Every hour'
          : trigger.every === 'day'
            ? `Every day at ${trigger.at}`
            : trigger.every === 'week'
              ? `Every ${(trigger.weekdays?.length ? trigger.weekdays : [1]).map((day) => WEEKDAYS[day - 1]).join(', ')} at ${trigger.at}`
              : `Monthly on day ${trigger.dayOfMonth ?? 1} at ${trigger.at}`;

      return {
        title: when,
        detail: trigger.audience
          ? `For each ${trigger.audience.type}${describeConditions(trigger.audience.conditions, fields) ? ` where ${describeConditions(trigger.audience.conditions, fields)}` : ''}`
          : zoneLabel(trigger.timezone),
      };
    }

    case 'date': {
      const field =
        fields.find((item) => item.path === `subject.${trigger.field}`)?.label ?? trigger.field;

      const offset =
        trigger.offsetDays === 0
          ? 'On'
          : trigger.offsetDays > 0
            ? `${unitWord(trigger.offsetDays, 'days')} after`
            : `${unitWord(-trigger.offsetDays, 'days')} before`;

      return {
        title: `${offset} ${field.toLowerCase()}${trigger.yearly ? ', every year' : ''}`,
        detail: `At ${trigger.at} (${zoneLabel(trigger.timezone)})`,
      };
    }

    default:
      return {
        title: 'Started by hand',
        detail: trigger.audience
          ? `On each ${trigger.audience.type}${describeConditions(trigger.audience.conditions, fields) ? ` where ${describeConditions(trigger.audience.conditions, fields)}` : ''}`
          : 'On chosen records',
      };
  }
};

export const STEP_TITLES: Record<StepType, string> = {
  action: 'Action',
  delay: 'Wait',
  wait_for: 'Wait for an event',
  branch: 'If / else',
  switch: 'Choose a path',
  split: 'A/B split',
  stop: 'Stop',
};

const valueText = (value: unknown): string => {
  if (Array.isArray(value)) return value.length ? plural(value.length, 'item') : '';

  if (value === true) return 'yes';

  if (value === false || value === undefined || value === null) return '';

  if (value === 'subject') return 'the record';

  return String(value);
};

const truncate = (text: string, length = 60) =>
  text.length > length ? `${text.slice(0, length - 1)}…` : text;

/** The card's title and one line about what it does. */
export const describeStep = (
  step: AutomationStep,
  context: {
    actions: ActionInfo[];
    events: { type: string; label: string }[];
    fields: FieldInfo[];
    /** Lead stages, to name the one a step moves to. */
    stages?: { id: string; name: string }[];
  },
): { title: string; detail: string | null } => {
  switch (step.type) {
    case 'action': {
      const action = context.actions.find((item) => item.type === step.action);

      const shown = (action?.fields ?? [])
        .map((field) => {
          const value = step.input[field.key];

          if (field.type === 'members' || field.type === 'tags')
            return Array.isArray(value) && value.length
              ? plural(value.length, field.type === 'members' ? 'member' : 'tag')
              : null;

          const named =
            field.type === 'custom_field'
              ? context.fields
                  .find((item) => item.path === `subject.customFields.${String(value)}`)
                  ?.label.replace(/ \(custom\)$/, '')
              : field.type === 'lead_stage'
                ? context.stages?.find((stage) => stage.id === value)?.name
                : undefined;

          const text = named ?? valueText(value);

          return text ? `${field.label.split(' (')[0]}: ${text}` : null;
        })
        .filter(Boolean);

      return {
        title: step.label || action?.label || step.action,
        detail: shown.length ? truncate(shown.slice(0, 2).join(' · ')) : null,
      };
    }

    case 'delay':
      return {
        title:
          step.label ||
          (step.until ? `Until ${step.until}` : unitWord(step.amount ?? 1, step.unit ?? 'minutes')),
        detail: step.label
          ? (step.until ?? unitWord(step.amount ?? 1, step.unit ?? 'minutes'))
          : null,
      };
    case 'wait_for': {
      const label = context.events.find((item) => item.type === step.event)?.label ?? step.event;

      return { title: step.label || label, detail: `At most ${unitWord(step.amount, step.unit)}` };
    }

    case 'branch': {
      const rule = describeConditions(step.conditions, context.fields);

      return {
        title: step.label || (rule ? `If ${rule}` : 'No condition yet'),
        detail: step.label ? rule : null,
      };
    }

    case 'switch':
      return {
        title:
          step.label ||
          step.cases.map((item, index) => item.label || `Case ${index + 1}`).join(' / '),
        detail: `${plural(step.cases.length, 'case')}, then otherwise`,
      };
    case 'split':
      return {
        title:
          step.label ||
          step.paths
            .map(
              (path, index) => `${path.label || String.fromCharCode(65 + index)} ${path.weight}%`,
            )
            .join(' · '),
        detail: 'Each run takes one path',
      };
    default:
      return { title: step.label || 'The run ends here', detail: null };
  }
};

/** What keeps a step from working, before the server says so. */
export const stepProblems = (step: AutomationStep, actions: ActionInfo[]): string[] => {
  switch (step.type) {
    case 'action': {
      const action = actions.find((item) => item.type === step.action);

      if (!action) return ['This action is not available (its plugin may be uninstalled)'];

      return action.fields
        .filter((field) => {
          if (!field.required) return false;

          const value = step.input[field.key];

          return (
            value === undefined ||
            value === null ||
            value === '' ||
            (Array.isArray(value) && !value.length)
          );
        })
        .map((field) => `Fill in ${field.label.toLowerCase()}`);
    }

    case 'branch':
      return step.conditions.rules.length ? [] : ['Add a condition'];
    case 'switch':
      return step.cases.some((item) => !item.conditions.rules.length)
        ? ['Every case needs a condition']
        : [];
    default:
      return [];
  }
};

/** Every problem in the flow, by step id. */
export const flowProblems = (
  steps: AutomationStep[],
  actions: ActionInfo[],
  into = new Map<string, string[]>(),
) => {
  for (const step of steps) {
    const problems = stepProblems(step, actions);

    if (problems.length) into.set(step.id, problems);

    for (const arm of armsOf(step)) flowProblems(arm.steps, actions, into);
  }

  return into;
};

export const countSteps = (steps: AutomationStep[]): number =>
  steps.reduce(
    (sum, step) => sum + 1 + armsOf(step).reduce((inner, arm) => inner + countSteps(arm.steps), 0),
    0,
  );

/** Outputs of the steps before `id` that conditions can use ("Customer updated happened"). */
export const stepOutputFields = (
  steps: AutomationStep[],
  id: string | null,
  context: { events: { type: string; label: string }[] },
): FieldInfo[] => {
  const out: FieldInfo[] = [];

  const walk = (list: AutomationStep[]): boolean => {
    for (const step of list) {
      if (step.id === id) return true;

      if (step.type === 'wait_for') {
        const label =
          step.label ||
          (context.events.find((item) => item.type === step.event)?.label ?? step.event);

        out.push({
          path: `steps.${step.id}.output.matched`,
          label: `${label} within the wait`,
          type: 'boolean',
        });
      }

      for (const arm of armsOf(step)) if (walk(arm.steps)) return true;
    }

    return false;
  };

  walk(steps);

  return out;
};
