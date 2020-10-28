import * as getUuid from 'uuid-by-string';
import { Customers, Fields } from './db/models';
import { debugBase } from './debuggers';
import { client, fetchElk, getIndexPrefix } from './elasticsearch';

interface ISaveEventArgs {
  type?: string;
  name?: string;
  customerId?: string;
  attributes?: any;
  additionalQuery?: any;
}

interface ICustomerIdentifyParams {
  email?: string;
  phone?: string;
  code?: string;
  integrationId?: string;
}

export const saveEvent = async (args: ISaveEventArgs) => {
  const { type, name, attributes, additionalQuery } = args;

  if (!type) {
    throw new Error('Type is required');
  }

  if (!name) {
    throw new Error('Name is required');
  }

  let customerId = args.customerId;
  let newlyCreatedId;

  if (!customerId) {
    customerId = await Customers.createVisitor();
    newlyCreatedId = customerId;
  }

  const searchQuery = {
    bool: {
      must: [{ term: { name } }, { term: { customerId } }]
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
          customerId,
          createdAt: new Date(),
          count: 1,
          attributes: Fields.generateTypedListFromMap(attributes || {})
        }
      }
    });

    debugBase(`Response ${JSON.stringify(response)}`);
  } catch (e) {
    debugBase(`Save event error ${e.message}`);

    if (newlyCreatedId) {
      await Customers.remove({ _id: newlyCreatedId });
    }

    customerId = undefined;
  }

  return { customerId };
};

export const getNumberOfVisits = async (
  customerId: string,
  url: string
): Promise<number> => {
  try {
    const response = await fetchElk('search', 'events', {
      query: {
        bool: {
          must: [
            { term: { name: 'viewPage' } },
            { term: { customerId } },
            { term: { 'attributes.url.keyword': url } }
          ]
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
    debugBase(`Error occured during getNumberOfVisits ${e.message}`);
    return 0;
  }
};

export const trackViewPageEvent = (args: {
  customerId: string;
  attributes: any;
}) => {
  const { attributes, customerId } = args;

  return saveEvent({
    type: 'lifeCycle',
    name: 'viewPage',
    customerId,
    attributes,
    additionalQuery: {
      bool: {
        must: [
          {
            term: {
              'attributes.field': 'url'
            }
          },
          {
            term: {
              'attributes.value': attributes.url
            }
          }
        ]
      }
    }
  });
};

export const trackCustomEvent = (args: {
  name: string;
  customerId: string;
  attributes: any;
}) => {
  return saveEvent({
    type: 'custom',
    name: args.name,
    customerId: args.customerId,
    attributes: args.attributes
  });
};

export const identifyCustomer = async (args: ICustomerIdentifyParams) => {
  // get or create customer
  let customer = await Customers.getWidgetCustomer(args);

  if (!customer) {
    customer = await Customers.createCustomer({
      primaryEmail: args.email,
      code: args.code,
      primaryPhone: args.phone
    });
  }

  return { customerId: customer._id };
};

export const updateCustomerProperty = async ({
  customerId,
  name,
  value
}: {
  customerId: string;
  name: string;
  value: any;
}) => {
  if (!customerId) {
    throw new Error('Customer id is required');
  }

  let modifier: any = { [name]: value };

  if (
    !['firstName', 'lastName', 'primaryPhone', 'primaryEmail', 'code'].includes(
      name
    )
  ) {
    const customer = await Customers.findOne({ _id: customerId });

    if (customer) {
      const prev = {};
      (customer.trackedData || []).forEach(td => (prev[td.field] = td.value));
      prev[name] = value;

      modifier = { trackedData: Fields.generateTypedListFromMap(prev) };
    }
  }

  await Customers.updateOne({ _id: customerId }, { $set: modifier });

  return { status: 'ok' };
};
