import { ACTIONS } from "../constants";
import { getActionsMap } from "../helpers";
import Automations, { IAction } from "../models/Automations"
import { Executions, EXECUTION_STATUS } from "../models/Executions"
import { executeActions } from "../utils";

export const playWait = async () => {
  const waitingExecutions = await Executions.find({
    waitingActionId: { $ne: null },
    startWaitingDate: { $ne: null },
  }).lean()

  for (const exec of waitingExecutions) {
    const automation = await Automations.findOne({ _id: exec.automationId }).lean();
    if (!automation) {
      continue;
    }

    const currentAction: IAction | undefined = automation.actions.find(a => a.type === ACTIONS.WAIT && a.id === exec.waitingActionId)

    if (!currentAction) {
      // waiting action is deleted or changed type from interface
      exec.waitingActionId = null;
      exec.startWaitingDate = null;
      exec.status = EXECUTION_STATUS.MISSID;
      exec.save();
      continue;
    }

    if (!currentAction.config || currentAction.config.value) {
      continue;
    }

    const finalWaitHour = currentAction.config.type === 'hour' ? currentAction.config.value : currentAction.config.value * 24;
    const performDate = new Date(exec.startWaitingDate.getTime() + (finalWaitHour || 0) * 60 * 60 * 1000);

    if (performDate > new Date()) {
      continue;
    }

    exec.waitingActionId = null;
    exec.startWaitingDate = null;
    exec.save();
    await executeActions(exec.triggerType, exec, await getActionsMap(automation), currentAction.nextActionId);
  }

}