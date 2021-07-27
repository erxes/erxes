import { IActionsMap, IAutomation } from "./models/Automations";

export const replacePlaceHolders = ({ actionData, triggerData }: { actionData?: any, triggerData?: any }) => {
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

export const getActionsMap = async (automation: IAutomation) => {
  const actionsMap: IActionsMap = {};

  for (const action of automation.actions) {
    actionsMap[action.id] = action;
  }

  return actionsMap;
}