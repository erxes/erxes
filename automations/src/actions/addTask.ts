import { replacePlaceHolders } from '../helpers';
import { sendRPCMessage } from '../messageBroker';

export const addTask = async ({ action, execution }) => {

  console.log(execution)

  const newData = await replacePlaceHolders({ actionData: action.config, triggerData: { ...execution.triggerData, ...execution.actionsData } });

  if (execution.triggerData.hasOwnProperty('conversationId')) {
    newData.conversationId = execution.triggerData.conversationId;
  }

  if (execution.triggerData.hasOwnProperty('cachedCustomerId')) {
    newData.customerId = execution.triggerData.cachedCustomerId;
  }

  return sendRPCMessage('task', 'add-task', { name: 'gggggggggggggg', stageId: 'FnsbxzEJKQ7LzQPrd', ...newData });
}