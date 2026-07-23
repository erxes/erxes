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

// Coerce a value expected to be a string into a literal string. Non-string
// inputs (objects, numbers, null) become safe primitives, neutralising NoSQL
// injection payloads like {"$ne": null} that arrive verbatim from req.body.
// Objects, arrays, and nullish values are rejected outright (empty string) so
// that crafted operator payloads never reach Mongo as `[object Object]` or
// similar lossy coercions.
const sanitizeString = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }
  if (value === null || value === undefined || typeof value === 'object') {
    return '';
  }
  return String(value);
};

export const receiveMessage = async (
  models: IModels,
  subdomain: string,
  integration: IInstagramIntegrationDocument,
  activity: IMessageData,
) => {
  const userId = sanitizeString(activity?.sender?.id);
  const { recipient, timestamp } = activity ?? {};
  const pageId = sanitizeString(recipient?.id);

  // Fail fast on malformed webhook payloads. After sanitisation, an empty
  // id means the inbound event lacked a real sender or recipient — letting
  // it through would collapse unrelated events onto the same conversation
  // key (senderId='', recipientId='') and corrupt message linkage.
  if (!userId.trim() || !pageId.trim()) {
    debugError(
      'Invalid Instagram webhook payload: missing sender or recipient id',
    );
    return;
  }

  let message = activity.message as any;
  const postback = activity.postback as any;

  const kind = INTEGRATION_KINDS.MESSENGER;
  const mid = message?.mid || postback?.mid;
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

  const existingMessage = await models.InstagramConversationMessages.findOne({
    mid,
  });

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
