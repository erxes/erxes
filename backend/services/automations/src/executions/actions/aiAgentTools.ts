import {
  AUTOMATION_CORE_ACTIONS,
  AUTOMATION_EXECUTION_STATUS,
  IAutomationExecutionDocument,
  IAutomationWorkflow,
  replaceOutputPlaceholders,
} from 'erxes-api-shared/core-modules';
import { TAiAgentActionConfig, TAiToolRuntime } from '../../ai';
import { IModels } from '../../connectionResolver';
import { getActionsMap } from '../../utils/utils';
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
    .slice(0, 64) || 'tool';

// The workflow's derived input contract splits into two groups: inputs whose
// binding resolves in this execution are system values — filled from the
// binding and HIDDEN from the model (it cannot know ids like customerId and
// would hallucinate them). Only unbound/unresolvable inputs become model
// parameters.
const buildToolInputPlan = async ({
  subdomain,
  execution,
  workflow,
}: {
  subdomain: string;
  execution: IAutomationExecutionDocument;
  workflow?: IAutomationWorkflow;
}) => {
  const bindings = workflow?.config?.inputs || {};
  const inputNames = Object.keys(bindings);
  const resolvedBindings: Record<string, unknown> = {};
  const modelParamNames: string[] = [];

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
      } else {
        modelParamNames.push(name);
      }
    }
  }

  return {
    resolvedBindings,
    parameters: {
      type: 'object' as const,
      properties: Object.fromEntries(
        modelParamNames.map((name) => [name, { type: 'string' }]),
      ),
      required: modelParamNames,
    },
  };
};

// generateText capture fields double as handoff parameters when the target
// is not a workflow
const buildCaptureFieldParameters = (actionConfig: TAiAgentActionConfig) => {
  const captureFields =
    actionConfig.goalType === 'generateText'
      ? actionConfig.captureFields || []
      : [];

  return {
    type: 'object' as const,
    properties: Object.fromEntries(
      captureFields.map(({ fieldName, prompt, dataType }) => [
        fieldName,
        { type: dataType, description: prompt },
      ]),
    ),
    required: captureFields.map(({ fieldName }) => fieldName),
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
}: {
  subdomain: string;
  models: IModels;
  execution: IAutomationExecutionDocument;
  actionConfig: TAiAgentActionConfig;
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
    const base = sanitizeToolName(tool.name);
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
          description: tool.description || targetWorkflow.description,
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
    // other target falls back to the agent's own captureFields — forcing the
    // model to actually have the values before it may hand off, and carrying
    // them into the result as attributes.
    const handoffParameters = targetWorkflow
      ? parameters
      : buildCaptureFieldParameters(actionConfig);

    runtimes.push({
      toolId: tool.id,
      kind: 'handoff',
      definition: {
        name,
        description: tool.description || targetWorkflow?.description,
        parameters: handoffParameters,
      },
    });
  }

  return runtimes;
};
