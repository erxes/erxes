import {
  AUTOMATION_EXECUTION_STATUS,
  AUTOMATION_STATUSES,
} from 'erxes-api-shared/core-modules';
import { TCreatedVia } from 'erxes-api-shared/core-types';
import { IModels } from '../connectionResolver';
import { getExecutionActionsMap } from '../utils/utils';
import { buildExecutionTarget } from './calculateExecutions';
import { executeActions } from './executeActions';

/**
 * Runs one automation against one target that the caller already chose.
 *
 * This is the addressed counterpart to `receiveTrigger`, which is an event
 * listener: it matches an event type to automations and then decides whether
 * each target qualifies. Here the caller has already decided, so the four
 * trigger-specific steps are deliberately skipped:
 *
 * - no trigger-type matching — the automation is named
 * - no `recordType` check — there is no event
 * - no `checkValidTrigger` — a caller enrolling from a segment or tag has
 *   already satisfied that condition by construction
 * - no re-enrollment dedupe — the caller owns its own idempotency (a broadcast
 *   tracks `receivedCustomerIds` and `runCount`)
 *
 * The execution still carries a real `automationId` and `triggerId`, so
 * history, stats and the builder work on these runs unchanged.
 */
export const runAutomationForTarget = async (
  subdomain: string,
  models: IModels,
  {
    automationId,
    target,
    triggerId,
    createdVia,
  }: {
    automationId: string;
    target: Record<string, any>;
    triggerId?: string;
    createdVia?: TCreatedVia;
  },
) => {
  const automation = await models.Automations.findOne({
    _id: automationId,
  }).lean();

  if (!automation) {
    throw new Error(`Automation ${automationId} not found`);
  }

  if (automation.status === AUTOMATION_STATUSES.ARCHIVED) {
    throw new Error(`Automation ${automationId} is archived`);
  }

  // Status is not checked beyond that: a caller addressing an automation
  // directly — a manual run, a test run — may want a draft.
  const trigger = triggerId
    ? (automation.triggers || []).find(({ id }) => id === triggerId)
    : (automation.triggers || [])[0];

  if (!trigger) {
    throw new Error(`Automation ${automationId} has no trigger to start from`);
  }

  if (!trigger.actionId) {
    return null;
  }

  const executionTarget = buildExecutionTarget(target);

  const execution = await models.Executions.create({
    automationId,
    triggerId: trigger.id,
    triggerType: trigger.type,
    triggerConfig: trigger.config,
    targetId: executionTarget._id,
    target: executionTarget,
    status: AUTOMATION_EXECUTION_STATUS.ACTIVE,
    description: 'Started directly by its caller',
    createdAt: new Date(),
  });

  // The caller says what configured this run; only here is the run itself
  // known, so its id is stamped on before anything downstream reads it. With
  // no caller to speak for it, the automation is its own origin.
  const via: TCreatedVia = {
    ...(createdVia || {
      source: 'automation',
      sourceId: automationId,
      actorId: automation.updatedBy || automation.createdBy,
    }),
    runId: execution._id,
  };

  await models.Executions.updateOne(
    { _id: execution._id },
    { $set: { createdVia: via } },
  );

  execution.createdVia = via;

  await executeActions(
    subdomain,
    trigger.type,
    execution,
    await getExecutionActionsMap(automation, execution),
    trigger.actionId,
  );

  return execution._id;
};
