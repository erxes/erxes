import {
  AUTOMATION_EXECUTION_STATUS,
  IAutomationAction,
  IAutomationExecutionDocument,
  replaceOutputPlaceholders,
} from 'erxes-api-shared/core-modules';
import { sendWorkerQueue } from 'erxes-api-shared/utils';
import { generateModels } from '../connectionResolver';

// Nested workflows are forbidden in the builder, so real depth never exceeds
// 1 today; the guard is the universal escape hatch for future call cycles.
export const MAX_WORKFLOW_DEPTH = 2;

const WORKFLOW_QUEUE_OPTIONS = { removeOnComplete: true, removeOnFail: true };

// Entering a workflow node: resolve every input binding against the parent
// scope (fail-fast, before any member side effect), create the child
// execution and hand it to the queue. The parent stays WAITING on the
// workflow node until the child completes.
export const startWorkflowExecution = async (
  subdomain: string,
  execution: IAutomationExecutionDocument,
  workflowAction: IAutomationAction,
) => {
  const depth = (execution.depth || 0) + 1;

  if (depth > MAX_WORKFLOW_DEPTH) {
    throw new Error(
      `Workflow depth limit (${MAX_WORKFLOW_DEPTH}) exceeded at "${workflowAction.label || workflowAction.id}"`,
    );
  }

  const bindings: Record<string, string> =
    workflowAction.config?.inputs || {};
  const inputs = await replaceOutputPlaceholders({
    subdomain,
    execution,
    values: bindings,
    keepUnresolvedPlaceholders: false,
  });

  const missingInputs = Object.keys(bindings).filter(
    (name) => inputs[name] === undefined,
  );

  if (missingInputs.length) {
    throw new Error(
      `Workflow input(s) not resolved: ${missingInputs.join(', ')}`,
    );
  }

  const models = await generateModels(subdomain);

  const childExecution = await models.Executions.create({
    automationId: execution.automationId,
    triggerId: execution.triggerId,
    triggerType: execution.triggerType,
    triggerConfig: execution.triggerConfig,
    targetId: execution.targetId,
    target: execution.target,
    status: AUTOMATION_EXECUTION_STATUS.ACTIVE,
    description: `Workflow: ${workflowAction.label || workflowAction.id}`,
    parentExecutionId: execution._id,
    workflowId: workflowAction.id,
    inputs,
    depth,
  });

  sendWorkerQueue('automations', 'action').add(
    'startWorkflow',
    { subdomain, data: { executionId: childExecution._id } },
    WORKFLOW_QUEUE_OPTIONS,
  );

  return { childExecutionId: childExecution._id, inputs };
};

// Called when a child execution finishes (or fails): wakes the parent via
// the queue instead of an inline call so no call stack builds up at any
// depth.
export const notifyParentExecution = (
  subdomain: string,
  execution: IAutomationExecutionDocument,
  status: 'complete' | 'error',
  errorMessage?: string,
) => {
  if (!execution.parentExecutionId || !execution.workflowId) {
    return;
  }

  sendWorkerQueue('automations', 'action').add(
    'resumeParentExecution',
    {
      subdomain,
      data: {
        parentExecutionId: execution.parentExecutionId,
        childExecutionId: execution._id,
        workflowId: execution.workflowId,
        status,
        errorMessage,
      },
    },
    WORKFLOW_QUEUE_OPTIONS,
  );
};
