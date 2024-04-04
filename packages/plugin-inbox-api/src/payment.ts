import { generateModels } from './connectionResolver';
import * as moment from 'moment';

export default {
  callback: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const conversationId = data.contentTypeId;
    await models.ConversationMessages.createMessage({
      conversationId,
      internal: true,
      content: `Payment received from customer via ${
        data.paymentKind
      } at ${moment(data.resolvedAt).format('YYYY-MM-DD HH:mm:ss')}`
    });
  }
};
