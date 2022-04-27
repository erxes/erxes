import { IModels } from './connectionResolver';
import {
  debugCallPro,
  debugError,
  debugFacebook,
} from './debuggers';
import {
  getPageAccessToken,
  refreshPageAccesToken,
  subscribePage,
  unsubscribePage
} from './facebook/utils';
import { Accounts, Integrations } from './models';
import Configs from './models/Configs';
import { getEnv, resetConfigsCache, sendRequest } from './utils';

export const removeIntegration = async (
  models: IModels,
  integrationErxesApiId: string,
  removeAll: boolean = false
): Promise<string> => {
  const integration = await Integrations.findOne({
    erxesApiId: integrationErxesApiId
  });

  if (!integration) {
    throw new Error('Integration not found');
  }

  // Remove endpoint
  let integrationRemoveBy;

  const { _id, kind, accountId, erxesApiId  } = integration;

  const account = await Accounts.findOne({ _id: accountId });
  
  const selector = { integrationId: _id };

  if (kind.includes('facebook')) {
    debugFacebook('Removing  entries');


    if(!account)  {
      throw new Error("Account not found");
      
    }

    for (const pageId of integration.facebookPageIds || []) {
      let pageTokenResponse;

      try {
        pageTokenResponse = await getPageAccessToken(pageId, account.token);
      } catch (e) {
        debugError(
          `Error ocurred while trying to get page access token with ${e.message}`
        );
        throw e;
      }

      await models.FbPosts.deleteMany({ recipientId: pageId });
      await models.FbComments.deleteMany({ recipientId: pageId });

      try {
        await unsubscribePage(pageId, pageTokenResponse);
      } catch (e) {
        debugError(
          `Error occured while trying to unsubscribe page pageId: ${pageId}`
        );
        throw e;
      }
    }

    integrationRemoveBy = { fbPageIds: integration.facebookPageIds };

    const conversationIds = await models.FbConversations.find(selector).distinct(
      '_id'
    );

    await models.FbCustomers.deleteMany({
      integrationId: integrationErxesApiId
    });

    await models.FbConversations.deleteMany(selector);
    await models.FbConversationMessages.deleteMany({
      conversationId: { $in: conversationIds }
    });

    await Integrations.deleteOne({ _id });
  }

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

  await Integrations.deleteOne({ _id });

  return erxesApiId;
};

export const removeAccount = async (
  models: IModels,
  _id: string
): Promise<{ erxesApiIds: string | string[] } | Error> => {
  const account = await Accounts.findOne({ _id });

  if (!account) {
    return new Error(`Account not found: ${_id}`);
  }

  const erxesApiIds: string[] = [];

  const integrations = await Integrations.find({ accountId: account._id });

  if (integrations.length > 0) {
    for (const integration of integrations) {
      try {
        const response = await removeIntegration(models, integration.erxesApiId, true);
        erxesApiIds.push(response);
      } catch (e) {
        throw e;
      }
    }
  }

  await Accounts.deleteOne({ _id });

  return { erxesApiIds };
};

export const repairIntegrations = async (
  integrationId: string
): Promise<true | Error> => {
  const integration = await Integrations.findOne({ erxesApiId: integrationId });

  if(!integration) {
    throw new Error('Integration not found')
  }

  for (const pageId of integration.facebookPageIds || []) {
    const pageTokens = await refreshPageAccesToken(pageId, integration);

    await subscribePage(pageId, pageTokens[pageId]);

    await Integrations.remove({
      erxesApiId: { $ne: integrationId },
      facebookPageIds: pageId,
      kind: integration.kind
    });
  }

  await Integrations.updateOne(
    { erxesApiId: integrationId },
    { $set: { healthStatus: 'healthy', error: '' } }
  );

  return true;
};

export const removeCustomers = async (models: IModels, params) => {
  const { customerIds } = params;
  const selector = { erxesApiId: { $in: customerIds } };

  await models.FbCustomers.deleteMany(selector);
  await models.CallProCustomers.deleteMany(selector);
};

export const updateIntegrationConfigs = async (configsMap): Promise<void> => {
  await Configs.updateConfigs(configsMap);

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
