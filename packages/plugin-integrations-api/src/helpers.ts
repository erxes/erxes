import { IModels } from './connectionResolver';
import { debugCallPro, debugError } from './debuggers';
import { getEnv, resetConfigsCache, sendRequest } from './utils';

export const removeIntegration = async (
  models: IModels,
  integrationErxesApiId: string
): Promise<string> => {
  const integration = await models.Integrations.findOne({
    erxesApiId: integrationErxesApiId
  });

  if (!integration) {
    throw new Error('Integration not found');
  }

  // Remove endpoint
  let integrationRemoveBy;

  const { _id, kind, erxesApiId } = integration;
  const selector = { integrationId: _id };

  if (kind === 'callpro') {
    debugCallPro('Removing callpro entries');

    await models.CallProConversations.find(selector).distinct('_id');

    integrationRemoveBy = { phoneNumber: integration.phoneNumber };

    await models.CallProCustomers.deleteMany(selector);
    await models.CallProConversations.deleteMany(selector);
  }

  // Remove from core =========
  const ENDPOINT_URL = getEnv({ name: 'ENDPOINT_URL' });
  const DOMAIN = getEnv({ name: 'DOMAIN' });

  if (ENDPOINT_URL) {
    // send domain to core endpoints
    try {
      await sendRequest({
        url: `${ENDPOINT_URL}/remove-endpoint`,
        method: 'POST',
        body: {
          domain: DOMAIN,
          ...integrationRemoveBy
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

export const removeCustomers = async (models: IModels, params) => {
  const { customerIds } = params;
  const selector = { erxesApiId: { $in: customerIds } };

  await models.CallProCustomers.deleteMany(selector);
};

export const updateIntegrationConfigs = async (
  models: IModels,
  configsMap
): Promise<void> => {
  await models.Configs.updateConfigs(configsMap);

  resetConfigsCache();
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
