import Integrations from '../models/Integrations';
import { ConversationMessages } from './models';
import { createOrUpdateConversation, getOrCreateCustomer } from './store';

const receiveMessage = async requestBody => {
  const { instanceId, acknowledges, messages } = requestBody;

  const integration = await Integrations.getIntegration({
    $and: [{ whatsappinstanceId: instanceId }, { kind: 'whatsapp' }],
  });

  if (acknowledges) {
    for (const acknowledge of acknowledges) {
      await ConversationMessages.updateOne({ mid: acknowledge.id }, { $set: { status: acknowledge.status } });
    }
  }

  if (messages) {
    for (const message of messages) {
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

      await createOrUpdateConversation(requestBody.messages, instanceId, customerIds, integrationIds);
    }
  }
};

export default receiveMessage;
