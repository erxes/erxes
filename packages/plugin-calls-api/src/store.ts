import { IModels } from './connectionResolver';
import { sendInboxMessage } from './messageBroker';

export const getOrCreateCustomer = async (
  models: IModels,
  subdomain: string,
  callAccount: any,
) => {
  const { inboxIntegrationId, primaryPhone } = callAccount;
  let customer = await models.Customers.findOne({
    primaryPhone,
    status: 'completed',
  });
  if (!customer) {
    try {
      customer = await models.Customers.create({
        inboxIntegrationId,
        erxesApiId: null,
        primaryPhone: primaryPhone,
        status: 'pending',
      });
    } catch (e) {
      if (e.message.includes('duplicate')) {
        return await getOrCreateCustomer(models, subdomain, callAccount);
      } else {
        throw new Error(e);
      }
    }

    try {
      const apiCustomerResponse = await sendInboxMessage({
        subdomain,
        action: 'integrations.receive',
        data: {
          action: 'get-create-update-customer',
          payload: JSON.stringify({
            integrationId: inboxIntegrationId,
            primaryPhone: primaryPhone,
            isUser: true,
            phone: [primaryPhone],
            kind: 'calls',
          }),
        },
        isRPC: true,
      });
      customer.erxesApiId = apiCustomerResponse._id;
      customer.status = 'completed';
      await customer.save();
    } catch (e) {
      await models.Customers.deleteOne({ _id: customer._id });
      throw new Error(e);
    }
  }
  return customer;
};

export const createCustomer = async (
  models: IModels,
  subdomain: string,
  docs: any,
) => {
  const { inboxIntegrationId, primaryPhone, customerId } = docs;
  let customer;
  if (customerId) {
    let customer = await models.Customers.findOne({
      primaryPhone: primaryPhone,
      erxesApiId: customerId,
    });
    return customer;
  }

  try {
    customer = await models.Customers.create({
      inboxIntegrationId,
      erxesApiId: null,
      primaryPhone: primaryPhone,
    });
  } catch (e) {
    throw new Error(e);
  }

  try {
    const apiCustomerResponse = await sendInboxMessage({
      subdomain,
      action: 'integrations.receive',
      data: {
        action: 'get-create-update-customer',
        payload: JSON.stringify({
          integrationId: inboxIntegrationId,
          isUser: true,
          phone: [primaryPhone],
          kind: 'calls',
        }),
      },
      isRPC: true,
    });
    customer.erxesApiId = apiCustomerResponse._id;

    await customer.save();
  } catch (e) {
    await models.Customers.deleteOne({ _id: customer._id });
    throw new Error(e);
  }
  return customer;
};
