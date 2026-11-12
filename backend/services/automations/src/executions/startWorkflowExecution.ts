import {
  AUTOMATION_ERROR_CODES,
  AUTOMATION_EXECUTION_STATUS,
  IAutomationAction,
  IAutomationExecutionDocument,
  readWorkflowForEach,
  replaceOutputPlaceholders,
  WORKFLOW_FOR_EACH_MAX_ITEMS,
} from 'erxes-api-shared/core-modules';
import { sendWorkerQueue } from 'erxes-api-shared/utils';
import { generateModels } from '../connectionResolver';
import { AutomationActionError } from './errorCodes';
import { forEachItemSuffix, TWorkflowForEachState } from './workflowForEach';

// Nested workflows are forbidden in the builder, so real depth never exceeds
// 1 today; the guard is the universal escape hatch for future call cycles.
export const MAX_WORKFLOW_DEPTH = 2;

const WORKFLOW_QUEUE_OPTIONS = { removeOnComplete: true, removeOnFail: true };

const resolveWorkflowInputs = async (
  subdomain: string,
  execution: IAutomationExecutionDocument,
  workflowAction: IAutomationAction,
  itemInput?: string,
) => {
  const bindings: Record<string, string> = {
    ...(workflowAction.config?.inputs || {}),
  };

  // The item input is filled from the list, never from its binding
  if (itemInput) {
    delete bindings[itemInput];
  }

  const inputs = await replaceOutputPlaceholders({
    subdomain,
    execution,
    values: bindings,
    keepUnresolvedPlaceholders: false,
  });

  // When an AI agent handed off into this workflow, its extracted arguments
  // fill inputs that have no working binding. Bound inputs are system values
  // (customerId etc.) — the model never overrides them.
  const handoffArgs = (execution.actions || []).at(-1)?.result?.handoff?.args;

  if (handoffArgs && typeof handoffArgs === 'object') {
    for (const name of Object.keys(bindings)) {
      const hasBinding = String(bindings[name] ?? '').trim().length > 0;

      if (
        (!hasBinding || inputs[name] === undefined) &&
        handoffArgs[name] !== undefined
      ) {
        inputs[name] = handoffArgs[name];
      }
    }
  }

  const missingInputs = Object.keys(bindings).filter(
    (name) => inputs[name] === undefined,
  );

  if (missingInputs.length) {
    throw new AutomationActionError(
      `Workflow input(s) not resolved: ${missingInputs.join(', ')}`,
      AUTOMATION_ERROR_CODES.CONFIG_INVALID,
    );
  }

  return inputs;
};

const checkWorkflowDepth = (
  execution: IAutomationExecutionDocument,
  workflowAction: IAutomationAction,
) => {
  const depth = (execution.depth || 0) + 1;

  if (depth > MAX_WORKFLOW_DEPTH) {
    throw new AutomationActionError(
      `Workflow depth limit (${MAX_WORKFLOW_DEPTH}) exceeded at "${
        workflowAction.label || workflowAction.id
      }"`,
      AUTOMATION_ERROR_CODES.WORKFLOW_DEPTH_EXCEEDED,
    );
  }

  return depth;
};

// Creates one child execution for the workflow node and hands it to the
// queue. The parent stays WAITING on the workflow node until it completes.
export const createWorkflowChildExecution = async (
  subdomain: string,
  execution: IAutomationExecutionDocument,
  workflowAction: Pick<IAutomationAction, 'id' | 'label'>,
  inputs: Record<string, unknown>,
  descriptionSuffix = '',
) => {
  const models = await generateModels(subdomain);

  const childExecution = await models.Executions.create({
    automationId: execution.automationId,
    triggerId: execution.triggerId,
    triggerType: execution.triggerType,
    triggerConfig: execution.triggerConfig,
    targetId: execution.targetId,
    target: execution.target,
    status: AUTOMATION_EXECUTION_STATUS.ACTIVE,
    description: `Workflow: ${
      workflowAction.label || workflowAction.id
    }${descriptionSuffix}`,
    parentExecutionId: execution._id,
    workflowId: workflowAction.id,
    inputs,
    depth: (execution.depth || 0) + 1,
  });

  sendWorkerQueue('automations', 'action').add(
    'startWorkflow',
    { subdomain, data: { executionId: childExecution._id } },
    WORKFLOW_QUEUE_OPTIONS,
  );

  return childExecution._id;
};

const resolveForEachItems = async (
  subdomain: string,
  execution: IAutomationExecutionDocument,
  expression: string,
) => {
  const { items } = await replaceOutputPlaceholders({
    subdomain,
    execution,
    values: { items: expression },
    keepUnresolvedPlaceholders: false,
  });

  if (!Array.isArray(items)) {
    throw new AutomationActionError(
      `For-each list "${expression}" did not resolve to a list`,
      AUTOMATION_ERROR_CODES.CONFIG_INVALID,
    );
  }

  if (items.length > WORKFLOW_FOR_EACH_MAX_ITEMS) {
    throw new AutomationActionError(
      `For-each list has ${items.length} items; the limit is ${WORKFLOW_FOR_EACH_MAX_ITEMS}`,
      AUTOMATION_ERROR_CODES.CONFIG_INVALID,
    );
  }

  return items;
};

// Entering a workflow node: resolve every input binding against the parent
// scope (fail-fast, before any member side effect) and start the child. A
// for-each node freezes its list and starts the first item's child; the rest
// follow one by one as each child completes. An empty list starts nothing
// and the parent continues at once (`shouldBreak` false).
export const startWorkflowExecution = async (
  subdomain: string,
  execution: IAutomationExecutionDocument,
  workflowAction: IAutomationAction,
) => {
  checkWorkflowDepth(execution, workflowAction);

  const forEach = readWorkflowForEach(workflowAction.config);

  if (!forEach) {
    const inputs = await resolveWorkflowInputs(
      subdomain,
      execution,
      workflowAction,
    );
    const childExecutionId = await createWorkflowChildExecution(
      subdomain,
      execution,
      workflowAction,
      inputs,
    );

    return { shouldBreak: true, result: { childExecutionId, inputs } };
  }

  const items = await resolveForEachItems(subdomain, execution, forEach.items);
  const inputs = await resolveWorkflowInputs(
    subdomain,
    execution,
    workflowAction,
    forEach.itemInput,
  );

  if (!items.length) {
    return {
      shouldBreak: false,
      result: { forEach: { total: 0, succeeded: 0, failed: [] } },
    };
  }

  const childExecutionId = await createWorkflowChildExecution(
    subdomain,
    execution,
    workflowAction,
    { ...inputs, [forEach.itemInput]: items[0] },
    forEachItemSuffix(0, items.length),
  );

  const state: TWorkflowForEachState = {
    items,
    itemInput: forEach.itemInput,
    onItemError: forEach.onItemError || 'continue',
    inputs,
    index: 0,
    currentChildId: childExecutionId,
    succeeded: 0,
    failed: [],
  };

  return { shouldBreak: true, result: { childExecutionId, forEach: state } };
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
