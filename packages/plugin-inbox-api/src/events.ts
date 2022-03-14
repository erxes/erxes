import * as getUuid from 'uuid-by-string';
import { debug } from './configs';
import { es } from './configs';
import { ICoreIModels } from './connectionResolver';
import { sendContactsMessage } from './messageBroker';

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

export const saveEvent = async (coreModels: ICoreIModels, args: ISaveEventArgs) => {
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

  const index = `${es.getIndexPrefix()}events`;

  try {
    const response = await es.client.update({
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
          attributes: coreModels.Fields.generateTypedListFromMap(attributes || {})
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

export const getNumberOfVisits = async (params: {
  url: string;
  visitorId?: string;
  customerId?: string;
}): Promise<number> => {
  const searchId = params.customerId
    ? { customerId: params.customerId }
    : { visitorId: params.visitorId };

  try {
    const response = await es.fetchElk({
      action: 'search',
      index: 'events',
      body: {
        query: {
          bool: {
            must: [
              { term: { name: 'viewPage' } },
              { term: searchId },
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
                            'attributes.value': params.url
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
      }
    });

    const hits = response.hits.hits;

    if (hits.length === 0) {
      return 0;
    }

    const [firstHit] = hits;

    return firstHit._source.count;
  } catch (e) {
    debug.error(`Error occured during getNumberOfVisits ${e.message}`);
    return 0;
  }
};

export const trackViewPageEvent = (coreModels: ICoreIModels, args: {
  customerId?: string;
  visitorId?: string;
  attributes: any;
}) => {
  const { attributes, customerId, visitorId } = args;

  return saveEvent(coreModels, {
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

export const trackCustomEvent = (coreModels: ICoreIModels, args: {
  name: string;
  customerId?: string;
  visitorId?: string;
  attributes: any;
}) => {
  return saveEvent(coreModels, {
    type: 'custom',
    name: args.name,
    customerId: args.customerId,
    visitorId: args.visitorId,
    attributes: args.attributes
  });
};

export const identifyCustomer = async (subdomain: string, args: ICustomerIdentifyParams = {}) => {
  // get or create customer
  let customer = await sendContactsMessage({
    subdomain,
    action: "customers.getWidgetCustomer",
    data: args, 
    isRPC: true
  })

  if (!customer) {
    customer = await sendContactsMessage({
      subdomain,
      action: "customers.createCustomer",
      data: {
        primaryEmail: args.email,
        code: args.code,
        primaryPhone: args.phone
      },
      isRPC: true
    })
  }

  return { customerId: customer._id };
};

export const updateCustomerProperty = async (
  coreModels: ICoreIModels,
  subdomain: string,
  {
    customerId,
    name,
    value
  }: {
    customerId: string;
    name: string;
    value: any;
  }
) => {
  if (!customerId) {
    throw new Error('Customer id is required');
  }

  let modifier: any = { [name]: value };

  if (
    ![
      'firstName',
      'lastName',
      'middleName',
      'primaryPhone',
      'primaryEmail',
      'code'
    ].includes(name)
  ) {
    const customer = await sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      data: {
        _id: customerId
      },
      isRPC: true
    });

    if (customer) {
      const prev = {};
      (customer.trackedData || []).forEach(td => (prev[td.field] = td.value));
      prev[name] = value;

      modifier = {
        trackedData: coreModels.Fields.generateTypedListFromMap(prev)
      };
    }
  }

  await await sendContactsMessage({
    subdomain,
    action: "customers.updateCustomer",
    data: {
      _id: customerId,
      doc: modifier
    },
    isRPC: true
  });

  return { status: 'ok' };
};
