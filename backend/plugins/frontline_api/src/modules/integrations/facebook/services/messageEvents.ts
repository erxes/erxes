import type { IFacebookConversationMessage } from '@/integrations/facebook/@types/conversationMessages';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import type { IModels } from '~/connectionResolvers';

type TFacebookReaction = NonNullable<
  IFacebookConversationMessage['reactions']
>[number];

const REPLY_QUOTE_PATTERN =
  /^<blockquote><strong>Replying to<\/strong><br\s*\/?>(?:[^<]|<(?!\/blockquote>))*<\/blockquote>/i;

export const replaceSenderReaction = (
  reactions: TFacebookReaction[] | undefined,
  senderId: string,
  next?: TFacebookReaction,
): TFacebookReaction[] => [
  ...(reactions || []).filter((item) => item.senderId !== senderId),
  ...(next ? [next] : []),
];

export const publishFacebookMessage = async <T extends object>(
  conversationErxesApiId: string | undefined,
  message: T,
) => {
  if (!conversationErxesApiId) {
    return;
  }

  await graphqlPubsub.publish(
    `conversationMessageInserted:${conversationErxesApiId}`,
    {
      conversationMessageInserted: {
        ...message,
        conversationId: conversationErxesApiId,
      },
    },
  );
};

export const getReplyPreview = (content?: string) =>
  (content || '')
    .replace(REPLY_QUOTE_PATTERN, '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^<>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

export const resolveReplyTo = async (
  models: IModels,
  conversationId: string,
  replyToMessageId?: string,
) => {
  if (!replyToMessageId) {
    return undefined;
  }

  const repliedMessage = await models.FacebookConversationMessages.findOne({
    conversationId,
    mid: replyToMessageId,
  }).lean();

  if (!repliedMessage) {
    return {
      messageId: replyToMessageId,
      content: 'Original message unavailable',
    };
  }

  return {
    messageId: replyToMessageId,
    content: getReplyPreview(repliedMessage.content) || 'Attachment',
    authorName: repliedMessage.userId ? 'You' : 'Customer',
  };
};
