import {
  Brands,
  Conversations,
  Customers,
  EngageMessages,
  Integrations
} from '../db/models';
import Messages from '../db/models/ConversationMessages';
import { IBrowserInfo } from '../db/models/Customers';
import { KIND_CHOICES } from '../db/models/definitions/constants';
import { debugBase, debugError } from '../debuggers';
import { client, fetchElk, getIndexPrefix } from '../elasticsearch';
import { getVisitorLog, sendToVisitorLog } from './logUtils';

export const getOrCreateEngageMessage = async (
  browserInfo: IBrowserInfo,
  visitorId?: string,
  customerId?: string
) => {
  let integrationId;

  let customer;

  if (customerId) {
    customer = await Customers.getCustomer(customerId);
    integrationId = customer.integrationId;
  }

  let visitor;

  if (visitorId) {
    visitor = await getVisitorLog(visitorId);
    integrationId = visitor.integrationId;
  }

  const integration = await Integrations.findOne({
    _id: integrationId,
    kind: KIND_CHOICES.MESSENGER
  });

  if (!integration) {
    throw new Error('Integration not found');
  }

  const brand = await Brands.getBrand({ _id: integration.brandId || '' });

  // try to create engage chat auto messages
  await EngageMessages.createVisitorOrCustomerMessages({
    brandId: brand._id,
    integrationId: integration._id,
    customer,
    visitor,
    browserInfo
  });

  // find conversations
  const query = customerId
    ? { integrationId, customerId }
    : { integrationId, visitorId };

  const convs = await Conversations.find(query);

  return Messages.findOne(Conversations.widgetsUnreadMessagesQuery(convs));
};

export const convertVisitorToCustomer = async (visitorId: string) => {
  let visitor;

  try {
    visitor = await getVisitorLog(visitorId);

    delete visitor.visitorId;
    delete visitor._id;
  } catch (e) {
    debugError(e.message);
  }

  const doc = { state: 'visitor', ...visitor };
  const customer = await Customers.createCustomer(doc);

  await Messages.updateVisitorEngageMessages(visitorId, customer._id);
  await Conversations.updateMany(
    {
      visitorId
    },
    { $set: { customerId: customer._id, visitorId: '' } }
  );

  const index = `${getIndexPrefix()}events`;

  try {
    const response = await client.updateByQuery({
      index,
      body: {
        script: {
          lang: 'painless',
          source:
            'ctx._source.visitorId = null; ctx._source.customerId = params.customerId',
          params: {
            customerId: customer._id
          }
        },
        query: {
          term: {
            visitorId
          }
        }
      }
    });

    debugBase(`Response ${JSON.stringify(response)}`);
  } catch (e) {
    debugError(`Update event error ${e.message}`);
  }

  await sendToVisitorLog({ visitorId }, 'remove');

  return customer;
};

export const getOrCreateEngageMessageElk = async (
  browserInfo: IBrowserInfo,
  visitorId?: string,
  customerId?: string
) => {
  let integrationId;

  let customer;

  if (customerId) {
    const response = await fetchElk(
      'search',
      'customers',
      {
        query: {
          match: {
            _id: customerId
          }
        }
      },
      '',
      { hits: { hits: [] } }
    );

    const customers = response.hits.hits.map(hit => {
      return {
        _id: hit._id,
        ...hit._source
      };
    });

    if (customers.length > 0) {
      customer = customers[0];
      integrationId = customer.integrationId;
    }
  }

  let visitor;

  if (visitorId) {
    visitor = await getVisitorLog(visitorId);
    integrationId = visitor.integrationId;
  }

  const integrationsResponse = await fetchElk(
    'search',
    'integrations',
    {
      query: {
        bool: {
          must: [
            { match: { _id: integrationId } },
            { match: { kind: KIND_CHOICES.MESSENGER } }
          ]
        }
      }
    },
    '',
    { hits: { hits: [] } }
  );

  let integration;

  const integrations = integrationsResponse.hits.hits.map(hit => {
    return {
      _id: hit._id,
      ...hit._source
    };
  });

  if (integrations.length === 0) {
    throw new Error('Integration not found');
  }

  integration = integrations[0];

  const brandsResponse = await fetchElk(
    'search',
    'brands',
    {
      query: {
        match: {
          _id: integration.brandId
        }
      }
    },
    '',
    { hits: { hits: [] } }
  );

  const brands = brandsResponse.hits.hits.map(hit => {
    return {
      _id: hit._id,
      ...hit._source
    };
  });

  if (brands.length === 0) {
    throw new Error('Brand not found');
  }

  const brandId = brands[0]._id;

  // try to create engage chat auto messages
  await EngageMessages.createVisitorOrCustomerMessages({
    brandId,
    integrationId: integration._id,
    customer,
    visitor,
    browserInfo
  });

  // find conversations
  const query = customerId
    ? { integrationId, customerId }
    : { integrationId, visitorId };

  const convs = await Conversations.find(query);

  return Messages.findOne(Conversations.widgetsUnreadMessagesQuery(convs));
};
