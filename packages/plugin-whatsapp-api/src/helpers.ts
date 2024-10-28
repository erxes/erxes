import { IModels } from './connectionResolver';
import { debugError, debugWhatsapp } from './debuggers';
import {
  getPageAccessToken,
  refreshPageAccesToken,
  subscribePage,
  unsubscribePage,
  getFacebookPageIdsForInsta
} from './utils';
import { getEnv, resetConfigsCache } from './commonUtils';
import fetch from 'node-fetch';

export const removeIntegration = async (
  subdomain: string,
  models: IModels,
  integrationErxesApiId: string
): Promise<string> => {
  // Remove from core =========
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

  if (!account) {
    throw new Error('Account not found');
  }

  const selector = { integrationId: _id };

  if (kind.includes('whatsapp')) {
    debugWhatsapp('Removing entries');

    const pageId = integration.whatsappNumberIds;

    if (!pageId) {
      throw new Error('Facebook page ID not found');
    }

    try {
      // const pageTokenResponse = await getPageAccessToken(pageId, account.token);

      await models.PostConversations.deleteMany({ recipientId: pageId });
      await models.CommentConversation.deleteMany({ recipientId: pageId });

      try {
        // await unsubscribePage(pageId, pageTokenResponse);
      } catch (e) {
        debugError(
          `Error occurred while trying to unsubscribe page pageId: ${pageId}`
        );
      }
    } catch (e) {
      debugError(
        `Error occurred while trying to get page access token with ${e.message}`
      );
    }

    integrationRemoveBy = { fbPageIds: integration.whatsappNumberIds };

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

  let pageId = integration.whatsappNumberIds;

  if (!pageId) {
    throw new Error('Page ID not found');
  }

  try {
    // const pageTokens = await refreshPageAccesToken(models, pageId, integration);

    // await subscribePage(pageId, pageTokens[pageId]);

    await models.Integrations.deleteMany({
      erxesApiId: { $ne: integrationId },
      facebookPageIds: pageId,
      kind: integration.kind
    });
  } catch (e) {
    console.log(e);
  }

  await models.Integrations.updateOne(
    { erxesApiId: integrationId },
    { $set: { healthStatus: 'healthy', error: '' } }
  );

  const ENDPOINT_URL = getEnv({ name: 'ENDPOINT_URL' });
  const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });

  if (ENDPOINT_URL) {
    // send domain to core endpoints
    try {
      await fetch(`${ENDPOINT_URL}/update-endpoint`, {
        method: 'POST',
        body: JSON.stringify({
          domain: `${DOMAIN}/gateway/pl:whatsapp`,
          facebookPageId: integration.whatsappNumberIds,
          fbPageIds: integration.whatsappNumberIds
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

export const whatsappGetCustomerPosts = async (
  models: IModels,
  { customerId }
) => {
  const customer = await models.Customers.findOne({ erxesApiId: customerId });

  if (!customer) {
    return [];
  }

  const result = await models.CommentConversation.aggregate([
    { $match: { senderId: customer.userId } },
    {
      $lookup: {
        from: 'posts_conversations_whatsapps',
        localField: 'postId',
        foreignField: 'postId',
        as: 'post'
      }
    },
    {
      $unwind: {
        path: '$post',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $addFields: {
        conversationId: '$post.erxesApiId'
      }
    },
    {
      $project: { _id: 0, conversationId: 1 }
    }
  ]);

  const conversationIds = result.map((conv) => conv.conversationId);

  return conversationIds;
};

export const whatsappCreateIntegration = async (
  subdomain: string,
  models: IModels,
  { accountId, integrationId, data, kind }
): Promise<{ status: 'success' }> => {
  console.log(data, 'data');
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

  let domain = `${DOMAIN}/gateway/pl:facebook`;

  if (process.env.NODE_ENV !== 'production') {
    domain = `${DOMAIN}/pl:facebook`;
  }

  if (ENDPOINT_URL) {
    // send domain to core endpoints
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

  // const facebookPageTokensMap: { [key: string]: string } = {};

  // for (const pageId of whatsAppNumberIds) {
  //   console.log(pageId, 'asdkopasdkaps');
  //   try {
  //     const pageAccessToken = await getPageAccessToken(pageId, account.token);

  //     facebookPageTokensMap[pageId] = pageAccessToken;

  //     try {
  //       await subscribePage(pageId, pageAccessToken);
  //       debugWhatsapp(`Successfully subscribed page ${pageId}`);
  //     } catch (e) {
  //       debugError(
  //         `Error ocurred while trying to subscribe page ${e.message || e}`
  //       );
  //       throw e;
  //     }
  //   } catch (e) {
  //     debugError(
  //       `Error ocurred while trying to get page access token with ${
  //         e.message || e
  //       }`
  //     );

  //     throw e;
  //   }
  // }

  // integration.facebookPageTokensMap = facebookPageTokensMap;

  await integration.save();

  return { status: 'success' };
};
