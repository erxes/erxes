import {
  AUTOMATION_ACTION_CONTRIBUTIONS,
  AUTOMATION_CORE_ACTIONS,
  AUTOMATION_EXECUTION_STATUS,
  IAutomationAction,
  IAutomationExecutionDocument,
  IAutomationWorkflow,
  replaceOutputPlaceholders,
  TAiContext,
} from 'erxes-api-shared/core-modules';
import {
  TAiAgentActionConfig,
  TAiAgentObjectField,
  TAiBridgeToolDefinition,
  TAiBridgeToolParameter,
  TAiToolRuntime,
} from '../../ai';
import {
  loadAiMemoryRecords,
  resolveAiMemoryScopes,
  toAiMemoryRecordParameter,
} from '../../ai/memory/events';
import { IModels } from '../../connectionResolver';
import { getActionsMap } from '../../utils/utils';
import { contributesTo, resolveRememberConfig } from '../actionPlacement';
import { executeActions } from '../executeActions';
import { MAX_WORKFLOW_DEPTH } from '../startWorkflowExecution';

// Actions that pause an execution cannot run inside a helper tool call: the
// agent conversation awaits the result inline.
const TOOL_BLOCKING_ACTION_TYPES: string[] = [
  AUTOMATION_CORE_ACTIONS.DELAY,
  AUTOMATION_CORE_ACTIONS.WAIT_EVENT,
  AUTOMATION_CORE_ACTIONS.WORKFLOW,
];

// Provider function names allow [a-z0-9_-] only
const sanitizeToolName = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 64);

// The provider name can lose the user's wording; the description keeps it
const describeTool = (name: string, description?: string) =>
  [name, description].filter(Boolean).join(': ');

// The workflow's derived input contract splits into two groups: inputs whose
// binding resolves in this execution are system values — filled from the
// binding and HIDDEN from the model (it cannot know ids like customerId and
// would hallucinate them). Only unbound/unresolvable inputs become model
// parameters.
const toIdList = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && !!item)
    : [];

// Inputs named for things the conversation already holds are limited to
// those: the model picks a media id, it never writes one.
const CONVERSATION_ENUM_INPUTS: Record<
  string,
  (facts: Record<string, unknown>) => {
    parameter: TAiBridgeToolParameter;
    required: boolean;
  } | null
> = {
  attachmentIds: (facts) => {
    const mediaIds = toIdList(facts.mediaIds);

    return mediaIds.length
      ? {
          parameter: {
            type: 'array',
            items: { type: 'string', enum: mediaIds },
            description:
              'Media the customer sent in this conversation that belong to this request.',
          },
          required: false,
        }
      : null;
  },
};

const buildToolInputPlan = async ({
  subdomain,
  execution,
  workflow,
  facts,
}: {
  subdomain: string;
  execution: IAutomationExecutionDocument;
  workflow?: IAutomationWorkflow;
  facts: Record<string, unknown>;
}) => {
  const bindings = workflow?.config?.inputs || {};
  const inputNames = Object.keys(bindings);
  const resolvedBindings: Record<string, unknown> = {};
  const modelParamNames: string[] = [];
  const enumParameters: Record<string, TAiBridgeToolParameter> = {};
  const requiredNames: string[] = [];

  if (inputNames.length) {
    const resolved = await replaceOutputPlaceholders({
      subdomain,
      execution,
      values: bindings,
      keepUnresolvedPlaceholders: false,
    });

    for (const name of inputNames) {
      const hasBinding = String(bindings[name] ?? '').trim().length > 0;

      if (hasBinding && resolved[name] !== undefined) {
        resolvedBindings[name] = resolved[name];
        continue;
      }

      const conversationEnum = CONVERSATION_ENUM_INPUTS[name];

      if (!conversationEnum) {
        modelParamNames.push(name);
        requiredNames.push(name);
        continue;
      }

      const plan = conversationEnum(facts);

      // Nothing to choose from: the input stays empty instead of invented.
      if (!plan) {
        resolvedBindings[name] = '';
        continue;
      }

      enumParameters[name] = plan.parameter;

      if (plan.required) {
        requiredNames.push(name);
      }
    }
  }

  return {
    resolvedBindings,
    parameters: {
      type: 'object' as const,
      properties: {
        ...Object.fromEntries(
          modelParamNames.map((name) => [name, { type: 'string' }]),
        ),
        ...enumParameters,
      },
      required: requiredNames,
    },
  };
};

// Providers accept JSON Schema types only: an option field is a string limited
// to its values, with each value's rule kept so the model still sees it
const toCaptureFieldSchema = ({
  dataType,
  prompt,
  options = [],
}: TAiAgentObjectField) => {
  if (dataType === 'option') {
    return {
      type: 'string',
      enum: options.map(({ value }) => value),
      description: [
        prompt,
        ...options.map(({ value, prompt: rule }) => `${value}: ${rule}`),
      ]
        .filter(Boolean)
        .join('\n'),
    };
  }

  if (dataType === 'array') {
    return { type: 'array', items: { type: 'string' }, description: prompt };
  }

  return { type: dataType, description: prompt };
};

// generateText capture fields double as handoff parameters when the target
// is not a workflow. None is required: every handoff of the agent shares
// them, so a required email blocks an unrelated "update record" handoff, and
// a model that must fill one it was never told invents it. When to hand off
// is the tool description's job.
const buildCaptureFieldParameters = (
  actionConfig: TAiAgentActionConfig,
  facts: Record<string, unknown>,
) => {
  const captureFields =
    actionConfig.goalType === 'generateText'
      ? actionConfig.captureFields || []
      : [];
  const properties: Record<string, TAiBridgeToolParameter> = {};

  for (const field of captureFields) {
    const conversationEnum = CONVERSATION_ENUM_INPUTS[field.fieldName];

    if (!conversationEnum) {
      properties[field.fieldName] = toCaptureFieldSchema(field);
      continue;
    }

    // Same rule as workflow inputs: pick from what the conversation holds,
    // or leave the field out when there is nothing to pick.
    const plan = conversationEnum(facts);

    if (plan) {
      properties[field.fieldName] = plan.parameter;
    }
  }

  return { type: 'object' as const, properties, required: [] };
};

// Exits live in nextActionId, the optional connects and the config keys an
// action branches on; any config value naming an action is one.
const toNextActionIds = (
  action: IAutomationAction,
  actionsById: Map<string, IAutomationAction>,
) => {
  const { optionalConnects = [], ...config } = (action.config || {}) as {
    optionalConnects?: { actionId?: string }[];
  } & Record<string, unknown>;

  return [
    action.nextActionId,
    ...optionalConnects.map(({ actionId }) => actionId),
    ...Object.values(config),
  ].filter(
    (value): value is string =>
      typeof value === 'string' && actionsById.has(value),
  );
};

// The record choices the tool's branch adds to the agent: an action on it
// declares the choice, and its target — an action off the branch — says
// what it remembers and what the agent calls it.
const findRecordChoices = async (
  actions: IAutomationAction[],
  entryActionId: string,
) => {
  const actionsById = new Map(actions.map((action) => [action.id, action]));
  const reached = new Set<string>();
  const queue = [entryActionId];

  while (queue.length) {
    const action = actionsById.get(queue.pop() || '');

    if (!action || reached.has(action.id)) {
      continue;
    }

    reached.add(action.id);
    queue.push(...toNextActionIds(action, actionsById));
  }

  const choices = new Map<string, { as: string; sourceActionIds: string[] }>();

  for (const id of reached) {
    const action = actionsById.get(id);
    const source = actionsById.get(action?.targetActionId || '');

    if (
      !action ||
      !source ||
      reached.has(source.id) ||
      !(await contributesTo(
        action.type,
        AUTOMATION_CORE_ACTIONS.AI_AGENT,
        AUTOMATION_ACTION_CONTRIBUTIONS.REMEMBERED_RECORD_CHOICE,
      ))
    ) {
      continue;
    }

    const remember = await resolveRememberConfig(
      source,
      new Set([AUTOMATION_CORE_ACTIONS.AI_AGENT]),
    );

    if (!remember) {
      continue;
    }

    const name = toAiMemoryRecordParameter(remember.as);
    const choice = choices.get(name) || { as: remember.as, sourceActionIds: [] };

    choice.sourceActionIds.push(source.id);
    choices.set(name, choice);
  }

  return choices;
};

const describeRecordFields = (fields: Record<string, unknown>) =>
  Object.entries(fields)
    .filter(([key]) => key !== '_id')
    .map(
      ([key, value]) =>
        `${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`,
    )
    .join(', ');

// The records the tool can act on, offered for the model to pick; null when
// there are none, and then the tool has nothing to do.
const buildRememberedRecordParameter = async ({
  subdomain,
  models,
  execution,
  as,
  sourceActionIds,
  aiContext,
}: {
  subdomain: string;
  models: IModels;
  execution: IAutomationExecutionDocument;
  as: string;
  sourceActionIds: string[];
  aiContext?: TAiContext | null;
}): Promise<TAiBridgeToolParameter | null> => {
  const records = await loadAiMemoryRecords({
    subdomain,
    models,
    automationId: execution.automationId,
    sourceActionIds,
    scopes: resolveAiMemoryScopes(execution, aiContext),
  });

  if (!records.length) {
    return null;
  }

  return {
    type: 'string',
    enum: records.map(({ id }) => id),
    description: [
      `The ${as} this request adds to — pick it from this list.`,
      ...records.map(({ id, fields }) =>
        [id, describeRecordFields(fields)].filter(Boolean).join(' — '),
      ),
    ].join('\n'),
  };
};

// Runs a wait-free workflow inline and returns its output to the agent. The
// child execution is recorded for history but carries NO parentExecutionId:
// the parent is not waiting on a workflow node, so the resume hook must not
// fire.
const executeWorkflowAsTool = async ({
  subdomain,
  models,
  execution,
  workflow,
  resolvedBindings,
  args,
}: {
  subdomain: string;
  models: IModels;
  execution: IAutomationExecutionDocument;
  workflow: IAutomationWorkflow;
  resolvedBindings: Record<string, unknown>;
  args: Record<string, unknown>;
}) => {
  for (const member of workflow.actions || []) {
    if (TOOL_BLOCKING_ACTION_TYPES.includes(member.type)) {
      throw new Error(
        `Workflow "${workflow.name}" contains a "${member.type}" action and cannot run as a helper tool`,
      );
    }
  }

  const depth = (execution.depth || 0) + 1;

  if (depth > MAX_WORKFLOW_DEPTH) {
    throw new Error(
      `Workflow depth limit (${MAX_WORKFLOW_DEPTH}) exceeded at tool "${workflow.name}"`,
    );
  }

  const childExecution = await models.Executions.create({
    automationId: execution.automationId,
    triggerId: execution.triggerId,
    triggerType: execution.triggerType,
    triggerConfig: execution.triggerConfig,
    targetId: execution.targetId,
    target: execution.target,
    status: AUTOMATION_EXECUTION_STATUS.ACTIVE,
    description: `Tool: ${workflow.name}`,
    workflowId: workflow.id,
    // System bindings win: the model only supplies unbound parameters
    inputs: { ...args, ...resolvedBindings },
    depth,
  });

  await executeActions(
    subdomain,
    execution.triggerType,
    childExecution,
    await getActionsMap(workflow.actions || []),
    workflow.config?.entryActionId,
  );

  if (childExecution.status !== AUTOMATION_EXECUTION_STATUS.COMPLETE) {
    throw new Error(
      childExecution.description ||
        `Tool workflow ended with status "${childExecution.status}"`,
    );
  }

  // Optional explicit output expression, otherwise the last member's result
  const outputExpression = workflow.config?.output;

  if (typeof outputExpression === 'string' && outputExpression.trim()) {
    const resolved = await replaceOutputPlaceholders({
      subdomain,
      execution: childExecution,
      values: { output: outputExpression },
      keepUnresolvedPlaceholders: false,
    });

    return { output: resolved.output, childExecutionId: childExecution._id };
  }

  const lastAction = (childExecution.actions || []).at(-1);

  return {
    output: lastAction?.result ?? null,
    childExecutionId: childExecution._id,
  };
};

// Wires the generateText tool configs into runtime tools: helpers get an
// inline workflow executor, handoffs are definition-only (routing happens via
// optionalConnects when the turn ends).
export const buildAiAgentTools = async ({
  subdomain,
  models,
  execution,
  actionConfig,
  aiContext,
}: {
  subdomain: string;
  models: IModels;
  execution: IAutomationExecutionDocument;
  actionConfig: TAiAgentActionConfig;
  aiContext?: TAiContext | null;
}): Promise<TAiToolRuntime[]> => {
  if (actionConfig.goalType !== 'generateText' || !actionConfig.tools?.length) {
    return [];
  }

  const automation = await models.Automations.findOne({
    _id: execution.automationId,
  }).lean();
  const workflowsById = new Map<string, IAutomationWorkflow>(
    (automation?.workflows || []).map((workflow) => [workflow.id, workflow]),
  );

  const usedNames = new Set<string>();
  const runtimes: TAiToolRuntime[] = [];

  for (const tool of actionConfig.tools) {
    const base =
      sanitizeToolName(tool.name) ||
      sanitizeToolName(`${tool.kind}_${tool.id}`) ||
      'tool';
    let name = base;
    for (let counter = 2; usedNames.has(name); counter++) {
      name = `${base}_${counter}`;
    }
    usedNames.add(name);

    // Both kinds get their target from the canvas wiring
    const targetActionId = (actionConfig.optionalConnects || []).find(
      ({ optionalConnectId }) => optionalConnectId === tool.id,
    )?.actionId;
    const targetWorkflow = targetActionId
      ? workflowsById.get(targetActionId)
      : undefined;

    const { parameters, resolvedBindings } = await buildToolInputPlan({
      subdomain,
      execution,
      workflow: targetWorkflow,
      facts: aiContext?.facts || {},
    });

    if (tool.kind === 'helper') {
      if (!targetWorkflow) {
        throw new Error(
          `Helper tool "${tool.name}" must be connected to a workflow on the canvas`,
        );
      }

      runtimes.push({
        toolId: tool.id,
        kind: 'helper',
        definition: {
          name,
          description: describeTool(
            tool.name,
            tool.description || targetWorkflow.description,
          ),
          parameters,
        },
        execute: (args) =>
          executeWorkflowAsTool({
            subdomain,
            models,
            execution,
            workflow: targetWorkflow,
            resolvedBindings,
            args,
          }),
      });
      continue;
    }

    // Handoff parameters: a workflow target exposes its unbound inputs; any
    // other target falls back to the agent's own captureFields, carried into
    // the result as attributes.
    let handoffParameters: TAiBridgeToolDefinition['parameters'] =
      targetWorkflow
        ? parameters
        : buildCaptureFieldParameters(actionConfig, aiContext?.facts || {});
    const recordChoices =
      targetActionId && !targetWorkflow
        ? await findRecordChoices(automation?.actions || [], targetActionId)
        : new Map<string, { as: string; sourceActionIds: string[] }>();
    let hasNothingToActOn = false;

    for (const [parameterName, { as, sourceActionIds }] of recordChoices) {
      const recordParameter = await buildRememberedRecordParameter({
        subdomain,
        models,
        execution,
        as,
        sourceActionIds,
        aiContext,
      });

      if (!recordParameter) {
        hasNothingToActOn = true;
        break;
      }

      handoffParameters = {
        ...handoffParameters,
        properties: {
          ...handoffParameters.properties,
          [parameterName]: recordParameter,
        },
        required: [...(handoffParameters.required || []), parameterName],
      };
    }

    // Nothing earlier to act on: offering the tool invites a false "done".
    if (hasNothingToActOn) {
      continue;
    }

    runtimes.push({
      toolId: tool.id,
      kind: 'handoff',
      definition: {
        name,
        description: describeTool(
          tool.name,
          tool.description || targetWorkflow?.description,
        ),
        parameters: handoffParameters,
      },
    });
  }

  return runtimes;
};
