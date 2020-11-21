import * as smoochApi from './smooch/api';
import * as twitterApi from './twitter/api';

import {
  Conversations as CallProConversations,
  Customers as CallProCustomers
} from './callpro/models';
import {
  ConversationMessages as ChatfuelConversationMessages,
  Conversations as ChatfuelConversations,
  Customers as ChatfuelCustomers
} from './chatfuel/models';
import {
  debugCallPro,
  debugFacebook,
  debugGmail,
  debugNylas,
  debugSmooch,
  debugTelnyx,
  debugTwitter,
  debugWhatsapp
} from './debuggers';
import {
  Comments as FacebookComments,
  ConversationMessages as FacebookConversationMessages,
  Conversations as FacebookConversations,
  Customers as FacebookCustomers,
  Posts as FacebookPosts
} from './facebook/models';
import { getPageAccessToken, unsubscribePage } from './facebook/utils';
import {
  ConversationMessages as GmailConversationMessages,
  Conversations as GmailConversations,
  Customers as GmailCustomers
} from './gmail/models';
import { Accounts, Integrations } from './models';
import { removeExistingNylasWebhook } from './nylas/auth';
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
import {
  SmoochLineConversationMessages,
  SmoochLineConversations,
  SmoochLineCustomers,
  SmoochTelegramConversationMessages,
  SmoochTelegramConversations,
  SmoochTelegramCustomers,
  SmoochTwilioConversationMessages,
  SmoochTwilioConversations,
  SmoochTwilioCustomers,
  SmoochViberConversationMessages,
  SmoochViberConversations,
  SmoochViberCustomers
} from './smooch/models';
import {
  ConversationMessages as TelnyxConversationMessages,
  Conversations as TelnyxConversations,
  Customers as TelnyxCustomers
} from './telnyx/models';
import { getTwitterConfig, unsubscribe } from './twitter/api';
import {
  ConversationMessages as TwitterConversationMessages,
  Conversations as TwitterConversations,
  Customers as TwitterCustomers
} from './twitter/models';
import { getEnv, resetConfigsCache, sendRequest } from './utils';
import { logout, setupChatApi as setupWhatsapp } from './whatsapp/api';
import {
  ConversationMessages as WhatsappConversationMessages,
  Conversations as WhatsappConversations,
  Customers as WhatsappCustomers
} from './whatsapp/models';

import { revokeToken, unsubscribeUser } from './gmail/api';
import Configs from './models/Configs';
import { enableOrDisableAccount } from './nylas/api';
import { setupNylas } from './nylas/controller';
import { createNylasWebhook } from './nylas/tracker';

export const removeIntegration = async (
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
        debugFacebook(
          `Error ocurred while trying to get page access token with ${e.message}`
        );
        throw e;
      }

      await FacebookPosts.deleteMany({ recipientId: pageId });
      await FacebookComments.deleteMany({ recipientId: pageId });

      try {
        await unsubscribePage(pageId, pageTokenResponse);
      } catch (e) {
        debugFacebook(
          `Error occured while trying to unsubscribe page pageId: ${pageId}`
        );
        throw e;
      }
    }

    integrationRemoveBy = { fbPageIds: integration.facebookPageIds };

    const conversationIds = await FacebookConversations.find(selector).distinct(
      '_id'
    );

    await FacebookCustomers.deleteMany({
      integrationId: integrationErxesApiId
    });
    await FacebookConversations.deleteMany(selector);
    await FacebookConversationMessages.deleteMany({
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
      debugGmail('Failed to unsubscribe gmail account');
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

    try {
      // Cancel nylas subscription
      await enableOrDisableAccount(integration.nylasAccountId, false);
    } catch (e) {
      debugNylas('Failed to cancel nylas-gmail account subscription');
      throw e;
    }
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

    const conversationIds = await TwitterConversations.find(selector).distinct(
      '_id'
    );

    try {
      unsubscribe(account.uid);
    } catch (e) {
      debugNylas('Failed to unsubscribe twitter account');
      throw e;
    }

    await TwitterConversationMessages.deleteMany(selector);
    await TwitterConversations.deleteMany({
      conversationId: { $in: conversationIds }
    });
    await TwitterCustomers.deleteMany(selector);
  }

  if (kind === 'whatsapp') {
    debugWhatsapp('Removing whatsapp entries');

    try {
      await logout(integration.whatsappinstanceId, integration.whatsappToken);
    } catch (e) {
      debugWhatsapp('Failed to logout WhatsApp account');
      throw e;
    }

    const conversationIds = await WhatsappConversations.find(selector).distinct(
      '_id'
    );

    await WhatsappConversationMessages.deleteMany({
      conversationId: { $in: conversationIds }
    });
    await WhatsappConversations.deleteMany(selector);
    await WhatsappCustomers.deleteMany(selector);
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
      await enableOrDisableAccount(integration.nylasAccountId, false);
    } catch (e) {
      debugNylas('Failed to cancel subscription of nylas-imap account');
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
      await enableOrDisableAccount(integration.nylasAccountId, false);
    } catch (e) {
      debugNylas('Failed to subscription nylas-office365 account');
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
      await enableOrDisableAccount(integration.nylasAccountId, false);
    } catch (e) {
      debugNylas('Failed to subscription nylas-outlook account');
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
      await enableOrDisableAccount(integration.nylasAccountId, false);
    } catch (e) {
      debugNylas('Failed to subscription nylas-exchange account');
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
      await enableOrDisableAccount(integration.nylasAccountId, false);
    } catch (e) {
      debugNylas('Failed to subscription nylas-yahoo account');
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

  if (kind === 'telegram') {
    debugSmooch('Removing Telegram entries');
    const conversationIds = await SmoochTelegramConversations.find(
      selector
    ).distinct('_id');
    try {
      await smoochApi.removeIntegration(integration.smoochIntegrationId);
    } catch (e) {
      throw e;
    }

    await SmoochTelegramCustomers.deleteMany(selector);
    await SmoochTelegramConversations.deleteMany(selector);
    await SmoochTelegramConversationMessages.deleteMany({
      conversationId: { $in: conversationIds }
    });
  }

  if (kind === 'viber') {
    debugSmooch('Removing Viber entries');
    const conversationIds = await SmoochViberConversations.find(
      selector
    ).distinct('_id');

    try {
      await smoochApi.removeIntegration(integration.smoochIntegrationId);
    } catch (e) {
      throw e;
    }

    await SmoochViberCustomers.deleteMany(selector);
    await SmoochViberConversations.deleteMany(selector);
    await SmoochViberConversationMessages.deleteMany({
      conversationId: { $in: conversationIds }
    });
  }

  if (kind === 'line') {
    debugSmooch('Removing Line entries');
    const conversationIds = await SmoochLineConversations.find(
      selector
    ).distinct('_id');

    try {
      await smoochApi.removeIntegration(integration.smoochIntegrationId);
    } catch (e) {
      throw e;
    }

    await SmoochLineCustomers.deleteMany(selector);
    await SmoochLineConversations.deleteMany(selector);
    await SmoochLineConversationMessages.deleteMany({
      conversationId: { $in: conversationIds }
    });
  }

  if (kind === 'twilio') {
    debugSmooch('Removing Twilio entries');
    const conversationIds = await SmoochTwilioConversations.find(
      selector
    ).distinct('_id');

    try {
      await smoochApi.removeIntegration(integration.smoochIntegrationId);
    } catch (e) {
      throw e;
    }

    await SmoochTwilioCustomers.deleteMany(selector);
    await SmoochTwilioConversations.deleteMany(selector);
    await SmoochTwilioConversationMessages.deleteMany({
      conversationId: { $in: conversationIds }
    });
  }

  if (kind === 'telnyx') {
    debugTelnyx('Removing telnyx entries');

    const conversationIds = await TelnyxConversations.find(selector).distinct(
      '_id'
    );

    try {
      await TelnyxCustomers.deleteMany(selector);
      await TelnyxConversations.deleteMany(selector);
      await TelnyxConversationMessages.deleteMany({
        conversationId: { $in: conversationIds }
      });
    } catch (e) {
      throw new Error(e.message);
    }
  }

  await Integrations.deleteOne({ _id });

  return erxesApiId;
};

export const removeAccount = async (
  _id: string
): Promise<{ erxesApiIds: string | string[] } | Error> => {
  const account = await Accounts.findOne({ _id });

  if (!account) {
    return new Error(`Account not found: ${_id}`);
  }

  const erxesApiIds = [];

  const integrations = await Integrations.find({ accountId: account._id });

  if (integrations.length) {
    for (const integration of integrations) {
      try {
        const response = await removeIntegration(integration.erxesApiId, true);
        erxesApiIds.push(response);
      } catch (e) {
        throw e;
      }
    }
  }

  await Accounts.deleteOne({ _id });

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
  await NylasExchangeCustomers.deleteMany(selector);
  await ChatfuelCustomers.deleteMany(selector);
  await CallProCustomers.deleteMany(selector);
  await TwitterCustomers.deleteMany(selector);
  await SmoochTelegramCustomers.deleteMany(selector);
  await SmoochViberCustomers.deleteMany(selector);
  await SmoochLineCustomers.deleteMany(selector);
  await SmoochTwilioCustomers.deleteMany(selector);
  await WhatsappCustomers.deleteMany(selector);
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

  const prevChatApiWebhook = await getValueAsString(
    'CHAT_API_WEBHOOK_CALLBACK_URL'
  );
  const prevChatApiUID = await getValueAsString('CHAT_API_UID');
  const prevTwitterConfig = await getTwitterConfig();

  await Configs.updateConfigs(configsMap);

  resetConfigsCache();

  const updatedTwitterConfig = await getTwitterConfig();

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
  const updatedChatApiWebhook = await getValueAsString(
    'CHAT_API_WEBHOOK_CALLBACK_URL'
  );
  const updatedChatApiUID = await getValueAsString('CHAT_API_UID');

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
    debugNylas(e.message);
    throw e;
  }

  try {
    if (
      prevTwitterConfig.oauth.consumer_key !==
        updatedTwitterConfig.oauth.consumer_key ||
      prevTwitterConfig.oauth.consumer_secret !==
        updatedTwitterConfig.oauth.consumer_secret
    ) {
      await twitterApi.registerWebhook();
    }
    if (
      prevTwitterConfig.oauth.token !== updatedTwitterConfig.oauth.token ||
      prevTwitterConfig.oauth.token_secret !==
        prevTwitterConfig.oauth.token_secret ||
      prevTwitterConfig.twitterWebhookEnvironment !==
        updatedTwitterConfig.twitterWebhookEnvironment
    ) {
      await twitterApi.registerWebhook();
    }
  } catch (e) {
    debugTwitter(e);
  }

  try {
    if (
      prevSmoochAppKeyId !== updatedSmoochAppKeyId ||
      prevSmoochAppKeySecret !== updatedSmoochAppKeySecret ||
      prevSmoochAppId !== updatedSmoochAppId
    ) {
      await smoochApi.setupSmooch();
      await smoochApi.setupSmoochWebhook();
    }

    if (prevSmoochWebhook !== updatedSmoochWebhook) {
      await smoochApi.setupSmoochWebhook();
    }
  } catch (e) {
    debugSmooch(e);
  }

  if (
    prevChatApiWebhook !== updatedChatApiWebhook ||
    prevChatApiUID !== updatedChatApiUID
  ) {
    try {
      await setupWhatsapp();
    } catch (e) {
      debugWhatsapp(e);
    }
  }
};
