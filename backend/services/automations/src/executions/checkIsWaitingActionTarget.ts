import { IModels } from '@/connectionResolver';
import { IAutomationWaitingActionDocument } from '@/mongo/waitingActionsToExecute';
import { isInSegment } from '@/utils/isInSegment';
import { EXECUTE_WAIT_TYPES } from 'erxes-api-shared/core-modules';

function accessNestedObject(obj: any, keys: string[]) {
  return keys.reduce((acc, key) => acc && acc[key], obj) || '';
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

    const automation = await models.Automations.findOne({
      _id: waitingAction.automationId,
    });

    for (const action of automation?.actions || []) {
      const connects = action.config?.optionalConnects || [];

      const optionalConnect = connects.find(
        ({ optionalConnectId }) => optionalConnectId === valueToCheck,
      );

      if (optionalConnect && optionalConnect?.actionId) {
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
    const waitingAction = await models.WaitingActions.findOne({
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
    });

    if (!waitingAction) {
      continue;
    }

    const { conditionType } = waitingAction;

    if (conditionType === EXECUTE_WAIT_TYPES.CHECK_OBJECT) {
      return await handleCheckObjectCondition(models, waitingAction, target);
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
  return null;
};
