import type { IModels } from '~/connectionResolvers';
import type { IInstagramIntegrationDocument } from '@/integrations/instagram/@types/integrations';
import { INTEGRATION_KINDS } from '@/integrations/instagram/constants';
import { getOrCreateCustomer } from '@/integrations/instagram/controller/store';
import { receiveInboxMessage } from '@/inbox/receiveMessage';
import { debugInstagram } from '@/integrations/instagram/debuggers';
import type { IMessageData } from '@/integrations/instagram/@types/utils';
import {
  checkIsBot,
  triggerInstagramAutomation,
} from '@/integrations/instagram/meta/automation/utils/messageUtils';
import { normalizeInstagramMessage } from '@/integrations/instagram/normalizeMessage';
import type { IInstagramConversationMessageDocument } from '@/integrations/instagram/@types/conversationMessages';
import {
  publishInstagramMessage,
  replaceSenderReaction,
} from '@/integrations/instagram/services/messageEvents';

import {
  getOrCreateInstagramRecord,
  instagramRecordId,
  syncInstagramInboxMessage,
  withInstagramDeliveryLease,
} from '@/integrations/instagram/services/persistence';

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
  await publishInstagramMessage(conversationId, inboxMessage.toObject());
};

const handleReactionEvent = async (models: IModels, activity: IMessageData) => {
  if (!activity.reaction) return false;

  const target = await models.InstagramConversationMessages.findOne({
    mid: activity.reaction.mid,
  });
  if (!target) return true;

  const { action, emoji, mid } = activity.reaction;
  const reactionValue = activity.reaction.reaction || emoji;
  const isReact = action === 'react';
  if (isReact && !reactionValue) return true;

  const reactions = replaceSenderReaction(
    target.reactions,
    activity.sender.id,
    isReact
      ? { senderId: activity.sender.id, reaction: reactionValue, emoji }
      : undefined,
  );
  target.reactions = reactions;
  await target.save();

  const conversation = await models.InstagramConversations.findOne({
    _id: target.conversationId,
  });
  if (conversation?.erxesApiId) {
    await syncInboxMessageAndPublish(models, conversation.erxesApiId, mid, {
      reactions,
    });
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

  const deletedFields = {
    content: '',
    attachments: [],
    messageKind: 'deleted' as const,
    deliveryStatus: 'deleted' as const,
    providerData,
  };
  Object.assign(existingMessage, deletedFields);
  await existingMessage.save();
  await syncInboxMessageAndPublish(models, conversationId, mid, deletedFields);

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
  const mid =
    message?.mid ||
    postback?.mid ||
    (postback
      ? instagramRecordId(
          'postback',
          pageId,
          userId,
          String(timestamp),
          postback.payload,
        )
      : undefined);
  if (!mid) return;
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

  const selector = { senderId: userId, recipientId: pageId };
  const bot = await checkIsBot(models, message, recipient.id);
  const botId = bot?._id;
  const conversation = await getOrCreateInstagramRecord(
    () => models.InstagramConversations.findOne(selector),
    () =>
      models.InstagramConversations.create({
        _id: instagramRecordId('conversation', pageId, userId),
        timestamp,
        ...selector,
        content: text,
        integrationId: integration._id,
        isBot: !!botId,
        botId,
      }),
  );
  const messageSelector = { mid, conversationId: conversation._id };
  const existingMessage = await models.InstagramConversationMessages.findOne(
    messageSelector,
  );

  if (normalizedMessage.messageKind !== 'deleted') {
    if (existingMessage?.inboxSyncPending === false) return;
    if (existingMessage && existingMessage.inboxSyncPending === undefined) {
      const legacyInboxMessage = await models.ConversationMessages.findOne({
        conversationId: conversation.erxesApiId,
        $or: [{ 'providerData.messageId': mid }, { mid }],
      });
      if (legacyInboxMessage) return;
    }
  }

  if (botId) conversation.botId = botId;
  conversation.content = text || '';
  await conversation.save();

  const formattedAttachments = (attachments || [])
    .filter((att) => att.type !== 'fallback')
    .map((att) => ({
      type: att.type,
      url: att.payload?.url ?? '',
    }));

  const apiConversationResponse = await receiveInboxMessage(subdomain, {
    action: 'create-or-update-conversation',
    payload: JSON.stringify({
      customerId: customer.erxesApiId,
      integrationId: integration.erxesApiId,
      content: text || '',
      attachments: formattedAttachments,
      conversationId:
        conversation.erxesApiId || `instagram-${conversation._id}`,
      updatedAt: timestamp,
    }),
  });
  if (apiConversationResponse.status !== 'success') {
    throw new Error(
      `Conversation creation failed: ${apiConversationResponse.errorMessage}`,
    );
  }
  conversation.erxesApiId = apiConversationResponse.data._id;
  await conversation.save();

  const erxesConversationId = conversation.erxesApiId;
  if (!erxesConversationId) {
    throw new Error('Erxes conversation ID is unavailable');
  }

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

  const content =
    text || (formattedAttachments.length > 0 ? HAS_ATTACHMENT : '');
  const stored = await getOrCreateInstagramRecord(
    () => models.InstagramConversationMessages.findOne(messageSelector),
    () =>
      models.InstagramConversationMessages.create({
        _id: instagramRecordId('message', pageId, mid),
        ...messageSelector,
        createdAt: timestamp,
        content,
        customerId: customer.erxesApiId,
        attachments: formattedAttachments,
        botId,
        ...normalizedMessage,
        inboxSyncPending: true,
      }),
  );

  await withInstagramDeliveryLease(
    models.InstagramConversationMessages,
    stored._id,
    async () => {
      await syncInstagramInboxMessage(
        models,
        subdomain,
        `instagram-${stored._id}`,
        {
          conversationId: erxesConversationId,
          content,
          customerId: customer.erxesApiId,
          attachments: formattedAttachments,
          createdAt: new Date(timestamp),
          ...normalizedMessage,
        },
        mid,
      );

      await triggerInstagramAutomation(subdomain, {
        conversationMessage: stored.toObject(),
        payload: message?.payload,
      });
    },
  );
};
