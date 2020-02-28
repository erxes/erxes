import { Conversations as CallProConversations, Customers as CallProCustomers } from './callpro/models';
import {
  ConversationMessages as ChatfuelConversationMessages,
  Conversations as ChatfuelConversations,
  Customers as ChatfuelCustomers,
} from './chatfuel/models';
import { debugCallPro, debugFacebook, debugGmail, debugNylas, debugTwitter } from './debuggers';
import {
  Comments as FacebookComments,
  ConversationMessages as FacebookConversationMessages,
  Conversations as FacebookConversations,
  Customers as FacebookCustomers,
  Posts as FacebookPosts,
} from './facebook/models';
import { getPageAccessToken, unsubscribePage } from './facebook/utils';
import {
  ConversationMessages as GmailConversationMessages,
  Conversations as GmailConversations,
  Customers as GmailCustomers,
} from './gmail/models';
import { getCredentialsByEmailAccountId } from './gmail/util';
import { stopPushNotification } from './gmail/watch';
import { Accounts, Integrations } from './models';
import Configs from './models/Configs';
import { enableOrDisableAccount, removeExistingNylasWebhook } from './nylas/auth';
import { setupNylas } from './nylas/controller';
import {
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
  NylasYahooCustomers,
} from './nylas/models';
import { createNylasWebhook } from './nylas/tracker';
import { unsubscribe } from './twitter/api';
import {
  ConversationMessages as TwitterConversationMessages,
  Conversations as TwitterConversations,
  Customers as TwitterCustomers,
} from './twitter/models';
import { getEnv, resetConfigsCache, sendRequest } from './utils';

export const removeIntegration = async (integrationErxesApiId: string): Promise<string> => {
  const integration = await Integrations.findOne({ erxesApiId: integrationErxesApiId });

  if (!integration) {
    return;
  }

  // Remove endpoint
  let integrationRemoveBy;

  const { _id, kind, accountId, erxesApiId } = integration;
  const account = await Accounts.findOne({ _id: accountId });

  const selector = { integrationId: _id };

  if (kind.includes('facebook')) {
    debugFacebook('Removing  entries');

    for (const pageId of integration.facebookPageIds) {
      let pageTokenResponse;

      try {
        pageTokenResponse = await getPageAccessToken(pageId, account.token);
      } catch (e) {
        debugFacebook(`Error ocurred while trying to get page access token with ${e.message}`);
      }

      await FacebookPosts.deleteMany({ recipientId: pageId });
      await FacebookComments.deleteMany({ recipientId: pageId });
      await unsubscribePage(pageId, pageTokenResponse);
    }

    integrationRemoveBy = { fbPageIds: integration.facebookPageIds };

    const conversationIds = await FacebookConversations.find(selector).distinct('_id');

    await FacebookCustomers.deleteMany({ integrationId: integrationErxesApiId });
    await FacebookConversations.deleteMany(selector);
    await FacebookConversationMessages.deleteMany({ conversationId: { $in: conversationIds } });

    await Integrations.deleteOne({ _id });
  }

  if (kind === 'gmail' && !account.nylasToken) {
    debugGmail('Removing gmail entries');

    const credentials = await getCredentialsByEmailAccountId({ email: account.uid });
    const conversationIds = await GmailConversations.find(selector).distinct('_id');

    integrationRemoveBy = { email: integration.email };

    await stopPushNotification(account.uid, credentials);

    await GmailCustomers.deleteMany(selector);
    await GmailConversations.deleteMany(selector);
    await GmailConversationMessages.deleteMany({ conversationId: { $in: conversationIds } });
  }

  if (kind === 'gmail' && account.nylasToken) {
    debugNylas('Removing nylas entries');

    const conversationIds = await NylasGmailConversations.find(selector).distinct('_id');

    await NylasGmailCustomers.deleteMany(selector);
    await NylasGmailConversations.deleteMany(selector);
    await NylasGmailConversationMessages.deleteMany({ conversationId: { $in: conversationIds } });

    // Cancel nylas subscription
    await enableOrDisableAccount(account.uid, false);
  }

  if (kind === 'callpro') {
    debugCallPro('Removing callpro entries');

    await CallProConversations.find(selector).distinct('_id');

    integrationRemoveBy = { phoneNumber: integration.phoneNumber };

    await CallProCustomers.deleteMany(selector);
    await CallProConversations.deleteMany(selector);
  }

  if (kind === 'twitter-dm') {
    debugTwitter('Removing twitter entries');

    const conversationIds = await TwitterConversations.find(selector).distinct('_id');

    unsubscribe(account.uid);

    await TwitterConversationMessages.deleteMany(selector);
    await TwitterConversations.deleteMany(selector);
    await TwitterCustomers.deleteMany({ conversationId: { $in: conversationIds } });
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
          ...integrationRemoveBy,
        },
      });
    } catch (e) {
      throw new Error(e.message);
    }
  }

  if (kind === 'imap') {
    debugNylas('Removing nylas-imap entries');

    const conversationIds = await NylasImapConversations.find(selector).distinct('_id');

    await NylasImapCustomers.deleteMany(selector);
    await NylasImapConversations.deleteMany(selector);
    await NylasImapConversationMessages.deleteMany({ conversationId: { $in: conversationIds } });

    // Cancel nylas subscription
    await enableOrDisableAccount(account.uid, false);
  }

  if (kind === 'office365') {
    debugNylas('Removing nylas-office365 entries');

    const conversationIds = await NylasOffice365Conversations.find(selector).distinct('_id');

    await NylasOffice365Customers.deleteMany(selector);
    await NylasOffice365Conversations.deleteMany(selector);
    await NylasOffice365ConversationMessages.deleteMany({ conversationId: { $in: conversationIds } });

    // Cancel nylas subscription
    await enableOrDisableAccount(account.uid, false);
  }

  if (kind === 'outlook') {
    debugNylas('Removing nylas-outlook entries');

    const conversationIds = await NylasOutlookConversations.find(selector).distinct('_id');

    await NylasOutlookCustomers.deleteMany(selector);
    await NylasOutlookConversations.deleteMany(selector);
    await NylasOutlookConversationMessages.deleteMany({ conversationId: { $in: conversationIds } });

    // Cancel nylas subscription
    await enableOrDisableAccount(account.uid, false);
  }

  if (kind === 'yahoo') {
    debugNylas('Removing nylas-yahoo entries');

    const conversationIds = await NylasYahooConversations.find(selector).distinct('_id');

    await NylasYahooCustomers.deleteMany(selector);
    await NylasYahooConversations.deleteMany(selector);
    await NylasYahooConversationMessages.deleteMany({ conversationId: { $in: conversationIds } });

    // Cancel nylas subscription
    await enableOrDisableAccount(account.uid, false);
  }

  if (kind === 'chatfuel') {
    debugCallPro('Removing chatfuel entries');

    const conversationIds = await ChatfuelConversations.find(selector).distinct('_id');

    await ChatfuelCustomers.deleteMany(selector);
    await ChatfuelConversations.deleteMany(selector);
    await ChatfuelConversationMessages.deleteMany({ conversationId: { $in: conversationIds } });
  }

  await Integrations.deleteOne({ _id });

  return erxesApiId;
};

export const removeAccount = async (_id: string): Promise<{ erxesApiIds: string | string[] }> => {
  const account = await Accounts.findOne({ _id });

  if (!account) {
    return;
  }

  const erxesApiIds = [];

  const integrations = await Integrations.find({ accountId: account._id });

  for (const integration of integrations) {
    erxesApiIds.push(await removeIntegration(integration.erxesApiId));
  }

  return { erxesApiIds };
};

export const removeCustomers = async params => {
  const { customerIds } = params;
  const selector = { erxesApiId: { $in: customerIds } };

  await FacebookCustomers.deleteMany(selector);
  await NylasGmailCustomers.deleteMany(selector);
  await NylasOutlookCustomers.deleteMany(selector);
  await NylasOffice365Customers.deleteMany(selector);
  await NylasYahooCustomers.deleteMany(selector);
  await NylasImapCustomers.deleteMany(selector);
  await ChatfuelCustomers.deleteMany(selector);
  await CallProCustomers.deleteMany(selector);
  await TwitterCustomers.deleteMany(selector);
};

export const updateIntegrationConfigs = async (configsMap): Promise<void> => {
  try {
    const prevNylasClientId = await Configs.getConfig('NYLAS_CLIENT_ID');
    const prevNylasClientSecret = await Configs.getConfig('NYLAS_CLIENT_SECRET');
    const prevNylasWebhook = await Configs.getConfig('NYLAS_WEBHOOK_CALLBACK_URL');

    await Configs.updateConfigs(configsMap);

    resetConfigsCache();

    const updatedNylasClientId = await Configs.getConfig('NYLAS_CLIENT_ID');
    const updatedNylasClientSecret = await Configs.getConfig('NYLAS_CLIENT_SECRET');
    const updatedNylasWebhook = await Configs.getConfig('NYLAS_WEBHOOK_CALLBACK_URL');

    if (
      prevNylasClientId.value.toString() !== updatedNylasClientId.value.toString() ||
      prevNylasClientSecret.value.toString() !== updatedNylasClientSecret.value.toString()
    ) {
      await setupNylas();

      await removeExistingNylasWebhook();
      await createNylasWebhook();
    }

    if (prevNylasWebhook.value.toString() !== updatedNylasWebhook.value.toString()) {
      await removeExistingNylasWebhook();
      await createNylasWebhook();
    }
  } catch (e) {
    throw e;
  }
};
