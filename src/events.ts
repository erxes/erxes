import { Customers } from './db/models';
import { debugBase } from './debuggers';
import { client, fetchElk } from './elasticsearch';

interface ISaveEventArgs {
  type?: string;
  name?: string;
  customerId?: string;
  attributes?: any;
  additionalQuery?: any;
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

  if (!customerId) {
    customerId = await Customers.createVisitor();
  }

  const searchQuery = {
    bool: {
      must: [{ term: { name } }, { term: { customerId } }],
    },
  };

  if (additionalQuery) {
    searchQuery.bool.must.push(additionalQuery);
  }

  let response = await fetchElk('search', 'events', {
    size: 1,
    query: searchQuery,
  });

  if (response.hits.total.value === 0) {
    response = await client.index({
      index: 'events',
      body: {
        type,
        name,
        customerId,
        createdAt: new Date(),
        count: 1,
        attributes: attributes || {},
      },
    });
  } else {
    response = await client.updateByQuery({
      index: 'events',
      refresh: true,
      body: {
        script: {
          lang: 'painless',
          source: 'ctx._source["count"] += 1',
        },
        query: searchQuery,
      },
    });
  }

  debugBase(`Response ${JSON.stringify(response)}`);

  return { customerId };
};

export const trackViewPageEvent = (args: { customerId: string; attributes: any }) => {
  const { attributes, customerId } = args;

  return saveEvent({
    type: 'lifeCycle',
    name: 'viewPage',
    customerId,
    attributes,
    additionalQuery: {
      term: {
        'attributes.url.keyword': attributes.url,
      },
    },
  });
};

export const trackCustomEvent = (args: { name: string; customerId: string; attributes: any }) => {
  return saveEvent({
    type: 'custom',
    name: args.name,
    customerId: args.customerId,
    attributes: args.attributes,
  });
};

export const identifyCustomer = async (args: { email?: string; phone?: string; code?: string }) => {
  // get or create customer
  let customer = await Customers.getWidgetCustomer(args);

  if (!customer) {
    customer = await Customers.createCustomer({
      primaryEmail: args.email,
      code: args.code,
      primaryPhone: args.phone,
    });
  }

  return { customerId: customer._id };
};

export const updateCustomerProperty = async ({
  customerId,
  name,
  value,
}: {
  customerId: string;
  name: string;
  value: any;
}) => {
  if (!customerId) {
    throw new Error('Customer id is required');
  }

  let modifier: any = { [name]: value };

  if (!['firstName', 'lastName', 'primaryPhone', 'primaryEmail', 'code'].includes(name)) {
    modifier = { [`trackedData.${name}`]: value };
  }

  await Customers.updateOne({ _id: customerId }, { $set: modifier });

  return { status: 'ok' };
};
