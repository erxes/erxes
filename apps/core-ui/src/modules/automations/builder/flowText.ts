import type {
  ActionInfo,
  AutomationStep,
  AutomationTrigger,
  ConditionGroup,
} from '@erxes/core-contract';
import { textOf } from '~/lib/text';
import { isRule } from './conditionOperators';
import { zoneLabel } from './timezones';
import type { FieldInfo } from './useAutomationFields';

/** Words for the trigger and the cards on the canvas. */

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
      : ` ${Array.isArray(first.value) ? first.value.join(', ') : textOf(first.value)}`;

  return `${name} ${OPS[first.op] ?? first.op}${value}${more}`;
};

const unitWord = (amount: number, unit: string) => plural(amount, unit.replace(/s$/, ''));

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type Audience = Extract<AutomationTrigger, { kind: 'manual' }>['audience'];

/** "For each customer where …". */
const audienceText = (prefix: string, audience: NonNullable<Audience>, fields: FieldInfo[]) => {
  const where = describeConditions(audience.conditions, fields);

  return `${prefix} ${audience.type}${where ? ` where ${where}` : ''}`;
};

const scheduleText = (trigger: Extract<AutomationTrigger, { kind: 'schedule' }>) => {
  switch (trigger.every) {
    case 'hour':
      return 'Every hour';
    case 'day':
      return `Every day at ${trigger.at}`;
    case 'week': {
      const days = trigger.weekdays?.length ? trigger.weekdays : [1];

      return `Every ${days.map((day) => WEEKDAYS[day - 1]).join(', ')} at ${trigger.at}`;
    }

    default:
      return `Monthly on day ${trigger.dayOfMonth ?? 1} at ${trigger.at}`;
  }
};

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

    case 'schedule':
      return {
        title: scheduleText(trigger),
        detail: trigger.audience
          ? audienceText('For each', trigger.audience, fields)
          : zoneLabel(trigger.timezone),
      };
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
          ? audienceText('On each', trigger.audience, fields)
          : 'On chosen records',
      };
  }
};

const valueText = (value: unknown): string => {
  if (Array.isArray(value)) return value.length ? plural(value.length, 'item') : '';

  if (value === true) return 'yes';

  if (value === false || value === undefined || value === null) return '';

  if (value === 'subject') return 'the record';

  return textOf(value);
};

const truncate = (text: string, length = 60) =>
  text.length > length ? `${text.slice(0, length - 1)}…` : text;

type DescribeContext = {
  actions: ActionInfo[];
  events: { type: string; label: string }[];
  fields: FieldInfo[];
  /** Lead stages, to name the one a step moves to. */
  stages?: { id: string; name: string }[];
};

/** An action's first two filled inputs: "Stage: Won · Tags: 2 tags". */
const actionDetail = (
  step: Extract<AutomationStep, { type: 'action' }>,
  action: ActionInfo | undefined,
  context: DescribeContext,
) => {
  const shown = (action?.fields ?? []).flatMap((field) => {
    const value = step.input[field.key];

    if (field.type === 'members' || field.type === 'tags') {
      return Array.isArray(value) && value.length
        ? [plural(value.length, field.type === 'members' ? 'member' : 'tag')]
        : [];
    }

    const named =
      field.type === 'custom_field'
        ? context.fields
            .find((item) => item.path === `subject.customFields.${String(value)}`)
            ?.label.replace(/ \(custom\)$/, '')
        : field.type === 'lead_stage'
          ? context.stages?.find((stage) => stage.id === value)?.name
          : undefined;

    const text = named ?? valueText(value);

    return text ? [`${field.label.split(' (')[0]}: ${text}`] : [];
  });

  return shown.length ? truncate(shown.slice(0, 2).join(' · ')) : null;
};

/** The card's title and one line about what it does. */
export const describeStep = (
  step: AutomationStep,
  context: DescribeContext,
): { title: string; detail: string | null } => {
  switch (step.type) {
    case 'action': {
      const action = context.actions.find((item) => item.type === step.action);

      return {
        title: step.label || action?.label || step.action,
        detail: actionDetail(step, action, context),
      };
    }

    case 'delay': {
      const length = unitWord(step.amount ?? 1, step.unit ?? 'minutes');

      return {
        title: step.label || (step.until ? `Until ${step.until}` : length),
        detail: step.label ? (step.until ?? length) : null,
      };
    }

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
