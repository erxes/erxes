import { replacePlaceHolders } from '../helpers';
import { sendRPCMessage } from '../messageBroker';

export const addTicket = async ({ action, execution }) => {
  const newData = await replacePlaceHolders({ actionData: action.config, target: execution.target });
  return sendRPCMessage('ticket', 'add-ticket', { ...execution.triggerData, ...action.config, ...newData });
}