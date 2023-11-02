import { IModels } from './connectionResolver';
import { sendInboxMessage } from './messageBroker';
import { ICustomer } from './models/definitions/customers';

export const getOrCreateCustomer = async (
  models: IModels,
  subdomain: string,
  callAccount: ICustomer & { recipientId?: String }
) => {
  const { inboxIntegrationId, primaryPhone, recipientId } = callAccount;

  let customer = await models.Customers.findOne({
    primaryPhone
  });

  // get conversation
  let conversation = await models.Conversations.findOne({
    senderId: primaryPhone,
    recipientId: recipientId || ''
  });

  // create conversation
  if (!conversation) {
    // save on integrations db
    try {
      conversation = await models.Conversations.create({
        timestamp: new Date(),
        senderId: primaryPhone,
        recipientId: recipientId,
        content: '',
        integrationId: inboxIntegrationId
      });
    } catch (e) {
      throw new Error(
        e.message.includes('duplicate')
          ? 'Concurrent request: conversation duplication'
          : e
      );
    }
  }

  if (!customer) {
    customer = await models.Customers.create({
      integrationId: inboxIntegrationId,
      erxesApiId: null,
      primaryPhone: primaryPhone
    });

    try {
      const apiCustomerResponse = await sendInboxMessage({
        subdomain,
        action: 'integrations.receive',
        data: {
          action: 'get-create-update-customer',
          payload: JSON.stringify({
            integrationId: inboxIntegrationId,
            firstName: primaryPhone,
            primaryPhone: primaryPhone,
            lastName: null,
            avatar: null,
            isUser: true,
            phone: [primaryPhone],
            conversationId: conversation.erxesApiId
          })
        },
        isRPC: true
      });

      customer.erxesApiId = apiCustomerResponse._id;
      await customer.save();
    } catch (e) {
      await models.Customers.deleteOne({ _id: customer._id });
      throw new Error(e);
    }
  }

  return customer;
};
