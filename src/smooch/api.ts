import * as request from 'request-promise';
import * as Smooch from 'smooch-core';
import { debugSmooch } from '../debuggers';
import { Integrations } from '../models';
import { getConfig } from '../utils';
import { TELEGRAM_API_URL } from './constants';
import {
  createOrGetSmoochConversation as storeConversation,
  createOrGetSmoochConversationMessage as storeMessage,
  createOrGetSmoochCustomer as storeCustomer,
} from './store';
import {
  IAttachment,
  ISmoochConversationArguments,
  ISmoochConversationMessageArguments,
  ISmoochCustomerArguments,
  ISmoochCustomerInput,
} from './types';

export const getSmoochConfig = async () => {
  return {
    SMOOCH_APP_ID: await getConfig('SMOOCH_APP_ID'),
    SMOOCH_APP_KEY_ID: await getConfig('SMOOCH_APP_KEY_ID'),
    SMOOCH_SMOOCH_APP_KEY_SECRET: await getConfig('SMOOCH_APP_KEY_SECRET'),
    SMOOCH_WEBHOOK_CALLBACK_URL: await getConfig('SMOOCH_WEBHOOK_CALLBACK_URL'),
  };
};

let smooch: Smooch;

const saveCustomer = async (customer: ISmoochCustomerInput) => {
  const { smoochIntegrationId, smoochUserId, surname, givenName, email, phone, avatarUrl } = customer;
  const integration = await Integrations.findOne({ smoochIntegrationId });

  if (!integration) {
    return debugSmooch('Integration not found with smoochIntegrationId: ', smoochIntegrationId);
  }

  const doc = <ISmoochCustomerArguments>{
    kind: integration.kind,
    smoochUserId,
    integrationIds: {
      id: integration._id,
      erxesApiId: integration.erxesApiId,
    },
    surname,
    givenName,
    email,
    phone,
    avatarUrl,
  };

  return storeCustomer(doc);
};

const saveConversation = async (
  smoochIntegrationId: string,
  smoochConversationId: string,
  customerId: string,
  content: string,
  received: number,
) => {
  const integration = await Integrations.findOne({ smoochIntegrationId });

  if (!integration) {
    return debugSmooch('Integration not found with smoochIntegrationId: ', smoochIntegrationId);
  }

  const createdAt = received * 1000;

  const doc = <ISmoochConversationArguments>{
    kind: integration.kind,
    smoochConversationId,
    customerId,
    content,
    integrationIds: {
      id: integration._id,
      erxesApiId: integration.erxesApiId,
    },
    createdAt,
  };

  return storeConversation(doc);
};

const saveMessage = async (
  smoochIntegrationId: string,
  customerId: string,
  conversationIds: any,
  content: string,
  messageId: string,
  attachment?: IAttachment,
) => {
  const integration = await Integrations.findOne({ smoochIntegrationId });

  if (!integration) {
    return debugSmooch('Integration not found with smoochIntegrationId: ', smoochIntegrationId);
  }

  const doc = <ISmoochConversationMessageArguments>{
    kind: integration.kind,
    customerId,
    conversationIds,
    content,
    messageId,
  };

  if (attachment) {
    doc.attachments = [attachment];
  }

  return storeMessage(doc);
};

const removeIntegration = async (integrationId: string) => {
  const { SMOOCH_APP_ID } = await getSmoochConfig();

  try {
    await smooch.integrations.delete({
      appId: SMOOCH_APP_ID,
      integrationId,
    });
  } catch (e) {
    debugSmooch(e.message);
  }
};

const setupSmoochWebhook = async () => {
  const {
    SMOOCH_APP_KEY_ID,
    SMOOCH_SMOOCH_APP_KEY_SECRET,
    SMOOCH_WEBHOOK_CALLBACK_URL,
    SMOOCH_APP_ID,
  } = await getSmoochConfig();

  if (!SMOOCH_APP_KEY_ID || !SMOOCH_SMOOCH_APP_KEY_SECRET || !SMOOCH_WEBHOOK_CALLBACK_URL || !SMOOCH_APP_ID) {
    debugSmooch('Smooch is not configured');
    return;
  }

  smooch = new Smooch({
    keyId: SMOOCH_APP_KEY_ID,
    secret: SMOOCH_SMOOCH_APP_KEY_SECRET,
    scope: 'app',
  });
  try {
    const { webhooks } = await smooch.webhooks.list();

    if (webhooks.length > 0) {
      for (const hook of webhooks) {
        if (hook.target !== SMOOCH_WEBHOOK_CALLBACK_URL) {
          try {
            debugSmooch('updating webhook');

            await smooch.webhooks.update(hook._id, {
              target: SMOOCH_WEBHOOK_CALLBACK_URL.replace(/\s/g, ''),
              includeClient: true,
            });
          } catch (e) {
            throw e;
          }
        }
      }
    } else {
      try {
        await smooch.webhooks.create({
          target: SMOOCH_WEBHOOK_CALLBACK_URL,
          triggers: ['message:appUser'],
          includeClient: true,
        });
      } catch (e) {
        debugSmooch(`An error occurred while setting up smooch webhook: ${e.message}`);
      }
    }
  } catch (e) {
    throw e;
  }
};

const getTelegramFile = async (token: string, fileId: string) => {
  try {
    const { result } = await request({
      uri: `${TELEGRAM_API_URL}/bot${token}/getFile?file_id=${fileId}`,
      method: 'GET',
      json: true,
    });
    return `${TELEGRAM_API_URL}/file/bot${token}/${result.file_path}`;
  } catch (e) {
    debugSmooch(e.mesage);
    throw e.mesage;
  }
};

const getLineWebhookUrl = async (erxesApiId: string) => {
  const appid = await getConfig('SMOOCH_APP_ID');

  const integration = await Integrations.findOne({ erxesApiId });

  return `https://app.smooch.io:443/api/line/webhooks/${appid}/${integration.smoochIntegrationId}`;
};

export {
  saveCustomer,
  saveConversation,
  saveMessage,
  setupSmoochWebhook,
  removeIntegration,
  getTelegramFile,
  getLineWebhookUrl,
};
