import { generateAutomationElementId, TAutomationAction } from 'ui-modules';

export type TBuiltInTemplateStep = {
  order: number;
  type: string;
  label?: string;
  description?: string;
  icon?: string;
  config?: Record<string, any>;
  next?: number | Record<string, number>;
};

export type TBuiltInTemplateRequirement = {
  key: string;
  kind: string;
  label: string;
  description?: string;
  fills?: { order: number; path: string; from?: string }[];
  dependsOn?: string;
};

export type TBuiltInTemplate = {
  id: string;
  name: string;
  description?: string;
  pluginName?: string;
  flow: TBuiltInTemplateStep[];
  requirements?: TBuiltInTemplateRequirement[];
  // Left empty on purpose, for the organization to write. Never blocks
  // installing — only says what would otherwise be discovered later.
  mustConfigure?: { order: number; label: string }[];
};

// `{{ actions.<order>.<path> }}` inside a template's config. The trailing dot
// is part of the match, so `actions.1.` never swallows `actions.11.`.
const STEP_REFERENCE_REGEX = /\{\{\s*actions\.(\d+)\./g;

const setPath = (target: Record<string, any>, path: string, value: unknown) => {
  const keys = path.split('.');
  const last = keys.pop();

  if (!last) {
    return;
  }

  let cursor = target;

  for (const key of keys) {
    if (typeof cursor[key] !== 'object' || cursor[key] === null) {
      cursor[key] = {};
    }
    cursor = cursor[key];
  }

  cursor[last] = value;
};

const rewriteStepReferences = (
  value: unknown,
  orderToId: Map<number, string>,
): any => {
  if (typeof value === 'string') {
    return value.replace(STEP_REFERENCE_REGEX, (match, order) => {
      const id = orderToId.get(Number(order));
      return id ? `{{ actions.${id}.` : match;
    });
  }

  if (Array.isArray(value)) {
    return value.map((item) => rewriteStepReferences(item, orderToId));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        rewriteStepReferences(item, orderToId),
      ]),
    );
  }

  return value;
};

/**
 * Turns a built-in template into actions a flow can hold.
 *
 * The template addresses its own steps by `order`, so the same template can be
 * installed any number of times into any number of automations: every install
 * mints fresh ids and rewrites the chain, the branch handles and the
 * `{{ actions.*.* }}` references onto them in one pass.
 *
 * @param usedIds ids already taken in the flow being installed into.
 * @param answers requirement key -> value chosen while installing.
 */
export const materializeBuiltInTemplate = (
  template: TBuiltInTemplate,
  {
    usedIds = [],
    answers = {},
  }: {
    usedIds?: string[];
    answers?: Record<string, unknown>;
  } = {},
): { actions: TAutomationAction[]; entryActionId?: string } => {
  const steps = [...(template.flow || [])].sort((a, b) => a.order - b.order);
  const taken = [...usedIds];
  const orderToId = new Map<number, string>();

  for (const step of steps) {
    const id = generateAutomationElementId(taken);
    taken.push(id);
    orderToId.set(step.order, id);
  }

  const actions = steps.map((step) => {
    const config: Record<string, any> = rewriteStepReferences(
      step.config || {},
      orderToId,
    );

    // A branch's targets live in the action's own config (`yes`/`no`,
    // `isExists`/`notExists`), not in `nextActionId`.
    if (step.next && typeof step.next === 'object') {
      for (const [handle, order] of Object.entries(step.next)) {
        const target = orderToId.get(order);

        if (target) {
          config[handle] = target;
        }
      }
    }

    return {
      id: orderToId.get(step.order) as string,
      type: step.type,
      label: step.label || '',
      description: step.description || '',
      icon: step.icon,
      config,
      nextActionId:
        typeof step.next === 'number' ? orderToId.get(step.next) : undefined,
    } as TAutomationAction;
  });

  for (const requirement of template.requirements || []) {
    const answer = answers[requirement.key];

    if (answer === undefined || answer === null) {
      continue;
    }

    for (const { order, path, from } of requirement.fills || []) {
      const action = actions.find(({ id }) => id === orderToId.get(order));

      if (!action) {
        continue;
      }

      const value = from ? (answer as Record<string, unknown>)?.[from] : answer;

      // A field the answer does not carry — a sender saved without a name —
      // is left alone, so the step shows it as still needing a value rather
      // than being filled with nothing.
      if (value === undefined || value === null || value === '') {
        continue;
      }

      setPath(action.config as Record<string, any>, path, value);
    }
  }

  return { actions, entryActionId: actions[0]?.id };
};

/** Requirements that have to be answered before the template can be installed. */
export const getUnansweredRequirements = (
  template: TBuiltInTemplate,
  answers: Record<string, unknown>,
) =>
  (template.requirements || []).filter(
    ({ key }) => answers[key] === undefined || answers[key] === null,
  );
