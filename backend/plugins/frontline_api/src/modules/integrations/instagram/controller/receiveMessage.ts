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

export const receiveMessage = async (
  models: IModels,
  subdomain: string,
  integration: IInstagramIntegrationDocument,
  activity: IMessageData,
) => {
  const userId = activity.sender.id;
  const { recipient, timestamp } = activity;

  let message = activity.message;
  const postback = activity.postback;

  const pageId = recipient.id;
  const kind = INTEGRATION_KINDS.MESSENGER;
  const mid =
    message?.mid ||
    postback?.mid ||
    `${activity.sender.id}:${activity.timestamp}`;

  if (activity.reaction) {
    const target = await models.InstagramConversationMessages.findOne({
      mid: activity.reaction.mid,
    });
    if (!target) return;

    const reactions = (target.reactions || []).filter(
      (reaction) => reaction.senderId !== activity.sender.id,
    );
    if (activity.reaction.action === 'react') {
      reactions.push({
        senderId: activity.sender.id,
        reaction: activity.reaction.reaction,
        emoji: activity.reaction.emoji,
      });
    }
    target.reactions = reactions;
    await target.save();
    const targetConversation = await models.InstagramConversations.findOne({
      _id: target.conversationId,
    });
    if (!targetConversation?.erxesApiId) return;
    await syncInboxMessageAndPublish(
      models,
      targetConversation.erxesApiId,
      activity.reaction.mid,
      { reactions },
    );
    return;
  }

  if (activity.read || activity.delivery) {
    const status = activity.read ? 'read' : 'delivered';
    const mids =
      activity.delivery?.mids ||
      (activity.read?.mid ? [activity.read.mid] : []);
    const pageId = integration.instagramPageId;
    const customerInstagramId = [
      activity.sender.id,
      activity.recipient.id,
    ].find((id) => id !== pageId);
    const statusConversation = customerInstagramId
      ? await models.InstagramConversations.findOne({
          senderId: customerInstagramId,
          recipientId: pageId,
        })
      : null;
    const watermark = activity.read?.watermark || activity.delivery?.watermark;
    let statusQuery: Record<string, unknown> | null = null;
    if (mids.length) {
      statusQuery = { mid: { $in: mids } };
    } else if (statusConversation && watermark) {
      statusQuery = {
        conversationId: statusConversation._id,
        userId: { $exists: true },
        createdAt: { $lte: new Date(watermark) },
      };
    }
    if (!statusQuery) return;

    const statusMessages =
      await models.InstagramConversationMessages.find(statusQuery);
    await models.InstagramConversationMessages.updateMany(statusQuery, {
      $set: { deliveryStatus: status },
    });
    if (statusConversation?.erxesApiId) {
      await Promise.all(
        statusMessages.map((statusMessage) =>
          syncInboxMessageAndPublish(
            models,
            statusConversation.erxesApiId as string,
            statusMessage.mid,
            { deliveryStatus: status },
          ),
        ),
      );
    }
    return;
  }

  if (message?.is_echo) return;

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

  const normalizedMessage = normalizeInstagramMessage(activity);
  const formattedAttachments = normalizedMessage.attachments || [];

  try {
    const apiConversationResponse = await receiveInboxMessage(subdomain, {
      action: 'create-or-update-conversation',
      payload: JSON.stringify({
        customerId: customer.erxesApiId,
        integrationId: integration.erxesApiId,
        content:
          normalizedMessage.content ||
          normalizedMessage.providerData?.previewText ||
          normalizedMessage.providerData?.fallbackReason ||
          '',
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

  if (existingMessage && normalizedMessage.messageKind === 'deleted') {
    existingMessage.content = '';
    existingMessage.attachments = [];
    existingMessage.messageKind = 'deleted';
    existingMessage.deliveryStatus = 'deleted';
    existingMessage.providerData = normalizedMessage.providerData;
    await existingMessage.save();
    await syncInboxMessageAndPublish(models, erxesConversationId, mid, {
      content: '',
      attachments: [],
      messageKind: 'deleted',
      deliveryStatus: 'deleted',
      providerData: normalizedMessage.providerData,
    });
    return;
  }

  if (!existingMessage) {
    let inboxMessageId: string | undefined;

    try {
      const content =
        normalizedMessage.content ||
        (formattedAttachments.length > 0 ? HAS_ATTACHMENT : '');

      const created = await models.InstagramConversationMessages.create({
        conversationId: conversation._id,
        mid,
        createdAt: timestamp,
        content,
        customerId: customer.erxesApiId,
        attachments: formattedAttachments,
        botId,
        messageKind: normalizedMessage.messageKind,
        providerData: normalizedMessage.providerData,
        replyTo: normalizedMessage.replyTo,
        deliveryStatus: normalizedMessage.deliveryStatus,
        expiresAt: normalizedMessage.expiresAt,
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
