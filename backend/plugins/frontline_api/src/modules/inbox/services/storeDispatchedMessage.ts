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

const getDispatchedMessageDoc = (
  data: DispatchedMessageData,
  doc: IConversationMessageAdd,
  kind: string,
  forwardedSnapshot?: Record<string, unknown>,
): IConversationMessageAdd & IMessage => ({
  ...doc,
  ...(kind === 'instagram-messenger' && doc.extraInfo?.forwardedFrom
    ? { content: data.content || '' }
    : {}),
  ...(data.displayContent ? { content: data.displayContent } : {}),
  ...(kind === 'facebook-messenger' && data.extraData?.facebookDelivery
    ? { content: data.content || '', attachments: data.attachments || [] }
    : {}),
  ...(forwardedSnapshot
    ? { content: doc.extraInfo?.forwardedNote || '' }
    : {}),
  ...getDispatchedMessageExtraData(data.extraData, forwardedSnapshot, doc),
  ...(data.messageKind ? { messageKind: data.messageKind } : {}),
  ...(data.providerData ? { providerData: data.providerData } : {}),
  ...(data.replyTo ? { replyTo: data.replyTo } : {}),
  ...(data.deliveryStatus ? { deliveryStatus: data.deliveryStatus } : {}),
});

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
  const { conversationId: responseConversationId, content } = data;
  if (responseConversationId && content) {
    await models.Conversations.updateConversation(responseConversationId, {
      content,
      updatedAt: new Date(),
    });
  }

  const deliveredParts =
    kind === 'instagram-messenger' && data.parts?.length
      ? data.parts
      : undefined;
  const messageDocs = deliveredParts
    ? deliveredParts.map((part, index) =>
        getDispatchedMessageDoc(
          part,
          {
            ...doc,
            ...part,
            content: part.content ?? doc.content,
            conversationId: doc.conversationId,
          },
          kind,
          index === 0 ? forwardedSnapshot : undefined,
        ),
      )
    : [getDispatchedMessageDoc(data, doc, kind, forwardedSnapshot)];
  const messages: IMessageDocument[] = [];
  // addMessage also updates the conversation preview and first responder.
  // Keep writes ordered so later parts cannot be overtaken by earlier ones.
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
  // Publish in the same order as storage to preserve the live timeline.
  for (const message of messages) {
    await pConversationClientMessageInserted(subdomain, message);
  }
  return messages[messages.length - 1];
};
