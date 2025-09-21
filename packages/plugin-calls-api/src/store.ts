import { IModels } from './connectionResolver';
import { sendCoreMessage, sendInboxMessage } from './messageBroker';

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

  if (customer && customer.erxesApiId) {
    const coreCustomer = await sendCoreMessage({
      subdomain,
      action: 'customers.findOne',
      isRPC: true,
      data: {
        _id: customer.erxesApiId,
      },
    });

    if (!coreCustomer?._id) {
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
              phones: [{ type: 'other', phone: primaryPhone }],
              kind: 'calls',
            }),
          },
          isRPC: true,
        });

        customer.erxesApiId = apiCustomerResponse._id;
        customer.status = 'completed';
        await customer.save();
      } catch (e) {
        console.log('API customer creation error:', e);
        if (customer && customer.status === 'pending') {
          await models.Customers.deleteOne({ _id: customer._id });
        }
        throw new Error(e.message || e);
      }
    }
  }

  if (!customer) {
    const pendingCustomer = await models.Customers.findOne({
      primaryPhone,
      status: 'pending',
    });

    if (pendingCustomer) {
      customer = pendingCustomer;
    } else {
      try {
        customer = await models.Customers.create({
          inboxIntegrationId,
          erxesApiId: undefined,
          primaryPhone: primaryPhone,
          status: 'pending',
        });
      } catch (e) {
        if (e.message.includes('duplicate') || e.code === 11000) {
          console.log('Duplicate error, retrying...', e);
          return await getOrCreateCustomer(models, subdomain, callAccount);
        } else {
          console.log('Customer creation error:', e);
          throw new Error(e.message || e);
        }
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
            phones: [{ type: 'other', phone: primaryPhone }],
            kind: 'calls',
          }),
        },
        isRPC: true,
      });

      customer.erxesApiId = apiCustomerResponse._id;
      customer.status = 'completed';
      await customer.save();
    } catch (e) {
      console.log('API customer creation error:', e);
      if (customer && customer.status === 'pending') {
        await models.Customers.deleteOne({ _id: customer._id });
      }
      throw new Error(e.message || e);
    }
  }

  return customer;
};

export const createCustomer = async (
  models: IModels,
  subdomain: string,
  docs: any,
) => {
  const { inboxIntegrationId, primaryPhone, customerId, phoneType } = docs;
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
          phones: [{ type: phoneType || 'primary', phone: primaryPhone }],
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
