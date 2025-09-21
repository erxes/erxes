import { IModels } from './connectionResolver';
import { sendInboxMessage } from './messageBroker';

export const getOrCreateCustomer = async (
  models: IModels,
  subdomain: string,
  callAccount: any,
) => {
  const { inboxIntegrationId, primaryPhone, phoneType } = callAccount;

  // Эхлээд тухайн утасны дугаараар хайж үзэх
  let customer = await models.Customers.findOne({
    primaryPhone,
    status: 'completed',
  });

  if (!customer) {
    // Pending статустай customer байгаа эсэхийг шалгах
    const pendingCustomer = await models.Customers.findOne({
      primaryPhone,
      status: 'pending',
    });

    if (pendingCustomer) {
      // Pending customer байвал түүнийг ашиглах
      customer = pendingCustomer;
    } else {
      try {
        // Шинэ customer үүсгэх
        customer = await models.Customers.create({
          inboxIntegrationId,
          erxesApiId: undefined, // null биш undefined ашиглах
          primaryPhone: primaryPhone,
          status: 'pending',
        });
      } catch (e) {
        // Duplicate алдаанд давтан оролдох
        if (e.message.includes('duplicate') || e.code === 11000) {
          console.log('Duplicate error, retrying...', e);
          return await getOrCreateCustomer(models, subdomain, callAccount);
        } else {
          console.log('Customer creation error:', e);
          throw new Error(e.message || e);
        }
      }
    }

    // API-д customer үүсгэх оролдлого
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
            phones: [{ type: phoneType || 'primary', phone: primaryPhone }],
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
