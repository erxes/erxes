import { pConversationClientMessageInserted } from '@/inbox/graphql/resolvers/mutations/widget';
import { receiveInboxMessage } from '@/inbox/receiveMessage';
import {
  IFacebookConversation,
  IFacebookConversationDocument,
} from '@/integrations/facebook/@types/conversations';
import {
  IFacebookCustomer,
  IFacebookCustomerDocument,
} from '@/integrations/facebook/@types/customers';
import { IFacebookIntegrationDocument } from '@/integrations/facebook/@types/integrations';
import { IFacebookBotDocument } from '@/integrations/facebook/db/definitions/bots';
import { debugError } from '@/integrations/facebook/debuggers';
import {
  ISendMessageData,
  TAttachmentMessage,
  TAutomationActionConfig,
  TBotConfigMessageButton,
  TFacebookMessageButton,
  TGenericTemplateMessage,
  TQuickRepliesMessage,
  TTemplateMessage,
  TTextInputMessage,
} from '@/integrations/facebook/meta/automation/types/automationTypes';
import {
  generateBotData,
  generatePayloadString,
  getUrl,
} from '@/integrations/facebook/meta/automation/utils/messageUtils';
import { sendReply } from '@/integrations/facebook/utils';
import {
  AutomationExecutionSetWaitCondition,
  EXECUTE_WAIT_TYPES,
} from 'erxes-api-shared/core-modules';
import { getEnv } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { IFacebookCommentConversation } from '../../../@types/comment_conversations';
import { IFacebookConversationMessageDocument } from '../../../@types/conversationMessages';

type TGenerateMessagesParams = {
  subdomain: string;
  conversation: IFacebookConversation;
  customer: IFacebookCustomer;
  executionId: string;
  actionId: string;
  config?: TAutomationActionConfig;
};

type TMessageTemplateContext = {
  prevAction?: Record<string, any>;
};

const getValueByPath = (
  source: Record<string, any>,
  path: string,
): { found: boolean; value?: unknown } => {
  const segments = path.split('.');

  let current: unknown = source;

  for (const segment of segments) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== 'object' ||
      !(segment in (current as Record<string, any>))
    ) {
      return { found: false };
    }

    current = (current as Record<string, any>)[segment];
  }

  return { found: true, value: current };
};

const replaceMessageTemplateString = (
  value: string,
  context: TMessageTemplateContext,
) => {
  return value.replace(
    /{{\s*([\w\d]+(?:\.[\w\d\-]+)*)\s*}}/g,
    (match, placeholderPath) => {
      const { found, value: resolvedValue } = getValueByPath(
        context as Record<string, any>,
        placeholderPath,
      );

      if (!found || resolvedValue === null || resolvedValue === undefined) {
        return match;
      }

      if (typeof resolvedValue === 'object') {
        return JSON.stringify(resolvedValue);
      }

      return String(resolvedValue);
    },
  );
};

const replaceMessageTemplateValues = <T>(
  value: T,
  context: TMessageTemplateContext,
): T => {
  if (typeof value === 'string') {
    return replaceMessageTemplateString(value, context) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) =>
      replaceMessageTemplateValues(item, context),
    ) as T;
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        replaceMessageTemplateValues(item, context),
      ]),
    ) as T;
  }

  return value;
};

export const resolveMessageActionConfigTemplates = (
  config?: TAutomationActionConfig,
  context: TMessageTemplateContext = {},
) => {
  if (!config) {
    return config;
  }

  return replaceMessageTemplateValues(config, context);
};

export const generateMessages = async ({
  subdomain,
  conversation,
  customer,
  executionId,
  actionId,
  config,
}: TGenerateMessagesParams) => {
  let { messages = [] } = config || {};

  const generateButtons = (buttons: TBotConfigMessageButton[] = []) => {
    const generatedButtons: TFacebookMessageButton[] = [];

    for (const button of buttons) {
      const obj: TFacebookMessageButton = {
        type: 'postback',
        title: (button.text || '').trim(),
        payload: generatePayloadString(
          conversation,
          button,
          customer?.erxesApiId || '',
          executionId,
          actionId,
        ),
      };

      if (button.link) {
        delete obj.payload;
        obj.type = 'web_url';
        obj.url = button.link;
      }

      generatedButtons.push(obj);
    }

    return generatedButtons;
  };

  const quickRepliesIndex = messages.findIndex(
    ({ type }) => type === 'quickReplies',
  );

  if (quickRepliesIndex !== -1) {
    const quickRepliesMessage = messages.splice(quickRepliesIndex, 1)[0];
    messages.push(quickRepliesMessage);
  }
  const generatedMessages: (
    | TTextInputMessage
    | TTemplateMessage
    | TGenericTemplateMessage
    | TAttachmentMessage
    | TQuickRepliesMessage
  )[] = [];

  for (const {
    type,
    buttons = [],
    text = '',
    cards = [],
    quickReplies = [],
    image = '',
    video = '',
    audio = '',
    input,
  } of messages) {
    const botData = generateBotData(subdomain, {
      type,
      buttons,
      text,
      cards,
      quickReplies,
      image,
    });

    if (['text', 'input'].includes(type) && !buttons?.length) {
      generatedMessages.push({
        text: input ? input.text : text,
        botData,
        inputData: input,
      });
    }

    if (['text', 'input'].includes(type) && !!buttons?.length) {
      generatedMessages.push({
        attachment: {
          type: 'template',
          payload: {
            template_type: 'button',
            text: (input ? input.text : text || '').trim(),
            buttons: generateButtons(buttons),
          },
        },
        botData,
        inputData: input,
      });
    }

    if (type === 'card' && cards?.length > 0) {
      generatedMessages.push({
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: cards.map(
              ({ title = '', subtitle = '', image = '', buttons = [] }) => ({
                title,
                subtitle,
                image_url: getUrl(subdomain, image),
                buttons: generateButtons(buttons),
              }),
            ),
          },
        },
        botData,
      } as TGenericTemplateMessage);
    }

    if (type === 'quickReplies' && quickReplies.length) {
      generatedMessages.push({
        text: text,
        quick_replies: quickReplies.map(
          (quickReply: { _id: string; text: string; image_url?: string }) => ({
            content_type: 'text',
            title: quickReply?.text || '',

            payload: generatePayloadString(
              conversation,
              quickReply,
              customer?.erxesApiId || '',
              executionId,
              actionId,
            ),
            ...(quickReply.image_url && {
              image_url: getUrl(subdomain, quickReply.image_url),
            }),
          }),
        ),
        botData,
      });
    }

    if (['image', 'audio', 'video'].includes(type)) {
      const url = image || video || audio;

      url &&
        generatedMessages.push({
          attachment: {
            type: type as 'image' | 'audio' | 'video',
            payload: {
              url: getUrl(subdomain, url),
            },
          },
          botData,
        });
    }
  }

  return generatedMessages;
};

export const sendMessage = async (
  models: IModels,
  bot: IFacebookBotDocument,
  { senderId, recipientId, integration, message, tag }: ISendMessageData,
  isLoop?: boolean,
) => {
  await trySendTypingOn(
    models,
    senderId,
    recipientId,
    integration.erxesApiId,
    tag,
  );

  try {
    // Send the actual message
    return await sendReply(
      models,
      'me/messages',
      {
        recipient: { id: senderId },
        message,
        tag,
      },
      recipientId,
      integration.erxesApiId,
    );
  } catch (error) {
    const shouldRetryWithTag =
      error.message.includes(
        'This message is sent outside of allowed window',
      ) &&
      bot?.tag &&
      !isLoop;

    if (shouldRetryWithTag) {
      return await sendMessage(
        models,
        bot,
        {
          senderId,
          recipientId,
          integration,
          message,
          tag: bot?.tag,
        },
        true,
      );
    }

    debugError(`Error occurred during send bot message: ${error.message}`);
    throw new Error(error.message);
  }
};

async function trySendTypingOn(
  models: IModels,
  senderId: string,
  recipientId: string,
  erxesApiId: string,
  tag?: string,
) {
  try {
    await sendReply(
      models,
      'me/messages',
      {
        recipient: { id: senderId },
        sender_action: 'typing_on',
        tag,
      },
      recipientId,
      erxesApiId,
    );
  } catch (err) {
    console.warn(`[sendTypingOn] failed: ${err.message}`);
  }
}

export const getOrCreateFacebookMessageActionContext = async (
  models: IModels,
  subdomain: string,
  collectionType: string,
  target: any,
  config: TAutomationActionConfig,
): Promise<{
  conversation: IFacebookConversationDocument;
  integration: IFacebookIntegrationDocument;
  customer: IFacebookCustomerDocument;
  bot: IFacebookBotDocument;
  recipientId: string;
  senderId: string;
  botId: string;
}> => {
  if (collectionType === 'comments') {
    return await getOrCreateCommentMessageActionContext({
      target,
      models,
      config,
      subdomain,
    });
  }

  return await getOrCreateDirectMessageActionContext({
    target,
    models,
  });
};

async function getOrCreateDirectMessageActionContext({
  target,
  models,
}: {
  target: IFacebookConversationMessageDocument;
  models: IModels;
}) {
  const conversation = await models.FacebookConversations.findOne({
    _id: target?.conversationId,
  });

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  const integration = await models.FacebookIntegrations.findOne({
    _id: conversation.integrationId,
  });

  if (!integration) {
    throw new Error('Integration not found');
  }
  const { recipientId, senderId, botId = '' } = conversation;

  const customer = await models.FacebookCustomers.findOne({
    userId: senderId,
  });

  if (!customer) {
    throw new Error(`Customer not found`);
  }

  const bot = await models.FacebookBots.findOne({ _id: botId }, { tag: 1 });

  if (!bot) {
    throw new Error(`Bot not found`);
  }

  return {
    conversation,
    integration,
    customer,
    bot,
    recipientId,
    senderId,
    botId,
  };
}

async function getOrCreateCommentMessageActionContext({
  target,
  models,
  config,
  subdomain,
}: {
  subdomain: string;
  target: IFacebookCommentConversation;
  config: TAutomationActionConfig;
  models: IModels;
}) {
  const { senderId, recipientId, erxesApiId } = target;

  const { botId } = config;

  let conversation = await models.FacebookConversations.findOne({
    senderId,
    recipientId,
  });

  const didCreateConversation = !conversation;

  const customer = await models.FacebookCustomers.findOne({
    erxesApiId: target.customerId,
  });

  if (!customer) {
    throw new Error(
      `Error occurred during send message with trigger type comments`,
    );
  }
  const integration = await models.FacebookIntegrations.findOne({
    erxesApiId: customer?.integrationId,
  });

  if (!integration) {
    throw new Error(
      `Error occurred during send message with trigger type comments`,
    );
  }

  const bot = await models.FacebookBots.findOne({ _id: botId });

  if (!bot) {
    throw new Error('Bot not found');
  }

  const DOMAIN = getEnv({
    name: 'DOMAIN',
    subdomain,
  });

  const timestamp = new Date();
  if (!conversation) {
    try {
      conversation = await models.FacebookConversations.create({
        timestamp,
        senderId,
        recipientId,
        content: 'Start conversation from comment',
        integrationId: integration._id,
        isBot: true,
        botId,
      });
    } catch (e) {
      throw new Error(
        e.message.includes('duplicate')
          ? 'Concurrent request: conversation duplication'
          : e,
      );
    }
  }

  // save on api
  try {
    const apiConversationResponse = await receiveInboxMessage(subdomain, {
      action: 'create-or-update-conversation',
      payload: JSON.stringify({
        customerId: customer.erxesApiId,
        integrationId: integration.erxesApiId,
        content: 'Start conversation from comment',
        conversationId: conversation.erxesApiId,
        updatedAt: timestamp,
      }),
    });

    if (apiConversationResponse.status === 'success') {
      conversation.erxesApiId = apiConversationResponse.data._id;

      await conversation.save();
    } else {
      throw new Error(
        `Conversation creation failed: ${JSON.stringify(
          apiConversationResponse,
        )}`,
      );
    }
  } catch (e) {
    if (didCreateConversation) {
      await models.FacebookConversations.deleteOne({ _id: conversation._id });
    }
    throw new Error(e);
  }

  if (!conversation.erxesApiId) {
    throw new Error('Conversation erxesApiId is required');
  }

  const created = await models.ConversationMessages.addMessage({
    conversationId: conversation.erxesApiId,
    content: '<p>Bot Message</p>',
    internal: true,
    botId,
    botData: [
      {
        type: 'text',
        text: `${DOMAIN}/inbox/index?_id=${erxesApiId}`,
      },
    ],
    fromBot: true,
  });

  pConversationClientMessageInserted(subdomain, {
    ...created.toObject(),
    conversationId: conversation.erxesApiId,
  });

  return {
    conversation,
    integration,
    customer,
    bot,
    recipientId,
    senderId,
    botId,
  };
}

export const generateConditionWaitToAction = ({
  customer,
  conversation,
}: {
  conversation: IFacebookConversationDocument;
  customer: IFacebookCustomerDocument;
}): AutomationExecutionSetWaitCondition => {
  return {
    type: EXECUTE_WAIT_TYPES.CHECK_OBJECT,
    propertyName: 'payload.btnId',
    expectedState: {
      conversationId: conversation._id,
      customerId: customer.erxesApiId,
    },
    shouldCheckOptionalConnect: true,
  };
};
