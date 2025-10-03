import { IModels } from '~/connectionResolvers';
import { debugError, debugFacebook } from '@/integrations/facebook/debuggers';
import {
  getPageAccessToken,
  refreshPageAccessToken,
  subscribePage,
  unsubscribePage,
} from '@/integrations/facebook/utils';
import fetch from 'node-fetch';
import { getEnv, resetConfigsCache } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';

export const removeIntegration = async (
  subdomain: string,
  integrationErxesApiId: string,
): Promise<string> => {
  const models = await generateModels(subdomain);

  const integration = await models.FacebookIntegrations.findOne({
    erxesApiId: integrationErxesApiId,
  });

  if (!integration) {
    throw new Error('Integration not found');
  }

  // Remove endpoint
  let integrationRemoveBy;

  const { _id, kind, accountId, erxesApiId } = integration;

  const account = await models.FacebookAccounts.findOne({ _id: accountId });

  const selector = { integrationId: _id };

  if (kind.includes('facebook')) {
    debugFacebook('Removing entries');

    if (!account) {
      throw new Error('Account not found');
    }

    for (const pageId of integration.facebookPageIds || []) {
      let pageTokenResponse;

      try {
        pageTokenResponse = await getPageAccessToken(pageId, account.token);
      } catch (e) {
        debugError(
          `Error occurred while trying to get page access token with ${e.message}`,
        );
      }

      try {
        await models.FacebookPostConversations.deleteMany({
          recipientId: pageId,
        });
        await unsubscribePage(pageId, pageTokenResponse);
      } catch (e) {
        debugError(
          `Error occured while trying to unsubscribe page pageId: ${pageId}`,
        );
      }
    }

    integrationRemoveBy = { fbPageIds: integration.facebookPageIds };

    const conversationIds = await models.FacebookConversations.find(
      selector,
    ).distinct('_id');

    await models.FacebookCustomers.deleteMany({
      integrationId: integrationErxesApiId,
    });

    await models.FacebookConversations.deleteMany(selector);
    await models.FacebookConversationMessages.deleteMany({
      conversationId: { $in: conversationIds },
    });

    await models.FacebookIntegrations.deleteOne({ _id });
  }

  // Remove from core =========
  const ENDPOINT_URL = getEnv({ name: 'ENDPOINT_URL' });
  const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });

  let domain = `${DOMAIN}/gateway/pl:frontline`;

  if (process.env.NODE_ENV !== 'production') {
    domain = `${DOMAIN}/pl:frontline`;
  }

  if (ENDPOINT_URL) {
    // send domain to core endpoints
    try {
      await fetch(`${ENDPOINT_URL}/remove-endpoint`, {
        method: 'POST',
        body: JSON.stringify({
          domain,
          ...integrationRemoveBy,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (e) {
      throw new Error(e.message);
    }
  }

  return erxesApiId;
};

export const removeAccount = async (
  subdomain: string,
  _id: string,
): Promise<{ erxesApiIds: string[] }> => {
  const models = await generateModels(subdomain);

  const account = await models.FacebookAccounts.findOne({ _id });

  if (!account) {
    throw new Error(`Account not found: ${_id}`);
  }

  const erxesApiIds: string[] = [];

  const integrations = await models.FacebookIntegrations.find({
    accountId: account._id,
  });

  if (integrations.length > 0) {
    for (const integration of integrations) {
      try {
        const response = await removeIntegration(
          subdomain,
          integration.erxesApiId,
        );
        erxesApiIds.push(response);
      } catch (e) {
        throw e;
      }
    }
  }
  await models.FacebookAccounts.deleteOne({ _id });

  return { erxesApiIds };
};

export const repairIntegrations = async (
  subdomain: string,
  integrationId: string,
): Promise<true | Error> => {
  const models = await generateModels(subdomain);

  const integration = await models.FacebookIntegrations.findOne({
    erxesApiId: integrationId,
  });
  if (!integration) {
    throw new Error('Integration not found');
  }

  for (const pageId of integration.facebookPageIds || []) {
    const pageTokens = await refreshPageAccessToken(
      models,
      pageId,
      integration,
    );

    await subscribePage(models, pageId, pageTokens[pageId]);

    await models.FacebookIntegrations.deleteMany({
      erxesApiId: { $ne: integrationId },
      facebookPageIds: pageId,
      kind: integration.kind,
    });
  }

  await models.FacebookIntegrations.updateOne(
    { erxesApiId: integrationId },
    { $set: { healthStatus: 'healthy', error: '' } },
  );

  const ENDPOINT_URL = getEnv({ name: 'ENDPOINT_URL' });
  const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });

  let domain = `${DOMAIN}/gateway/pl:frontline`;

  if (process.env.NODE_ENV !== 'production') {
    domain = `${DOMAIN}/pl:frontline`;
  }

  if (ENDPOINT_URL) {
    await fetch(`${ENDPOINT_URL}/update-endpoint`, {
      method: 'POST',
      body: JSON.stringify({
        domain,
        facebookPageIds: integration.facebookPageIds,
        fbPageIds: integration.facebookPageIds, // Consider removing if duplicate of facebookPageIds
      }),
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return true;
};

export const updateConfigs = async (
  subdomain: string,
  configsMap,
): Promise<void> => {
  const models = await generateModels(subdomain);

  await models.FacebookConfigs.updateConfigs(configsMap);

  await resetConfigsCache();
};

export const facebookCreateIntegration = async (
  subdomain: string,
  { accountId, integrationId, data, kind },
): Promise<{ status: 'success' }> => {
  // Parse the pageIds from the data string
  const facebookPageIds = JSON.parse(data).pageIds;
  const models = await generateModels(subdomain);

  // Create a new Facebook integration in the database
  try {
    const integration = await models.FacebookIntegrations.create({
      kind,
      accountId,
      erxesApiId: integrationId,
      facebookPageIds,
    });
    // Retrieve environment variables for endpoint and domain
    const ENDPOINT_URL = getEnv({ name: 'ENDPOINT_URL' });
    const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });

    // Set domain based on environment (production vs non-production)
    let domain = `${DOMAIN}/gateway/pl:frontline`;
    if (process.env.NODE_ENV !== 'production') {
      domain = `${DOMAIN}/pl:frontline`;
    }
    console.log(ENDPOINT_URL, 'ENDPOINT_URL');
    console.log(DOMAIN, 'DOMAIN');

    // Register the endpoint if ENDPOINT_URL is defined
    if (ENDPOINT_URL) {
      try {
        await fetch(`${ENDPOINT_URL}/register-endpoint`, {
          method: 'POST',
          body: JSON.stringify({
            domain,
            facebookPageIds,
            fbPageIds: facebookPageIds,
          }),
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (e) {
        // Delete the integration if endpoint registration fails
        await models.FacebookIntegrations.deleteOne({ _id: integration._id });
        throw e;
      }
    }

    // Initialize a map to store page IDs and their access tokens
    const facebookPageTokensMap: { [key: string]: string } = {};
    // Retrieve the Facebook account details
    const account = await models.FacebookAccounts.getAccount({
      _id: accountId,
    });

    // Process each page ID to get access token and subscribe the page
    for (const pageId of facebookPageIds) {
      try {
        // Get the access token for the page
        const pageAccessToken = await getPageAccessToken(pageId, account.token);
        facebookPageTokensMap[pageId] = pageAccessToken;

        try {
          // Subscribe the page using the access token
          await subscribePage(models, pageId, pageAccessToken);
          debugFacebook(`Successfully subscribed page ${pageId}`);
        } catch (e) {
          // Log and throw error if subscription fails
          debugError(
            `Error occurred while trying to subscribe page ${e.message || e}`,
          );
          throw e;
        }
      } catch (e) {
        // Log and throw error if token retrieval fails
        debugError(
          `Error occurred while trying to get page access token with ${
            e.message || e
          }`,
        );
        throw e;
      }
    }

    // Save the page tokens map to the integration
    integration.facebookPageTokensMap = facebookPageTokensMap;
    await integration.save();

    // Return success status
    return { status: 'success' };
  } catch (e) {
    console.error('Error in FacebookIntegrations.create:', e);
    throw e;
  }
};
