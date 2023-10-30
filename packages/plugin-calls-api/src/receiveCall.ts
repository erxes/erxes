import { IModels } from './connectionResolver';
import { ICustomer } from './models/definitions/customers';
import { getOrCreateCustomer } from './store';

const receiveCall = async (
  models: IModels,
  subdomain: string,
  params: ICustomer & { recipientId?: String }
) => {
  const integration = await models.Integrations.findOne({
    inboxId: params.inboxIntegrationId
  });

  if (!integration) {
    throw new Error('Integration not found');
  }

  params.recipientId = integration.phone;

  const customer = await getOrCreateCustomer(models, subdomain, params);

  return customer;
};

export default receiveCall;
