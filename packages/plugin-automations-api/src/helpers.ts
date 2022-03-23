import { sendCommonMessage, sendCoreMessage } from "./messageBroker";
import { IAction, IActionsMap } from "./models/definitions/automaions";

const getRelatedValue = async (subdomain: string, target, targetKey) => {
  if (['userId', 'assignedUserId', 'closedUserId', 'ownerId', 'createdBy'].includes(targetKey)) {

    const user = await sendCoreMessage({
      subdomain,
      action: 'users.findOne',
      data: { _id: target[targetKey] },
      isRPC: true,
    });

    return user && (user.detail && user.detail.fullName || user.email) || '';
  }

  if (['participatedUserIds', 'assignedUserIds', 'watchedUserIds'].includes(targetKey)) {
    const users = await sendCoreMessage({
      subdomain,
      action: 'users.find',
      data: { _id: { $in: target[targetKey] } },
      isRPC: true,
    });

    return (users.map(user => user.detail && user.detail.fullName || user.email) || []).join(', ')
  }

  if (targetKey === 'tagIds') {
    const tags = await sendCommonMessage({
      subdomain,
      serviceName: 'tags',
      action: 'find',
      data: { _id: { $in: target[targetKey] } }
    });

    return (tags.map(tag => tag.name) || []).join(', ')
  }

  if (targetKey === 'labelIds') {
    const labels = await sendCommonMessage({
      subdomain,
      serviceName: 'cards',
      action: 'pipelineLabels.find',
      data: { _id: { $in: target[targetKey] } }
    });

    return (labels.map(label => label.name) || []).join(', ')
  }

  if (['integrationId', 'relatedIntegrationIds'].includes(targetKey)) {
    const integration = await sendCommonMessage({
      subdomain,
      serviceName: 'inbox',
      action: 'integrations.findOne',
      data: { _id: target[targetKey] }
    });

    return integration && integration.name || '';
  }

  if (['relatedIntegrationIds'].includes(targetKey)) {
    const integrations = await sendCommonMessage({
      subdomain,
      serviceName: 'inbox',
      action: 'integrations.find',
      data: { _id: { $in: target[targetKey] } }
    });

    return (integrations.map(i => i.name) || []).join(', ');
  }

  if (targetKey === 'parentCompanyId') {
    const company = await sendCommonMessage({
      subdomain,
      serviceName: 'contacts',
      action: 'companies.findOne',
      data: { _id: target[targetKey] }
    });

    return company && company.name || '';
  }

  if (['initialStageId', 'stageId'].includes(targetKey)) {
    const stage = await sendCommonMessage({
      subdomain,
      serviceName: 'cards',
      action: 'stages.findOne',
      data: { _id: target[targetKey] }
    });

    return stage && stage.name || '';
  }

  if (['sourceConversationIds'].includes(targetKey)) {
    const conversations = await sendCommonMessage({
      subdomain,
      serviceName: 'inbox',
      action: 'conversations.find',
      data: { _id: { $in: target[targetKey] } }
    });

    return (conversations.map(c => c.content) || []).join(', ')
  }

  if (['brandIds'].includes(targetKey)) {
    const brands = await sendCommonMessage({
      subdomain,
      serviceName: 'core',
      action: 'brands.find',
      data: { _id: { $in: target[targetKey] } }
    });

    return (brands.map(brand => brand.name) || []).join(', ')
  }

  return false
}

export const replacePlaceHolders = async (
  {
    subdomain,
    actionData,
    target,
    isRelated = true
  }: {
    subdomain: string,
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
          const replaceValue = isRelated && await getRelatedValue(subdomain, target, targetKey) || target[targetKey];

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
            const fieldId = (match && match.length === 2) ? match[1] : '';

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