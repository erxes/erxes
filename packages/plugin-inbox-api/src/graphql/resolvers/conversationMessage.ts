import { debug } from '../../configs';
import { getDocument } from '../../cacheUtils';
import { IMessageDocument } from '../../models/definitions/conversationMessages';
import { Conversations } from '../../models';
import { MESSAGE_TYPES } from '../../models/definitions/constants';
import { sendRPCMessage } from '../../messageBroker';

export default {
  user(message: IMessageDocument) {
    return message.userId && { __typename: 'User', _id: message.userId }
  },

  customer(message: IMessageDocument) {
    return message.customerId && { __typename: 'Customer', _id: message.customerId }
  },

  async mailData(message: IMessageDocument, _args ) {
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

    return sendRPCMessage('rpc_queue:api_to_integrations', {
      action: 'getMessage',
      data: {
        erxesApiMessageId: message._id,
        integrationId: integration._id,
        path
      }
    })
  },

  async videoCallData(
    message: IMessageDocument,
    _args,
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
      const response = await sendRPCMessage('integrations:rpc_queue:getDailyRoom', {
        erxesApiMessageId: message._id
      })

      return response;
    } catch (e) {
      debug.error(e);
      return null;
    }
  }
};