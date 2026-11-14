import { customAlphabet } from 'nanoid';
import type {
  TAutomationBuiltInTemplate,
  TAutomationBuiltInTemplateStep,
} from '../automations/types';
import type {
  TTemplate,
  TTemplateAnswers,
  TTemplateFill,
  TTemplateWorkflow,
} from './types';

// Same shape as the builder's own element ids
const generateId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 15);

const newId = (taken: Set<string>) => {
  let id = generateId();

  while (taken.has(id)) {
    id = generateId();
  }

  taken.add(id);

  return id;
};

// `{{ actions.<order>.` — the trailing dot keeps 1 from matching 11
const STEP_REFERENCE = /\{\{\s*actions\.(\d+)\./g;
// `{{ parts.<key> }}` is the created record's id, `{{ parts.<key>.<ref> }}`
// an id that came with it
const PART_REFERENCE =
  /\{\{\s*parts\.([A-Za-z0-9_-]+)(?:\.([A-Za-z0-9_-]+))?\s*\}\}/g;

export type TTemplatePartRefs = Record<string, Record<string, string>>;
// `{{ answers.<key> }}` is replaced by a text answer, inside a longer text
const ANSWER_REFERENCE = /\{\{\s*answers\.([A-Za-z0-9_-]+)\s*\}\}/g;

export type TMaterializedAction = {
  id: string;
  type: string;
  label: string;
  description: string;
  icon?: string;
  config: Record<string, any>;
  nextActionId?: string;
  targetActionId?: string;
  position?: TTemplateNodePosition;
};

export type TTemplateNodePosition = { x: number; y: number };

// The builder's own step between nodes
export const TEMPLATE_NODE_SPACING = { x: 500, y: 300 };

const childOrdersOf = (step: TAutomationBuiltInTemplateStep) => [
  ...(typeof step.next === 'number'
    ? [step.next]
    : Object.values(step.next || {})),
  ...Object.values(step.connects || {}).filter(
    (target): target is number => typeof target === 'number',
  ),
];

/**
 * Where each step is drawn, by order. The builder only places a plain chain
 * by itself, so branches would pile up on one spot: here the main path runs
 * right from the trigger on one row and every other branch takes a new row.
 * Each step is placed once, so a loop back cannot repeat.
 */
export const layoutTemplateFlow = (flow: TAutomationBuiltInTemplateStep[]) => {
  const steps = new Map(flow.map((step) => [step.order, step]));
  const sorted = [...flow].sort((a, b) => a.order - b.order);
  const positions = new Map<number, TTemplateNodePosition>();
  let nextRow = 0;

  for (const root of sorted) {
    if (positions.has(root.order)) {
      continue;
    }

    const stack = [{ order: root.order, column: 1, row: -1 }];

    while (stack.length) {
      const item = stack.pop() as {
        order: number;
        column: number;
        row: number;
      };
      const step = steps.get(item.order);

      if (!step || positions.has(item.order)) {
        continue;
      }

      const row = item.row === -1 ? nextRow++ : item.row;

      positions.set(item.order, {
        x: item.column * TEMPLATE_NODE_SPACING.x,
        y: row * TEMPLATE_NODE_SPACING.y,
      });

      const children = childOrdersOf(step);

      // The first child stays on this row; the rest get rows of their own
      for (let index = children.length - 1; index >= 0; index--) {
        stack.push({
          order: children[index],
          column: item.column + 1,
          row: index === 0 ? row : -1,
        });
      }
    }
  }

  return positions;
};

const rewrite = (
  value: unknown,
  orderToId: Map<number, string>,
  partIds: Record<string, string>,
  partRefs: TTemplatePartRefs = {},
): any => {
  if (typeof value === 'string') {
    return value
      .replace(STEP_REFERENCE, (match, order) => {
        const id = orderToId.get(Number(order));
        return id ? `{{ actions.${id}.` : match;
      })
      .replace(PART_REFERENCE, (match, key, ref) =>
        ref ? (partRefs[key]?.[ref] ?? match) : (partIds[key] ?? match),
      );
  }

  if (Array.isArray(value)) {
    return value.map((item) => rewrite(item, orderToId, partIds, partRefs));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        rewrite(item, orderToId, partIds, partRefs),
      ]),
    );
  }

  return value;
};

export const setTemplatePath = (
  target: Record<string, any>,
  path: string,
  value: unknown,
) => {
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

/**
 * Steps addressed by `order` turned into actions with fresh ids: the chain,
 * branch handles (`yes`/`no`, `isExists`/`notExists`), `{{ actions.N. }}`
 * and `{{ parts.key }}` all point at the new ids. The same flow can be
 * installed any number of times.
 */
export const materializeFlow = (
  flow: TAutomationBuiltInTemplateStep[],
  {
    usedIds = [],
    partIds = {},
    partRefs = {},
    workflowIds = {},
  }: {
    usedIds?: string[];
    partIds?: Record<string, string>;
    partRefs?: TTemplatePartRefs;
    // Workflow key → id, for helper tools that connect to one
    workflowIds?: Record<string, string>;
  } = {},
) => {
  const steps = [...flow].sort((a, b) => a.order - b.order);
  const taken = new Set(usedIds);
  const orderToId = new Map<number, string>();

  for (const step of steps) {
    orderToId.set(step.order, newId(taken));
  }

  const actions: TMaterializedAction[] = steps.map((step) => {
    const config: Record<string, any> = rewrite(
      step.config || {},
      orderToId,
      partIds,
      partRefs,
    );

    if (step.next && typeof step.next === 'object') {
      for (const [handle, order] of Object.entries(step.next)) {
        const target = orderToId.get(order);

        if (target) {
          config[handle] = target;
        }
      }
    }

    for (const [key, order] of Object.entries(step.refs || {})) {
      const id = orderToId.get(order);
      if (id) config[key] = id;
    }

    // `sourceId` is the step itself: the builder draws a branch from the
    // handle `<sourceId>-<optionalConnectId>-right`
    if (step.connects) {
      const sourceId = orderToId.get(step.order) as string;

      config.optionalConnects = Object.entries(step.connects).flatMap(
        ([optionalConnectId, target]) => {
          const actionId =
            typeof target === 'number'
              ? orderToId.get(target)
              : workflowIds[target];
          return actionId ? [{ sourceId, optionalConnectId, actionId }] : [];
        },
      );
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
      targetActionId:
        step.target === undefined ? undefined : orderToId.get(step.target),
    };
  });

  return { actions, entryActionId: actions[0]?.id, orderToId, taken };
};

const answerValue = (answer: unknown, from?: string) =>
  from ? (answer as Record<string, unknown> | null)?.[from] : answer;

const isEmpty = (value: unknown) =>
  value === undefined || value === null || value === '';

const insertAnswers = (value: unknown, answers: TTemplateAnswers): any => {
  if (typeof value === 'string') {
    return value.replace(ANSWER_REFERENCE, (_match, key) => {
      const answer = answers[key];
      return typeof answer === 'string' ? answer : '';
    });
  }

  if (Array.isArray(value)) {
    return value.map((item) => insertAnswers(item, answers));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        insertAnswers(item, answers),
      ]),
    );
  }

  return value;
};

/**
 * Everything a template installs, ready to save: its parts with their
 * defaults and answers, and one automation per journey. `partIds` are the
 * ids the parts will be saved under, so journeys can point at them.
 */
export const materializeTemplate = (
  template: TTemplate,
  {
    answers,
    partIds,
    partRefs = {},
  }: {
    answers: TTemplateAnswers;
    partIds: Record<string, string>;
    // Ids that came with created parts, known once they exist
    partRefs?: TTemplatePartRefs;
  },
) => {
  const parts = template.parts.map((part) => ({
    key: part.key,
    type: part.type,
    doc: insertAnswers(part.defaults, answers) as Record<string, any>,
  }));

  const automations = template.journeys.map((journey) => {
    const declared = (insertAnswers(journey.workflows || [], answers) ||
      []) as TTemplateWorkflow[];
    const reserved = new Set<string>();
    const workflowIds = Object.fromEntries(
      declared.map(({ key }) => [key, newId(reserved)]),
    );
    const { actions, entryActionId, orderToId, taken } = materializeFlow(
      insertAnswers(journey.flow, answers),
      { partIds, partRefs, workflowIds, usedIds: [...reserved] },
    );
    const positions = layoutTemplateFlow(journey.flow);

    for (const [order, position] of positions) {
      const action = actions.find(({ id }) => id === orderToId.get(order));
      if (action) action.position = position;
    }

    const lowestRow = Math.max(0, ...[...positions.values()].map(({ y }) => y));
    const workflows = declared.map((workflow, index) => {
      const built = materializeFlow(workflow.flow, {
        partIds,
        partRefs,
        usedIds: [...taken],
      });
      built.taken.forEach((id) => taken.add(id));

      for (const [order, position] of layoutTemplateFlow(workflow.flow)) {
        const action = built.actions.find(
          ({ id }) => id === built.orderToId.get(order),
        );
        if (action) action.position = position;
      }

      // Beside the step whose tool runs it, below the main flow
      const caller = journey.flow.find((step) =>
        Object.values(step.connects || {}).includes(workflow.key),
      );
      const callerX = caller ? (positions.get(caller.order)?.x ?? 0) : 0;

      return {
        key: workflow.key,
        orderToId: built.orderToId,
        node: {
          id: workflowIds[workflow.key],
          name: workflow.name,
          description: workflow.description || '',
          config: {
            inputs: workflow.inputs,
            ...(workflow.inputHints ? { inputHints: workflow.inputHints } : {}),
            entryActionId: built.entryActionId,
            // What the agent reads back names this workflow's own steps
            ...(workflow.output
              ? {
                  output: rewrite(
                    workflow.output,
                    built.orderToId,
                    partIds,
                    partRefs,
                  ),
                }
              : {}),
          },
          actions: built.actions,
          position: {
            x: callerX + TEMPLATE_NODE_SPACING.x,
            y: lowestRow + (index + 1) * TEMPLATE_NODE_SPACING.y,
          },
        },
      };
    });

    const trigger = {
      id: newId(taken),
      type: journey.trigger.type,
      position: { x: 0, y: 0 },
      config: rewrite(
        insertAnswers(journey.trigger.config || {}, answers),
        orderToId,
        partIds,
        partRefs,
      ),
      actionId: entryActionId,
    };

    return {
      journey: journey.key,
      name: journey.name,
      description: journey.description || '',
      triggers: [trigger],
      actions,
      workflows,
      orderToId,
    };
  });

  const apply = (fill: TTemplateFill, value: unknown) => {
    if (fill.target === 'part') {
      const part = parts.find(({ key }) => key === fill.part);
      if (part) setTemplatePath(part.doc, fill.path, value);
      return;
    }

    const automation = automations.find(
      ({ journey }) => journey === fill.journey,
    );

    if (!automation) {
      return;
    }

    if (fill.target === 'trigger') {
      setTemplatePath(automation.triggers[0].config, fill.path, value);
      return;
    }

    if (fill.target === 'workflow') {
      const workflow = automation.workflows.find(
        ({ key }) => key === fill.workflow,
      );
      const action = workflow?.node.actions.find(
        ({ id }) => id === workflow.orderToId.get(fill.order),
      );

      if (action) setTemplatePath(action.config, fill.path, value);
      return;
    }

    const action = automation.actions.find(
      ({ id }) => id === automation.orderToId.get(fill.order),
    );

    if (action) {
      setTemplatePath(action.config, fill.path, value);
    }
  };

  for (const requirement of template.requirements) {
    const answer = answers[requirement.key];

    if (isEmpty(answer)) {
      continue;
    }

    for (const fill of requirement.fills || []) {
      const value = answerValue(answer, fill.from);

      // A field the answer does not carry stays as the template left it
      if (!isEmpty(value)) {
        apply(fill, value);
      }
    }
  }

  return {
    parts,
    automations: automations.map(
      ({ journey, name, description, triggers, actions, workflows }) => ({
        journey,
        name,
        description,
        triggers,
        actions,
        workflows: workflows.map(({ node }) => node),
      }),
    ),
  };
};

/**
 * A built-in workflow template as actions for a flow that already exists (a
 * campaign's): fresh ids that avoid `usedIds`, then each answer written into
 * the steps its requirement fills. Unanswered requirements are reported, not
 * guessed, so the caller keeps installing closed.
 */
export const materializeBuiltInTemplate = (
  template: TAutomationBuiltInTemplate,
  {
    usedIds = [],
    answers = {},
  }: { usedIds?: string[]; answers?: TTemplateAnswers } = {},
) => {
  const { actions, entryActionId, orderToId } = materializeFlow(
    template.flow || [],
    { usedIds },
  );
  const unanswered: string[] = [];

  for (const requirement of template.requirements || []) {
    const answer = answers[requirement.key];

    if (isEmpty(answer)) {
      unanswered.push(requirement.key);
      continue;
    }

    for (const { order, path, from } of requirement.fills || []) {
      const action = actions.find(({ id }) => id === orderToId.get(order));
      const value = answerValue(answer, from);

      // A field the answer does not carry stays as the template left it
      if (action && !isEmpty(value)) {
        setTemplatePath(action.config, path, value);
      }
    }
  }

  return { actions, entryActionId, unanswered };
};
