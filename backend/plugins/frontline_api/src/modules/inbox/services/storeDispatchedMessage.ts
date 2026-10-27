import type {
  IConversationMessageAdd,
  IMessage,
  IMessageDocument,
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
  createdAt?: Date;
  extraData?: Record<string, unknown>;
  attachments?: IConversationMessageAdd['attachments'];
  parts?: DispatchedMessageData[];
} & Pick<
  IMessage,
  'messageKind' | 'providerData' | 'replyTo' | 'deliveryStatus'
>;

const getDispatchedMessageExtraData = (
  extraData: DispatchedMessageData['extraData'],
  forwardedSnapshot: Record<string, unknown> | undefined,
  doc: IConversationMessageAdd,
): { extraData?: Record<string, unknown> } => {
  if (!extraData && !forwardedSnapshot) {
    return {};
  }
  return {
    extraData: {
      ...extraData,
      ...(forwardedSnapshot && {
        forwardedSnapshot,
        forwardedFrom: doc.extraInfo?.forwardedFrom,
      }),
    },
  };
};

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
    ...getDispatchedMessageExtraData(extraData, forwardedSnapshot, doc),
    ...(messageKind ? { messageKind } : {}),
    ...(providerData ? { providerData } : {}),
    ...(replyTo ? { replyTo } : {}),
    ...(deliveryStatus ? { deliveryStatus } : {}),
  };

  const deliveredParts =
    kind === 'instagram-messenger' && data.parts?.length
      ? data.parts
      : undefined;
  const messageDocs = deliveredParts
    ? deliveredParts.map((part) => ({
        ...messageDoc,
        ...part,
        conversationId: doc.conversationId,
        ...getDispatchedMessageExtraData(
          part.extraData,
          forwardedSnapshot,
          doc,
        ),
      }))
    : [messageDoc];
  const messages: IMessageDocument[] = [];
  for (const deliveredDoc of messageDocs) {
    const message = await models.ConversationMessages.addMessage(
      deliveredDoc,
      userId,
    );
    messages.push(await models.ConversationMessages.getMessage(message._id));
  }
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
  await markAutomatedReplyHumanActive({ models, conversation, userId });
  for (const message of messages) {
    await pConversationClientMessageInserted(subdomain, message);
  }
  return messages[messages.length - 1];
};
