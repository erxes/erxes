import type { IModels } from '~/connectionResolvers';
import type { IInstagramIntegrationDocument } from '@/integrations/instagram/@types/integrations';
import { INTEGRATION_KINDS } from '@/integrations/instagram/constants';
import { getOrCreateCustomer } from '@/integrations/instagram/controller/store';
import { receiveInboxMessage } from '@/inbox/receiveMessage';
import { debugInstagram } from '@/integrations/instagram/debuggers';
import type { IMessageData } from '@/integrations/instagram/@types/utils';
import { pConversationClientMessageInserted } from '@/inbox/graphql/resolvers/mutations/widget';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import {
  checkIsBot,
  triggerInstagramAutomation,
} from '@/integrations/instagram/meta/automation/utils/messageUtils';
import { normalizeInstagramMessage } from '@/integrations/instagram/normalizeMessage';
import type { IInstagramConversationMessageDocument } from '@/integrations/instagram/@types/conversationMessages';

const HAS_ATTACHMENT = 'This message has an attachment';

const syncInboxMessageAndPublish = async (
  models: IModels,
  conversationId: string,
  mid: string,
  update: Record<string, unknown>,
) => {
  const inboxMessage = await models.ConversationMessages.findOne({
    conversationId,
    $or: [{ 'providerData.messageId': mid }, { mid }],
  });
  if (!inboxMessage) return;

  Object.assign(inboxMessage, update);
  await inboxMessage.save();
  await graphqlPubsub.publish(`conversationMessageInserted:${conversationId}`, {
    conversationMessageInserted: {
      ...inboxMessage.toObject(),
      conversationId,
    },
  });
};

const handleReactionEvent = async (models: IModels, activity: IMessageData) => {
  if (!activity.reaction) return false;

  const target = await models.InstagramConversationMessages.findOne({
    mid: activity.reaction.mid,
  });
  if (!target) return true;

  const reactionValue = activity.reaction.reaction || activity.reaction.emoji;
  if (activity.reaction.action === 'react' && !reactionValue) return true;

  const reactions = (target.reactions || []).filter(
    (reaction) => reaction.senderId !== activity.sender.id,
  );
  if (activity.reaction.action === 'react') {
    reactions.push({
      senderId: activity.sender.id,
      reaction: reactionValue,
      emoji: activity.reaction.emoji,
    });
  }

  target.reactions = reactions;
  await target.save();

  const conversation = await models.InstagramConversations.findOne({
    _id: target.conversationId,
  });
  if (conversation?.erxesApiId) {
    await syncInboxMessageAndPublish(
      models,
      conversation.erxesApiId,
      activity.reaction.mid,
      { reactions },
    );
  }

  return true;
};

const handleDeletedInstagramMessage = async ({
  models,
  existingMessage,
  conversationId,
  mid,
  providerData,
}: {
  models: IModels;
  existingMessage: IInstagramConversationMessageDocument | null;
  conversationId: string;
  mid: string;
  providerData: ReturnType<typeof normalizeInstagramMessage>['providerData'];
}) => {
  if (!existingMessage) return false;

  existingMessage.content = '';
  existingMessage.attachments = [];
  existingMessage.messageKind = 'deleted';
  existingMessage.deliveryStatus = 'deleted';
  existingMessage.providerData = providerData;
  await existingMessage.save();
  await syncInboxMessageAndPublish(models, conversationId, mid, {
    content: '',
    attachments: [],
    messageKind: 'deleted',
    deliveryStatus: 'deleted',
    providerData,
  });

  return true;
};

const receiptMessageIds = (activity: IMessageData): string[] => {
  if (activity.delivery?.mids) return activity.delivery.mids;
  if (activity.read?.mid) return [activity.read.mid];
  return [];
};

const receiptStatusQuery = ({
  mids,
  conversation,
  watermark,
}: {
  mids: string[];
  conversation: { _id: string } | null;
  watermark?: number;
}): Record<string, unknown> | null => {
  if (mids.length) return { mid: { $in: mids } };
  if (!conversation || !watermark) return null;

  return {
    conversationId: conversation._id,
    userId: { $exists: true },
    createdAt: { $lte: new Date(watermark) },
  };
};

const handleReceiptEvent = async (
  models: IModels,
  integration: IInstagramIntegrationDocument,
  activity: IMessageData,
) => {
  if (!activity.read && !activity.delivery) return false;

  const status = activity.read ? 'read' : 'delivered';
  const mids = receiptMessageIds(activity);
  const pageId = integration.instagramPageId;
  const customerInstagramId = [activity.sender.id, activity.recipient.id].find(
    (id) => id !== pageId,
  );
  const conversation = customerInstagramId
    ? await models.InstagramConversations.findOne({
        senderId: customerInstagramId,
        recipientId: pageId,
      })
    : null;
  const watermark = activity.read?.watermark || activity.delivery?.watermark;
  const statusQuery = receiptStatusQuery({ mids, conversation, watermark });
  if (!statusQuery) return true;

  const messages = await models.InstagramConversationMessages.find(statusQuery);
  await models.InstagramConversationMessages.updateMany(statusQuery, {
    $set: { deliveryStatus: status },
  });

  const erxesApiId = conversation?.erxesApiId;
  if (erxesApiId) {
    await Promise.all(
      messages.map((statusMessage) =>
        syncInboxMessageAndPublish(models, erxesApiId, statusMessage.mid, {
          deliveryStatus: status,
        }),
      ),
    );
  }

  return true;
};

export const receiveMessage = async (
  models: IModels,
  subdomain: string,
  integration: IInstagramIntegrationDocument,
  activity: IMessageData,
) => {
  const userId = activity.sender.id;
  const { recipient, timestamp } = activity;

  if (await handleReactionEvent(models, activity)) return;
  if (await handleReceiptEvent(models, integration, activity)) return;

  let message = activity.message;
  const postback = activity.postback;

  const pageId = recipient.id;
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

  const normalizedMessage = normalizeInstagramMessage({
    ...activity,
    message,
    text,
  });

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
    senderId: userId,
    recipientId: pageId,
  });

  const bot = await checkIsBot(models, message, recipient.id);
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
        `Conversation creation failed: ${JSON.stringify(
          apiConversationResponse,
        )}`,
      );
    }
  } catch (e) {
    if (isNewConversation) {
      await models.InstagramConversations.deleteOne({ _id: conversation._id });
    }
    throw new Error(e.message);
  }

  const erxesConversationId = conversation.erxesApiId;
  if (!erxesConversationId) {
    throw new Error('Erxes conversation ID is unavailable');
  }

  const existingMessage = await models.InstagramConversationMessages.findOne({
    mid,
  });

  if (
    mid &&
    normalizedMessage.messageKind === 'deleted' &&
    (await handleDeletedInstagramMessage({
      models,
      existingMessage,
      conversationId: erxesConversationId,
      mid,
      providerData: normalizedMessage.providerData,
    }))
  ) {
    return;
  }

  if (!existingMessage) {
    let inboxMessageId: string | undefined;
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
        ...normalizedMessage,
      });

      const inboxMessage = await models.ConversationMessages.createMessage({
        conversationId: erxesConversationId,
        content,
        customerId: customer.erxesApiId,
        attachments: formattedAttachments,
        createdAt: new Date(timestamp),
        messageKind: normalizedMessage.messageKind,
        providerData: normalizedMessage.providerData,
        replyTo: normalizedMessage.replyTo,
        deliveryStatus: normalizedMessage.deliveryStatus,
        expiresAt: normalizedMessage.expiresAt,
      });
      inboxMessageId = inboxMessage._id;

      await pConversationClientMessageInserted(subdomain, inboxMessage);

      await triggerInstagramAutomation(subdomain, {
        conversationMessage: created.toObject(),
        payload: message?.payload,
      });
    } catch (e) {
      await models.InstagramConversationMessages.deleteOne({ mid });
      if (inboxMessageId) {
        await models.ConversationMessages.deleteOne({ _id: inboxMessageId });
      }
      throw new Error(
        e.message.includes('duplicate')
          ? 'Concurrent request: conversation message duplication'
          : e.message,
      );
    }
  }
};
