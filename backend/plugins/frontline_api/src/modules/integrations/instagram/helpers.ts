import { generateModels } from '~/connectionResolvers';
import { debugError } from './debuggers';
import {
  getPageAccessToken,
  refreshPageAccesToken,
  subscribePage,
  unsubscribePage,
  getFacebookPageIdsForInsta,
} from './utils';
import { getEnv, resetConfigsCache } from 'erxes-api-shared/utils';
import fetch from 'node-fetch';
import { z } from 'zod';
import { INTEGRATION_KINDS } from './constants';
import { getErrorMessage } from '@/integrations/utils';

const syncInstagramEndpoint = async (
  subdomain: string,
  action: 'register' | 'update' | 'remove',
  instagramPageId: string | undefined,
): Promise<void> => {
  const endpoint = getEnv({ name: 'ENDPOINT_URL' });
  if (!endpoint) return;
  if (!instagramPageId) throw new Error('Instagram page ID not found');

  const domain = getEnv({ name: 'DOMAIN', subdomain });
  const path =
    process.env.NODE_ENV === 'production'
      ? '/gateway/pl:frontline'
      : '/pl:frontline';
  const response = await fetch(`${endpoint}/${action}-endpoint`, {
    method: 'POST',
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      domain: `${domain}${path}`,
      instagramPageId,
      igPageId: instagramPageId,
    }),
  });
  if (!response.ok) {
    throw new Error(
      `Instagram endpoint ${action} failed (HTTP ${response.status})`,
    );
  }
};

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

  const { _id, kind, accountId, erxesApiId, instagramPageId, facebookPageId } =
    integration;
  const selector = { integrationId: _id };
  if (kind === INTEGRATION_KINDS.POST && instagramPageId) {
    await models.InstagramPostConversations.deleteMany({
      recipientId: instagramPageId,
    });
    await models.InstagramCommentConversation.deleteMany({
      recipientId: instagramPageId,
    });
    await models.InstagramCommentConversationReply.deleteMany({
      recipientId: instagramPageId,
    });
  } else if (kind === INTEGRATION_KINDS.MESSENGER) {
    const conversationIds = await models.InstagramConversations.find(
      selector,
    ).distinct('_id');
    await models.InstagramConversations.deleteMany(selector);
    await models.InstagramConversationMessages.deleteMany({
      conversationId: { $in: conversationIds },
    });
  }

  // Like Discord bot removal, detach locally before cleaning up the last
  // provider subscription. Post and Messenger share these remote resources.
  await models.InstagramIntegrations.deleteOne({ _id });
  const remainingInstagram = await models.InstagramIntegrations.countDocuments({
    instagramPageId,
  });
  if (!remainingInstagram && instagramPageId) {
    await models.InstagramCustomers.deleteMany({
      integrationId: integrationErxesApiId,
    });
    try {
      await syncInstagramEndpoint(subdomain, 'remove', instagramPageId);
    } catch (error) {
      debugError(
        `Instagram endpoint cleanup failed: ${getErrorMessage(error)}`,
      );
    }
  }
  if (
    facebookPageId &&
    !(await models.InstagramIntegrations.countDocuments({ facebookPageId }))
  ) {
    try {
      const account = await models.InstagramAccounts.findOne({
        _id: accountId,
      });
      if (account) {
        const token = await getPageAccessToken(facebookPageId, account.token);
        await unsubscribePage(facebookPageId, token);
      }
    } catch (error) {
      debugError(
        `Instagram subscription cleanup failed: ${getErrorMessage(error)}`,
      );
    }
  }

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
    await syncInstagramEndpoint(
      subdomain,
      'update',
      integration.instagramPageId,
    );
  } catch (error) {
    await models.InstagramIntegrations.markUnhealthy(
      { erxesApiId: integrationId },
      'error',
      getErrorMessage(error),
    );
    throw error;
  }

  await models.InstagramIntegrations.deleteMany({
    erxesApiId: { $ne: integrationId },
    facebookPageIds: pageId,
    kind: integration.kind,
  });

  await models.InstagramIntegrations.updateOne(
    { erxesApiId: integrationId },
    { $set: { healthStatus: 'healthy', error: '' } },
  );

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

const integrationDataSchema = z.object({
  pageIds: z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]),
});

export const instagramCreateIntegration = async (
  subdomain: string,
  {
    accountId,
    integrationId,
    data,
    kind,
  }: {
    accountId: string;
    integrationId: string;
    data: string;
    kind: string;
  },
): Promise<{ status: 'success' }> => {
  const models = await generateModels(subdomain);
  const account = await models.InstagramAccounts.getAccount({ _id: accountId });
  if (!account) throw new Error('Account not found');

  const { pageIds } = integrationDataSchema.parse(JSON.parse(data));
  const instagramPageId = Array.isArray(pageIds) ? pageIds[0] : pageIds;
  const facebookPageId = await getFacebookPageIdsForInsta(
    account.token,
    instagramPageId,
  );
  if (!facebookPageId) throw new Error('Select Instagram Pages');

  // Resolve credentials before persisting a provider row. The outer inbox
  // registration already rolls back its own integration on failure.
  const pageAccessToken = await getPageAccessToken(
    facebookPageId,
    account.token,
  );
  const integration = await models.InstagramIntegrations.create({
    kind,
    accountId,
    erxesApiId: integrationId,
    instagramPageId,
    facebookPageId: facebookPageId.toString(),
    facebookPageTokensMap: { [facebookPageId]: pageAccessToken },
  });
  try {
    await subscribePage(facebookPageId, pageAccessToken);
    await syncInstagramEndpoint(subdomain, 'register', instagramPageId);
  } catch (error) {
    await models.InstagramIntegrations.deleteOne({ _id: integration._id });
    throw error;
  }
  return { status: 'success' };
};
