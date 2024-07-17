import { IModels } from './connectionResolver';
import { debugError, debugInstagram } from './debuggers';
import {
  getPageAccessToken,
  unsubscribePage,
  refreshPageAccesToken,
  subscribePage,
  getFacebookPageIdsForInsta
} from './utils';
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

    let pageTokenResponse;
    let pageId = integration.facebookPageId;

    if (!pageId) {
      throw new Error('Page ID not found');
    }
    try {
      pageTokenResponse = await getPageAccessToken(pageId, account.token);
    } catch (e) {
      debugError(
        `Error ocurred while trying to get page access token with ${e.message}`
      );
    }

    await models.PostConversations.deleteMany({ recipientId: pageId });
    await models.CommentConversation.deleteMany({ recipientId: pageId });

    try {
      await unsubscribePage(pageId, pageTokenResponse);
    } catch (e) {
      debugError(
        `Error occured while trying to unsubscribe page pageId: ${pageId}`
      );
    }

    integrationRemoveBy = { igPageId: integration.facebookPageId };

    const conversationIds =
      await models.Conversations.find(selector).distinct('_id');

    await models.Customers.deleteMany({
      integrationId: integrationErxesApiId
    });

    await models.Conversations.deleteMany(selector);
    await models.ConversationMessages.deleteMany({
      conversationId: { $in: conversationIds }
    });

    await models.Integrations.deleteOne({ _id });
  }

  // Remove from core =========
  const ENDPOINT_URL = getEnv({ name: 'ENDPOINT_URL' });
  const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });

  if (ENDPOINT_URL) {
    // send domain to core endpoints
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

  let pageId = integration.facebookPageId;

  if (!pageId) {
    throw new Error('Page ID not found');
  }

  try {
    // pageTokenResponse = await getPageAccessToken(pageId, account.token);
    const pageTokens = await refreshPageAccesToken(models, pageId, integration);
    await subscribePage(pageId, pageTokens[pageId]);
    await models.Integrations.deleteMany({
      erxesApiId: { $ne: integrationId },
      facebookPageIds: pageId,
      kind: integration.kind
    });
  } catch (e) {
    debugError(
      `Error ocurred while trying to get page access token with ${e.message}`
    );
  }

  await models.Integrations.updateOne(
    { erxesApiId: integrationId },
    { $set: { healthStatus: 'healthy', error: '' } }
  );

  const ENDPOINT_URL = getEnv({
    name: 'ENDPOINT_URL'
  });
  const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });

  if (ENDPOINT_URL) {
    // send domain to core endpoints
    try {
      await fetch(`${ENDPOINT_URL}/update-endpoint`, {
        method: 'POST',
        body: JSON.stringify({
          domain: `${DOMAIN}/gateway/pl:instagram`,
          instagramPageId: integration.instagramPageId,
          igPageId: integration.instagramPageId
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
  configsMap
): Promise<void> => {
  await models.Configs.updateConfigs(configsMap);

  await resetConfigsCache();
};

export const instagramCreateIntegration = async (
  subdomain: string,
  models: IModels,
  { accountId, integrationId, data, kind }
): Promise<{ status: 'success' }> => {
  try {
    // Parse data and log the Instagram page IDs
    const instagramPageIds = JSON.parse(data).pageIds;
    console.log(instagramPageIds, 'instagramPageIds');

    // Fetch account information
    const account = await models.Accounts.getAccount({ _id: accountId });

    // Process each Instagram page ID
    for (const instagramPageId of instagramPageIds) {
      // Get the corresponding Facebook page ID
      const facebookPageId = await getFacebookPageIdsForInsta(
        account.token,
        instagramPageId
      );
      console.log(facebookPageId, 'facebookPageId');

      // Check if facebookPageId is not null
      if (!facebookPageId) {
        throw new Error(
          `No Facebook page ID found for Instagram page ID ${instagramPageId}`
        );
      }

      // Register endpoint (conditional based on environment)
      const ENDPOINT_URL = getEnv({ name: 'ENDPOINT_URL' });
      const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });
      let domain = `${DOMAIN}/gateway/pl:instagram`;

      if (process.env.NODE_ENV !== 'production') {
        domain = `${DOMAIN}/pl:instagram`;
      }

      if (ENDPOINT_URL) {
        try {
          await fetch(`${ENDPOINT_URL}/register-endpoint`, {
            method: 'POST',
            body: JSON.stringify({
              domain,
              facebookPageIds: [facebookPageId], // Wrap facebookPageId in an array
              fbPageIds: [facebookPageId] // Wrap facebookPageId in an array
            }),
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (e) {
          throw new Error(
            `Failed to register endpoint for Facebook page ID ${facebookPageId}: ${e.message}`
          );
        }
      }

      // Get page access token and subscribe page
      try {
        const pageAccessToken = await getPageAccessToken(
          facebookPageId,
          account.token
        );
        const facebookPageTokensMap: { [key: string]: string } = {};
        facebookPageTokensMap[facebookPageId] = pageAccessToken;

        await subscribePage(facebookPageId, pageAccessToken);
        console.log(`Successfully subscribed page ${facebookPageId}`);

        // If needed, save the integration (uncomment and adjust if necessary)
        const integration = await models.Integrations.create({
          kind,
          accountId,
          erxesApiId: integrationId,
          instagramPageIds,
          facebookPageIds: [facebookPageId],
          facebookPageTokensMap
        });
        await integration.save();
      } catch (e) {
        throw new Error(
          `Error with Facebook page ID ${facebookPageId}: ${e.message}`
        );
      }
    }

    return { status: 'success' };
  } catch (error) {
    console.error(`Integration creation failed: ${error.message}`);
    throw error;
  }
};
