import type {
  IConversationMessageAdd,
  IMessage,
} from '@/inbox/@types/conversationMessages';
import type { IConversationDocument } from '@/inbox/@types/conversations';
import { pConversationClientMessageInserted } from '@/inbox/graphql/resolvers/mutations/widget';
import type { IContext } from '~/connectionResolvers';
import {
  markAutomatedReplyHumanActive,
  publishUnreadCountsSafely,
} from '@/inbox/graphql/resolvers/mutations/conversationAutomation';

type DispatchedMessageData = {
  conversationId?: string;
  content?: string;
  displayContent?: string;
  extraData?: Record<string, unknown>;
  attachments?: IConversationMessageAdd['attachments'];
} & Pick<
  IMessage,
  'messageKind' | 'providerData' | 'replyTo' | 'deliveryStatus'
>;

export const storeDispatchedMessage = async ({
  data,
  doc,
  kind,
  conversation,
  integrationId,
  userId,
  models,
  subdomain,
  forwardedSnapshot,
}: {
  data: DispatchedMessageData;
  doc: IConversationMessageAdd;
  kind: string;
  conversation: IConversationDocument;
  integrationId: string;
  userId: string;
  models: IContext['models'];
  subdomain: string;
  forwardedSnapshot?: Record<string, unknown>;
}) => {
  const {
    conversationId: responseConversationId,
    content,
    displayContent,
    extraData,
    messageKind,
    providerData,
    replyTo,
    deliveryStatus,
  } = data;
  if (responseConversationId && content) {
    await models.Conversations.updateConversation(responseConversationId, {
      content,
      updatedAt: new Date(),
    });
  }

  const messageDoc: typeof doc & { extraData?: Record<string, unknown> } = {
    ...doc,
    ...(kind === 'instagram-messenger' && doc.extraInfo?.forwardedFrom
      ? { content: content || '' }
      : {}),
    ...(displayContent ? { content: displayContent } : {}),
    ...(kind === 'facebook-messenger' && extraData?.facebookDelivery
      ? { content: content || '', attachments: data.attachments || [] }
      : {}),
    ...(forwardedSnapshot
      ? { content: doc.extraInfo?.forwardedNote || '' }
      : {}),
    ...(extraData || forwardedSnapshot
      ? {
          extraData: {
            ...extraData,
            ...(forwardedSnapshot && {
              forwardedSnapshot,
              forwardedFrom: doc.extraInfo?.forwardedFrom,
            }),
          },
        }
      : {}),
    ...(messageKind ? { messageKind } : {}),
    ...(providerData ? { providerData } : {}),
    ...(replyTo ? { replyTo } : {}),
    ...(deliveryStatus ? { deliveryStatus } : {}),
  };

  const message = await models.ConversationMessages.addMessage(
    messageDoc,
    userId,
  );
  if (kind === 'telegram-messenger' && responseConversationId && content) {
    await models.Conversations.updateConversation(responseConversationId, {
      content,
    });
  }
  await publishUnreadCountsSafely({
    conversationId: conversation._id,
    integrationId,
    userIds: doc.mentionedUserIds?.filter((id) => id !== userId) || [],
    models,
    subdomain,
  });
  const dbMessage = await models.ConversationMessages.getMessage(message._id);
  await markAutomatedReplyHumanActive({ models, conversation, userId });
  await pConversationClientMessageInserted(subdomain, dbMessage);
  return dbMessage;
};
