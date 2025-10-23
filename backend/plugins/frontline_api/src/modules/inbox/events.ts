const getUuid = require('uuid-by-string');
import {
  client,
  getIndexPrefix,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { debugError } from '~/modules/inbox/utils';

interface ISaveEventArgs {
  type?: string;
  name?: string;
  triggerAutomation?: boolean;
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
  const { type, name, triggerAutomation, attributes, additionalQuery } = args;

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
        { term: customerId ? { customerId } : { visitorId } },
      ],
    },
  };

  if (additionalQuery) {
    searchQuery.bool.must.push(additionalQuery);
  }

  const index = `${getIndexPrefix()}events`;

  try {
    await client.update({
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
          attributes: await sendTRPCMessage({
            subdomain,
            pluginName: 'core',
            method: 'query',
            module: 'fields',
            action: 'generateTypedListFromMap',
            input: {
              attributes,
            },
          }),
        },
      },
    });
  } catch (e) {
    debugError(`Save event error ${e.message}`);

    customerId = undefined;
    visitorId = undefined;
  }

  if (triggerAutomation && customerId) {
    await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'customers',
      action: 'findOne',
      input: {
        _id: customerId,
      },
    });

    // sendAutomationsMessage({
    //   subdomain,
    //   action: 'trigger',
    //   data: {
    //     type: `core:${customer.state}`,
    //     targets: [customer],
    //   },
    // });
  }

  return { customerId };
};

export const trackViewPageEvent = (
  subdomain: string,
  args: {
    customerId?: string;
    visitorId?: string;
    attributes: any;
  },
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
                        'attributes.field': 'url',
                      },
                    },
                    {
                      match: {
                        'attributes.value': attributes.url,
                      },
                    },
                  ],
                },
              },
            },
          },
        ],
      },
    },
  });
};

export const trackCustomEvent = (
  subdomain: string,
  args: {
    name: string;
    triggerAutomation?: boolean;
    customerId?: string;
    visitorId?: string;
    attributes: any;
  },
) => {
  return saveEvent(subdomain, {
    type: 'custom',
    name: args.name,
    triggerAutomation: args.triggerAutomation,
    customerId: args.customerId,
    visitorId: args.visitorId,
    attributes: args.attributes,
  });
};

export const identifyCustomer = async (
  subdomain: string,
  args: ICustomerIdentifyParams = {},
) => {
  let customer = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'customers',
    action: 'getWidgetCustomer',
    input: {
      query: { args },
    },
  });

  if (!customer) {
    customer = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'mutation',
      module: 'customers',
      action: 'createCustomer',
      input: {
        primaryEmail: args.email,
        code: args.code,
        primaryPhone: args.phone,
      },
    });
  }

  return { customerId: customer._id };
};

export const updateCustomerProperties = async (
  subdomain: string,
  {
    customerId,
    data,
  }: {
    customerId: string;
    data: Array<{ name: string; value: any }>;
  },
) => {
  if (!customerId) {
    throw new Error('Customer id is required');
  }
  const customer = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'customers',
    action: 'findOne',
    input: {
      query: {
        _id: customerId,
      },
    },
  });

  const prevTrackedData = {};
  const prevCustomFieldsData = {};

  if (customer) {
    if (customer.trackedData) {
      customer.trackedData.forEach(
        (td) => (prevTrackedData[td.field] = td.value),
      );
    }

    if (customer.customFieldsData) {
      customer.customFieldsData.forEach(
        (td) => (prevCustomFieldsData[td.field] = td.value),
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
        'code',
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

  modifier.trackedData = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'fields',
    action: 'generateTypedListFromMap',
    input: {
      query: {
        prevTrackedData,
      },
    },
  });

  modifier.customFieldsData = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'fields',
    action: 'generateTypedListFromMap',
    input: {
      query: {
        prevCustomFieldsData,
      },
    },
  });

  await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'mutation',
    module: 'customers',
    action: 'updateCustomer',
    input: {
      _id: customerId,
      doc: modifier,
    },
  });

  await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'customers',
    action: 'findOne',
    input: {
      query: { _id: customerId },
    },
  });

  // customer automation trigger =========
  //   if (updatedCustomer) {
  //     sendAutomationsMessage({
  //       subdomain,
  //       action: 'trigger',
  //       data: {
  //         type: `core:${updatedCustomer.state}`,
  //         targets: [updatedCustomer],
  //       },
  //     });
  //   }

  return { status: 'ok' };
};
