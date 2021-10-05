import { replacePlaceHolders } from '../helpers';
import { sendRPCMessage } from '../messageBroker';

export const addBoardItem = async ({ action, execution, type }) => {
  const { config = {} } = action;


  let newData = action.config.assignedTo ? await replacePlaceHolders({
    actionData: { assignedTo: action.config.assignedTo },
    target: execution.target, isRelated: false
  }) : {}

  delete action.config.assignedTo;

  newData = {
    ...newData,
    ...await replacePlaceHolders({ actionData: action.config, target: execution.target })
  };

  if (newData.hasOwnProperty('assignedTo')) {
    newData.assignedUserIds = newData.assignedTo.trim().split(', ')
  }

  if (newData.hasOwnProperty('labelIds')) {
    newData.labelIds = newData.labelIds.trim().split(', ')
  }

  if (newData.hasOwnProperty('cardName')) {
    newData.name = newData.cardName
  }

  if (config.hasOwnProperty('stageId')) {
    newData.stageId = config.stageId
  }

  let conformity = {};
  if (['company', 'customer', 'task', 'deal', 'ticket'].includes(execution.triggerType)) {
    conformity = {
      mainType: execution.triggerType,
      mainTypeId: execution.targetId,
      relType: type
    }
  }

  if (execution.triggerType === 'conversation') {
    newData.sourceConversationIds = [execution.targetId]
  }

  const response = await sendRPCMessage(`add-${type}`, {
    type,
    ...newData,
    conformity
  });

  if (response.error) {
    return response
  }

  return {
    name: response.name,
    itemId: response._id,
    stageId: response.stageId,
    pipelineId: newData.pipelineId,
    boardId: newData.boardId
  };
}
