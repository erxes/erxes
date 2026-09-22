import { TAutomationAction, TAutomationTrigger } from 'ui-modules';

// name -> default binding expression, e.g. { customerId: "{{ trigger.customerId }}" }
export type TWorkflowInputBindings = Record<string, string>;

// Config keys that can point to another action (if / findObject branches)
export const BRANCH_CONFIG_KEYS = ['yes', 'no', 'isExists', 'notExists'];

// Token body excludes BOTH braces so malformed nested placeholders like
// "{{ trigger.{{ trigger.content }} }}" never match as a whole — only the
// innermost well-formed token does.
const PLACEHOLDER_REGEX = /\{\{\s*([^{}]+?)\s*\}\}/g;

const mapConfigStrings = (
  value: unknown,
  transform: (text: string) => string,
): any => {
  if (typeof value === 'string') {
    return transform(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => mapConfigStrings(item, transform));
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        mapConfigStrings(entry, transform),
      ]),
    );
  }
  return value;
};

// External = resolves outside the workflow: trigger.* or an actions.* ref whose
// action is not a member. Bare tokens ({{ content }}) and static dates
// ({{ now }}) are left untouched — their origin is ambiguous.
const isExternalToken = (token: string, memberIds: Set<string>) => {
  if (token.startsWith('trigger.')) {
    return true;
  }
  if (token.startsWith('actions.')) {
    const actionId = token.split('.')[1];
    return !!actionId && !memberIds.has(actionId);
  }
  return false;
};

// Extract-function analysis: every external token becomes a named input
// (last path segment, counter on collision), member configs are rewritten to
// {{ input.<name> }} and the original expression is kept as the default binding.
export const rewriteActionsToInputs = (actions: TAutomationAction[]) => {
  const memberIds = new Set(actions.map((action) => action.id));
  const tokenToName = new Map<string, string>();
  const usedNames = new Set<string>();

  for (const action of actions) {
    mapConfigStrings(action.config || {}, (text) => {
      for (const match of text.matchAll(PLACEHOLDER_REGEX)) {
        const token = match[1].trim();
        if (tokenToName.has(token) || !isExternalToken(token, memberIds)) {
          continue;
        }
        const base = token.split('.').pop() || 'value';
        let name = base;
        for (let counter = 2; usedNames.has(name); counter++) {
          name = `${base}${counter}`;
        }
        usedNames.add(name);
        tokenToName.set(token, name);
      }
      return text;
    });
  }

  if (!tokenToName.size) {
    return { actions, inputs: {} as TWorkflowInputBindings };
  }

  const rewritten = actions.map((action) => ({
    ...action,
    config: mapConfigStrings(action.config || {}, (text) =>
      text.replace(PLACEHOLDER_REGEX, (full, inner) => {
        const name = tokenToName.get(inner.trim());
        return name ? `{{ input.${name} }}` : full;
      }),
    ),
  }));

  const inputs: TWorkflowInputBindings = {};
  for (const [token, name] of tokenToName) {
    inputs[name] = `{{ ${token} }}`;
  }

  return { actions: rewritten, inputs };
};

// Reverse of rewriteActionsToInputs, used by unconvert: {{ input.<name> }} is
// replaced with that input's binding expression.
export const substituteInputsBack = (
  actions: TAutomationAction[],
  inputs: TWorkflowInputBindings,
) =>
  actions.map((action) => ({
    ...action,
    config: mapConfigStrings(action.config || {}, (text) =>
      text.replace(PLACEHOLDER_REGEX, (full, inner) => {
        const token = inner.trim();
        if (!token.startsWith('input.')) {
          return full;
        }
        return inputs[token.slice('input.'.length)] ?? full;
      }),
    ),
  }));

// Lazily migrates workflows saved before the input.* rewrite existed. Clean
// workflows derive no external tokens, so this is a no-op for them. Existing
// manual bindings win over re-derived defaults.
export const normalizeWorkflowInputs = <
  T extends { actions?: TAutomationAction[]; config?: any },
>(
  workflow: T,
): T => {
  const { actions, inputs } = rewriteActionsToInputs(workflow.actions || []);

  if (!Object.keys(inputs).length) {
    return workflow;
  }

  return {
    ...workflow,
    actions,
    config: {
      ...(workflow.config || {}),
      inputs: { ...inputs, ...(workflow.config?.inputs || {}) },
    },
  };
};

// A binding is dangling when it references an action that does not exist in
// the automation the workflow currently lives in.
export const isDanglingBinding = (
  expression: string,
  existingActionIds: Set<string>,
) => {
  const actionRef = expression.match(/\{\{\s*actions\.([^.\s}]+)/);
  return !!actionRef && !existingActionIds.has(actionRef[1]);
};

// Rewrites every connection field (trigger.actionId, nextActionId, branch
// keys, folk keys, optionalConnects) through mapValue.
export const remapConnectionRefs = (
  {
    actions,
    triggers,
  }: { actions: TAutomationAction[]; triggers: TAutomationTrigger[] },
  mapValue: (value?: string) => string | undefined,
  folkKeysByType: Record<string, { key: string }[]> = {},
) => {
  const remappedActions = actions.map((action) => {
    const config = { ...(action.config || {}) };

    for (const key of [
      ...BRANCH_CONFIG_KEYS,
      ...(folkKeysByType[action.type] || []).map((folk) => folk.key),
    ]) {
      if (typeof config[key] === 'string') {
        config[key] = mapValue(config[key]);
      }
    }

    if (Array.isArray(config.optionalConnects)) {
      config.optionalConnects = config.optionalConnects.map(
        (connect: { actionId?: string }) => ({
          ...connect,
          actionId: mapValue(connect.actionId),
        }),
      );
    }

    return {
      ...action,
      nextActionId: mapValue(action.nextActionId),
      config,
    };
  });

  const remappedTriggers = triggers.map((trigger) => ({
    ...trigger,
    actionId: mapValue(trigger.actionId),
  }));

  return { actions: remappedActions, triggers: remappedTriggers };
};

// One-time load migration of the legacy reference model: workflows that
// stored `config.memberActionIds` while their members still lived in the
// root actions list. Members move into the workflow snapshot, root refs to
// them are rewired to the workflow node, and inputs are derived. Snapshot
// workflows just get normalizeWorkflowInputs.
export const normalizeAutomationWorkflows = ({
  triggers = [],
  actions = [],
  workflows = [],
}: {
  triggers?: TAutomationTrigger[];
  actions?: TAutomationAction[];
  workflows?: any[];
}) => {
  let remainingActions = actions;
  let remainingTriggers = triggers;

  const normalizedWorkflows = workflows.map((workflow) => {
    const memberIds: string[] = workflow?.config?.memberActionIds || [];

    if (workflow?.actions?.length || !memberIds.length) {
      return normalizeWorkflowInputs(workflow);
    }

    const memberSet = new Set(memberIds);
    const members = remainingActions.filter((action) =>
      memberSet.has(action.id),
    );

    const remapped = remapConnectionRefs(
      {
        actions: remainingActions.filter((action) => !memberSet.has(action.id)),
        triggers: remainingTriggers,
      },
      (value) => (value && memberSet.has(value) ? workflow.id : value),
    );
    remainingActions = remapped.actions;
    remainingTriggers = remapped.triggers;

    const { memberActionIds: _dropped, ...restConfig } = workflow.config || {};

    return normalizeWorkflowInputs({
      ...workflow,
      actions: members,
      config: {
        ...restConfig,
        entryActionId: restConfig.entryActionId || memberIds[0],
      },
    });
  });

  return {
    triggers: remainingTriggers,
    actions: remainingActions,
    workflows: normalizedWorkflows,
  };
};
