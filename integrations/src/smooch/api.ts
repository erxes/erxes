import * as request from 'request-promise';
import * as Smooch from 'smooch-core';
import { debugSmooch } from '../debuggers';
import { Integrations } from '../models';
import { getConfig } from '../utils';
import { TELEGRAM_API_URL } from './constants';
import {
  createOrGetSmoochConversation as storeConversation,
  createOrGetSmoochConversationMessage as storeMessage,
  createOrGetSmoochCustomer as storeCustomer
} from './store';
import { SMOOCH_MODELS } from './store';
import {
  IAttachment,
  ISmoochConversationArguments,
  ISmoochConversationMessageArguments,
  ISmoochCustomerArguments,
  ISmoochCustomerInput,
  ISmoochProps
} from './types';

interface IMessage {
  text: string;
  role: string;
  type: string;
  mediaUrl?: string;
}

export const getSmoochConfig = async () => {
  return {
    SMOOCH_APP_ID: await getConfig('SMOOCH_APP_ID'),
    SMOOCH_APP_KEY_ID: await getConfig('SMOOCH_APP_KEY_ID'),
    SMOOCH_SMOOCH_APP_KEY_SECRET: await getConfig('SMOOCH_APP_KEY_SECRET'),
    SMOOCH_WEBHOOK_CALLBACK_URL: await getConfig('SMOOCH_WEBHOOK_CALLBACK_URL')
  };
};

const saveCustomer = async (customer: ISmoochCustomerInput) => {
  const {
    smoochIntegrationId,
    smoochUserId,
    surname,
    givenName,
    email,
    phone,
    avatarUrl
  } = customer;
  const integration = await Integrations.findOne({ smoochIntegrationId });

  if (!integration) {
    return debugSmooch(
      'Integration not found with smoochIntegrationId: ',
      smoochIntegrationId
    );
  }

  const doc = <ISmoochCustomerArguments>{
    kind: integration.kind,
    smoochUserId,
    integrationIds: {
      id: integration._id,
      erxesApiId: integration.erxesApiId
    },
    surname,
    givenName,
    email,
    phone,
    avatarUrl
  };

  return storeCustomer(doc);
};

const saveConversation = async (
  smoochIntegrationId: string,
  smoochConversationId: string,
  customerId: string,
  content: string,
  received: number
) => {
  const integration = await Integrations.findOne({ smoochIntegrationId });

  if (!integration) {
    return debugSmooch(
      'Integration not found with smoochIntegrationId: ',
      smoochIntegrationId
    );
  }

  const createdAt = received * 1000;

  const doc = <ISmoochConversationArguments>{
    kind: integration.kind,
    smoochConversationId,
    customerId,
    content,
    integrationIds: {
      id: integration._id,
      erxesApiId: integration.erxesApiId
    },
    createdAt
  };

  return storeConversation(doc);
};

const saveMessage = async (
  smoochIntegrationId: string,
  customerId: string,
  conversationIds: any,
  content: string,
  messageId: string,
  attachment?: IAttachment
) => {
  const integration = await Integrations.findOne({ smoochIntegrationId });

  if (!integration) {
    return debugSmooch(
      'Integration not found with smoochIntegrationId: ',
      smoochIntegrationId
    );
  }

  const doc = <ISmoochConversationMessageArguments>{
    kind: integration.kind,
    customerId,
    conversationIds,
    content,
    messageId
  };

  if (attachment) {
    doc.attachments = [attachment];
  }

  return storeMessage(doc);
};

const removeIntegration = async (integrationId: string) => {
  const { SMOOCH_APP_ID } = await getSmoochConfig();

  const smooch = await setupSmooch();

  try {
    await smooch.integrations.delete({
      appId: SMOOCH_APP_ID,
      integrationId
    });
  } catch (e) {
    debugSmooch(e.message);
    throw e;
  }
};

const setupSmoochWebhook = async () => {
  const { SMOOCH_WEBHOOK_CALLBACK_URL } = await getSmoochConfig();

  if (!SMOOCH_WEBHOOK_CALLBACK_URL) {
    debugSmooch('Smooch config variables does not configured');
    throw new Error('Smooch config variables does not configured');
  }

  const smooch = await setupSmooch();

  try {
    const { webhooks } = await smooch.webhooks.list();

    if (webhooks.length > 0) {
      for (const webhook of webhooks) {
        if (webhook.target !== SMOOCH_WEBHOOK_CALLBACK_URL) {
          try {
            debugSmooch('updating webhook');

            await smooch.webhooks.update(webhook._id, {
              target: SMOOCH_WEBHOOK_CALLBACK_URL.replace(/\s/g, ''),
              includeClient: true
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
          includeClient: true
        });
      } catch (e) {
        debugSmooch(
          `An error occurred while setting up smooch webhook: ${e.message}`
        );
        throw e;
      }
    }
  } catch (error) {
    debugSmooch(
      `An error occurred while setting up smooch webhook: ${error.message}`
    );
    throw error;
  }
};

const getTelegramFile = async (token: string, fileId: string) => {
  try {
    const { result } = await request({
      uri: `${TELEGRAM_API_URL}/bot${token}/getFile?file_id=${fileId}`,
      method: 'GET',
      json: true
    });
    return `${TELEGRAM_API_URL}/file/bot${token}/${result.file_path}`;
  } catch (e) {
    debugSmooch(e.mesage);
    throw e;
  }
};

const getLineWebhookUrl = async (erxesApiId: string) => {
  const appid = await getConfig('SMOOCH_APP_ID');

  if (!appid) {
    throw new Error('Smooch app id does not configured');
  }
  const integration = await Integrations.findOne({ erxesApiId });

  return `https://app.smooch.io:443/api/line/webhooks/${appid}/${integration.smoochIntegrationId}`;
};

const reply = async requestBody => {
  const { attachments, conversationId, content, integrationId } = requestBody;

  const { SMOOCH_APP_ID } = await getSmoochConfig();

  if (attachments.length > 1) {
    throw new Error('You can only attach one file');
  }

  const integration = await Integrations.findOne({ erxesApiId: integrationId });

  const conversationModel = SMOOCH_MODELS[integration.kind].conversations;

  const customerModel = SMOOCH_MODELS[integration.kind].customers;

  const conversation = await conversationModel.findOne({
    erxesApiId: conversationId
  });

  const customerId = conversation.customerId;

  const user = await customerModel.findOne({ erxesApiId: customerId });

  const messageInput: IMessage = {
    text: content,
    role: 'appMaker',
    type: 'text'
  };

  if (attachments.length !== 0) {
    messageInput.type = 'file';
    messageInput.mediaUrl = attachments[0].url;
  }

  const smooch = await setupSmooch();

  try {
    const { message } = await smooch.appUsers.sendMessage({
      appId: SMOOCH_APP_ID,
      userId: user.smoochUserId,
      message: messageInput
    });

    const messageModel = SMOOCH_MODELS[integration.kind].conversationMessages;

    await messageModel.create({
      conversationId: conversation.id,
      messageId: message._id,
      content
    });
  } catch (e) {
    debugSmooch(`Failed to send smooch message: ${e.message}`);
    throw e;
  }
};

const createIntegration = async requestBody => {
  const { SMOOCH_APP_ID } = await getSmoochConfig();

  let { kind } = requestBody;
  const { data, integrationId } = requestBody;

  if (kind.includes('smooch')) {
    kind = kind.split('-')[1];
  }

  const props = JSON.parse(data);

  const smoochProps = <ISmoochProps>{
    kind,
    erxesApiId: integrationId
  };

  switch (kind) {
    case 'telegram':
      smoochProps.telegramBotToken = props.token;
      break;
    case 'viber':
      smoochProps.viberBotToken = props.token;
      break;
    case 'line':
      smoochProps.lineChannelId = props.channelId;
      smoochProps.lineChannelSecret = props.channelSecret;
      break;
    case 'twilio':
      smoochProps.twilioSid = props.accountSid;
      smoochProps.twilioAuthToken = props.authToken;
      smoochProps.twilioPhoneSid = props.phoneNumberSid;
      break;
  }
  props.type = kind;
  smoochProps.smoochDisplayName = props.displayName;

  const integration = await Integrations.create(smoochProps);

  const smooch = await setupSmooch();

  try {
    const result = await smooch.integrations.create({
      appId: SMOOCH_APP_ID,
      props
    });

    await Integrations.updateOne(
      { _id: integration.id },
      { $set: { smoochIntegrationId: result.integration._id } }
    );
  } catch (e) {
    debugSmooch(`Failed to create smooch integration: ${e.message}`);

    await Integrations.deleteOne({ _id: integration.id });

    throw e;
  }
};

export const setupSmooch = async () => {
  const {
    SMOOCH_APP_KEY_ID,
    SMOOCH_SMOOCH_APP_KEY_SECRET,
    SMOOCH_WEBHOOK_CALLBACK_URL,
    SMOOCH_APP_ID
  } = await getSmoochConfig();

  if (
    !SMOOCH_APP_KEY_ID ||
    !SMOOCH_SMOOCH_APP_KEY_SECRET ||
    !SMOOCH_WEBHOOK_CALLBACK_URL ||
    !SMOOCH_APP_ID
  ) {
    debugSmooch(`
      Missing following config
      SMOOCH_APP_KEY_ID: ${SMOOCH_APP_KEY_ID}
      SMOOCH_SMOOCH_APP_KEY_SECRET: ${SMOOCH_SMOOCH_APP_KEY_SECRET}
      SMOOCH_WEBHOOK_CALLBACK_URL: ${SMOOCH_WEBHOOK_CALLBACK_URL}
      SMOOCH_APP_ID: ${SMOOCH_APP_ID}
    `);

    throw new Error(`
    Missing following config
      SMOOCH_APP_KEY_ID: ${SMOOCH_APP_KEY_ID}
      SMOOCH_SMOOCH_APP_KEY_SECRET: ${SMOOCH_SMOOCH_APP_KEY_SECRET}
      SMOOCH_WEBHOOK_CALLBACK_URL: ${SMOOCH_WEBHOOK_CALLBACK_URL}
      SMOOCH_APP_ID: ${SMOOCH_APP_ID}
  `);
  }

  return new Smooch({
    keyId: SMOOCH_APP_KEY_ID,
    secret: SMOOCH_SMOOCH_APP_KEY_SECRET,
    scope: 'app'
  });
};

export {
  saveCustomer,
  saveConversation,
  saveMessage,
  setupSmoochWebhook,
  removeIntegration,
  getTelegramFile,
  getLineWebhookUrl,
  reply,
  createIntegration
};
