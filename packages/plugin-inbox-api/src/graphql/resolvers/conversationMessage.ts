import { debugError } from '../../debuggers';
import { getDocument } from '../../cacheUtils';
import { IMessageDocument } from '../../models/definitions/conversationMessages';
import { IContext } from '@erxes/api-utils';
import { Conversations } from '../../models';
import { MESSAGE_TYPES } from '../../models/definitions/constants';

export default {
  user(message: IMessageDocument) {
    return getDocument('users', { _id: message.userId });
  },

  customer(message: IMessageDocument, _, { dataLoaders }: IContext) {
    return (
      (message.customerId && dataLoaders.customer.load(message.customerId)) ||
      null
    );
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
    }).lean();

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