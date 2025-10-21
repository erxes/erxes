import { IModels } from '@/connectionResolver';
import { IAutomationWaitingActionDocument } from '@/mongo/waitingActionsToExecute';
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
  models: IModels,
  type: string,
  targets: any[],
  executionId: string,
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
          ...(executionId ? { executionId } : {}),
        },
      ],
    });

    if (!waitingAction) {
      continue;
    }

    const { conditionType } = waitingAction;

    if (conditionType === EXECUTE_WAIT_TYPES.CHECK_OBJECT) {
      waitingAction.conditionConfig;
      return await handleCheckObjectCondition(models, waitingAction, target);
    }

    // Can add more: if (conditionType === 'isInSegment') {...}
  }

  return null;
};
