import {
  findCompany,
  findCustomer,
  getContentItem,
  prepareEngageCustomers
} from './utils';
import { serviceDiscovery } from './configs';
import { generateModels } from './connectionResolver';
import { sendMessage } from '@erxes/api-utils/src/core';

export let client;

export const initBroker = cl => {
  client = cl;

  const { consumeRPCQueue, consumeQueue } = client;

  consumeRPCQueue('contacts:getCustomerName', async ({ subdomain, data: { customer } }) => {
    const models = await generateModels(subdomain);

    return {
      data: await models.Customers.getCustomerName(customer),
      status: 'success'
    };
  });

  consumeRPCQueue('contacts:findCustomer', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await findCustomer(models, data)
    };
  });

  consumeRPCQueue('contacts:findCompany', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await findCompany(models, data)
    };
  });

  consumeRPCQueue('contacts:getCustomers', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Customers.find(data)
    };
  });

  consumeRPCQueue('contacts:getCustomerIds', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Customers.find(data).distinct('_id')
    };
  });

  consumeRPCQueue(
    'contacts:findActiveCustomers',
    async ({ subdomain, data: { selector, fields } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Customers.findActiveCustomers(selector, fields)
      };
    }
  );

  consumeRPCQueue(
    'contacts:customers:findOne',
    async ({ subdomain, data: { selector, fields } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Customers.findOne(selector, fields).lean()
      };
    }
  );

  consumeRPCQueue(
    'contacts:findActiveCompanies',
    async ({ subdomain,  data: { selector, fields } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Companies.findActiveCompanies(selector, fields)
      };
    }
  );

  consumeRPCQueue('contacts:createCustomer', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Customers.createCustomer(data)
    };
  });

  consumeRPCQueue('contacts:createCompany', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Companies.createCompany(data)
    };
  });

  consumeRPCQueue('contacts:customers:update', async ({ subdomain, data: { _id, doc  } }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Customers.updateCustomer(_id, doc)
    };
  });

  consumeRPCQueue(
    'contacts:customers:updateOne',
    async ({ subdomain, data: { selector, modifier } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Customers.updateOne(selector, modifier)
      };
    }
  );

  consumeQueue('contacts:customers:remove', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Customers.removeCustomers(data)
    };
  });

  consumeRPCQueue('contacts:companies:update', async ({ subdomain, data: { _id, doc } }) => {
    const { Companies } = await generateModels(subdomain);

    return {
      status: 'success',
      data: await Companies.updateCompany(_id, doc)
    };
  });

  consumeRPCQueue(
    'contacts:companies:updateCommon',
    async ({ subdomain, data: { selector, modifier } }) => {
      const { Companies } = await generateModels(subdomain);

      return {
        status: 'success',
        data: await Companies.updateOne(selector, modifier)
      };
    }
  );

  consumeRPCQueue('contacts:customers:getWidgetCustomer', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Customers.getWidgetCustomer(data)
    };
  });

  consumeRPCQueue('contacts:customers:updateMessengerCustomer', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Customers.updateMessengerCustomer(data)
    };
  });

  consumeRPCQueue('contacts:customers:createMessengerCustomer', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Customers.createMessengerCustomer(data)
    };
  });

  consumeRPCQueue('contacts:customers:saveVisitorContactInfo', async ({ subdomain, data }) => {
    const models  = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Customers.saveVisitorContactInfo(data)
    };
  });

  consumeQueue(
    'contacts:customers:updateLocation',
    async ({ subdomain, data: { customerId, browserInfo } }) => {
      const models = await generateModels(subdomain);

      await models.Customers.updateLocation(customerId, browserInfo);
    }
  );

  consumeQueue('contacts:customers:updateSession', async ({ subdomain, data: { customerId } }) => {
    const models = await generateModels(subdomain);

    await models.Customers.updateSession(customerId);
  });

  consumeRPCQueue('contacts:customers:getCustomerName', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return { data: models.Customers.getCustomerName(data), status: 'success' };
  });

  consumeRPCQueue('contacts:rpc_queue:getContentItem', async data => {
    const models = await generateModels('os');
    return {
      status: 'success',
      data: await getContentItem(models, data)
    };
  });

  consumeRPCQueue('contacts:customers:prepareEngageCustomers', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await prepareEngageCustomers(models, data)
    };
  });

  consumeRPCQueue(
    'contacts:generateInternalNoteNotif',
    async ({ subdomain, data }) => {
      const { contentTypeId, notifDoc, type } = data;

      const { Customers, Companies } = await generateModels(subdomain);

      let model: any = Customers;
      let link = `/contacts/details/`;

      if (type === 'company') {
        model = Companies;
        link = `/companies/details/`;
      }

      const response = await model.findOne({ _id: contentTypeId });

      const name =
        type === 'customer'
          ? await Customers.getCustomerName(response)
          : await Companies.getCompanyName(response);

      notifDoc.notifType = `${type}Mention`;
      notifDoc.content = name;
      notifDoc.link = link + response._id;
      notifDoc.contentTypeId = response._id;
      notifDoc.contentType = `${type}`;

      return {
        status: 'success',
        data: notifDoc
      };
    }
  );
};

export const sendSegmentsMessage = async (action, data, isRPC=false, defaultValue?): Promise<any> => {
  return sendMessage(client, serviceDiscovery, 'segments', action, data, isRPC, defaultValue);
};

export const sendCoreMessage = async (action, data, isRPC=false, defaultValue?): Promise<any> => {
  return sendMessage(client, serviceDiscovery, 'core', action, data, isRPC, defaultValue);
};

export const sendFormsMessage = async (action, data, isRPC=false, defaultValue?): Promise<any> => {
  return sendMessage(client, serviceDiscovery, 'forms', action, data, isRPC, defaultValue);
};

export const sendInboxMessage = async (action, data, isRPC=false, defaultValue?): Promise<any> => {
  return sendMessage(client, serviceDiscovery, 'inbox', action, data, isRPC, defaultValue);
};

export const sendEngagesMessage = async (action, data, isRPC=false, defaultValue?): Promise<any> => {
  return sendMessage(client, serviceDiscovery, 'engages', action, data, isRPC, defaultValue);
};

export const sendInternalNotesMessage = async (action, data, isRPC=false, defaultValue?): Promise<any> => {
  return sendMessage(client, serviceDiscovery, 'internalNotes', action, data, isRPC, defaultValue);
};

export const sendTagsMessage = async (action, data, isRPC=false, defaultValue?): Promise<any> => {
  return sendMessage(client, serviceDiscovery, 'tags', action, data, isRPC, defaultValue);
};

export const sendContactsMessage = async (action, data, isRPC=false, defaultValue?): Promise<any> => {
  return sendMessage(client, serviceDiscovery, 'contacts', action, data, isRPC, defaultValue);
};

export const fetchSegment = (segment, options?) =>
  sendSegmentsMessage('fetchSegment', { segment, options }, true);

export default function() {
  return client;
}