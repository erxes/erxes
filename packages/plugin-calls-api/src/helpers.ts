import { getEnv } from '@erxes/api-utils/src';
import { IModels } from './connectionResolver';
import { generateToken, getDomain } from './utils';

export const removeCustomers = async (models: IModels, params) => {
  const { customerIds } = params;
  const selector = { erxesApiId: { $in: customerIds } };

  await models.Customers.deleteMany(selector);
};

export const updateConfigs = async (
  models: IModels,
  configsMap,
): Promise<void> => {
  await models.Configs.updateConfigs(configsMap);
};

export const callsCreateIntegration = async (
  subdomain: string,
  models: IModels,
  args: any,
): Promise<{ status: 'success' }> => {
  const { data } = args;

  const { integrationId } = args;
  const docData = JSON.parse(data);
  const token = await generateToken(integrationId);
  const domain = getDomain(subdomain);
  const ENDPOINT_URL = getEnv({ name: 'ENDPOINT_URL' });

  const integration = await (
    await models
  ).Integrations.create({
    inboxId: integrationId,
    token,
    ...docData,
  });

  if (ENDPOINT_URL) {
    // send domain to core endpoints
    try {
      await fetch(`${ENDPOINT_URL}/register-endpoint`, {
        method: 'POST',
        body: JSON.stringify({
          domain: domain,
          callQueues: docData.queues,
          erxesApiId: integration._id,
          subdomain,
        }),
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (e) {
      await models.Integrations.deleteOne({ _id: integrationId });
      throw e;
    }
  }

  return {
    status: 'success',
  };
};
