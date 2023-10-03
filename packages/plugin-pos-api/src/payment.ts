import { generateModels } from './connectionResolver';
import { sendPosclientMessage } from './messageBroker';

export default {
  callback: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    if (data.contentType !== 'pos:orders' || data.status !== 'paid') {
      return;
    }

    const { posToken } = data.data;
    const pos = await models.Pos.getPos({ token: posToken });

    sendPosclientMessage({
      subdomain,
      action: 'paymentCallbackClient',
      data,
      pos,
      isRPC: false
    });
  }
};
