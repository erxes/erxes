import {
  findCompany,
  findCustomer,
  getContentItem,
  prepareEngageCustomers
} from './utils';
import { serviceDiscovery } from './configs';
import { generateModels } from './connectionResolver';
import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { getNumberOfVisits } from './events';
import { AWS_EMAIL_STATUSES, EMAIL_VALIDATION_STATUSES } from './constants';
import { updateContactsField } from './utils';
import { sendToWebhook as sendWebhook } from '@erxes/api-utils/src';

export let client;

export const initBroker = cl => {
  client = cl;

  const { consumeRPCQueue, consumeQueue } = client;

  consumeRPCQueue(
    'contacts:customers.getCustomerName',
    async ({ subdomain, data: { customer } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.Customers.getCustomerName(customer),
        status: 'success'
      };
    }
  );

  consumeRPCQueue('contacts:customers.findOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await findCustomer(models, data)
    };
  });

  consumeRPCQueue('contacts:companies.findOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await findCompany(models, data)
    };
  });

  consumeRPCQueue('contacts:customers.find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Customers.find(data).lean()
    };
  });

  consumeRPCQueue(
    'contacts:customers.getCustomerIds',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Customers.find(data).distinct('_id')
      };
    }
  );

  consumeRPCQueue(
    'contacts:customers.findActiveCustomers',
    async ({ subdomain, data: { selector, fields } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Customers.findActiveCustomers(selector, fields)
      };
    }
  );

  consumeRPCQueue(
    'contacts:companies.findActiveCompanies',
    async ({ subdomain, data: { selector, fields } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Companies.findActiveCompanies(selector, fields)
      };
    }
  );

  consumeRPCQueue(
    'contacts:customers.createCustomer',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Customers.createCustomer(data)
      };
    }
  );

  consumeRPCQueue(
    'contacts:companies.createCompany',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Companies.createCompany(data)
      };
    }
  );

  consumeRPCQueue(
    'contacts:customers.updateCustomer',
    async ({ subdomain, data: { _id, doc } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Customers.updateCustomer(_id, doc)
      };
    }
  );

  consumeRPCQueue(
    'contacts:customers.updateOne',
    async ({ subdomain, data: { selector, modifier } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Customers.updateOne(selector, modifier)
      };
    }
  );

  consumeRPCQueue(
    'contacts:customers.updateMany',
    async ({ subdomain, data: { selector, modifier } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Customers.updateMany(selector, modifier)
      };
    }
  );

  consumeRPCQueue(
    'contacts:customers.markCustomerAsActive',
    async ({ subdomain, data: { customerId } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Customers.markCustomerAsActive(customerId)
      };
    }
  );

  consumeQueue(
    'contacts:customers.removeCustomers',
    async ({ subdomain, data: { customerIds } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Customers.removeCustomers(customerIds)
      };
    }
  );

  consumeRPCQueue(
    'contacts:companies.updateCompany',
    async ({ subdomain, data: { _id, doc } }) => {
      const { Companies } = await generateModels(subdomain);

      return {
        status: 'success',
        data: await Companies.updateCompany(_id, doc)
      };
    }
  );

  consumeRPCQueue(
    'contacts:companies.removeCompanies',
    async ({ subdomain, data: { _ids } }) => {
      const { Companies } = await generateModels(subdomain);

      return {
        status: 'success',
        data: await Companies.removeCompanies(_ids)
      };
    }
  );

  consumeRPCQueue(
    'contacts:companies.updateCommon',
    async ({ subdomain, data: { selector, modifier } }) => {
      const { Companies } = await generateModels(subdomain);

      return {
        status: 'success',
        data: await Companies.updateOne(selector, modifier)
      };
    }
  );

  consumeRPCQueue(
    'contacts:customers.getWidgetCustomer',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Customers.getWidgetCustomer(data)
      };
    }
  );

  consumeRPCQueue(
    'contacts:customers.updateMessengerCustomer',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Customers.updateMessengerCustomer(data)
      };
    }
  );

  consumeRPCQueue(
    'contacts:customers.createMessengerCustomer',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Customers.createMessengerCustomer(data)
      };
    }
  );

  consumeRPCQueue(
    'contacts:customers.saveVisitorContactInfo',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Customers.saveVisitorContactInfo(data)
      };
    }
  );

  consumeQueue(
    'contacts:customers.updateLocation',
    async ({ subdomain, data: { customerId, browserInfo } }) => {
      const models = await generateModels(subdomain);

      await models.Customers.updateLocation(customerId, browserInfo);
    }
  );

  consumeQueue(
    'contacts:customers.updateSession',
    async ({ subdomain, data: { customerId } }) => {
      const models = await generateModels(subdomain);

      await models.Customers.updateSession(customerId);
    }
  );

  consumeRPCQueue(
    'contacts:customers.getCustomerName',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        data: models.Customers.getCustomerName(data),
        status: 'success'
      };
    }
  );

  consumeRPCQueue('contacts.getContentItem', async data => {
    const models = await generateModels('os');
    return {
      status: 'success',
      data: await getContentItem(models, data)
    };
  });

  consumeRPCQueue(
    'contacts:customers.prepareEngageCustomers',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await prepareEngageCustomers(models, subdomain, data)
      };
    }
  );

  consumeRPCQueue('contacts:getNumberOfVisits', async ({ data }) => ({
    status: 'success',
    data: await getNumberOfVisits(data)
  }));

  consumeQueue(
    'contacts:customers.setUnsubscribed',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      const { customerIds = [], status, _id } = data;

      const update: any = { isSubscribed: 'No' };

      if (status === AWS_EMAIL_STATUSES.BOUNCE) {
        update.emailValidationStatus = EMAIL_VALIDATION_STATUSES.INVALID;
      }

      if (_id && status) {
        return {
          status: 'success',
          data: await models.Customers.updateOne({ _id }, { $set: update })
        };
      }

      if (customerIds.length > 0 && !status) {
        return {
          status: 'success',
          data: await models.Customers.updateMany(
            { _id: { $in: customerIds } },
            { $set: update }
          )
        };
      }
    }
  );

  consumeRPCQueue(
    'contacts:updateContactsField',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await updateContactsField(models, subdomain, data)
      };
    }
  );
};

export const sendSegmentsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'segments',
    ...args
  });
};

export const sendCoreMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'core',
    ...args
  });
};

export const sendFormsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'forms',
    ...args
  });
};

export const sendInboxMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'inbox',
    ...args
  });
};

export const sendEngagesMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'engages',
    ...args
  });
};

export const sendInternalNotesMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'internalnotes',
    ...args
  });
};

export const sendTagsMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'tags',
    ...args
  });
};

export const sendContactsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'contacts',
    ...args
  });
};

export const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string }
): Promise<any> => {
  return sendMessage({
    serviceDiscovery,
    client,
    ...args
  });
};

export const sendIntegrationsMessage = (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'integrations',
    ...args
  });
};

export const fetchSegment = (subdomain: string, segmentId: string, options?) =>
  sendSegmentsMessage({
    subdomain,
    action: 'fetchSegment',
    data: { segmentId, options },
    isRPC: true
  });

export const sendToWebhook = ({ subdomain, data }) => {
  return sendWebhook(client, { subdomain, data });
};

export default function() {
  return client;
}
