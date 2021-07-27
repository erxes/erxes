import { sendRPCMessage } from '../messageBroker';

export const addDeal = async ({ config, data }) => {
  return sendRPCMessage('deal', 'add-deal', {...data, ...config})
}