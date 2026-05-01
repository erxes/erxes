import { IModels } from '~/connectionResolvers';
import { IInstagramIntegrationDocument } from '@/integrations/instagram/@types/integrations';
import { INTEGRATION_KINDS } from '@/integrations/instagram/constants';
import { getOrCreateCustomer } from '@/integrations/instagram/controller/store';
import { receiveInboxMessage } from '@/inbox/receiveMessage';
import { debugError, debugInstagram } from '@/integrations/instagram/debuggers';
import { IMessageData } from '@/integrations/instagram/@types/utils';
import { pConversationClientMessageInserted } from '@/inbox/graphql/resolvers/mutations/widget';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import {
  checkIsBot,
  triggerInstagramAutomation,
} from '@/integrations/instagram/meta/automation/utils/messageUtils';

const HAS_ATTACHMENT = 'This message has an attachment';

/**
 * Sanitize a value expected to be a string to prevent NoSQL injection.
 * Coerces non-string values (e.g. numbers, objects) to strings, which
 * neutralizes injection objects like {"$gt": ""} by converting them to
 * "[object Object]".
 */
const sanitizeString = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }
  return String(value ?? '');
};

export const receiveMessage = async (
  models: IModels,
  subdomain: string,
  integration: IInstagramIntegrationDocument,
  activity: IMessageData,
) => {
  const { recipient, timestamp } = activity;

  if (activity.sender?.id == null || recipient?.id == null) {
    throw new Error(
      'Instagram webhook is missing sender.id or recipient.id',
    );
  }

  const userId = sanitizeString(activity.sender.id);

  let message = activity.message as any;
  const postback = activity.postback as any;

  const pageId = sanitizeString(recipient.id);
  const kind = INTEGRATION_KINDS.MESSENGER;
  const rawMid = message?.mid || postback?.mid;
  const mid = rawMid != null ? sanitizeString(rawMid) : undefined;
  const attachments = message?.attachments;

  debugInstagram(`Received message from ${userId} → page ${pageId}`);

  let text = activity.text || message?.text;

  if (!text && !message && !!postback) {
    text = postback.title;
    message = { mid: postback.mid };
    if (postback.payload) {
      message.payload = postback.payload;
    }
  }

  if (message?.quick_reply) {
    message.payload = message.quick_reply.payload;
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

  let conversation = await models.InstagramConversations.findOne({
    senderId: { $eq: userId },
    recipientId: { $eq: pageId },
  });

  const bot = await checkIsBot(models, message, pageId);
  const botId = bot?._id;
  let isNewConversation = false;

  if (!conversation) {
    isNewConversation = true;
    try {
      conversation = await models.InstagramConversations.create({
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
          : e.message,
      );
    }
  } else {
    const existingBot = await models.InstagramBots.findOne({ _id: botId });
    if (existingBot) {
      conversation.botId = botId;
    }
    conversation.content = text || '';
    await conversation.save();
  }

  const formattedAttachments = (attachments || [])
    .filter((att) => att.type !== 'fallback')
    .map((att) => ({
      type: att.type,
      url: att.payload?.url ?? '',
    }));

  try {
    const apiConversationResponse = await receiveInboxMessage(subdomain, {
      action: 'create-or-update-conversation',
      payload: JSON.stringify({
        customerId: customer.erxesApiId,
        integrationId: integration.erxesApiId,
        content: text || '',
        attachments: formattedAttachments,
        conversationId: conversation.erxesApiId,
        updatedAt: timestamp,
      }),
    });

    if (apiConversationResponse.status === 'success') {
      conversation.erxesApiId = apiConversationResponse.data._id;
      await conversation.save();
    } else {
      throw new Error(
        `Conversation creation failed: ${JSON.stringify(apiConversationResponse)}`,
      );
    }
  } catch (e) {
    if (isNewConversation) {
      await models.InstagramConversations.deleteOne({ _id: conversation._id });
    }
    throw new Error(e.message);
  }

  // Skip the dedupe lookup when mid is absent, otherwise every mid-less event
  // would collide on a single { mid: undefined } idempotency key.
  const existingMessage = mid
    ? await models.InstagramConversationMessages.findOne({
        mid: { $eq: mid },
      })
    : null;

  if (!existingMessage) {
    try {
      const content =
        text || (formattedAttachments.length > 0 ? HAS_ATTACHMENT : '');

      const created = await models.InstagramConversationMessages.create({
        conversationId: conversation._id,
        mid,
        createdAt: timestamp,
        content,
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
        debugError(`Error publishing conversationMessageInserted: ${err.message}`);
      }

      await triggerInstagramAutomation(subdomain, {
        conversationMessage: created.toObject(),
        payload: message?.payload,
      });
    } catch (e) {
      throw new Error(
        e.message.includes('duplicate')
          ? 'Concurrent request: conversation message duplication'
          : e.message,
      );
    }
  }
};
