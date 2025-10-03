import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';

export default {
  collectItems: async ({ subdomain, data }) => {
    const { contentId } = data;
    const customer = await sendTRPCMessage({
      pluginName: 'core',
      method: 'query',
      module: 'customers',
      action: 'findOne',
      input: {
        _id: contentId,
      },
    });

    if (!customer?.primaryPhone) {
      return {
        status: 'success',
        data: [],
      };
    }

    const models = await generateModels(subdomain);
    const histories = await models.CallHistory.find({
      customerPhone: customer.primaryPhone,
    });

    const results: any = [];
    for (const history of histories) {
      const messages = await models.ConversationMessages.findOne({
        conversationId: history.conversationId,
      }).limit(3);

      const user = await sendTRPCMessage({
        pluginName: 'core',
        method: 'query',
        module: 'users',
        action: 'findOne',
        input: {
          _id: history.createdBy,
        },
      });

      results.push({
        _id: history._id,
        contentType: 'calls:customer',
        createdAt: history.createdAt,
        contentTypeDetail: {
          history,
          conversationMessages: messages ? messages : [],
          assignedUser: user ? { details: user.details, _id: user._id } : {},
        },
      });
    }
    return {
      status: 'success',
      data: results,
    };
  },
};
