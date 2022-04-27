import {
  ConversationMessages as ChatfuelConversationMessages,
  Conversations as ChatfuelConversations,
  Customers as ChatfuelCustomers
} from './chatfuel/models';
import { IModels } from './connectionResolver';
import {
  debugCallPro,
  debugError,
  debugFacebook,
  debugGmail,
  debugNylas,
} from './debuggers';
import {
  getPageAccessToken,
  refreshPageAccesToken,
  subscribePage,
  unsubscribePage
} from './facebook/utils';
import { revokeToken, unsubscribeUser } from './gmail/api';
import {
  ConversationMessages as GmailConversationMessages,
  Conversations as GmailConversations,
  Customers as GmailCustomers
} from './gmail/models';
import { Accounts, Integrations } from './models';
import Configs from './models/Configs';
import { enableOrDisableAccount } from './nylas/api';
import { removeExistingNylasWebhook } from './nylas/auth';
import { setupNylas } from './nylas/controller';
import {
  NylasExchangeConversationMessages,
  NylasExchangeConversations,
  NylasExchangeCustomers,
  NylasGmailConversationMessages,
  NylasGmailConversations,
  NylasGmailCustomers,
  NylasImapConversationMessages,
  NylasImapConversations,
  NylasImapCustomers,
  NylasOffice365ConversationMessages,
  NylasOffice365Conversations,
  NylasOffice365Customers,
  NylasOutlookConversationMessages,
  NylasOutlookConversations,
  NylasOutlookCustomers,
  NylasYahooConversationMessages,
  NylasYahooConversations,
  NylasYahooCustomers
} from './nylas/models';
import { createNylasWebhook } from './nylas/tracker';
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

  const { _id, kind, accountId, erxesApiId, nylasAccountId = "", smoochIntegrationId = "" } = integration;

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

  if (kind === 'gmail' && !integration.nylasToken) {
    debugGmail('Removing gmail entries');

    const conversationIds = await GmailConversations.find(selector).distinct(
      '_id'
    );

    integrationRemoveBy = { email: integration.email };

    await GmailCustomers.deleteMany(selector);
    await GmailConversations.deleteMany(selector);
    await GmailConversationMessages.deleteMany({
      conversationId: { $in: conversationIds }
    });

    try {
      await unsubscribeUser(integration.email);

      if (removeAll) {
        await revokeToken(integration.email);
      }
    } catch (e) {
      debugError('Failed to unsubscribe gmail account');

      if (e.message.includes('Token has been expired or revoked')) {
        return ""
      }

      throw e;
    }
  }

  if (kind === 'gmail' && integration.nylasToken) {
    debugNylas('Removing nylas entries');

    const conversationIds = await NylasGmailConversations.find(
      selector
    ).distinct('_id');

    await NylasGmailCustomers.deleteMany(selector);
    await NylasGmailConversations.deleteMany(selector);
    await NylasGmailConversationMessages.deleteMany({
      conversationId: { $in: conversationIds }
    });

    const { email, googleAccessToken } = integration;

    try {
      // Cancel nylas subscription
      await enableOrDisableAccount(nylasAccountId, false);
      await revokeToken(email, googleAccessToken);
    } catch (e) {
      debugError('Failed to cancel nylas-gmail account subscription');
      throw e;
    }
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

  if (kind === 'imap') {
    debugNylas('Removing nylas-imap entries');

    const conversationIds = await NylasImapConversations.find(
      selector
    ).distinct('_id');

    await NylasImapCustomers.deleteMany(selector);
    await NylasImapConversations.deleteMany(selector);
    await NylasImapConversationMessages.deleteMany({
      conversationId: { $in: conversationIds }
    });

    try {
      // Cancel nylas subscription
      await enableOrDisableAccount(nylasAccountId, false);
    } catch (e) {
      debugError('Failed to cancel subscription of nylas-imap account');
      throw e;
    }
  }

  if (kind === 'office365') {
    debugNylas('Removing nylas-office365 entries');

    const conversationIds = await NylasOffice365Conversations.find(
      selector
    ).distinct('_id');

    await NylasOffice365Customers.deleteMany(selector);
    await NylasOffice365Conversations.deleteMany(selector);
    await NylasOffice365ConversationMessages.deleteMany({
      conversationId: { $in: conversationIds }
    });

    try {
      // Cancel nylas subscription
      await enableOrDisableAccount(nylasAccountId, false);
    } catch (e) {
      debugError('Failed to subscription nylas-office365 account');
      throw e;
    }
  }

  if (kind === 'outlook') {
    debugNylas('Removing nylas-outlook entries');

    const conversationIds = await NylasOutlookConversations.find(
      selector
    ).distinct('_id');

    await NylasOutlookCustomers.deleteMany(selector);
    await NylasOutlookConversations.deleteMany(selector);
    await NylasOutlookConversationMessages.deleteMany({
      conversationId: { $in: conversationIds }
    });

    try {
      // Cancel nylas subscription
      await enableOrDisableAccount(nylasAccountId, false);
    } catch (e) {
      debugError('Failed to subscription nylas-outlook account');
      throw e;
    }
  }

  if (kind === 'exchange') {
    debugNylas('Removing nylas-exchange entries');

    const conversationIds = await NylasYahooConversations.find(
      selector
    ).distinct('_id');

    await NylasExchangeCustomers.deleteMany(selector);
    await NylasExchangeConversations.deleteMany(selector);
    await NylasExchangeConversationMessages.deleteMany({
      conversationId: { $in: conversationIds }
    });

    try {
      // Cancel nylas subscription
      await enableOrDisableAccount(nylasAccountId, false);
    } catch (e) {
      debugError('Failed to subscription nylas-exchange account');
      throw e;
    }
  }

  if (kind === 'yahoo') {
    debugNylas('Removing nylas-yahoo entries');

    const conversationIds = await NylasYahooConversations.find(
      selector
    ).distinct('_id');

    await NylasYahooCustomers.deleteMany(selector);
    await NylasYahooConversations.deleteMany(selector);
    await NylasYahooConversationMessages.deleteMany({
      conversationId: { $in: conversationIds }
    });

    try {
      // Cancel nylas subscription
      await enableOrDisableAccount(nylasAccountId, false);
    } catch (e) {
      debugError('Failed to subscription nylas-yahoo account');
      throw e;
    }
  }

  if (kind === 'chatfuel') {
    debugCallPro('Removing chatfuel entries');

    const conversationIds = await ChatfuelConversations.find(selector).distinct(
      '_id'
    );

    await ChatfuelCustomers.deleteMany(selector);
    await ChatfuelConversations.deleteMany(selector);
    await ChatfuelConversationMessages.deleteMany({
      conversationId: { $in: conversationIds }
    });
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
  await NylasGmailCustomers.deleteMany(selector);
  await NylasOutlookCustomers.deleteMany(selector);
  await NylasOffice365Customers.deleteMany(selector);
  await NylasYahooCustomers.deleteMany(selector);
  await NylasImapCustomers.deleteMany(selector);
  await NylasExchangeCustomers.deleteMany(selector);
  await ChatfuelCustomers.deleteMany(selector);
  await models.CallProCustomers.deleteMany(selector);
};

export const updateIntegrationConfigs = async (configsMap): Promise<void> => {
  const getValueAsString = async name => {
    const entry = await Configs.getConfig(name);

    if (entry.value) {
      return entry.value.toString();
    }

    return entry.value;
  };

  const prevNylasClientId = await getValueAsString('NYLAS_CLIENT_ID');
  const prevNylasClientSecret = await getValueAsString('NYLAS_CLIENT_SECRET');
  const prevNylasWebhook = await getValueAsString('NYLAS_WEBHOOK_CALLBACK_URL');

  const prevSmoochAppKeyId = await getValueAsString('SMOOCH_APP_KEY_ID');
  const prevSmoochAppKeySecret = await getValueAsString(
    'SMOOCH_APP_KEY_SECRET'
  );
  const prevSmoochAppId = await getValueAsString('SMOOCH_APP_ID');
  const prevSmoochWebhook = await getValueAsString(
    'SMOOCH_WEBHOOK_CALLBACK_URL'
  );
  
  await Configs.updateConfigs(configsMap);

  resetConfigsCache();

  const updatedNylasClientId = await getValueAsString('NYLAS_CLIENT_ID');
  const updatedNylasClientSecret = await getValueAsString(
    'NYLAS_CLIENT_SECRET'
  );
  const updatedNylasWebhook = await getValueAsString(
    'NYLAS_WEBHOOK_CALLBACK_URL'
  );

  const updatedSmoochAppKeyId = await getValueAsString('SMOOCH_APP_KEY_ID');
  const updatedSmoochAppKeySecret = await getValueAsString(
    'SMOOCH_APP_KEY_SECRET'
  );
  const updatedSmoochAppId = await getValueAsString('SMOOCH_APP_ID');
  const updatedSmoochWebhook = await getValueAsString(
    'SMOOCH_WEBHOOK_CALLBACK_URL'
  );

  try {
    if (
      prevNylasClientId !== updatedNylasClientId ||
      prevNylasClientSecret !== updatedNylasClientSecret
    ) {
      await setupNylas();

      await removeExistingNylasWebhook();
      await createNylasWebhook();
    }

    if (prevNylasWebhook !== updatedNylasWebhook) {
      await removeExistingNylasWebhook();
      await createNylasWebhook();
    }
  } catch (e) {
    debugError(e.message);
    throw e;
  }
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
