import type { Activity } from '@/integrations/facebook/@types/utils';
import type { IFacebookIntegrationDocument } from '@/integrations/facebook/@types/integrations';
import { sanitizeString } from '@/integrations/facebook/services/conversationSync';
import {
  fetchFacebookSharePreview,
  fetchStoryMediaUrl,
  isFacebookStoryUrl,
  isStoryMessageKind,
} from '@/integrations/facebook/services/messagePreview';

export type TFacebookMessage = NonNullable<Activity['channelData']['message']>;

type PreparedFacebookActivity = {
  recipient: Activity['recipient'];
  timestamp: Date;
  message?: TFacebookMessage;
  postback: Activity['channelData']['postback'];
  pageId: string;
  userId: string;
  mid?: string;
  attachments: TFacebookMessage['attachments'];
  text?: string;
  adData?: {
    source: string;
    type: string;
    adId?: string;
    postId?: string;
    pageId: string;
  };
};

export const prepareFacebookActivity = (
  activity: Activity,
): PreparedFacebookActivity => {
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
export const isMidOnlyFacebookMessage = (args: {
  mid?: string;
  message?: TChannelMessage;
  text?: string;
  attachments: TChannelMessage['attachments'];
  postback: Activity['channelData']['postback'];
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

export const resolveStoryEnrichment = async (args: {
  integration: IFacebookIntegrationDocument;
  pageId: string;
  mid?: string;
  story?: { id?: string; url?: string };
  isMidOnlyMessage: boolean;
  attachments: TChannelMessage['attachments'];
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
  const isStory = isStoryMessageKind(messageKind);
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
