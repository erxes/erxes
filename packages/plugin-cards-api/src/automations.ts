import {
  replacePlaceHolders,
  setProperty
} from '@erxes/api-utils/src/automations';
import { generateModels, IModels } from './connectionResolver';
import { itemsAdd } from './graphql/resolvers/mutations/utils';
import { putActivityLog } from './logUtils';
import { sendCommonMessage, sendCoreMessage } from './messageBroker';
import { getCollection } from './models/utils';

const getRelatedValue = async (
  models: IModels,
  subdomain: string,
  target,
  targetKey
) => {
  if (
    [
      'userId',
      'assignedUserId',
      'closedUserId',
      'ownerId',
      'createdBy'
    ].includes(targetKey)
  ) {
    const user = await sendCoreMessage({
      subdomain,
      action: 'users.findOne',
      data: { _id: target[targetKey] },
      isRPC: true
    });

    return (
      (user && ((user.detail && user.detail.fullName) || user.email)) || ''
    );
  }

  if (
    ['participatedUserIds', 'assignedUserIds', 'watchedUserIds'].includes(
      targetKey
    )
  ) {
    const users = await sendCoreMessage({
      subdomain,
      action: 'users.find',
      data: {
        query: {
          _id: { $in: target[targetKey] }
        }
      },
      isRPC: true
    });

    return (
      users.map(user => (user.detail && user.detail.fullName) || user.email) ||
      []
    ).join(', ');
  }

  if (targetKey === 'tagIds') {
    const tags = await sendCommonMessage({
      subdomain,
      serviceName: 'tags',
      action: 'find',
      data: { _id: { $in: target[targetKey] } }
    });

    return (tags.map(tag => tag.name) || []).join(', ');
  }

  if (targetKey === 'labelIds') {
    const labels = await models.PipelineLabels.find({
      _id: { $in: target[targetKey] }
    });

    return (labels.map(label => label.name) || []).join(', ');
  }

  if (['initialStageId', 'stageId'].includes(targetKey)) {
    const stage = await models.Stages.findOne({
      _id: target[targetKey]
    });

    return (stage && stage.name) || '';
  }

  if (['sourceConversationIds'].includes(targetKey)) {
    const conversations = await sendCommonMessage({
      subdomain,
      serviceName: 'inbox',
      action: 'conversations.find',
      data: { _id: { $in: target[targetKey] } }
    });

    return (conversations.map(c => c.content) || []).join(', ');
  }

  return false;
};

export default {
  receiveActions: async ({
    subdomain,
    data: { action, execution, collectionType, triggerType, actionType }
  }) => {
    const models = await generateModels(subdomain);

    if (actionType === 'create') {
      return actionCreate({
        models,
        subdomain,
        action,
        execution,
        collectionType
      });
    }

    return setProperty({
      models,
      subdomain,
      getRelatedValue,
      action,
      execution,
      triggerType,
      sendCommonMessage
    });
  }
};

const actionCreate = async ({
  models,
  subdomain,
  action,
  execution,
  collectionType
}) => {
  const { config = {} } = action;

  let newData = action.config.assignedTo
    ? await replacePlaceHolders({
        models,
        subdomain,
        getRelatedValue,
        actionData: { assignedTo: action.config.assignedTo },
        target: execution.target,
        isRelated: false
      })
    : {};

  delete action.config.assignedTo;

  newData = {
    ...newData,
    ...(await replacePlaceHolders({
      models,
      subdomain,
      getRelatedValue,
      actionData: action.config,
      target: execution.target
    }))
  };

  if (execution.target.userId) {
    newData.userId = execution.target.userId;
  }

  if (execution.triggerType === 'conversation') {
    newData.sourceConversationIds = [execution.targetId];
  }

  if (
    ['contacts:customer', 'contacts:lead'].includes(execution.triggerType) &&
    execution.target.isFormSubmission
  ) {
    newData.sourceConversationIds = [execution.target.conversationId];
  }

  if (newData.hasOwnProperty('assignedTo')) {
    newData.assignedUserIds = newData.assignedTo.trim().split(', ');
  }

  if (newData.hasOwnProperty('labelIds')) {
    newData.labelIds = newData.labelIds.trim().split(', ');
  }

  if (newData.hasOwnProperty('cardName')) {
    newData.name = newData.cardName;
  }

  if (config.hasOwnProperty('stageId')) {
    newData.stageId = config.stageId;
  }

  try {
    const { create } = getCollection(models, collectionType);

    const item = await itemsAdd(
      models,
      subdomain,
      newData,
      collectionType,
      create
    );

    const mainType = execution.triggerType.split(':')[1];
    await sendCoreMessage({
      subdomain,
      action: 'conformities.addConformity',
      data: {
        mainType: mainType.replace('lead', 'customer'),
        mainTypeId: execution.targetId,
        relType: `${collectionType}`,
        relTypeId: item._id
      }
    });

    return item;
  } catch (e) {
    return { error: e.message };
  }
};
