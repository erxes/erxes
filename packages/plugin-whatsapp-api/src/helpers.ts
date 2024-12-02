import { IModels } from './connectionResolver';
import { debugError, debugWhatsapp } from './debuggers';
import { getEnv, resetConfigsCache } from './commonUtils';
import fetch from 'node-fetch';

export const removeIntegration = async (
  subdomain: string,
  models: IModels,
  integrationErxesApiId: string
): Promise<string> => {
  const integration = await models.Integrations.findOne({
    erxesApiId: integrationErxesApiId
  });

  if (!integration) {
    throw new Error('Integration not found');
  }

  let integrationRemoveBy;

  const { _id, kind, accountId, erxesApiId } = integration;

  const account = await models.Accounts.findOne({ _id: accountId });

  if (!account) {
    throw new Error('Account not found');
  }

  const selector = { integrationId: _id };

  if (kind.includes('whatsapp')) {
    debugWhatsapp('Removing entries');

    const whatsappNumberIds = integration.whatsappNumberIds;

    if (!whatsappNumberIds) {
      throw new Error('whatsappNumber ID not found');
    }

    integrationRemoveBy = { whatsappNumberIds: integration.whatsappNumberIds };

    const conversationIds =
      await models.Conversations.find(selector).distinct('_id');

    await models.Customers.deleteMany({ integrationId: integrationErxesApiId });
    await models.Conversations.deleteMany(selector);
    await models.ConversationMessages.deleteMany({
      conversationId: { $in: conversationIds }
    });

    await models.Integrations.deleteOne({ _id });
  }
  const ENDPOINT_URL = getEnv({ name: 'ENDPOINT_URL' });
  const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });
  if (ENDPOINT_URL) {
    try {
      await fetch(`${ENDPOINT_URL}/remove-endpoint`, {
        method: 'POST',
        body: JSON.stringify({
          domain: DOMAIN,
          ...integrationRemoveBy
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (e) {
      throw new Error(e.message);
    }
  }

  await models.Integrations.deleteOne({ _id });

  return erxesApiId;
};

export const removeAccount = async (
  subdomain,
  models: IModels,
  _id: string
): Promise<{ erxesApiIds: string | string[] } | Error> => {
  const account = await models.Accounts.findOne({ _id });

  if (!account) {
    return new Error(`Account not found: ${_id}`);
  }

  const erxesApiIds: string[] = [];

  const integrations = await models.Integrations.find({
    accountId: account._id
  });
  if (integrations.length > 0) {
    for (const integration of integrations) {
      try {
        const response = await removeIntegration(
          subdomain,
          models,
          integration.erxesApiId
        );
        erxesApiIds.push(response);
      } catch (e) {
        throw e;
      }
    }
  }

  await models.Accounts.deleteOne({ _id });

  return { erxesApiIds };
};

export const repairIntegrations = async (
  subdomain: string,
  models: IModels,
  integrationId: string
): Promise<true | Error> => {
  const integration = await models.Integrations.findOne({
    erxesApiId: integrationId
  });

  if (!integration) {
    throw new Error('Integration not found');
  }

  let number = integration.whatsappNumberIds;

  if (!number) {
    throw new Error('Number not found');
  }

  try {
    await models.Integrations.deleteMany({
      erxesApiId: { $ne: integrationId },
      whatsappNumberIds: number,
      kind: integration.kind
    });
  } catch (e) {
    throw new Error(`Failed to delete integrations: ${e.message}`);
  }

  await models.Integrations.updateOne(
    { erxesApiId: integrationId },
    { $set: { healthStatus: 'healthy', error: '' } }
  );

  const ENDPOINT_URL = getEnv({ name: 'ENDPOINT_URL' });
  const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });

  if (ENDPOINT_URL) {
    try {
      await fetch(`${ENDPOINT_URL}/update-endpoint`, {
        method: 'POST',
        body: JSON.stringify({
          domain: `${DOMAIN}/gateway/pl:whatsapp`,
          whatsappNumberIds: integration.whatsappNumberIds
        }),
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (e) {
      throw e;
    }
  }

  return true;
};

export const removeCustomers = async (models: IModels, params) => {
  const { customerIds } = params;
  const selector = { erxesApiId: { $in: customerIds } };

  await models.Customers.deleteMany(selector);
};

export const updateConfigs = async (
  models: IModels,
  configsMap
): Promise<void> => {
  await models.Configs.updateConfigs(configsMap);

  await resetConfigsCache();
};

export const routeErrorHandling = (fn, callback?: any) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (e) {
      if (callback) {
        return callback(res, e, next);
      }

      debugError(e.message);

      return next(e);
    }
  };
};

export const whatsappCreateIntegration = async (
  subdomain: string,
  models: IModels,
  { accountId, integrationId, data, kind }
): Promise<{ status: 'success' }> => {
  const whatsappNumberIds = JSON.parse(data).pageIds;

  const account = await models.Accounts.getAccount({ _id: accountId });

  const integration = await models.Integrations.create({
    kind,
    accountId,
    erxesApiId: integrationId,
    whatsappNumberIds
  });

  const ENDPOINT_URL = getEnv({ name: 'ENDPOINT_URL' });
  const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });

  let domain = `${DOMAIN}/gateway/pl:whatsapp`;

  if (process.env.NODE_ENV !== 'production') {
    domain = `${DOMAIN}/pl:whatsapp`;
  }

  if (ENDPOINT_URL) {
    try {
      await fetch(`${ENDPOINT_URL}/register-endpoint`, {
        method: 'POST',
        body: JSON.stringify({
          domain,
          whatsappNumberIds,
          wabaIds: whatsappNumberIds
        }),
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (e) {
      await models.Integrations.deleteOne({ _id: integration._id });
      throw e;
    }
  }

  await integration.save();

  return { status: 'success' };
};