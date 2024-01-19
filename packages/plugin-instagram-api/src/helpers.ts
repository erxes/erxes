import { IModels } from './connectionResolver';
import { debugError, debugInstagram } from './debuggers';
import {
  getPageAccessToken,
  unsubscribePage,
  refreshPageAccesToken,
  subscribePage,
  getFacebookPageIdsForInsta,
} from './utils';
import { getEnv, resetConfigsCache } from './commonUtils';
import fetch from 'node-fetch';

export const removeIntegration = async (
  models: IModels,
  integrationErxesApiId: string,
): Promise<string> => {
  const integration = await models.Integrations.findOne({
    erxesApiId: integrationErxesApiId,
  });

  if (!integration) {
    throw new Error('Integration not found');
  }

  // Remove endpoint
  let integrationRemoveBy;

  const { _id, kind, accountId, erxesApiId } = integration;

  const account = await models.Accounts.findOne({ _id: accountId });

  const selector = { integrationId: _id };

  if (kind.includes('instagram')) {
    debugInstagram('Removing entries');

    if (!account) {
      throw new Error('Account not found');
    }

    for (const pageId of integration.facebookPageId || '') {
      let pageTokenResponse;

      try {
        pageTokenResponse = await getPageAccessToken(pageId, account.token);
      } catch (e) {
        debugError(
          `Error ocurred while trying to get page access token with ${e.message}`,
        );
      }

      try {
        await unsubscribePage(pageId, pageTokenResponse);
      } catch (e) {
        debugError(
          `Error occured while trying to unsubscribe page pageId: ${pageId}`,
        );
      }
    }

    integrationRemoveBy = { igPageId: integration.instagramPageId };

    const conversationIds =
      await models.Conversations.find(selector).distinct('_id');

    await models.Customers.deleteMany({
      integrationId: integrationErxesApiId,
    });

    await models.Conversations.deleteMany(selector);
    await models.ConversationMessages.deleteMany({
      conversationId: { $in: conversationIds },
    });

    await models.Integrations.deleteOne({ _id });
  }

  // Remove from core =========
  const ENDPOINT_URL = getEnv({ name: 'ENDPOINT_URL' });
  const DOMAIN = getEnv({ name: 'DOMAIN' });

  if (ENDPOINT_URL) {
    // send domain to core endpoints
    try {
      await fetch(`${ENDPOINT_URL}/remove-endpoint`, {
        method: 'POST',
        body: JSON.stringify({
          domain: DOMAIN,
          ...integrationRemoveBy,
        }),
        headers: { 'Content-Type': 'application/json' },
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
  _id: string,
): Promise<{ erxesApiIds: string | string[] } | Error> => {
  const account = await models.Accounts.findOne({ _id });

  if (!account) {
    return new Error(`Account not found: ${_id}`);
  }

  const erxesApiIds: string[] = [];

  const integrations = await models.Integrations.find({
    accountId: account._id,
  });

  if (integrations.length > 0) {
    for (const integration of integrations) {
      try {
        const response = await removeIntegration(
          models,
          integration.erxesApiId,
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
  models: IModels,
  integrationId: string,
): Promise<true | Error> => {
  const integration = await models.Integrations.findOne({
    erxesApiId: integrationId,
  });

  if (!integration) {
    throw new Error('Integration not found');
  }

  for (const pageId of integration.facebookPageId || '') {
    const pageTokens = await refreshPageAccesToken(models, pageId, integration);

    await subscribePage(pageId, pageTokens[pageId]);

    await models.Integrations.remove({
      erxesApiId: { $ne: integrationId },
      facebookPageId: pageId,
      kind: integration.kind,
    });
  }

  await models.Integrations.updateOne(
    { erxesApiId: integrationId },
    { $set: { healthStatus: 'healthy', error: '' } },
  );

  const ENDPOINT_URL = getEnv({
    name: 'ENDPOINT_URL',
  });
  const DOMAIN = getEnv({ name: 'DOMAIN' });

  if (ENDPOINT_URL) {
    // send domain to core endpoints
    try {
      await fetch(`${ENDPOINT_URL}/update-endpoint`, {
        method: 'POST',
        body: JSON.stringify({
          domain: `${DOMAIN}/gateway/pl:instagram`,
          instagramPageId: integration.instagramPageId,
          igPageId: integration.instagramPageId,
        }),
        headers: { 'Content-Type': 'application/json' },
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
export const updateConfigs = async (
  models: IModels,
  configsMap,
): Promise<void> => {
  await models.Configs.updateConfigs(configsMap);

  await resetConfigsCache();
};

export const instagramCreateIntegration = async (
  models: IModels,
  { accountId, integrationId, data, kind },
) => {
  const instagramPageId = JSON.parse(data).pageId;

  const account = await models.Accounts.getAccount({ _id: accountId });
  const facebookPageId = await getFacebookPageIdsForInsta(
    account.token,
    instagramPageId,
  );
  let integration;
  try {
    integration = await models.Integrations.create({
      kind,
      accountId,
      erxesApiId: integrationId,
      instagramPageId,
      facebookPageId,
    });
  } catch (error) {
    // You can also throw the error again or perform additional error handling here
    throw error;
  }

  const ENDPOINT_URL = getEnv({ name: 'ENDPOINT_URL' });
  const DOMAIN = getEnv({ name: 'DOMAIN' });

  let domain = `${DOMAIN}/gateway/pl:instagram`;

  if (process.env.NODE_ENV !== 'production') {
    domain = `${DOMAIN}/pl:instagram`;
  }

  if (ENDPOINT_URL) {
    // send domain to core endpoints
    try {
      await fetch(`${ENDPOINT_URL}/register-endpoint`, {
        method: 'POST',
        body: JSON.stringify({
          domain,
          instagramPageId,
          igPageId: instagramPageId,
        }),
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (e) {
      await models.Integrations.deleteOne({ _id: integration._id });
      throw e;
    }
  }

  const facebookPageTokensMap: { [key: string]: string } = {};

  if (facebookPageId !== null) {
    // Directly use facebookPageId as it's a string
    const pageId = facebookPageId;

    // Rest of your code
    try {
      const pageAccessToken = await getPageAccessToken(pageId, account.token);

      facebookPageTokensMap[pageId] = pageAccessToken;

      try {
        await subscribePage(pageId, pageAccessToken);
        debugInstagram(`Successfully subscribed page ${pageId}`);
      } catch (e) {
        debugError(
          `Error occurred while trying to subscribe page ${e.message || e}`,
        );
        throw e;
      }
    } catch (e) {
      debugError(
        `Error occurred while trying to get page access token with ${
          e.message || e
        }`,
      );
      throw e;
    }
  } else {
    // Handle the case where facebookPageId is null
    throw new Error('facebookPageId is null');
  }

  integration.facebookPageTokensMap = facebookPageTokensMap;

  await integration.save();

  return { status: 'success' };
};
