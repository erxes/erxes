import { generateModels } from './connectionResolver';
import { sendContactsMessage } from './messageBroker';

export default {
  collectItems: async ({ subdomain, data }) => {
    const { contentId } = data;

    const customer = await sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      isRPC: true,
      data: {
        _id: contentId
      }
    });

    if (!customer) {
      return {
        status: 'success',
        data: []
      };
    }

    const models = await generateModels(subdomain);
    const messages = await models.Messages.find({
      'to.address': customer.primaryEmail
    });

    const results: any = [];

    for (const message of messages) {
      results.push({
        _id: message._id,
        contentType: 'imap:customer',
        createdAt: message.createdAt,
        contentTypeDetail: message
      });
    }

    return {
      status: 'success',
      data: results
    };
  }
};
