import { receiveInboxMessage } from '@/inbox/receiveMessage';
import { INTEGRATION_KINDS } from '@/integrations/whatsapp/constants';
import { IModels } from '~/connectionResolvers';

export const getOrCreateCustomer = async (
  models: IModels,
  subdomain: string,
  phoneNumberId: string,
  userId: string,
  profileName?: string,
) => {
  const integration = await models.WhatsappIntegrations.getIntegration({
    phoneNumberId,
    kind: { $in: INTEGRATION_KINDS.ALL },
  });

  let customer = await models.WhatsappCustomers.findOne({ userId });

  if (customer) {
    return customer;
  }

  const [firstName = profileName || userId, ...lastNameParts] = (
    profileName || userId
  ).split(' ');

  customer = await models.WhatsappCustomers.create({
    userId,
    firstName,
    lastName: lastNameParts.join(' '),
    integrationId: integration.erxesApiId,
  });

  try {
    const response = await receiveInboxMessage(subdomain, {
      action: 'get-create-update-customer',
      payload: JSON.stringify({
        integrationId: integration.erxesApiId,
        firstName,
        lastName: lastNameParts.join(' '),
        primaryPhone: userId,
        isUser: true,
      }),
    });

    if (response.status === 'success') {
      customer.erxesApiId = response.data._id;
      await customer.save();
      return customer;
    }

    throw new Error(response.errorMessage || 'Customer creation failed');
  } catch (e) {
    await models.WhatsappCustomers.deleteOne({ _id: customer._id });
    throw e;
  }
};
