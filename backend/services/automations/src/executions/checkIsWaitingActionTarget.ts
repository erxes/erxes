import { IModels } from '../connectionResolver';
import { IAutomationWaitingActionDocument } from '../mongo/waitingActionsToExecute';
import { isInSegment } from '../utils/isInSegment';
import { getExecutionActionsMap } from '../utils/utils';
import { EXECUTE_WAIT_TYPES } from 'erxes-api-shared/core-modules';

function accessNestedObject(obj: any, keys: string[]) {
  return keys.reduce((acc, key) => acc?.[key], obj) || '';
}

const handleCheckObjectCondition = async (
  models: IModels,
  waitingAction: IAutomationWaitingActionDocument,
  target: any,
) => {
  if (waitingAction.conditionType === EXECUTE_WAIT_TYPES.CHECK_OBJECT) {
    const {
      expectedState = {},
      expectedStateConjunction = 'every',
      propertyName,
      shouldCheckOptionalConnect = false,
    } = waitingAction.conditionConfig || {};

    const isMatch = Object.keys(expectedState)[
      expectedStateConjunction === 'some' ? 'some' : 'every'
    ]((key) => target[key] === expectedState[key]);

    if (!shouldCheckOptionalConnect) {
      return isMatch ? waitingAction : null;
    }
    const valueToCheck = propertyName
      ? accessNestedObject(target, propertyName.split('.'))
      : undefined;

    const [automation, execution] = await Promise.all([
      models.Automations.findOne({ _id: waitingAction.automationId }),
      models.Executions.findOne({ _id: waitingAction.executionId }),
    ]);

    // Stale wait record: its automation/execution no longer exists. Drop it
    // so it stops shadowing fresh waits on the same conversation.
    if (!automation || (waitingAction.executionId && !execution)) {
      await models.WaitingActions.deleteOne({ _id: waitingAction._id });
      return null;
    }

    // The waiting action may live inside a workflow snapshot (child
    // execution), so the connects must be looked up in the execution's own
    // action scope, not just the root actions.
    const actions = execution
      ? Object.values(await getExecutionActionsMap(automation, execution))
      : automation.actions || [];

    for (const action of actions) {
      const connects = action.config?.optionalConnects || [];

      const optionalConnect = connects.find(
        ({ optionalConnectId }) => optionalConnectId === valueToCheck,
      );

      if (optionalConnect?.actionId) {
        if (waitingAction.responseActionId !== optionalConnect.actionId) {
          waitingAction.responseActionId = optionalConnect.actionId;
        }
        return waitingAction;
      }
    }
  }

  return null;
};

export const checkIsWaitingAction = async (
  subdomain: string,
  models: IModels,
  type: string,
  targets: any[],
): Promise<IAutomationWaitingActionDocument | null> => {
  for (const target of targets) {
    // Several waits can match (e.g. stale records on the same conversation):
    // evaluate every candidate instead of trusting the first one
    const waitingActions = await models.WaitingActions.find({
      $or: [
        {
          conditionType: EXECUTE_WAIT_TYPES.IS_IN_SEGMENT,
          'conditionConfig.targetId': target._id,
        },
        {
          conditionType: EXECUTE_WAIT_TYPES.CHECK_OBJECT,
          'conditionConfig.contentType': { $regex: `^${type}\\..*` },
        },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(20);
    console.log({ waitingActions });

    for (const waitingAction of waitingActions) {
      const { conditionType } = waitingAction;

      if (conditionType === EXECUTE_WAIT_TYPES.CHECK_OBJECT) {
        console.log({ waitingAction, target });
        const matched = await handleCheckObjectCondition(
          models,
          waitingAction,
          target,
        );

        if (matched) {
          return matched;
        }
        continue;
      }

      if (conditionType === EXECUTE_WAIT_TYPES.IS_IN_SEGMENT) {
        const { targetId, segmentId } = waitingAction.conditionConfig || {};
        const execution = await models.Executions.findOne({
          _id: waitingAction.executionId,
        });
        const lastExecutedAction =
          execution?.actions?.[execution?.actions?.length - 1];
        const lastActionTime = lastExecutedAction?.createdAt
          ? new Date(lastExecutedAction.createdAt).getTime()
          : 0;
        const now = Date.now();
        if (
          lastExecutedAction?.result?.targetId === target?._id &&
          now - lastActionTime < 2000
        ) {
          continue;
        }
        if (targetId === target._id) {
          if (await isInSegment(subdomain, segmentId, targetId)) {
            return waitingAction;
          }
        }
      }
    }
  }
  return null;
};
