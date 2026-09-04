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
import {
  getPageAccessTokenFromMap,
  graphRequest,
  sendReply,
} from '@/integrations/facebook/utils';
import { IFacebookConversationDocument } from '@/integrations/facebook/@types/conversations';
import { IFacebookConversationMessageDocument } from '@/integrations/facebook/@types/conversationMessages';
import {
  checkIsBot,
  parseAutomationPayload,
  triggerFacebookMessageAutomation,
} from '@/integrations/facebook/meta/automation/utils/messageUtils';

const STORY_LIFETIME_MS = 24 * 60 * 60 * 1000;

type TGraphMessageAttachment = {
  file_url?: string;
  image_data?: { url?: string; preview_url?: string };
  video_data?: { url?: string; preview_url?: string };
};

type TGraphMessageDetails = {
  attachments?: { data?: TGraphMessageAttachment[] };
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const fetchStoryMediaUrl = async (
  integration: IFacebookIntegrationDocument,
  pageId: string,
  mid: string,
) => {
  const pageToken = getPageAccessTokenFromMap(
    pageId,
    integration.facebookPageTokensMap || {},
  );
  if (!pageToken) {
    debugFacebook(`Cannot fetch story media without a page token: ${pageId}`);
    return undefined;
  }

  try {
    const details = (await graphRequest.get(
      `/${encodeURIComponent(mid)}?fields=attachments.limit(10){file_url,image_data,video_data}`,
      pageToken,
    )) as TGraphMessageDetails;
    const attachment = details.attachments?.data?.[0];

    return (
      attachment?.image_data?.url ||
      attachment?.image_data?.preview_url ||
      attachment?.video_data?.url ||
      attachment?.video_data?.preview_url ||
      attachment?.file_url
    );
  } catch (error) {
    debugFacebook(
      `Failed to fetch Messenger story media for ${mid}: ${getErrorMessage(error)}`,
    );
    return undefined;
  }
};

const readOpenGraphValue = (html: string, property: string) => {
  const escapedProperty = property.replace(
    /[.*+?^${}()|[\]\\]/g,
    String.raw`\$&`,
  );
  const pattern = new RegExp(
    `<meta[^>]+property=["']${escapedProperty}["'][^>]+content=["']([^"']*)`,
    'i',
  );
  return pattern.exec(html)?.[1]?.replace(/&amp;/g, '&');
};

const fetchFacebookSharePreview = async (url?: string) => {
  if (!url) return undefined;

  try {
    const parsed = new URL(url);
    if (
      parsed.protocol !== 'https:' ||
      (parsed.hostname !== 'facebook.com' &&
        !parsed.hostname.endsWith('.facebook.com'))
    ) {
      return undefined;
    }

    const response = await fetch(parsed.toString(), {
      headers: { 'user-agent': 'facebookexternalhit/1.1' },
      signal: AbortSignal.timeout(5000),
    });
    const finalUrl = new URL(response.url);
    if (
      finalUrl.hostname !== 'facebook.com' &&
      !finalUrl.hostname.endsWith('.facebook.com')
    ) {
      return undefined;
    }

    const html = await response.text();
    const previewUrl = readOpenGraphValue(html, 'og:image');

    return { previewUrl };
  } catch {
    return undefined;
  }
};

const isFacebookStoryUrl = (url?: string) => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return (
      (parsed.hostname === 'facebook.com' ||
        parsed.hostname.endsWith('.facebook.com')) &&
      parsed.pathname.startsWith('/stories/')
    );
  } catch {
    return false;
  }
};

/**
 * Sanitize a value expected to be a string to prevent NoSQL injection.
 * Coerces non-string values (e.g. numbers) to strings, which also neutralizes
 * injection objects like {"$gt": ""} by converting them to "[object Object]".
 */
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

const sanitizeString = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }
  return String(value ?? '');
};

const DEFAULT_HANDOFF_MESSAGE =
  'A teammate will take over shortly. Automated replies are paused.';

const getReplyPreview = (content?: string) =>
  (content || '')
    .replace(
      /^<blockquote><strong>Replying to<\/strong><br\s*\/?>(?:[^<]|<(?!\/blockquote>))*<\/blockquote>/i,
      '',
    )
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^<>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

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

const handleReaction = async (
  models: IModels,
  userId: string,
  pageId: string,
  reaction: Activity['channelData']['reaction'],
) => {
  if (!reaction?.mid || !reaction.action) {
    return false;
  }

  const conversation = await models.FacebookConversations.findOne({
    senderId: userId,
    recipientId: pageId,
  });

  if (!conversation?.erxesApiId) {
    debugFacebook('Ignoring reaction for an unknown conversation');
    return true;
  }

  const target = await models.FacebookConversationMessages.findOne({
    conversationId: conversation._id,
    mid: sanitizeString(reaction.mid),
  });

  if (!target) {
    debugFacebook('Ignoring reaction for an unknown message');
    return true;
  }

  const normalizedReaction = sanitizeString(
    reaction.reaction || reaction.emoji,
  );
  if (reaction.action === 'react' && !normalizedReaction) {
    debugFacebook('Ignoring reaction without a value');
    return true;
  }

  const reactions = (target.reactions || []).filter(
    (item) => item.senderId !== userId,
  );
  if (reaction.action === 'react') {
    reactions.push({ senderId: userId, reaction: normalizedReaction });
  }
  target.reactions = reactions;
  await target.save();

  await graphqlPubsub.publish(
    `conversationMessageInserted:${conversation.erxesApiId}`,
    {
      conversationMessageInserted: {
        ...target.toObject(),
        conversationId: conversation.erxesApiId,
      },
    },
  );
  return true;
};

const upsertFacebookConversation = async ({
  models,
  integration,
  senderId,
  recipientId,
  timestamp,
  content,
  botId,
}: {
  models: IModels;
  integration: IFacebookIntegrationDocument;
  senderId: string;
  recipientId: string;
  timestamp: Date;
  content?: string;
  botId?: string;
}) => {
  let conversation = await models.FacebookConversations.findOne({
    senderId: { $eq: senderId },
    recipientId: { $eq: recipientId },
  });

  if (!conversation) {
    try {
      conversation = await models.FacebookConversations.create({
        timestamp,
        senderId,
        recipientId,
        content,
        integrationId: integration._id,
        isBot: Boolean(botId),
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
    conversation.content = content || '';
  }

  return conversation;
};

const formatAttachments = (
  attachments: NonNullable<Activity['channelData']['message']>['attachments'],
) => {
  const stickerAttachment = (attachments || []).find(
    (attachment) =>
      Boolean(attachment.payload?.sticker_id) &&
      Boolean(attachment.payload?.url),
  );
  const attachmentsToFormat = stickerAttachment
    ? [{ ...stickerAttachment, type: 'image' }]
    : attachments || [];
  const seenAttachmentUrls = new Set<string>();

  return attachmentsToFormat
    .map((att) => ({
      type: att.type === 'fallback' ? 'share' : att.type,
      url: att.payload?.url || '',
      name:
        att.payload?.title ||
        (att.type === 'fallback' ? 'Shared Instagram story' : undefined),
    }))
    .filter((attachment) => {
      if (attachment.url && seenAttachmentUrls.has(attachment.url)) {
        return false;
      }
      if (attachment.url) seenAttachmentUrls.add(attachment.url);
      return true;
    });
};

const syncInboxConversation = async ({
  models,
  subdomain,
  customerId,
  integrationId,
  content,
  attachments,
  conversation,
  timestamp,
}: {
  models: IModels;
  subdomain: string;
  customerId?: string;
  integrationId: string;
  content: string;
  attachments: ReturnType<typeof formatAttachments>;
  conversation: IFacebookConversationDocument;
  timestamp: Date;
}) => {
  try {
    const response = await receiveInboxMessage(subdomain, {
      action: 'create-or-update-conversation',
      payload: JSON.stringify({
        customerId,
        integrationId,
        content,
        attachments,
        conversationId: conversation.erxesApiId,
        updatedAt: timestamp,
      }),
    });

    if (response.status !== 'success') {
      throw new Error(
        `Conversation creation failed: ${JSON.stringify(response)}`,
      );
    }

    conversation.erxesApiId = response.data._id;
    await conversation.save();
  } catch (e) {
    await models.FacebookConversations.deleteOne({ _id: conversation._id });
    throw new Error(e);
  }
};

type TFacebookMessage = NonNullable<Activity['channelData']['message']>;

const prepareFacebookActivity = (activity: Activity) => {
  const { recipient, from, timestamp, channelData } = activity;
  let { message } = channelData;
  const { postback } = channelData;
  const pageId = sanitizeString(recipient.id);
  const userId = sanitizeString(from.id);
  const rawMid = channelData.message?.mid || postback?.mid;
  const mid = rawMid != null ? sanitizeString(rawMid) : undefined;
  const attachments = channelData.message?.attachments;
  let text = activity.text || message?.text;

  if (!text && !message && postback) {
    text = postback.title;
    message = { mid: postback.mid };
    if (postback.payload) {
      message.payload = postback.payload;
    }
  }
  if (message?.quick_reply) {
    message.payload = message.quick_reply.payload;
  }

  const referral = message?.referral || postback?.referral;
  const adData =
    referral?.type === 'OPEN_THREAD'
      ? {
          source: referral.source,
          type: referral.type,
          adId: referral.ad_id,
          postId: referral.ads_context_data?.post_id,
          pageId,
        }
      : undefined;

  return {
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
  };
};

const resolveFacebookReplyTo = async (
  models: IModels,
  conversationId: string,
  message?: TFacebookMessage,
) => {
  const replyToMessageId = message?.reply_to?.mid;
  if (!replyToMessageId) {
    return undefined;
  }

  const repliedMessage = await models.FacebookConversationMessages.findOne({
    conversationId,
    mid: replyToMessageId,
  }).lean();
  return {
    messageId: replyToMessageId,
    content: getReplyPreview(repliedMessage?.content) || 'Attachment',
    authorName: repliedMessage?.userId ? 'You' : 'Customer',
  };
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
  senderId,
  recipientId,
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
  replyTo?: Awaited<ReturnType<typeof resolveFacebookReplyTo>>;
  botId?: string;
  senderId: string;
  recipientId: string;
  adData?: Exclude<
    ReturnType<typeof prepareFacebookActivity>['adData'],
    undefined
  >;
  messageKind?: string;
  providerData?: IFacebookConversationMessageDocument['providerData'];
  expiresAt?: Date;
}) => {
  const existing = await models.FacebookConversationMessages.findOne({
    mid: { $eq: mid },
  });
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
      await graphqlPubsub.publish(
        `conversationMessageInserted:${conversation.erxesApiId}`,
        { conversationMessageInserted: updated },
      );
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
    try {
      await graphqlPubsub.publish(
        `conversationMessageInserted:${conversation.erxesApiId}`,
        {
          conversationMessageInserted: doc,
        },
      );
    } catch {
      throw new Error(
        'conversationMessageInserted Error publishing subscription:',
      );
    }

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
          senderId,
          recipientId,
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
    throw new Error(
      e.message.includes('duplicate')
        ? 'Concurrent request: conversation message duplication'
        : e,
    );
  }
};

const resolveStoryMessageKind = (
  isStoryShare: boolean,
  attachmentType?: string,
): string | undefined => {
  if (isStoryShare) {
    return 'story_reply';
  }
  if (attachmentType === 'story_reply' || attachmentType === 'story_mention') {
    return attachmentType;
  }
  if (attachmentType === 'post' || attachmentType === 'reel') {
    return 'share';
  }
  return undefined;
};

type TChannelMessage = NonNullable<Activity['channelData']['message']>;
type TChannelAttachment = NonNullable<TChannelMessage['attachments']>[number];

// Meta sends story shares as a message containing only `mid` for some
// Messenger Page webhooks. Preserve that event as an unavailable story
// instead of storing an empty message that the inbox cannot render.
const isMidOnlyFacebookMessage = (args: {
  mid?: string;
  message?: TChannelMessage;
  text?: string;
  attachments?: TChannelMessage['attachments'];
  postback?: Activity['channelData']['postback'];
}): boolean =>
  Boolean(
    args.mid &&
    args.message &&
    !args.text &&
    !args.attachments?.length &&
    !args.postback &&
    !args.message.quick_reply &&
    !args.message.referral &&
    !args.message.payload,
  );

const resolveStoryEnrichment = async (args: {
  integration: IFacebookIntegrationDocument;
  pageId: string;
  mid?: string;
  story?: { id?: string; url?: string };
  isMidOnlyMessage: boolean;
  attachments?: TChannelMessage['attachments'];
}) => {
  const { integration, pageId, mid, story, isMidOnlyMessage, attachments } =
    args;
  const storyMediaUrl =
    story?.url ||
    (isMidOnlyMessage && mid
      ? await fetchStoryMediaUrl(integration, pageId, mid)
      : undefined);
  const messageAttachments: TChannelAttachment[] =
    story || isMidOnlyMessage
      ? [
          {
            type: 'story_reply',
            payload: { url: storyMediaUrl || '' },
          },
        ]
      : attachments || [];
  const primaryAttachment = messageAttachments[0];
  const isStoryShare =
    primaryAttachment?.type === 'share' &&
    isFacebookStoryUrl(primaryAttachment.payload?.url);
  const sharePreview =
    primaryAttachment?.type === 'post' ||
    primaryAttachment?.type === 'reel' ||
    isStoryShare
      ? await fetchFacebookSharePreview(primaryAttachment.payload?.url)
      : undefined;
  const messageKind = resolveStoryMessageKind(
    isStoryShare,
    primaryAttachment?.type,
  );
  const isStory = Boolean(messageKind);
  const storyUrl = isStoryShare
    ? sharePreview?.previewUrl
    : primaryAttachment?.payload?.url;
  const storyProviderData = {
    messageId: mid,
    attachmentType: primaryAttachment?.type,
    storyUrl,
    fallbackReason: storyUrl ? undefined : 'Story unavailable',
    previewText:
      messageKind === 'story_reply' ? 'Story reply' : 'Story mention',
  };
  const shareProviderData = {
    messageId: mid,
    attachmentType: primaryAttachment?.type,
    previewText:
      primaryAttachment?.type === 'reel' ? 'Facebook reel' : 'Facebook post',
    previewUrl: sharePreview?.previewUrl,
    shareType:
      primaryAttachment?.type === 'reel'
        ? ('reel' as const)
        : ('post' as const),
  };
  let providerData:
    | typeof storyProviderData
    | typeof shareProviderData
    | undefined;
  if (isStory) {
    providerData = storyProviderData;
  } else if (messageKind === 'share') {
    providerData = shareProviderData;
  }
  return { messageAttachments, primaryAttachment, messageKind, providerData };
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
    const isStory = Boolean(messageKind);
    const attachmentPreview = attachmentPreviewFor({
      primaryAttachment,
      message,
      postback,
    });
    const previewContent =
      text || providerData?.previewText || attachmentPreview;
    const replyTo = await resolveFacebookReplyTo(
      models,
      conversation._id,
      message,
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
      senderId: userId,
      recipientId: pageId,
      adData,
      messageKind,
      providerData,
      expiresAt: isStory
        ? new Date(timestamp.getTime() + STORY_LIFETIME_MS)
        : undefined,
    });
  } catch (error) {
    throw new Error(`Error processing Facebook message: ${error.message}.`);
  }
};
