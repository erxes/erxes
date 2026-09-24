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

  const [firstName = profileName || userId, ...lastNameParts] = (
    profileName || userId
  ).split(' ');

  const customer = await models.WhatsappCustomers.getOrCreateByPhone({
    userId,
    integrationId: integration.erxesApiId,
    firstName,
    lastName: lastNameParts.join(' '),
  });

  if (customer.erxesApiId) {
    return customer;
  }

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

  if (response.status !== 'success') {
    throw new Error(response.errorMessage || 'Customer creation failed');
  }

  customer.erxesApiId = response.data._id;
  await customer.save();
  return customer;
};
