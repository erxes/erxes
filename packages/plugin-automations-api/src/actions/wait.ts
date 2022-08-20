import { IModels } from '../connectionResolver';
import { ACTIONS } from '../constants';
import { getActionsMap } from '../helpers';
import { IAction } from '../models/definitions/automaions';
import { EXECUTION_STATUS } from '../models/definitions/executions';
import { executeActions } from '../utils';

export const playWait = async (models: IModels, subdomain: string) => {
  const waitingExecutions = await models.Executions.find({
    waitingActionId: { $ne: null },
    startWaitingDate: { $ne: null }
  });

  for (const exec of waitingExecutions) {
    const automation = await models.Automations.findOne({
      _id: exec.automationId
    }).lean();
    if (!automation) {
      continue;
    }

    const currentAction: IAction | undefined = automation.actions.find(
      a => a.type === ACTIONS.WAIT && a.id === exec.waitingActionId
    );

    if (!currentAction) {
      // waiting action is deleted or changed type from interface
      exec.waitingActionId = undefined;
      exec.startWaitingDate = undefined;
      exec.status = EXECUTION_STATUS.MISSID;
      exec.save();
      continue;
    }

    if (
      !exec.startWaitingDate ||
      !currentAction.config ||
      currentAction.config.value
    ) {
      continue;
    }

    const finalWaitHour =
      currentAction.config.type === 'hour'
        ? currentAction.config.value
        : currentAction.config.value * 24;
    const performDate = new Date(
      exec.startWaitingDate.getTime() + (finalWaitHour || 0) * 60 * 60 * 1000
    );

    if (performDate > new Date()) {
      continue;
    }

    exec.waitingActionId = undefined;
    exec.startWaitingDate = undefined;
    exec.save();
    await executeActions(
      subdomain,
      exec.triggerType,
      exec,
      await getActionsMap(automation),
      currentAction.nextActionId
    );
  }
};
