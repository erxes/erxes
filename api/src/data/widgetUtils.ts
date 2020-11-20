import {
  Brands,
  Conversations,
  Customers,
  EngageMessages,
  Integrations
} from '../db/models';
import Messages from '../db/models/ConversationMessages';
import { IBrowserInfo } from '../db/models/Customers';

export const getOrCreateEngageMessage = async (
  customerId: string,
  browserInfo: IBrowserInfo
) => {
  const customer = await Customers.getCustomer(customerId);

  // Preventing from displaying non messenger integrations like form's messages
  // as last unread message
  const integration = await Integrations.findOne({
    _id: customer.integrationId,
    kind: 'messenger'
  });

  if (!integration) {
    throw new Error('Integration not found');
  }

  const brand = await Brands.findOne({ _id: integration.brandId });

  if (!brand) {
    throw new Error('Brand not found');
  }

  // try to create engage chat auto messages
  await EngageMessages.createVisitorOrCustomerMessages({
    brand,
    integration,
    customer,
    browserInfo
  });

  // find conversations
  const convs = await Conversations.find({
    integrationId: integration._id,
    customerId: customer._id
  });

  return Messages.findOne(Conversations.widgetsUnreadMessagesQuery(convs));
};
