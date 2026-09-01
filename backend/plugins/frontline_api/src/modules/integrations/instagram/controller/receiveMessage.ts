import { IModels } from '~/connectionResolvers';
import { IInstagramIntegrationDocument } from '@/integrations/instagram/@types/integrations';
import { INTEGRATION_KINDS } from '@/integrations/instagram/constants';
import { getOrCreateCustomer } from '@/integrations/instagram/controller/store';
import { receiveInboxMessage } from '@/inbox/receiveMessage';
import { debugInstagram } from '@/integrations/instagram/debuggers';
import { IMessageData } from '@/integrations/instagram/@types/utils';
import { pConversationClientMessageInserted } from '@/inbox/graphql/resolvers/mutations/widget';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import {
  checkIsBot,
  triggerInstagramAutomation,
} from '@/integrations/instagram/meta/automation/utils/messageUtils';
import { normalizeInstagramMessage } from '@/integrations/instagram/normalizeMessage';
import { IInstagramConversationMessageDocument } from '@/integrations/instagram/@types/conversationMessages';

const HAS_ATTACHMENT = 'This message has an attachment';

const syncInboxMessageAndPublish = async (
  models: IModels,
  conversationId: string,
  mid: string,
  update: Record<string, unknown>,
) => {
  const inboxMessage = await models.ConversationMessages.findOne({
    conversationId,
    'providerData.messageId': mid,
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
  const customerInstagramId = [
    activity.sender.id,
    activity.recipient.id,
  ].find((id) => id !== pageId);
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
  if (conversation?.erxesApiId) {
    await Promise.all(
      messages.map((statusMessage) =>
        syncInboxMessageAndPublish(
          models,
          conversation.erxesApiId as string,
          statusMessage.mid,
          { deliveryStatus: status },
        ),
      ),
    );
  }
  return true;
};

const prepareInstagramMessage = (activity: IMessageData) => {
  let message = activity.message;
  const postback = activity.postback;
  let text = activity.text || message?.text;
  if (!text && !message && postback) {
    text = postback.title;
    message = {
      mid: postback.mid,
      ...(postback.payload && { payload: postback.payload }),
    };
  }
  if (message?.quick_reply) message.payload = message.quick_reply.payload;
  return {
    message,
    text,
    mid:
      message?.mid ||
      postback?.mid ||
      `${activity.sender.id}:${activity.timestamp}`,
  };
};

const upsertInstagramConversation = async ({
  models,
  integration,
  activity,
  text,
  message,
}: {
  models: IModels;
  integration: IInstagramIntegrationDocument;
  activity: IMessageData;
  text?: string;
  message: IMessageData['message'];
}) => {
  const senderId = activity.sender.id;
  const recipientId = activity.recipient.id;
  const bot = await checkIsBot(models, message, recipientId);
  const botId = bot?._id;
  let conversation = await models.InstagramConversations.findOne({
    senderId,
    recipientId,
  });
  if (conversation) {
    const existingBot = await models.InstagramBots.findOne({ _id: botId });
    if (existingBot) conversation.botId = botId;
    conversation.content = text || '';
    await conversation.save();
    return { conversation, botId, isNew: false };
  }
  try {
    conversation = await models.InstagramConversations.create({
      timestamp: activity.timestamp,
      senderId,
      recipientId,
      content: text,
      integrationId: integration._id,
      isBot: Boolean(botId),
      botId,
    });
    return { conversation, botId, isNew: true };
  } catch (error) {
    const messageText =
      error instanceof Error ? error.message : String(error);
    throw new Error(
      messageText.includes('duplicate')
        ? 'Concurrent request: conversation duplication'
        : messageText,
    );
  }
};

const syncInstagramInboxConversation = async ({
  models,
  subdomain,
  integration,
  conversation,
  normalizedMessage,
  customerId,
  timestamp,
  isNew,
}: {
  models: IModels;
  subdomain: string;
  integration: IInstagramIntegrationDocument;
  conversation: Awaited<
    ReturnType<typeof upsertInstagramConversation>
  >['conversation'];
  normalizedMessage: ReturnType<typeof normalizeInstagramMessage>;
  customerId: string;
  timestamp: number;
  isNew: boolean;
}) => {
  try {
    const response = await receiveInboxMessage(subdomain, {
      action: 'create-or-update-conversation',
      payload: JSON.stringify({
        customerId,
        integrationId: integration.erxesApiId,
        content:
          normalizedMessage.content ||
          normalizedMessage.providerData?.previewText ||
          normalizedMessage.providerData?.fallbackReason ||
          '',
        attachments: normalizedMessage.attachments || [],
        conversationId: conversation.erxesApiId,
        updatedAt: timestamp,
      }),
    });
    if (response.status !== 'success') {
      throw new Error(`Conversation creation failed: ${JSON.stringify(response)}`);
    }
    conversation.erxesApiId = response.data._id;
    await conversation.save();
  } catch (error) {
    if (isNew) {
      await models.InstagramConversations.deleteOne({ _id: conversation._id });
    }
    throw error;
  }
};

const handleDeletedInstagramMessage = async ({
  models,
  existingMessage,
  normalizedMessage,
  conversationId,
  mid,
}: {
  models: IModels;
  existingMessage: IInstagramConversationMessageDocument | null;
  normalizedMessage: ReturnType<typeof normalizeInstagramMessage>;
  conversationId: string;
  mid: string;
}) => {
  if (!existingMessage || normalizedMessage.messageKind !== 'deleted') {
    return false;
  }
  existingMessage.content = '';
  existingMessage.attachments = [];
  existingMessage.messageKind = 'deleted';
  existingMessage.deliveryStatus = 'deleted';
  existingMessage.providerData = normalizedMessage.providerData;
  await existingMessage.save();
  await syncInboxMessageAndPublish(models, conversationId, mid, {
    content: '',
    attachments: [],
    messageKind: 'deleted',
    deliveryStatus: 'deleted',
    providerData: normalizedMessage.providerData,
  });
  return true;
};

const createInstagramMessage = async ({
  models,
  subdomain,
  conversation,
  conversationId,
  normalizedMessage,
  customerId,
  timestamp,
  mid,
  botId,
  automationPayload,
}: {
  models: IModels;
  subdomain: string;
  conversation: Awaited<
    ReturnType<typeof upsertInstagramConversation>
  >['conversation'];
  conversationId: string;
  normalizedMessage: ReturnType<typeof normalizeInstagramMessage>;
  customerId: string;
  timestamp: number;
  mid: string;
  botId?: string;
  automationPayload?: string;
}) => {
  const attachments = normalizedMessage.attachments || [];
  const content =
    normalizedMessage.content || (attachments.length ? HAS_ATTACHMENT : '');
  let inboxMessageId: string | undefined;
  try {
    const created = await models.InstagramConversationMessages.create({
      conversationId: conversation._id,
      mid,
      createdAt: timestamp,
      content,
      customerId,
      attachments,
      botId,
      messageKind: normalizedMessage.messageKind,
      providerData: normalizedMessage.providerData,
      replyTo: normalizedMessage.replyTo,
      deliveryStatus: normalizedMessage.deliveryStatus,
      expiresAt: normalizedMessage.expiresAt,
    });
    const inboxMessage = await models.ConversationMessages.createMessage({
      conversationId,
      content,
      customerId,
      attachments,
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
      payload: automationPayload,
    });
  } catch (error) {
    await models.InstagramConversationMessages.deleteOne({ mid });
    if (inboxMessageId) {
      await models.ConversationMessages.deleteOne({ _id: inboxMessageId });
    }
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    throw new Error(
      errorMessage.includes('duplicate')
        ? 'Concurrent request: conversation message duplication'
        : errorMessage,
    );
  }
};

export const receiveMessage = async (
  models: IModels,
  subdomain: string,
  integration: IInstagramIntegrationDocument,
  activity: IMessageData,
) => {
  const userId = activity.sender.id;
  const { recipient, timestamp } = activity;
  const pageId = recipient.id;
  const kind = INTEGRATION_KINDS.MESSENGER;

  if (await handleReactionEvent(models, activity)) return;
  if (await handleReceiptEvent(models, integration, activity)) return;

  const prepared = prepareInstagramMessage(activity);
  const { message, text, mid } = prepared;
  if (message?.is_echo) return;

  debugInstagram(`Received message from ${userId} → page ${pageId}`);

  const customer = await getOrCreateCustomer(
    models,
    subdomain,
    pageId,
    userId,
    kind,
  );

  if (!customer?.erxesApiId) {
    throw new Error('Customer not found');
  }

  const { conversation, botId, isNew } = await upsertInstagramConversation({
    models,
    integration,
    activity,
    text,
    message,
  });

  const normalizedMessage = normalizeInstagramMessage(activity);
  await syncInstagramInboxConversation({
    models,
    subdomain,
    integration,
    conversation,
    normalizedMessage,
    customerId: customer.erxesApiId,
    timestamp,
    isNew,
  });

  const erxesConversationId = conversation.erxesApiId;

  if (!erxesConversationId) {
    throw new Error('Erxes conversation ID is unavailable');
  }

  const existingMessage = await models.InstagramConversationMessages.findOne({
    mid,
  });

  if (
    await handleDeletedInstagramMessage({
      models,
      existingMessage,
      normalizedMessage,
      conversationId: erxesConversationId,
      mid,
    })
  )
    return;

  if (!existingMessage) {
    await createInstagramMessage({
      models,
      subdomain,
      conversation,
      conversationId: erxesConversationId,
      normalizedMessage,
      customerId: customer.erxesApiId,
      timestamp,
      mid,
      botId,
      automationPayload: message?.payload,
    });
  }
};
