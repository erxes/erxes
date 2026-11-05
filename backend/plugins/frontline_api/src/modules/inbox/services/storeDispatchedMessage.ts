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

type DispatchedMessagePart = {
  content?: string;
  displayContent?: string;
  createdAt?: Date;
  extraData?: Record<string, unknown>;
  attachments?: IConversationMessageAdd['attachments'];
} & Pick<
  IMessage,
  'messageKind' | 'providerData' | 'replyTo' | 'deliveryStatus'
>;

type DispatchedMessageData = DispatchedMessagePart & {
  conversationId?: string;
  parts?: DispatchedMessagePart[];
};

type DispatchedMessageDoc = IConversationMessageAdd & IMessage;

type DispatchedMessageDocInput<TData = DispatchedMessagePart> = {
  data: TData;
  doc: IConversationMessageAdd;
  kind: string;
  forwardedSnapshot?: Record<string, unknown>;
};

type StoreDispatchedMessageParams =
  DispatchedMessageDocInput<DispatchedMessageData> & {
    conversation: IConversationDocument;
    integrationId: string;
    userId: string;
    models: IContext['models'];
    subdomain: string;
  };

const hasFacebookDelivery = ({ data, kind }: DispatchedMessageDocInput) =>
  kind === 'facebook-messenger' && Boolean(data.extraData?.facebookDelivery);

const resolveDispatchedContent = (input: DispatchedMessageDocInput): string => {
  const { data, doc, kind, forwardedSnapshot } = input;
  if (forwardedSnapshot) {
    return doc.extraInfo?.forwardedNote || '';
  }
  if (hasFacebookDelivery(input)) {
    return data.content || '';
  }
  if (data.displayContent) {
    return data.displayContent;
  }
  if (kind === 'instagram-messenger' && doc.extraInfo?.forwardedFrom) {
    return data.content || '';
  }
  return doc.content;
};

const resolveDispatchedExtraData = ({
  data,
  doc,
  forwardedSnapshot,
}: DispatchedMessageDocInput): Pick<IMessage, 'extraData'> => {
  if (!data.extraData && !forwardedSnapshot) {
    return {};
  }
  return {
    extraData: {
      ...data.extraData,
      ...(forwardedSnapshot && {
        forwardedSnapshot,
        forwardedFrom: doc.extraInfo?.forwardedFrom,
      }),
    },
  };
};

const buildDispatchedMessageDoc = (
  input: DispatchedMessageDocInput,
): DispatchedMessageDoc => {
  const { data, doc } = input;
  const { messageKind, providerData, replyTo, deliveryStatus } = data;
  return {
    ...doc,
    content: resolveDispatchedContent(input),
    ...(hasFacebookDelivery(input) && {
      attachments: data.attachments || [],
    }),
    ...resolveDispatchedExtraData(input),
    ...(messageKind && { messageKind }),
    ...(providerData && { providerData }),
    ...(replyTo && { replyTo }),
    ...(deliveryStatus && { deliveryStatus }),
  };
};

const toDeliveredPartDoc = (
  doc: IConversationMessageAdd,
  part: DispatchedMessagePart,
): IConversationMessageAdd & Pick<IMessage, 'createdAt'> => ({
  ...doc,
  content: part.content ?? doc.content,
  attachments: part.attachments ?? doc.attachments,
  ...(part.createdAt && { createdAt: part.createdAt }),
});

const buildDispatchedMessageDocs = ({
  data,
  doc,
  kind,
  forwardedSnapshot,
}: DispatchedMessageDocInput<DispatchedMessageData>): DispatchedMessageDoc[] => {
  const parts = kind === 'instagram-messenger' ? data.parts : undefined;
  if (!parts?.length) {
    return [buildDispatchedMessageDoc({ data, doc, kind, forwardedSnapshot })];
  }
  return parts.map((part, index) =>
    buildDispatchedMessageDoc({
      data: part,
      doc: toDeliveredPartDoc(doc, part),
      kind,
      forwardedSnapshot: index === 0 ? forwardedSnapshot : undefined,
    }),
  );
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
}: StoreDispatchedMessageParams): Promise<IMessageDocument> => {
  const { conversationId: responseConversationId, content } = data;
  if (responseConversationId && content) {
    await models.Conversations.updateConversation(responseConversationId, {
      content,
      updatedAt: new Date(),
    });
  }

  const messages: IMessageDocument[] = [];
  for (const messageDoc of buildDispatchedMessageDocs({
    data,
    doc,
    kind,
    forwardedSnapshot,
  })) {
    const { _id } = await models.ConversationMessages.addMessage(
      messageDoc,
      userId,
    );
    messages.push(await models.ConversationMessages.getMessage(_id));
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
