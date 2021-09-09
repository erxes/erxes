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

  sendRPCMessage(`add-${type}`, {
    type,
    ...newData,
    conformity
  });

  return newData;
}