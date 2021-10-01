import { Conversations } from '../../db/models';
import { MESSAGE_TYPES } from '../../db/models/definitions/constants';
import { IMessageDocument } from '../../db/models/definitions/conversationMessages';
import { debugError } from '../../debuggers';
import { IContext } from '../types';
import { getDocument } from './mutations/cacheUtils';

export default {
  user(message: IMessageDocument) {
    return getDocument('users', { _id: message.userId });
  },

  customer(message: IMessageDocument, _, { dataLoaders }: IContext) {
    if (message.customerId) {
      return dataLoaders.customer.load(message.customerId);
    }
  },

  async mailData(message: IMessageDocument, _args, { dataSources }: IContext) {
    const conversation = await Conversations.findOne({
      _id: message.conversationId
    }).lean();

    if (!conversation || message.internal) {
      return null;
    }

    const integration = await getDocument('integrations', {
      _id: conversation.integrationId
    });

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
      debugError(e);
      return null;
    }
  }
};
