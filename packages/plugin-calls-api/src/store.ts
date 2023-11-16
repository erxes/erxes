import { IModels } from './connectionResolver';
import { sendInboxMessage } from './messageBroker';
import { ICustomer } from './models/definitions/customers';

export const getOrCreateCustomer = async (
  models: IModels,
  subdomain: string,
  callAccount: ICustomer & { recipientId?: String }
) => {
  const { inboxIntegrationId, primaryPhone } = callAccount;

  let customer = await models.Customers.findOne({
    primaryPhone
  });

  if (!customer) {
    customer = await models.Customers.create({
      integrationId: inboxIntegrationId,
      erxesApiId: null,
      primaryPhone: primaryPhone
    });

    try {
      const apiCustomerResponse = await sendInboxMessage({
        subdomain,
        action: 'integrations.receive',
        data: {
          action: 'get-create-update-customer',
          payload: JSON.stringify({
            integrationId: inboxIntegrationId,
            firstName: primaryPhone,
            primaryPhone: primaryPhone,
            lastName: null,
            avatar: null,
            isUser: true,
            phone: [primaryPhone]
          })
        },
        isRPC: true
      });
      customer.erxesApiId = apiCustomerResponse._id;
      await customer.save();
    } catch (e) {
      await models.Customers.deleteOne({ _id: customer._id });
      throw new Error(e);
    }
  }

  return customer;
};
