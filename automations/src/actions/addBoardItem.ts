import { replacePlaceHolders } from '../helpers';
import { sendRPCMessage } from '../messageBroker';

export const addBoardItem = async ({ action, execution, type }) => {
  const newData = await replacePlaceHolders({ actionData: action.config, target: execution.target });

  if (execution.target.hasOwnProperty('conversationId')) {
    newData.conversationId = execution.target.conversationId;
  }

  if (execution.target.hasOwnProperty('cachedCustomerId')) {
    newData.customerId = execution.target.cachedCustomerId;
  }

  if (execution.target.hasOwnProperty('customerId')) {
    newData.customerId = execution.target.customerId;
  }

  if (execution.target.hasOwnProperty('companyId')) {
    newData.companyId = execution.target.companyId;
  }

  const { config = {} } = action;

  if (config.hasOwnProperty('cardName')) {
    newData.name = config.cardName
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
