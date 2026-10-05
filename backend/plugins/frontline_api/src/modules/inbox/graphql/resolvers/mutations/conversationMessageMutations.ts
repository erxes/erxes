import type {
  IConversationMessageAdd,
  IMessage,
} from '@/inbox/@types/conversationMessages';
import type { IConversationDocument } from '@/inbox/@types/conversations';
import { authorizeConversationAccess } from '@/inbox/conversationUtils';
import { resolveForwardedSnapshotForMessage } from '@/inbox/forwardedMessage';
import { pConversationClientMessageInserted } from './widget';
import {
  reactToConversationMessage,
  type IConversationReaction,
} from '@/inbox/services/conversationReaction';
import { createNotifications } from '~/utils/notifications';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import type { IContext } from '~/connectionResolvers';
import {
  dispatchConversationToService,
  markAutomatedReplyHumanActive,
  publishUnreadCountsSafely,
} from './conversationAutomation';
import { publishMessage, sendNotifications } from './conversationNotifications';

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

const storeDispatchedMessage = async ({
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

export const conversationMessageMutations = {
  async conversationMessagePin(
    _root: unknown,
    {
      conversationId,
      messageId,
      remove,
    }: {
      conversationId: string;
      messageId: string;
      remove?: boolean;
    },
    { user, models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('conversationMessageAdd');
    await authorizeConversationAccess(models, user, conversationId);
    const conversation =
      await models.Conversations.getConversation(conversationId);
    const integration = await models.Integrations.getIntegration({
      _id: conversation.integrationId,
    });
    if (integration.kind !== 'discord-messenger') {
      throw new Error('Pinning messages is not supported by this channel');
    }
    const response = await dispatchConversationToService(subdomain, 'discord', {
      action: 'pin-messenger',
      type: 'discord',
      payload: JSON.stringify({
        integrationId: integration._id,
        conversationId,
        messageId,
        remove,
      }),
      integrationId: integration._id,
    });
    if (response?.status === 'error') {
      throw new Error(response.errorMessage || 'Failed to update message pin');
    }
    return response?.data || { status: 'success' };
  },

  async conversationMessageReact(
    _root: unknown,
    args: IConversationReaction,
    context: IContext,
  ): Promise<boolean> {
    return reactToConversationMessage(args, context);
  },

  async conversationAgentTyping(
    _root,
    {
      conversationId,
      typing = true,
    }: { conversationId: string; typing?: boolean },
    { models, subdomain }: IContext,
  ) {
    try {
      const conversation =
        await models.Conversations.getConversation(conversationId);
      if (!conversation?.integrationId) {
        return false;
      }

      const integration = await models.Integrations.getIntegration({
        _id: conversation.integrationId,
      });
      if (!integration?.kind) {
        return false;
      }

      const serviceName = integration.kind.split('-')[0];

      await dispatchConversationToService(subdomain, serviceName, {
        action: 'typing',
        type: serviceName,
        payload: JSON.stringify({
          integrationId: integration._id,
          conversationId: conversation._id,
          typing,
        }),
        integrationId: integration._id,
      });

      return true;
    } catch {
      return false;
    }
  },

  async conversationMessageAdd(
    _root,
    doc: IConversationMessageAdd,
    { user, models, subdomain }: IContext,
  ) {
    try {
      const conversation = await models.Conversations.getConversation(
        doc.conversationId,
      );
      const integration = await models.Integrations.getIntegration({
        _id: conversation.integrationId,
      });

      const { _id: integrationId } = integration;
      const { _id: conversationId } = conversation;
      const {
        content = '',
        internal,
        attachments = [],
        extraInfo,
        poll,
        replyToMessageId,
      } = doc;
      const { _id: userId } = user;
      const forwardedSnapshot =
        !internal && integration.kind === 'discord-messenger'
          ? await resolveForwardedSnapshotForMessage(models, user, extraInfo)
          : undefined;

      await sendNotifications(subdomain, {
        user,
        conversations: [conversation],
        type: 'conversationAddMessage',
        mobile: true,
        messageContent: content,
      });

      const { kind } = integration;

      const customer = conversation.customerId
        ? await sendTRPCMessage({
            subdomain,
            pluginName: 'core',
            method: 'query',
            module: 'customers',
            action: 'findOne',
            input: { _id: conversation.customerId },
            defaultValue: null,
          })
        : null;

      if (!customer) {
        throw new Error('Customer not found for the conversation');
      }

      const email = customer.primaryEmail;

      if (!internal && kind === 'lead' && email) {
        await sendTRPCMessage({
          subdomain,

          pluginName: 'core',
          method: 'mutation',
          module: 'core',
          action: 'sendEmail',
          input: {
            toEmails: [email],
            title: 'Reply',
            template: { data: content },
          },
        });
      }

      if (doc.mentionedUserIds && doc.mentionedUserIds.length > 0) {
        const userIds = doc.mentionedUserIds.filter((id) => id !== userId);

        await createNotifications({
          contentType: 'inbox',
          contentTypeId: doc.conversationId,
          fromUserId: userId,
          subdomain,
          notificationType: 'internalNote',
          userIds,
          action: 'created',
        });
      }

      if (internal) {
        const message = await models.ConversationMessages.addMessage(
          doc,
          userId,
        );
        await publishUnreadCountsSafely({
          conversationId,
          integrationId,
          userIds: doc.mentionedUserIds?.filter((id) => id !== userId) || [],
          models,
          subdomain,
        });
        const dbMessage = await models.ConversationMessages.getMessage(
          message._id,
        );

        publishMessage(models, dbMessage);

        return dbMessage;
      }

      const serviceName = integration.kind.split('-')[0];
      const actionType = kind?.split('-')[1] || 'unknown';

      const response = await dispatchConversationToService(
        subdomain,
        serviceName,
        {
          action: `reply-${actionType}`,
          type: serviceName,
          payload: JSON.stringify({
            integrationId,
            conversationId,
            content,
            internal,
            attachments,
            extraInfo,
            poll,
            replyToMessageId,
            userId,
          }),
          integrationId,
        },
      );

      if (response?.status === 'error') {
        throw new Error(
          response.errorMessage || 'Failed to send message to external service',
        );
      }

      if (response?.data?.data) {
        return storeDispatchedMessage({
          data: response.data.data,
          doc,
          kind,
          conversation,
          integrationId,
          userId,
          models,
          subdomain,
          forwardedSnapshot,
        });
      }

      const message = await models.ConversationMessages.addMessage(doc, userId);
      await publishUnreadCountsSafely({
        conversationId,
        integrationId,
        userIds: doc.mentionedUserIds?.filter((id) => id !== userId) || [],
        models,
        subdomain,
      });
      const dbMessage = await models.ConversationMessages.getMessage(
        message._id,
      );

      await markAutomatedReplyHumanActive({
        models,
        conversation,
        userId,
      });

      publishMessage(models, dbMessage, conversation.customerId);

      return dbMessage;
    } catch (err) {
      throw new Error(`Failed to add message to conversation: ${err.message}`);
    }
  },

  async conversationMessageEdit(
    _root,
    { _id, ...fields }: IMessage & { _id: string },
    { user, models }: IContext,
  ) {
    const message = await models.ConversationMessages.getMessage(_id);
    if (message.internal && user._id === message.userId) {
      return await models.ConversationMessages.updateMessage(_id, fields);
    }
    throw new Error(
      `You cannot edit this message. Only the author of an internal message can edit it.`,
    );
  },
};
