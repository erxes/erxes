import Companies from './models/Companies';
import Customers from './models/Customers';
import { findCompany, findCustomer, generateFields } from './utils';

let client;

export const initBroker = (cl) => {
  client = cl;

  const { consumeRPCQueue, consumeQueue } = client;

  consumeRPCQueue('contacts:rpc_queue:getCustomerName', async (customer) => ({
    data: await Customers.getCustomerName(customer),
    status: 'success',
  }));

  consumeRPCQueue('contacts:rpc_queue:findCustomer', async (doc) => ({
    status: 'success',
    data: await findCustomer(doc),
  }));

  consumeRPCQueue('contacts:rpc_queue:findCompany', async (doc) => ({
    status: 'success',
    data: await findCompany(doc),
  }));

  consumeRPCQueue(
    'contacts:rpc_queue:findActiveCustomers',
    async ({ selector, fields }) => ({
      status: 'success',
      data: await Customers.findActiveCustomers(selector, fields),
    })
  );

  consumeRPCQueue(
    'contacts:rpc_queue:findActiveCompanies',
    async ({ selector, fields }) => ({
      status: 'success',
      data: await Companies.findActiveCompanies(selector, fields),
    })
  );

  consumeRPCQueue('contacts:rpc_queue:create_customer', async (data) => ({
    status: 'success',
    data: await Customers.createCustomer(data),
  }));

  consumeRPCQueue('contacts:rpc_queue:createCompany', async (data) => ({
    status: 'success',
    data: await Companies.createCompany(data),
  }));

  consumeRPCQueue(
    'contacts:rpc_queue:updateCustomer',
    async ({ _id, doc }) => ({
      status: 'success',
      data: await Customers.updateCustomer(_id, doc),
    })
  );

  consumeRPCQueue('contacts:rpc_queue:updateCompany', async ({ _id, doc }) => ({
    status: 'success',
    data: await Companies.updateCompany(_id, doc),
  }));

  consumeRPCQueue('contacts:rpc_queue:getWidgetCustomer', async (data) => ({
    status: 'success',
    data: await Customers.getWidgetCustomer(data),
  }));

  consumeRPCQueue(
    'contacts:rpc_queue:updateMessengerCustomer',
    async (data) => ({
      status: 'success',
      data: await Customers.updateMessengerCustomer(data),
    })
  );

  consumeRPCQueue(
    'contacts:rpc_queue:createMessengerCustomer',
    async (data) => ({
      status: 'success',
      data: await Customers.createMessengerCustomer(data),
    })
  );

  consumeRPCQueue(
    'contacts:rpc_queue:saveVisitorContactInfo',
    async (data) => ({
      status: 'success',
      data: await Customers.saveVisitorContactInfo(data),
    })
  );

  consumeQueue('contacts:updateLocation', ({ customerId, browserInfo }) =>
    Customers.updateLocation(customerId, browserInfo)
  );

  consumeQueue('contacts:updateSession', ({ customerId }) =>
    Customers.updateSession(customerId)
  );

  consumeRPCQueue('contacts:rpc_queue:getFields', async (args) => ({
    status: 'success',
    data: await generateFields(args),
  }));

  consumeRPCQueue(
    'contacts:segments:associationTypes',
    async ({ mainType }) => {
      let types: string[] = [];

      if (['customer', 'lead'].includes(mainType)) {
        types = ['company', 'deal', 'ticket', 'task'];
      }

      if (mainType === 'company') {
        types = ['customer', 'deal', 'ticket', 'task'];
      }

      return { data: { types }, status: 'success' };
    }
  );

  consumeRPCQueue('contacts:segments:esTypesMap', async () => {
    return { data: { typesMap: {} }, status: 'success' };
  });

  consumeRPCQueue('contacts:segments:initialSelector', async () => {
    const negative = {
      term: {
        status: 'deleted',
      },
    };

    return { data: { negative }, status: 'success' };
  });

  consumeRPCQueue('contacts:getCustomerName', async (customer) => {
    return { data: Customers.getCustomerName(customer), status: 'success' };
  });
};

export const sendMessage = async (channel, message): Promise<any> => {
  return client.sendMessage(channel, message);
};

export const sendRPCMessage = async (channel, message): Promise<any> => {
  return client.sendRPCMessage(channel, message);
};

export const sendContactMessage = async (action, data): Promise<any> => {
  return client.sendMessage(`contacts:${action}`, data);
};

export const sendContactRPCMessage = async (action, data): Promise<any> => {
  return client.sendRPCMessage(`contacts:rpc_queue:${action}`, data);
};

export const sendFormRPCMessage = async (action, data): Promise<any> => {
  return client.sendRPCMessage(`forms:rpc_queue:${action}`, data);
};

export const sendConformityMessage = async (action, data): Promise<any> => {
  return client.sendRPCMessage(`conformities:${action}`, data);
};

export const sendEngageMessage = async (action, data): Promise<any> => {
  return client.sendRPCMessage(`engages:rpc_queue:${action}`, data);
};

export const prepareCustomFieldsData = async (doc): Promise<any> => {
  return client.sendRPCMessage('fields:rpc_queue:prepareCustomFieldsData', {
    doc,
  });
};

export const generateCustomFieldsData = async (doc): Promise<any> => {
  return client.sendRPCMessage('fields:rpc_queue:generateCustomFieldsData', {
    doc,
  });
};

export const sendFieldRPCMessage = async (action, data): Promise<any> => {
  return client.sendRPCMessage(`fields:rpc_queue:${action}`, data);
};

export const findIntegrations = async (query, options?): Promise<any> => {
  return client.sendRPCMessage('rpc_queue:findIntegrations', {
    query,
    options,
  });
};

export const sendToLog = (channel: string, data) =>
  client.sendMessage(channel, data);

export const removeCustomersConversations = async (
  customerIds
): Promise<any> => {
  await client.consumeQueue(
    'contact:removeCustomersConversations',
    customerIds
  );
};

export const removeCustomersEngages = async (customerIds): Promise<any> => {
  await client.consumeQueue('contact:removeCustomersEngages', customerIds);
};

export const changeCustomer = async (customerId, customerIds): Promise<any> => {
  await client.consumeQueue('contact:changeCustomer', customerId, customerIds);
};

export const engageChangeCustomer = async (
  customerId,
  customerIds
): Promise<any> => {
  await client.consumeQueue('engage:changeCustomer', customerId, customerIds);
};

export const fetchSegment = (segment, options?) =>
  sendRPCMessage('rpc_queue:fetchSegment', {
    segment,
    options,
  });

export default function() {
  return client;
}
