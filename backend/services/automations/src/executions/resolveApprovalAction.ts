import {
  AUTOMATION_CORE_ACTIONS,
  AUTOMATION_EXECUTION_STATUS,
  AUTOMATION_STATUSES,
} from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '../connectionResolver';
import { debugInfo } from '../debugger';
import { getExecutionActionsMap } from '../utils/utils';
import { executeActions } from './executeActions';
import { finalizeExecAction } from './executionActionMetrics';

export type TApprovalDecision = 'approved' | 'rejected' | 'expired';

export type TResolveApprovalInput = {
  executionId: string;
  actionId: string;
  decision: TApprovalDecision;
  userId?: string;
  reason?: string;
};

type TResolveApprovalResult = { applied: boolean; reason?: string };

/**
 * Continues a run parked on an approval step: approved takes the approved
 * branch, rejected and expired take the rejected one. The run is claimed
 * atomically, so a decision and a timeout arriving together resume it once.
 */
export const resolveApprovalAction = async (
  subdomain: string,
  models: IModels,
  { executionId, actionId, decision, userId, reason }: TResolveApprovalInput,
): Promise<TResolveApprovalResult> => {
  const claimed = await models.Executions.findOneAndUpdate(
    {
      _id: executionId,
      status: AUTOMATION_EXECUTION_STATUS.WAITING,
      waitingActionId: actionId,
    },
    { $set: { status: AUTOMATION_EXECUTION_STATUS.ACTIVE }, $unset: { waitingActionId: 1 } },
    { new: true },
  );

  if (!claimed) {
    return { applied: false, reason: 'not-waiting' };
  }

  const execAction = (claimed.actions || [])
    .slice()
    .reverse()
    .find((item) => item.actionId === actionId && item.status === 'waiting');
  const requestId = execAction?.result?.requestId;

  if (execAction) {
    execAction.result = {
      ...(execAction.result || {}),
      decision,
      decidedBy: userId,
      reason,
    };
    finalizeExecAction(execAction, 'success');
    claimed.markModified('actions');
  }

  await claimed.save();

  // A run that ran out of time leaves nothing pending for anyone to answer.
  if (decision === 'expired' && requestId) {
    await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'mutation',
      module: 'approval',
      action: 'cancelAutomationRequest',
      input: { requestId },
      defaultValue: null,
    });
  }

  const automation = await models.Automations.findOne({
    _id: claimed.automationId,
    status: AUTOMATION_STATUSES.ACTIVE,
  }).lean();

  if (!automation) {
    debugInfo(
      `Approval ${decision} for execution ${executionId} recorded; automation is not active, so the run stops here`,
    );
    claimed.status = AUTOMATION_EXECUTION_STATUS.COMPLETE;
    claimed.description = `Approval ${decision} while the automation was not active`;
    await claimed.save();

    return { applied: false, reason: 'automation-not-active' };
  }

  const actionsMap = await getExecutionActionsMap(automation, claimed);
  const action = actionsMap[actionId];

  if (action?.type !== AUTOMATION_CORE_ACTIONS.APPROVAL) {
    return { applied: false, reason: 'not-an-approval-step' };
  }

  const nextActionId =
    decision === 'approved' ? action.config?.approved : action.config?.rejected;

  await executeActions(
    subdomain,
    claimed.triggerType,
    claimed,
    actionsMap,
    nextActionId,
  );

  return { applied: true };
};
