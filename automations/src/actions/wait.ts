import { ACTIONS } from "../constants";
import { getActionsMap } from "../helpers";
import Automations, { IAction } from "../models/Automations"
import { Executions } from "../models/Executions"
import { executeActions } from "../utils";

export const playWait = async () => {
  const waitingExecutions = await Executions.find({
    waitingActionId: { $ne: null },
    lastCheckedWaitDate: { $ne: null },
  })

  for (const exec of waitingExecutions) {
    const automation = await Automations.findOne({ _id: exec.automationId }).lean();
    if (!automation) {
      continue;
    }

    let currentAction: IAction | undefined;
    for (const action of automation.actions.filter(a => a.type === ACTIONS.WAIT)) {
      if (action.id !== exec.waitingActionId) {
        continue;
      }

      currentAction = action;
    }

    if (!currentAction) {
      // waiting action is deleted or changed type from interface
      continue;
    }

    if (!currentAction.config) {
      continue;
    }

    const performDate = new Date(exec.lastCheckedWaitDate.getTime() + (currentAction.config.finalWaitMinute || 0) * 60 * 1000);

    if (performDate > new Date()) {
      continue;
    }

    exec.waitingActionId = null;
    exec.lastCheckedWaitDate = new Date();
    await exec.save();
    await executeActions(exec.triggerType, exec, await getActionsMap(automation), currentAction.nextActionId);
  }

}