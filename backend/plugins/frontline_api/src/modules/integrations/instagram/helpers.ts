import { generateModels } from '~/connectionResolvers';
import { debugError, debugInstagram } from './debuggers';
import {
  getPageAccessToken,
  refreshPageAccesToken,
  subscribePage,
  unsubscribePage,
  getFacebookPageIdsForInsta,
} from './utils';
import { getEnv, resetConfigsCache } from 'erxes-api-shared/utils';
import fetch from 'node-fetch';

export const removeIntegration = async (
  subdomain: string,
  integrationErxesApiId: string,
): Promise<string> => {
  const models = await generateModels(subdomain);

  const integration = await models.InstagramIntegrations.findOne({
    erxesApiId: integrationErxesApiId,
  });

  if (!integration) {
    throw new Error('Integration not found');
  }

  // Remove endpoint
  let integrationRemoveBy;

  const { _id, kind, accountId, erxesApiId } = integration;

  const account = await models.InstagramAccounts.findOne({ _id: accountId });

  if (!account) {
    throw new Error('Account not found');
  }

  const selector = { integrationId: _id };

  if (kind.includes('instagram')) {
    debugInstagram('Removing entries');

    const pageId = integration.facebookPageId;

    if (!pageId) {
      throw new Error('Facebook page ID not found');
    }

    try {
      const pageTokenResponse = await getPageAccessToken(pageId, account.token);

      await models.InstagramPostConversations.deleteMany({
        recipientId: pageId,
      });
      await models.InstagramCommentConversation.deleteMany({
        recipientId: pageId,
      });

      try {
        await unsubscribePage(pageId, pageTokenResponse);
      } catch (e) {
        debugError(
          `Error occurred while trying to unsubscribe page pageId: ${pageId}`,
        );
      }
    } catch (e) {
      debugError(
        `Error occurred while trying to get page access token with ${e.message}`,
      );
    }

    integrationRemoveBy = { igPageId: integration.instagramPageIds?.[0] };

    const conversationIds = await models.InstagramConversations.find(
      selector,
    ).distinct('_id');

    await models.InstagramCustomers.deleteMany({
      integrationId: integrationErxesApiId,
    });
    await models.InstagramConversations.deleteMany(selector);
    await models.InstagramConversationMessages.deleteMany({
      conversationId: { $in: conversationIds },
    });

    await models.Integrations.deleteOne({ _id });
  }
  const ENDPOINT_URL = getEnv({ name: 'ENDPOINT_URL' });
  const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });
  let domain = `${DOMAIN}/gateway/pl:instagram`;

  if (process.env.NODE_ENV !== 'production') {
    domain = `${DOMAIN}/pl:instagram`;
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

  await models.Integrations.deleteOne({ _id });

  return erxesApiId;
};

export const removeAccount = async (
  subdomain,
  _id: string,
): Promise<{ erxesApiIds: string | string[] } | Error> => {
  const models = await generateModels(subdomain);

  const account = await models.InstagramAccounts.findOne({ _id });

  if (!account) {
    return new Error(`Account not found: ${_id}`);
  }

  const erxesApiIds: string[] = [];

  const integrations = await models.InstagramIntegrations.find({
    accountId: account._id,
  });
  if (integrations.length > 0) {
    for (const integration of integrations) {
      const response = await removeIntegration(
        subdomain,
        integration.erxesApiId,
      );
      erxesApiIds.push(response);
    }
  }

  await models.InstagramAccounts.deleteOne({ _id });

  return { erxesApiIds };
};

export const repairIntegrations = async (
  subdomain: string,
  integrationId: string,
): Promise<true | Error> => {
  const models = await generateModels(subdomain);
  const integration = await models.InstagramIntegrations.findOne({
    erxesApiId: integrationId,
  });

  if (!integration) {
    throw new Error('Integration not found');
  }

  const pageId = integration.facebookPageId;

  if (!pageId) {
    throw new Error('Page ID not found');
  }

  try {
    const pageTokens = await refreshPageAccesToken(models, pageId, integration);

    await subscribePage(pageId, pageTokens[pageId]);

    await models.InstagramIntegrations.deleteMany({
      erxesApiId: { $ne: integrationId },
      facebookPageIds: pageId,
      kind: integration.kind,
    });
  } catch (e) {
    console.log(e);
  }

  await models.InstagramIntegrations.updateOne(
    { erxesApiId: integrationId },
    { $set: { healthStatus: 'healthy', error: '' } },
  );

  const ENDPOINT_URL = getEnv({ name: 'ENDPOINT_URL' });
  const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });

  let domain = `${DOMAIN}/gateway/pl:instagram`;

  if (process.env.NODE_ENV !== 'production') {
    domain = `${DOMAIN}/pl:instagram`;
  }
  if (ENDPOINT_URL) {
    // send domain to core endpoints
    await fetch(`${ENDPOINT_URL}/update-endpoint`, {
      method: 'POST',
      body: JSON.stringify({
        domain,
        instagramPageId: integration.instagramPageIds?.[0],
        igPageId: integration.instagramPageIds?.[0],
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

  await models.InstagramConfigs.updateConfigs(configsMap);

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

export const instagramGetCustomerPosts = async ({ customerId, subdomain }) => {
  const models = await generateModels(subdomain);

  const customer = await models.InstagramCustomers.findOne({
    erxesApiId: customerId,
  });

  if (!customer) {
    return [];
  }

  const result = await models.InstagramCommentConversation.aggregate([
    { $match: { senderId: customer.userId } },
    {
      $lookup: {
        from: 'posts_conversations_instagrams',
        localField: 'postId',
        foreignField: 'postId',
        as: 'post',
      },
    },
    {
      $unwind: {
        path: '$post',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        conversationId: '$post.erxesApiId',
      },
    },
    {
      $project: { _id: 0, conversationId: 1 },
    },
  ]);

  const conversationIds = result.map((conv) => conv.conversationId);

  return conversationIds;
};

export const instagramCreateIntegration = async (
  subdomain: string,
  { accountId, integrationId, data, kind },
): Promise<{ status: 'success' }> => {
  const models = await generateModels(subdomain);

  const account = await models.InstagramAccounts.getAccount({ _id: accountId });
  if (!account) {
    throw new Error('Account not found');
  }
  const instagramPageIds = JSON.parse(data).pageIds;
  const instagramPageId = Array.isArray(instagramPageIds)
    ? instagramPageIds[0]
    : instagramPageIds;
  const facebookPageIds = await getFacebookPageIdsForInsta(
    account.token,
    instagramPageId,
  );

  if (facebookPageIds) {
    const integration = await models.InstagramIntegrations.create({
      kind,
      accountId,
      erxesApiId: integrationId,
      instagramPageId: instagramPageId.toString(),
      facebookPageId: facebookPageIds.toString(), // Ensure it's a string
    });

    const ENDPOINT_URL = getEnv({ name: 'ENDPOINT_URL' });
    const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });

    let domain = `${DOMAIN}/gateway/pl:instagram`;

    if (process.env.NODE_ENV !== 'production') {
      domain = `${DOMAIN}/pl:instagram`;
    }

    if (ENDPOINT_URL) {
      // Send domain to core endpoints
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
        await models.InstagramIntegrations.deleteOne({ _id: integration._id });
        throw e;
      }
    }

    const facebookPageTokensMap: { [key: string]: string } = {};

    try {
      const pageAccessToken = await getPageAccessToken(
        facebookPageIds,
        account.token,
      );

      facebookPageTokensMap[facebookPageIds] = pageAccessToken;

      try {
        await subscribePage(facebookPageIds, pageAccessToken);
        debugInstagram(`Successfully subscribed page ${facebookPageIds}`);
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

    integration.facebookPageTokensMap = facebookPageTokensMap;

    await integration.save();

    return { status: 'success' };
  } else {
    // Handle the case where facebookPageId is null
    throw new Error('Select Instagram Pages');
  }
};
