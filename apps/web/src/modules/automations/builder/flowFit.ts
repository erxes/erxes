import type {
  ActionInfo,
  AutomationDefinition,
  AutomationStep,
  ConditionGroup,
} from '@erxes/core-contract';
import type { Catalog } from '../automationQueries';
import { startingEventType } from './AppTriggerSettings';
import { REPLY_ACTION } from './flowChecks';
import { armsOf } from './flowModel';

type Trigger = AutomationDefinition['trigger'];

const PLACEHOLDER = /\{\{\s*([^{}|]+?)\s*(\|[^{}]*)?\}\}/g;

/** The record type runs are about, and whether the trigger gives one at all. */
export const subjectOf = (trigger: Trigger, triggers: Catalog['triggers']) => {
  if (trigger.kind === 'event') {
    const event = triggers.find((item) => item.type === trigger.event);

    return { subject: event?.subject ?? 'customer', hasSubject: Boolean(event?.subject) };
  }

  if (trigger.kind === 'date') return { subject: trigger.subject, hasSubject: true };

  if (trigger.kind === 'webhook' || trigger.kind === 'app')
    return { subject: trigger.subject?.type ?? 'customer', hasSubject: Boolean(trigger.subject) };

  const audience = 'audience' in trigger ? trigger.audience : undefined;

  return { subject: audience?.type ?? 'customer', hasSubject: Boolean(audience) };
};

/** The actions a step can use under this trigger: those its record and kind allow. */
export const actionsFor = (catalog: Pick<Catalog, 'actions' | 'triggers'>, trigger: Trigger) => {
  const { subject, hasSubject } = subjectOf(trigger, catalog.triggers);

  return catalog.actions.filter(
    (action) =>
      (trigger.kind === 'webhook' || action.type !== REPLY_ACTION) &&
      (!action.subject || (hasSubject && (action.subject === 'any' || action.subject === subject))),
  );
};

const walkSteps = (steps: AutomationStep[]): AutomationStep[] =>
  steps.flatMap((step) => [step, ...armsOf(step).flatMap((arm) => walkSteps(arm.steps))]);

/** Each step's id, mapped to the ids of the steps that run before it (whose results it can use). */
const earlierIds = (steps: AutomationStep[]) => {
  const order = walkSteps(steps).map((step) => step.id);

  return new Map(order.map((id, index) => [id, new Set(order.slice(0, index))]));
};

const recordKey = (trigger: Trigger, catalog: Pick<Catalog, 'triggers'>) => {
  const { subject, hasSubject } = subjectOf(trigger, catalog.triggers);

  return hasSubject ? subject : '';
};

const eventKey = (trigger: Trigger) => `${trigger.kind}:${startingEventType(trigger) ?? ''}`;

type Stale = (path: string, stepId: string) => boolean;

const staleIn = (
  prev: AutomationDefinition,
  next: AutomationDefinition,
  catalog: Pick<Catalog, 'triggers'>,
): Stale => {
  const recordGone = recordKey(prev.trigger, catalog) !== recordKey(next.trigger, catalog);
  const eventGone = eventKey(prev.trigger) !== eventKey(next.trigger);
  const before = earlierIds(prev.steps);
  const after = earlierIds(next.steps);

  return (path, stepId) => {
    if (!before.has(stepId)) return false;

    if (path.startsWith('subject.')) return recordGone;

    if (path.startsWith('event.')) return eventGone;

    const source = /^steps\.([^.]+)\./.exec(path)?.[1];

    return Boolean(source && before.get(stepId)?.has(source) && !after.get(stepId)?.has(source));
  };
};

const scrubText = (text: string, stale: (path: string) => boolean) =>
  text.replace(PLACEHOLDER, (whole, path: string) => (stale(path.trim()) ? '' : whole));

const scrubValue = (value: unknown, stale: (path: string) => boolean): unknown => {
  if (typeof value === 'string') return scrubText(value, stale);

  if (Array.isArray(value)) return value.map((item) => scrubValue(item, stale));

  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, scrubValue(item, stale)]),
    );

  return value;
};

const scrubGroup = (group: ConditionGroup, stale: (path: string) => boolean): ConditionGroup => ({
  ...group,
  rules: group.rules
    .filter((rule) => 'rules' in rule || !stale(rule.path))
    .map((rule) => ('rules' in rule ? scrubGroup(rule, stale) : rule)),
});

const totalOf = (counts: number[]) => counts.reduce((total, count) => total + count, 0);

const countIn = (value: unknown, stale: (path: string) => boolean): number => {
  if (typeof value === 'string')
    return [...value.matchAll(PLACEHOLDER)].filter((match) => stale((match[1] ?? '').trim()))
      .length;

  if (Array.isArray(value)) return totalOf(value.map((item: unknown) => countIn(item, stale)));

  if (value && typeof value === 'object')
    return totalOf(Object.values(value).map((item: unknown) => countIn(item, stale)));

  return 0;
};

const countRules = (group: ConditionGroup, stale: (path: string) => boolean): number =>
  group.rules.reduce(
    (sum, rule) => sum + ('rules' in rule ? countRules(rule, stale) : Number(stale(rule.path))),
    0,
  );

const staleCount = (step: AutomationStep, stale: (path: string) => boolean) => {
  switch (step.type) {
    case 'action':
      return countIn(step.input, stale);
    case 'delay':
      return countIn(step.until ?? '', stale);
    case 'branch':
      return countRules(step.conditions, stale);
    case 'switch':
      return step.cases.reduce((sum, item) => sum + countRules(item.conditions, stale), 0);
    default:
      return 0;
  }
};

const scrubStep = (step: AutomationStep, stale: (path: string) => boolean): AutomationStep => {
  switch (step.type) {
    case 'action':
      return {
        ...step,
        input: Object.fromEntries(
          Object.entries(step.input).map(([key, value]) => [key, scrubValue(value, stale)]),
        ),
      };
    case 'delay':
      return step.until === undefined ? step : { ...step, until: scrubText(step.until, stale) };
    case 'branch':
      return { ...step, conditions: scrubGroup(step.conditions, stale) };
    case 'switch':
      return {
        ...step,
        cases: step.cases.map((item) => ({
          ...item,
          conditions: scrubGroup(item.conditions, stale),
        })),
      };
    default:
      return step;
  }
};

const withoutSteps = (steps: AutomationStep[], drop: Set<string>): AutomationStep[] =>
  steps
    .filter((step) => !drop.has(step.id))
    .map((step) => {
      switch (step.type) {
        case 'branch':
          return {
            ...step,
            then: withoutSteps(step.then, drop),
            else: withoutSteps(step.else, drop),
          };
        case 'switch':
          return {
            ...step,
            cases: step.cases.map((item) => ({ ...item, steps: withoutSteps(item.steps, drop) })),
            otherwise: withoutSteps(step.otherwise, drop),
          };
        case 'split':
          return {
            ...step,
            paths: step.paths.map((path) => ({ ...path, steps: withoutSteps(path.steps, drop) })),
          };
        default:
          return step;
      }
    });

const mapSteps = (
  steps: AutomationStep[],
  change: (step: AutomationStep) => AutomationStep,
): AutomationStep[] =>
  steps.map((step) => {
    const next = change(step);

    switch (next.type) {
      case 'branch':
        return { ...next, then: mapSteps(next.then, change), else: mapSteps(next.else, change) };
      case 'switch':
        return {
          ...next,
          cases: next.cases.map((item) => ({ ...item, steps: mapSteps(item.steps, change) })),
          otherwise: mapSteps(next.otherwise, change),
        };
      case 'split':
        return {
          ...next,
          paths: next.paths.map((path) => ({ ...path, steps: mapSteps(path.steps, change) })),
        };
      default:
        return next;
    }
  });

const titleOf = (step: AutomationStep, known: ActionInfo[]) =>
  step.label ||
  (step.type === 'action'
    ? (known.find((action) => action.type === step.action)?.label ?? step.action)
    : step.type);

export interface Fit {
  /** The change with what it broke taken out. */
  definition: AutomationDefinition;
  /** The steps it removes, by name: their action can't run under the new trigger. */
  removed: string[];
  /** How many data fields and conditions it clears: they used data the change takes away. */
  cleared: number;
}

/**
 * What an edit breaks in steps that worked before it: actions the new trigger can't run, and
 * data fields or conditions that point at the old trigger's record or data, or at a step that
 * no longer runs before them. New steps (a template, one just added) are left alone.
 */
export const fitFlow = (
  prev: AutomationDefinition,
  next: AutomationDefinition,
  catalog: Pick<Catalog, 'actions' | 'triggers'>,
): Fit => {
  const before = new Set(walkSteps(prev.steps).map((step) => step.id));
  const could = new Set(actionsFor(catalog, prev.trigger).map((action) => action.type));
  const can = new Set(actionsFor(catalog, next.trigger).map((action) => action.type));

  const broken = walkSteps(next.steps).filter(
    (step) =>
      step.type === 'action' &&
      before.has(step.id) &&
      could.has(step.action) &&
      !can.has(step.action),
  );

  const kept = { ...next, steps: withoutSteps(next.steps, new Set(broken.map((step) => step.id))) };
  const stale = staleIn(prev, kept, catalog);

  const cleared = walkSteps(kept.steps).reduce(
    (sum, step) => sum + staleCount(step, (path) => stale(path, step.id)),
    0,
  );

  return {
    definition: {
      ...kept,
      steps: mapSteps(kept.steps, (step) => scrubStep(step, (path) => stale(path, step.id))),
    },
    removed: broken.map((step) => titleOf(step, catalog.actions)),
    cleared,
  };
};

export const breaksAnything = (fit: Fit) => fit.removed.length > 0 || fit.cleared > 0;
