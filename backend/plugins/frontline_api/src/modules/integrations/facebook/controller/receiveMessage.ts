import { IModels } from '~/connectionResolvers';
import { IFacebookIntegrationDocument } from '@/integrations/facebook/@types/integrations';
import { INTEGRATION_KINDS } from '@/integrations/facebook/constants';
import { getOrCreateCustomer } from '@/integrations/facebook/controller/store';
import { receiveInboxMessage } from '@/inbox/receiveMessage';
import { debugFacebook } from '@/integrations/facebook/debuggers';
import { Activity } from '@/integrations/facebook/@types/utils';
import { IFacebookBotDocument } from '@/integrations/facebook/db/definitions/bots';
import { pConversationClientMessageInserted } from '@/inbox/graphql/resolvers/mutations/widget';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import { sendReply } from '@/integrations/facebook/utils';
import { IFacebookConversationDocument } from '@/integrations/facebook/@types/conversations';
import { IFacebookConversationMessageDocument } from '@/integrations/facebook/@types/conversationMessages';
import {
  checkIsBot,
  parseAutomationPayload,
  triggerFacebookMessageAutomation,
} from '@/integrations/facebook/meta/automation/utils/messageUtils';

/**
 * Sanitize a value expected to be a string to prevent NoSQL injection.
 * Coerces non-string values (e.g. numbers) to strings, which also neutralizes
 * injection objects like {"$gt": ""} by converting them to "[object Object]".
 */
const sanitizeString = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }
  return String(value ?? '');
};

const DEFAULT_HANDOFF_MESSAGE =
  'A teammate will take over shortly. Automated replies are paused.';

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const buildMessengerTextPayload = ({
  senderId,
  text,
  tag,
}: {
  senderId: string;
  text: string;
  tag?: string;
}) => {
  const trimmedTag = tag?.trim();
  const payload: {
    recipient: { id: string };
    message: { text: string };
    messaging_type: string;
    tag?: string;
  } = {
    recipient: { id: senderId },
    message: { text },
    messaging_type: trimmedTag ? 'MESSAGE_TAG' : 'RESPONSE',
  };

  if (trimmedTag) {
    payload.tag = trimmedTag;
  }

  return payload;
};

const handleHumanHandoff = async ({
  models,
  subdomain,
  conversation,
  conversationMessage,
  integration,
  bot,
  senderId,
  recipientId,
}: {
  models: IModels;
  subdomain: string;
  conversation: IFacebookConversationDocument;
  conversationMessage: IFacebookConversationMessageDocument;
  integration: IFacebookIntegrationDocument;
  bot: IFacebookBotDocument;
  senderId: string;
  recipientId: string;
}) => {
  if (!conversation.erxesApiId) {
    return;
  }

  const pauseMinutes = Math.max(1, Number(bot.handoffPauseMinutes || 10));
  const pausedUntil = new Date(Date.now() + pauseMinutes * 60 * 1000);
  const inboxConversation = await models.Conversations.findOne({
    _id: conversation.erxesApiId,
  }).lean();

  if (inboxConversation?.automatedReplyControl?.status !== 'human_active') {
    await receiveInboxMessage(subdomain, {
      action: 'set-automated-reply-control',
      payload: JSON.stringify({
        conversationId: conversation.erxesApiId,
        status: 'handoff_requested',
        pausedUntil,
        reason: 'customer_requested',
      }),
    });
  }

  const text = bot.handoffMessage || DEFAULT_HANDOFF_MESSAGE;

  const sendHandoffReply = (tag?: string) =>
    sendReply(
      models,
      'me/messages',
      buildMessengerTextPayload({
        senderId,
        text,
        tag,
      }),
      recipientId,
      integration.erxesApiId,
    );

  let sendResult;

  try {
    sendResult = await sendHandoffReply();
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    const shouldRetryWithTag =
      errorMessage.includes('outside of allowed window') && bot.tag;

    if (!shouldRetryWithTag) {
      throw new Error(errorMessage);
    }

    sendResult = await sendHandoffReply(bot.tag);
  }

  await models.FacebookConversationMessages.addBotMessage(subdomain, {
    conversationId: conversation._id,
    botId: bot._id,
    botData: [{ type: 'text', text }],
    mid: String(
      sendResult?.mid ||
        sendResult?.message_id ||
        `handoff-${conversationMessage._id}`,
    ),
    conversationErxesApiId: conversation.erxesApiId,
  });
};

export const receiveMessage = async (
  models: IModels,
  subdomain: string,
  integration: IFacebookIntegrationDocument,
  activity: Activity,
) => {
  try {
    debugFacebook(
      `Received message: ${activity.text} from ${activity.from.id}`,
    );
    const { recipient, from, timestamp, channelData } = activity;
    let { message, postback } = channelData;
    const pageId = sanitizeString(recipient.id);
    const userId = sanitizeString(from.id);
    const kind = INTEGRATION_KINDS.MESSENGER;
    const rawMid = channelData.message?.mid || postback?.mid;
    const mid = rawMid != null ? sanitizeString(rawMid) : undefined;
    const attachments = channelData.message?.attachments;

    if (message?.is_echo || userId === pageId) {
      debugFacebook(
        `Skipping Facebook echo message ${mid || ''} from page ${pageId}`,
      );
      return;
    }

    let text = activity.text || message?.text;
    let adData;

    if (!text && !message && !!postback) {
      text = postback.title;

      message = {
        mid: postback.mid,
      };

      if (postback.payload) {
        message.payload = postback.payload;
      }
    }

    if (message?.quick_reply) {
      message.payload = message.quick_reply.payload;
    }

    const referral = message?.referral || postback?.referral;
    const isOpenThreadEvent = referral?.type === 'OPEN_THREAD';

    if (isOpenThreadEvent) {
      adData = {
        source: referral.source,
        type: referral.type,
        adId: referral.ad_id,
        postId: referral.ads_context_data?.post_id,
        pageId,
      };
    }

    const customer = await getOrCreateCustomer(
      models,
      subdomain,
      pageId,
      userId,
      kind,
    );
    if (!customer) {
      throw new Error('Customer not found');
    }

    let conversation = await models.FacebookConversations.findOne({
      senderId: { $eq: userId },
      recipientId: { $eq: pageId },
    });

    const bot = await checkIsBot(models, message, recipient.id);
    const botId = bot?._id;

    // create conversation
    if (!conversation) {
      // save on integrations db
      try {
        conversation = await models.FacebookConversations.create({
          timestamp,
          senderId: userId,
          recipientId: pageId,
          content: text,
          integrationId: integration._id,
          isBot: !!botId,
          botId,
        });
      } catch (e) {
        throw new Error(
          e.message.includes('duplicate')
            ? 'Concurrent request: conversation duplication'
            : e,
        );
      }
    } else {
      const bot = await models.FacebookBots.findOne({ _id: botId });

      if (bot) {
        conversation.botId = botId;
      }
      conversation.content = text || '';
    }

    const formattedAttachments = (attachments || [])
      .filter((att) => att.type !== 'fallback')
      .map((att) => ({
        type: att.type,
        url: att.payload ? att.payload.url : '',
      }));

    // save on api
    try {
      const data = {
        action: 'create-or-update-conversation',
        payload: JSON.stringify({
          customerId: customer.erxesApiId,
          integrationId: integration.erxesApiId,
          content: text || '',
          attachments: formattedAttachments,
          conversationId: conversation.erxesApiId,
          updatedAt: timestamp,
        }),
      };

      const apiConversationResponse = await receiveInboxMessage(
        subdomain,
        data,
      );

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
      await models.FacebookConversations.deleteOne({ _id: conversation._id });
      throw new Error(e);
    }
    // get conversation message
    let conversationMessage = await models.FacebookConversationMessages.findOne(
      {
        mid: { $eq: mid },
      },
    );

    if (!conversationMessage) {
      try {
        const created = await models.FacebookConversationMessages.create({
          conversationId: conversation._id,
          mid,
          createdAt: timestamp,
          content: text,
          customerId: customer.erxesApiId,
          attachments: formattedAttachments,
          botId,
        });

        const doc = {
          ...created.toObject(),
          conversationId: conversation.erxesApiId,
        };

        await pConversationClientMessageInserted(subdomain, doc);
        try {
          await graphqlPubsub.publish(
            `conversationMessageInserted:${conversation.erxesApiId}`,
            {
              conversationMessageInserted: {
                ...created.toObject(),
                conversationId: conversation.erxesApiId,
              },
            },
          );
        } catch (err) {
          throw new Error(
            'conversationMessageInserted Error publishing subscription:',
          );
        }

        conversationMessage = created;

        const payload = parseAutomationPayload(message?.payload);
        if (payload.persistentMenuType === 'human_handoff') {
          const handoffBot = await models.FacebookBots.findOne({
            _id: payload.botId || botId,
          });

          if (handoffBot) {
            await handleHumanHandoff({
              models,
              subdomain,
              conversation,
              conversationMessage,
              integration,
              bot: handoffBot,
              senderId: userId,
              recipientId: pageId,
            });
          }

          return;
        }

        triggerFacebookMessageAutomation(subdomain, {
          conversationMessage: conversationMessage.toObject(),
          payload: message?.payload,
          adData,
        });
      } catch (e) {
        throw new Error(
          e.message.includes('duplicate')
            ? 'Concurrent request: conversation message duplication'
            : e,
        );
      }
    }
  } catch (error) {
    throw new Error(`Error processing Facebook message: ${error.message}.`);
  }
};
