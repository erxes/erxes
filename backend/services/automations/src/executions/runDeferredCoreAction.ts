import { IModels } from '../connectionResolver';
import { debugError } from '../debugger';
import {
  completeDeferredAction,
  locateDeferredAction,
  TDeferredActionRef,
} from './completeDeferredAction';
import { executeCoreActions } from './executeCoreActions';
import { getTargetType } from './executeActions';
import { getExecutionActionsMap } from '../utils/utils';
import { AUTOMATION_STATUSES } from 'erxes-api-shared/core-modules';

/**
 * Runs a core action that was handed to the queue instead of the synchronous
 * path, then reports the outcome through the shared completion handler so a
 * standby flow resumes exactly as a plugin-deferred one does.
 */
export const runDeferredCoreAction = async (
  subdomain: string,
  models: IModels,
  ref: TDeferredActionRef,
) => {
  const located = await locateDeferredAction(models, ref);

  // The work job runs against an action that was persisted before it was
  // queued, so not finding one is a real fault, not a normal race.
  if (!located.ok) {
    debugError(
      `Deferred core action not runnable (${located.reason}): execution ` +
        `${ref.executionId}, action ${ref.actionId}, job ${ref.jobId}`,
    );

    return { applied: false, reason: located.reason };
  }

  const { execution, execAction } = located;

  const fail = (message: string, evidence?: unknown) =>
    completeDeferredAction(subdomain, models, {
      ...ref,
      status: 'error',
      result: { error: message, result: evidence },
    });

  const automation = await models.Automations.findOne({
    _id: execution.automationId,
    status: AUTOMATION_STATUSES.ACTIVE,
  });

  if (!automation) {
    return fail('Automation is no longer active');
  }

  const actionsMap = await getExecutionActionsMap(automation, execution);
  const action = actionsMap[ref.actionId];

  if (!action) {
    return fail(`Action ${ref.actionId} is no longer part of the automation`);
  }

  try {
    const { actionResponse, shouldBreak } = await executeCoreActions(
      execution.triggerType,
      getTargetType(action, actionsMap, execution.triggerType),
      action.type,
      subdomain,
      execution,
      action,
      execAction,
      actionsMap,
    );

    if (shouldBreak) {
      return fail(`Action ${action.type} cannot be deferred`);
    }

    // The handler may have rerouted the flow; persist that before the
    // completion handler reads nextActionId back off the document.
    execution.markModified('actions');
    await execution.save();

    return completeDeferredAction(subdomain, models, {
      ...ref,
      status: 'success',
      result: actionResponse,
    });
  } catch (e) {
    debugError(
      `Deferred core action ${action.type} failed on execution ${execution._id}: ${e.message}`,
    );

    // Keep whatever the failing action attached; the message alone loses it.
    return fail(e.message, e.result);
  }
};
