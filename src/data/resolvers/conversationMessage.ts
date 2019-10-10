import { Conversations, Customers, Integrations, Users } from '../../db/models';
import { IMessageDocument } from '../../db/models/definitions/conversationMessages';
import { IContext } from '../types';

export default {
  user(message: IMessageDocument) {
    return Users.findOne({ _id: message.userId });
  },

  customer(message: IMessageDocument) {
    return Customers.findOne({ _id: message.customerId });
  },

  async mailData(message: IMessageDocument, _args, { dataSources }: IContext) {
    const conversation = await Conversations.findOne({ _id: message.conversationId }).lean();

    if (!conversation || message.internal) {
      return null;
    }

    const integration = await Integrations.findOne({ _id: conversation.integrationId }).lean();

    if (!integration) {
      return null;
    }

    const { kind } = integration;

    // Not mail
    if (!kind.includes('gmail')) {
      return null;
    }

    const path = kind.includes('nylas') ? `/nylas/get-message` : `/${kind}/get-message`;

    return dataSources.IntegrationsAPI.fetchApi(path, {
      erxesApiMessageId: message._id,
      integrationId: integration._id,
    });
  },
};
