import {
  Brands,
  Conversations,
  Customers,
  EngageMessages,
  Integrations
} from '../db/models';
import Messages from '../db/models/ConversationMessages';
import { IBrowserInfo } from '../db/models/Customers';
import { fetchElk } from '../elasticsearch';
import { getEnv } from './utils';

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
  const convs = await getConversation(integration._id, customer._id);

  return Messages.findOne(Conversations.widgetsUnreadMessagesQuery(convs));
};

const getConversation = async (integrationId: string, customerId: string) => {
  const ELK_SYNCER = getEnv({ name: 'ELK_SYNCER', defaultValue: 'true' });

  if (ELK_SYNCER === 'true') {
    const response = await fetchElk('search', 'conversation_messages', {
      query: {
        bool: {
          must: [{ match: { integrationId } }, { match: { customerId } }]
        }
      }
    });

    if (response.hits.hits.length > 0) {
      return response.hits.hits[0]._source;
    }
  }

  return await Conversations.find({
    integrationId,
    customerId
  });
};
