import { replacePlaceHolders } from '../helpers';
import { sendRPCMessage } from '../messageBroker';

export const addTask = async ({ action, execution }) => {

  const newData = await replacePlaceHolders({ actionData: action.config, target: execution.target});

  if (execution.triggerData.hasOwnProperty('conversationId')) {
    newData.conversationId = execution.triggerData.conversationId;
  }

  if (execution.triggerData.hasOwnProperty('cachedCustomerId')) {
    newData.customerId = execution.triggerData.cachedCustomerId;
  }

  const { config = {} } = action;

  if (config.hasOwnProperty('cardName')) {
    newData.name = config.cardName
  }

  if (config.hasOwnProperty('stageId')) {
    newData.stageId = config.stageId
  }

  return sendRPCMessage('task', 'add-task', { ...newData });
}