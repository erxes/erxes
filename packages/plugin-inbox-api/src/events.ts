import { client, getIndexPrefix } from '@erxes/api-utils/src/elasticsearch';
import * as getUuid from 'uuid-by-string';
import { debug } from './configs';
import {
  sendAutomationsMessage,
  sendContactsMessage,
  sendFormsMessage
} from './messageBroker';

interface ISaveEventArgs {
  type?: string;
  name?: string;
  customerId?: string;
  visitorId?: string;
  attributes?: any;
  additionalQuery?: any;
}

interface ICustomerIdentifyParams {
  email?: string;
  phone?: string;
  code?: string;
  integrationId?: string;
}

export const saveEvent = async (subdomain: string, args: ISaveEventArgs) => {
  const { type, name, attributes, additionalQuery } = args;

  if (!type) {
    throw new Error('Type is required');
  }

  if (!name) {
    throw new Error('Name is required');
  }

  let visitorId = args.visitorId;
  let customerId = args.customerId;

  const searchQuery = {
    bool: {
      must: [
        { term: { name } },
        { term: customerId ? { customerId } : { visitorId } }
      ]
    }
  };

  if (additionalQuery) {
    searchQuery.bool.must.push(additionalQuery);
  }

  const index = `${getIndexPrefix()}events`;

  try {
    const response = await client.update({
      index,
      // generate unique id based on searchQuery
      id: getUuid(JSON.stringify(searchQuery)),
      body: {
        script: { source: 'ctx._source["count"] += 1', lang: 'painless' },
        upsert: {
          type,
          name,
          visitorId,
          customerId,
          createdAt: new Date(),
          count: 1,
          attributes: await sendFormsMessage({
            subdomain,
            action: 'fields.generateTypedListFromMap',
            data: attributes || {},
            isRPC: true
          })
        }
      }
    });

    debug.info(`Response ${JSON.stringify(response)}`);
  } catch (e) {
    debug.error(`Save event error ${e.message}`);

    customerId = undefined;
    visitorId = undefined;
  }

  return { customerId };
};

export const trackViewPageEvent = (
  subdomain: string,
  args: {
    customerId?: string;
    visitorId?: string;
    attributes: any;
  }
) => {
  const { attributes, customerId, visitorId } = args;

  return saveEvent(subdomain, {
    type: 'lifeCycle',
    name: 'viewPage',
    customerId,
    visitorId,
    attributes,
    additionalQuery: {
      bool: {
        must: [
          {
            nested: {
              path: 'attributes',
              query: {
                bool: {
                  must: [
                    {
                      term: {
                        'attributes.field': 'url'
                      }
                    },
                    {
                      match: {
                        'attributes.value': attributes.url
                      }
                    }
                  ]
                }
              }
            }
          }
        ]
      }
    }
  });
};

export const trackCustomEvent = (
  subdomain: string,
  args: {
    name: string;
    customerId?: string;
    visitorId?: string;
    attributes: any;
  }
) => {
  return saveEvent(subdomain, {
    type: 'custom',
    name: args.name,
    customerId: args.customerId,
    visitorId: args.visitorId,
    attributes: args.attributes
  });
};

export const identifyCustomer = async (
  subdomain: string,
  args: ICustomerIdentifyParams = {}
) => {
  // get or create customer
  let customer = await sendContactsMessage({
    subdomain,
    action: 'customers.getWidgetCustomer',
    data: args,
    isRPC: true
  });

  if (!customer) {
    customer = await sendContactsMessage({
      subdomain,
      action: 'customers.createCustomer',
      data: {
        primaryEmail: args.email,
        code: args.code,
        primaryPhone: args.phone
      },
      isRPC: true
    });
  }

  return { customerId: customer._id };
};

export const updateCustomerProperties = async (
  subdomain: string,
  {
    customerId,
    data
  }: {
    customerId: string;
    data: Array<{ name: string; value: any }>;
  }
) => {
  if (!customerId) {
    throw new Error('Customer id is required');
  }

  const customer = await sendContactsMessage({
    subdomain,
    action: 'customers.findOne',
    data: {
      _id: customerId
    },
    isRPC: true
  });

  const prevTrackedData = {};
  const prevCustomFieldsData = {};

  if (customer) {
    if (customer.trackedData) {
      customer.trackedData.forEach(
        td => (prevTrackedData[td.field] = td.value)
      );
    }

    if (customer.customFieldsData) {
      customer.customFieldsData.forEach(
        td => (prevCustomFieldsData[td.field] = td.value)
      );
    }
  }

  const modifier: any = {};

  for (const { name, value } of data || []) {
    if (
      [
        'firstName',
        'lastName',
        'middleName',
        'primaryPhone',
        'primaryEmail',
        'code'
      ].includes(name)
    ) {
      modifier[name] = value;
      continue;
    }

    if (name.includes('custom_field__')) {
      const key = name.replace('custom_field__', '');
      prevCustomFieldsData[key] = value;
      continue;
    }

    prevTrackedData[name] = value;
  }

  modifier.trackedData = await sendFormsMessage({
    subdomain,
    action: 'fields.generateTypedListFromMap',
    data: prevTrackedData,
    isRPC: true
  });

  modifier.customFieldsData = await sendFormsMessage({
    subdomain,
    action: 'fields.generateTypedListFromMap',
    data: prevCustomFieldsData,
    isRPC: true
  });

  await await sendContactsMessage({
    subdomain,
    action: 'customers.updateCustomer',
    data: {
      _id: customerId,
      doc: modifier
    },
    isRPC: true
  });

  const updatedCustomer = await sendContactsMessage({
    subdomain,
    action: 'customers.findOne',
    data: {
      _id: customerId
    },
    isRPC: true
  });

  // customer automation trigger =========
  if (updatedCustomer) {
    sendAutomationsMessage({
      subdomain,
      action: 'trigger',
      data: {
        type: `contacts:${updatedCustomer.state}`,
        targets: [updatedCustomer]
      }
    });
  }

  return { status: 'ok' };
};
