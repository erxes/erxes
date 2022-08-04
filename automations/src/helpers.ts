import { sendRPCMessage } from "./messageBroker";
import { IAction, IActionsMap } from "./models/Automations";

const getRelatedValue = async (target, targetKey) => {
  if (['userId', 'assignedUserId', 'closedUserId', 'ownerId', 'createdBy'].includes(targetKey)) {
    const user = await sendRPCMessage('get-object', {
      model: 'Users', selector: { _id: target[targetKey] }
    });
    return user && (user.detail && user.detail.fullName || user.email) || '';
  }

  if (['participatedUserIds', 'assignedUserIds', 'watchedUserIds'].includes(targetKey)) {
    const users = await sendRPCMessage('find-objects', {
      model: 'Users', selector: { _id: { $in: target[targetKey] } }
    });
    return (users.map(user => user.detail && user.detail.fullName || user.email) || []).join(', ')
  }

  if (targetKey === 'tagIds') {
    const tags = await sendRPCMessage('find-objects', {
      model: 'Tags', selector: { _id: { $in: target[targetKey] } }
    });
    return (tags.map(tag => tag.name) || []).join(', ')
  }

  if (targetKey === 'labelIds') {
    const labels = await sendRPCMessage('find-objects', {
      model: 'Labels', selector: { _id: { $in: target[targetKey] } }
    });
    return (labels.map(label => label.name) || []).join(', ')
  }

  if (['integrationId', 'relatedIntegrationIds'].includes(targetKey)) {
    const integration = await sendRPCMessage('get-object', {
      model: 'Integrations', selector: { _id: target[targetKey] }
    });
    return integration && integration.name || '';
  }

  if (['relatedIntegrationIds'].includes(targetKey)) {
    const integrations = await sendRPCMessage('find-objects', {
      model: 'Integrations', selector: { _id: { $in: target[targetKey] } }
    });
    return (integrations.map(i => i.name) || []).join(', ');
  }

  if (targetKey === 'parentCompanyId') {
    const company = await sendRPCMessage('get-object', {
      model: 'Companies', selector: { _id: target[targetKey] }
    });
    return company && company.name || '';
  }

  if (['initialStageId', 'stageId'].includes(targetKey)) {
    const stage = await sendRPCMessage('get-object', {
      model: 'Stages', selector: { _id: target[targetKey] }
    });
    return stage && stage.name || '';
  }

  if (['sourceConversationIds'].includes(targetKey)) {
    const conversations = await sendRPCMessage('find-objects', {
      model: 'Conversations', selector: { _id: { $in: target[targetKey] } }
    });
    return (conversations.map(c => c.content) || []).join(', ')
  }

  if (['brandIds'].includes(targetKey)) {
    const brands = await sendRPCMessage('find-objects', {
      model: 'Brands', selector: { _id: { $in: target[targetKey] } }
    });
    return (brands.map(brand => brand.name) || []).join(', ')
  }

  return false
}

export const replacePlaceHolders = async (
  {
    actionData,
    target,
    isRelated = true
  }: {
    actionData?: any,
    target: any,
    isRelated?: boolean
  }
) => {
  if (actionData) {
    const targetKeys = Object.keys(target);
    const actionDataKeys = Object.keys(actionData);

    for (const actionDataKey of actionDataKeys) {
      for (const targetKey of targetKeys) {
        if (actionData[actionDataKey].includes(`{{ ${targetKey} }}`)) {
          const replaceValue = isRelated && await getRelatedValue(target, targetKey) || target[targetKey];

          actionData[actionDataKey] = actionData[actionDataKey].replace(
            `{{ ${targetKey} }}`, replaceValue
          );
        }

        if (actionData[actionDataKey].includes(`{{ now }}`)) {
          actionData[actionDataKey] = actionData[actionDataKey].replace(`{{ now }}`, new Date())
        }
        if (actionData[actionDataKey].includes(`{{ tomorrow }}`)) {
          const today = new Date()
          const tomorrow = today.setDate(today.getDate() + 1)
          actionData[actionDataKey] = actionData[actionDataKey].replace(`{{ tomorrow }}`, tomorrow)
        }
        if (actionData[actionDataKey].includes(`{{ nextWeek }}`)) {
          const today = new Date()
          const nextWeek = today.setDate(today.getDate() + 7)
          actionData[actionDataKey] = actionData[actionDataKey].replace(`{{ nextWeek }}`, nextWeek)
        }
        if (actionData[actionDataKey].includes(`{{ nextMonth }}`)) {
          const today = new Date()
          const nextMonth = today.setDate(today.getDate() + 30)
          actionData[actionDataKey] = actionData[actionDataKey].replace(`{{ nextMonth }}`, nextMonth)
        }

        for (const complexFieldKey of ['customFieldsData', 'trackedData']) {
          if (actionData[actionDataKey].includes(complexFieldKey)) {
            const regex = new RegExp(`{{ ${complexFieldKey}.([\\w\\d]+) }}`);
            const match = regex.exec(actionData[actionDataKey]);
            const fieldId = match[1];

            const complexFieldData = target[complexFieldKey].find(cfd => cfd.field === fieldId);

            if (complexFieldData) {
              actionData[actionDataKey] = actionData[actionDataKey].replace(
                `{{ ${complexFieldKey}.${fieldId} }}`, complexFieldData.value
              );
            }
          }
        }
      }

      actionData[actionDataKey] = actionData[actionDataKey].replace(/\[\[ /g, '').replace(/ \]\]/g, '')
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