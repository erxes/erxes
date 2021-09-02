import { replacePlaceHolders } from '../helpers';
import { sendRPCMessage } from '../messageBroker';

export const addDeal = async ({ action, execution }) => {
  const newData = await replacePlaceHolders({ actionData: action.config, target: execution.target });
  return sendRPCMessage('add-deal', { type: 'deal', ...execution.triggerData, ...action.config, ...newData });
}