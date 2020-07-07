import { createMessage, createOrUpdateConversation, getOrCreateCustomer } from './store';

import Integrations from '../models/Integrations';
import { ConversationMessages } from './models';

const receiveMessage = async requestBody => {
  const { instanceId, ack, messages } = requestBody;

  const integration = await Integrations.getIntegration({
    $and: [{ whatsappinstanceId: instanceId }, { kind: 'whatsapp' }],
  });

  if (ack) {
    for (const acknowledge of ack) {
      await ConversationMessages.updateOne({ mid: acknowledge.id }, { $set: { status: acknowledge.status } });
    }
  }

  if (messages) {
    for (const message of messages) {
      if (!message || message.fromMe) {
        return;
      }

      const phoneNumber = message.chatId.split('@', 2)[0];

      const customer = await getOrCreateCustomer(phoneNumber, message.senderName, instanceId);

      const customerIds = {
        customerId: customer.id,
        customerErxesApiID: customer.erxesApiId,
      };

      const integrationIds = {
        integrationId: integration.id,
        integrationErxesApiId: integration.erxesApiId,
      };

      const conversation = await createOrUpdateConversation(message, instanceId, customerIds, integrationIds);

      const conversationIds = {
        conversationId: conversation._id,
        conversationErxesApiId: conversation.erxesApiId,
        customerErxesApiId: customer.erxesApiId,
      };

      await createMessage(message, conversationIds);
    }
  }
};

export default receiveMessage;
