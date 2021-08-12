import { IAction, IActionsMap } from "./models/Automations";
import { IExecution } from "./models/Executions";

export const replaceHelper = ({ config, data }: { config: any, data: any }) => {
  if (config && data) {
    const dataKeys = Object.keys(data);
    const configKeys = Object.keys(config);

    for (const dataKey of dataKeys) {
      for (const configKey of configKeys) {
        if (config[configKey].includes(`{{ ${dataKey} }}`)) {
          config[configKey] = config[configKey].replace(`{{ ${dataKey} }}`, data[configKey]);
        }
      }
    }
  }
}

export const replacePlaceHolders = ({ actionData, triggerData }: { actionData?: any, triggerData: IExecution }) => {
  if (actionData && triggerData) {
    const triggerDataKeys = Object.keys(triggerData);
    const actionDataKeys = Object.keys(actionData);

    for (const triggerDataKey of triggerDataKeys) {
      for (const actionDataKey of actionDataKeys) {
        if (actionData[actionDataKey].includes(`{{ ${triggerDataKey} }}`)) {
          actionData[actionDataKey] = actionData[actionDataKey].replace(`{{ ${triggerDataKey} }}`, triggerData[triggerDataKey]);
        }
      }
    }
  }

  return actionData;
}

export const getActionsMap = async (actions: IAction[]) => {
  const actionsMap: IActionsMap = {};

  for (const action of actions) {
    actionsMap[action.id] = action;
  }

  return actionsMap;
}