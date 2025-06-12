import { sendCoreMessage, sendInboxMessage } from '../messageBroker';

export const getOrCreateErxesCustomer = async (
  subdomain,
  inboxIntegrationId,
  primaryPhone,
) => {
  return await sendInboxMessage({
    subdomain,
    action: 'integrations.receive',
    data: {
      action: 'get-create-update-customer',
      payload: JSON.stringify({
        integrationId: inboxIntegrationId,
        primaryPhone: primaryPhone,
        isUser: true,
        phone: [primaryPhone],
      }),
    },
    isRPC: true,
  });
};

export const updateErxesConversation = async (subdomain, payload) => {
  return await sendInboxMessage({
    subdomain,
    action: 'integrations.receive',
    data: {
      action: 'create-or-update-conversation',
      payload: JSON.stringify(payload),
    },
    isRPC: true,
  });
};

export const sendErxesMessage = async (subdomain, messageData) => {
  return await sendInboxMessage({
    subdomain,
    action: 'conversationClientMessageInserted',
    data: messageData,
  });
};

export const findErxesOperator = async (subdomain, userId) => {
  return await sendCoreMessage({
    subdomain,
    action: 'users.findOne',
    data: { _id: userId },
    isRPC: true,
  });
};
