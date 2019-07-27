import { Conversations, Customers } from './facebook/models';
import Integrations from './models/Integrations';

export const integrationFactory = (params: {
  kind?: string;
  accountId?: string;
  erxesApiId?: string;
  facebookPageIds?: string[];
}) => {
  const integration = new Integrations({
    kind: params.kind || 'facebook',
    accountId: params.accountId || '_id',
    erxesApiId: params.erxesApiId || '_id',
    facebookPageIds: params.facebookPageIds || [],
  });

  return integration.save();
};

export const facebookCustomerFactory = (params: { userId: string }) => {
  const customer = new Customers({
    userId: params.userId,
  });

  return customer.save();
};

export const facebookConversationFactory = (params: { senderId: string; recipientId: string }) => {
  const conversation = new Conversations({
    timestamp: new Date(),
    senderId: params.senderId,
    recipientId: params.recipientId,
    content: 'content',
  });

  return conversation.save();
};
