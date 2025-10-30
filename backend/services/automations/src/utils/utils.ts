import {
  IAutomationAction,
  IAutomationActionsMap,
} from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

export const getActionsMap = async (actions: IAutomationAction[]) => {
  const actionsMap: IAutomationActionsMap = {};

  for (const action of actions) {
    actionsMap[action.id] = action;
  }

  return actionsMap;
};

const isDiffValue = (latest, target, field) => {
  if (field.includes('customFieldsData') || field.includes('trackedData')) {
    const [ct, fieldId] = field.split('.');
    const latestFoundItem = latest[ct].find((i) => i.field === fieldId);
    const targetFoundItem = target[ct].find((i) => i.field === fieldId);

    // previously empty and now receiving new value
    if (!latestFoundItem && targetFoundItem) {
      return true;
    }

    if (latestFoundItem && targetFoundItem) {
      return latestFoundItem.value !== targetFoundItem.value;
    }

    return false;
  }

  const getValue = (obj, attr) => {
    try {
      return obj[attr];
    } catch (e) {
      return undefined;
    }
  };

  const extractFields = field.split('.');

  let latestValue = latest;
  let targetValue = target;

  for (const f of extractFields) {
    latestValue = getValue(latestValue, f);
    targetValue = getValue(targetValue, f);
  }

  if (targetValue !== latestValue) {
    return true;
  }

  return false;
};

export const getConfig = async (
  subdomain: string,
  code: string,
  defaultValue?: any,
) => {
  return await sendTRPCMessage({
    subdomain,
    method: 'query',
    pluginName: 'core',
    module: 'config',
    action: 'getConfig',
    input: { code, defaultValue },
  });
};
