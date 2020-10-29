import { Conversations, Customers, Integrations, Users } from '../../db/models';
import { MESSAGE_TYPES } from '../../db/models/definitions/constants';
import { IMessageDocument } from '../../db/models/definitions/conversationMessages';
import { debugExternalApi } from '../../debuggers';
import { IContext } from '../types';

export default {
  user(message: IMessageDocument) {
    return Users.findOne({ _id: message.userId });
  },

  customer(message: IMessageDocument) {
    return Customers.findOne({ _id: message.customerId });
  },

  async mailData(message: IMessageDocument, _args, { dataSources }: IContext) {
    const conversation = await Conversations.findOne({
      _id: message.conversationId
    }).lean();

    if (!conversation || message.internal) {
      return null;
    }

    const integration = await Integrations.findOne({
      _id: conversation.integrationId
    }).lean();

    if (!integration) {
      return null;
    }

    const { kind } = integration;

    // Not mail
    if (!kind.includes('nylas') && kind !== 'gmail') {
      return null;
    }

    const path = kind.includes('nylas')
      ? `/nylas/get-message`
      : `/${kind}/get-message`;

    return dataSources.IntegrationsAPI.fetchApi(path, {
      erxesApiMessageId: message._id,
      integrationId: integration._id
    });
  },

  async videoCallData(
    message: IMessageDocument,
    _args,
    { dataSources }: IContext
  ) {
    const conversation = await Conversations.findOne({
      _id: message.conversationId
    });

    if (!conversation || message.internal) {
      return null;
    }

    if (message.contentType !== MESSAGE_TYPES.VIDEO_CALL) {
      return null;
    }

    try {
      const response = await dataSources.IntegrationsAPI.fetchApi(
        '/daily/room',
        { erxesApiMessageId: message._id }
      );
      return response;
    } catch (e) {
      debugExternalApi(e);
      return null;
    }
  }
};
