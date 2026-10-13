import type { IModels } from '~/connectionResolvers';
import type { IFacebookIntegrationDocument } from '@/integrations/facebook/@types/integrations';
import { INTEGRATION_KINDS } from '@/integrations/facebook/constants';
import { getOrCreateCustomer } from '@/integrations/facebook/controller/store';
import { debugFacebook } from '@/integrations/facebook/debuggers';
import type { Activity } from '@/integrations/facebook/@types/utils';
import { pConversationClientMessageInserted } from '@/inbox/graphql/resolvers/mutations/widget';
import type { IFacebookConversationDocument } from '@/integrations/facebook/@types/conversations';
import type { IFacebookConversationMessageDocument } from '@/integrations/facebook/@types/conversationMessages';
import {
  checkIsBot,
  parseAutomationPayload,
  triggerFacebookMessageAutomation,
} from '@/integrations/facebook/meta/automation/utils/messageUtils';
import {
  isMidOnlyFacebookMessage,
  prepareFacebookActivity,
  resolveStoryEnrichment,
  type TFacebookMessage,
} from '@/integrations/facebook/services/messageNormalization';
import {
  formatAttachments,
  handleHumanHandoff,
  handleReaction,
  syncInboxConversation,
  upsertFacebookConversation,
} from '@/integrations/facebook/services/conversationSync';
import {
  publishFacebookMessage,
  resolveReplyTo,
} from '@/integrations/facebook/services/messageEvents';
import {
  STORY_LIFETIME_MS,
  isStoryMessageKind,
} from '@/integrations/facebook/services/messagePreview';
import { getErrorMessage } from '@/integrations/utils';

const attachmentPreviewFor = (args: {
  primaryAttachment?: {
    type?: string;
    payload?: { sticker_id?: string; url?: string; title?: string };
  };
  message?: { quick_reply?: { payload?: string } };
  postback?: { title?: string } | null;
}): string => {
  if (args.primaryAttachment?.payload?.sticker_id) return 'Sent a sticker';
  if (args.primaryAttachment?.type === 'image') return 'Sent an image';
  if (args.primaryAttachment?.type === 'video') return 'Sent a video';
  if (args.primaryAttachment?.type === 'audio') return 'Voice message';
  if (args.primaryAttachment?.type === 'file') return 'Sent a file';
  if (args.primaryAttachment) return 'Shared content';
  if (args.message?.quick_reply) return 'Selected a quick reply';
  if (args.postback) return args.postback.title || 'Selected an action';
  return 'Unsupported Messenger message';
};

const storeFacebookMessage = async ({
  models,
  subdomain,
  integration,
  conversation,
  message,
  mid,
  timestamp,
  content,
  customerId,
  attachments,
  replyTo,
  botId,
  adData,
  messageKind,
  providerData,
  expiresAt,
}: {
  models: IModels;
  subdomain: string;
  integration: IFacebookIntegrationDocument;
  conversation: IFacebookConversationDocument;
  message?: TFacebookMessage;
  mid?: string;
  timestamp: Date;
  content: string;
  customerId?: string;
  attachments: ReturnType<typeof formatAttachments>;
  replyTo?: Awaited<ReturnType<typeof resolveReplyTo>>;
  botId?: string;
  adData?: Exclude<
    ReturnType<typeof prepareFacebookActivity>['adData'],
    undefined
  >;
  messageKind?: string;
  providerData: IFacebookConversationMessageDocument['providerData'];
  expiresAt?: Date;
}) => {
  const existing = mid
    ? await models.FacebookConversationMessages.findOne({ mid: { $eq: mid } })
    : null;
  if (existing) {
    if (messageKind && !existing.messageKind) {
      existing.attachments = attachments;
      existing.messageKind = messageKind;
      existing.providerData = providerData;
      existing.expiresAt = expiresAt;
      await existing.save();

      const updated = {
        ...existing.toObject(),
        conversationId: conversation.erxesApiId,
      };
      await pConversationClientMessageInserted(subdomain, updated);
      await publishFacebookMessage(conversation.erxesApiId, updated);
    }
    return;
  }

  try {
    const created = await models.FacebookConversationMessages.create({
      conversationId: conversation._id,
      mid,
      createdAt: timestamp,
      content,
      customerId,
      attachments,
      replyTo,
      botId,
      messageKind,
      providerData,
      expiresAt,
    });
    const doc = {
      ...created.toObject(),
      conversationId: conversation.erxesApiId,
    };

    await pConversationClientMessageInserted(subdomain, doc);
    await publishFacebookMessage(conversation.erxesApiId, doc);

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
          conversationMessage: created,
          integration,
          bot: handoffBot,
        });
      }
      return;
    }

    triggerFacebookMessageAutomation(subdomain, {
      conversationMessage: created.toObject(),
      payload: message?.payload,
      adData,
    });
  } catch (e) {
    const errorMessage = getErrorMessage(e);
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
  integration: IFacebookIntegrationDocument,
  activity: Activity,
) => {
  try {
    debugFacebook(
      `Received message: ${activity.text} from ${activity.from.id}`,
    );
    const {
      recipient,
      timestamp,
      message,
      postback,
      pageId,
      userId,
      mid,
      attachments,
      text,
      adData,
    } = prepareFacebookActivity(activity);
    const kind = INTEGRATION_KINDS.MESSENGER;

    if (
      await handleReaction(
        models,
        userId,
        pageId,
        activity.channelData.reaction,
      )
    ) {
      return;
    }

    if (message?.is_echo || userId === pageId) {
      debugFacebook(
        `Skipping Facebook echo message ${mid || ''} from page ${pageId}`,
      );
      return;
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

    const bot = await checkIsBot(models, message, recipient.id);
    const botId = bot?._id;
    const conversation = await upsertFacebookConversation({
      models,
      integration,
      senderId: userId,
      recipientId: pageId,
      timestamp,
      content: text,
      botId,
    });
    const story = message?.reply_to?.story;
    const isMidOnlyMessage = isMidOnlyFacebookMessage({
      mid,
      message,
      text,
      attachments,
      postback,
    });
    const { messageAttachments, primaryAttachment, messageKind, providerData } =
      await resolveStoryEnrichment({
        integration,
        pageId,
        mid,
        story,
        isMidOnlyMessage,
        attachments,
      });
    const formattedAttachments = formatAttachments(messageAttachments);
    const isStory = isStoryMessageKind(messageKind);
    const attachmentPreview = attachmentPreviewFor({
      primaryAttachment,
      message,
      postback,
    });
    const previewContent =
      text || providerData?.previewText || attachmentPreview;
    const replyTo = await resolveReplyTo(
      models,
      conversation._id,
      message?.reply_to?.mid,
    );

    await syncInboxConversation({
      models,
      subdomain,
      customerId: customer.erxesApiId,
      integrationId: integration.erxesApiId,
      content: previewContent,
      attachments: formattedAttachments,
      conversation,
      timestamp,
    });
    await storeFacebookMessage({
      models,
      subdomain,
      integration,
      conversation,
      message,
      mid,
      timestamp,
      content: text || '',
      customerId: customer.erxesApiId,
      attachments: formattedAttachments,
      replyTo,
      botId,
      adData,
      messageKind,
      providerData,
      expiresAt: isStory
        ? new Date(timestamp.getTime() + STORY_LIFETIME_MS)
        : undefined,
    });
  } catch (error) {
    throw new Error(
      `Error processing Facebook message: ${getErrorMessage(error)}.`,
    );
  }
};
