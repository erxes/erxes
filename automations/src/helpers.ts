import { IAction, IActionsMap } from "./models/Automations";

export const replacePlaceHolders = ({ actionData, target }: { actionData?: any, target: any }) => {
  if (actionData) {
    const targetKeys = Object.keys(target);
    const actionDataKeys = Object.keys(actionData);

    for (const targetKey of targetKeys) {
      for (const actionDataKey of actionDataKeys) {
        if (actionData[actionDataKey].includes(`{{ ${targetKey} }}`)) {
          actionData[actionDataKey] = actionData[actionDataKey].replace(`{{ ${targetKey} }}`, target[targetKey]);
        }

        for (const complexFieldKey of ['customFieldsData', 'trackedData']) {
          if (actionData[actionDataKey].includes(complexFieldKey)) {
            const regex = new RegExp(`{{ ${complexFieldKey}.([\\w\\d]+) }}`);
            const match = regex.exec(actionData[actionDataKey]);
            const fieldId = match[1];

            const complexFieldData = target[complexFieldKey].find(cfd => cfd.field === fieldId);

            if (complexFieldData) {
              actionData[actionDataKey] = actionData[actionDataKey].replace(`{{ ${complexFieldKey}.${fieldId} }}`, complexFieldData.value );
            }
          }
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