import { replacePlaceHolders } from '../helpers';
import { sendRPCMessage } from '../messageBroker';

export const addTask = async ({ action, execution }) => {
  const newData = await replacePlaceHolders({ actionData: action.config, triggerData: { ...execution.triggerData, ...execution.actionsData } });

  return sendRPCMessage('task', 'add-task', { name: 'gggggggggggggg', stageId: 'FnsbxzEJKQ7LzQPrd', ...newData });
}