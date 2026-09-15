import type { IConversationDocument } from '@/inbox/@types/conversations';
import type { IMessageDocument } from '@/inbox/@types/conversationMessages';
import {
  AUTOMATED_REPLY_REASON,
  AUTOMATED_REPLY_STATUS,
} from '@/inbox/db/definitions/constants';
import { publishConversationUnreadCounts } from '@/inbox/services/conversationUnreadCounts';
import type { IUserDocument } from 'erxes-api-shared/core-types';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import type { IContext, IModels } from '~/connectionResolvers';
import { debugError } from '@/inbox/utils';
import * as _ from 'underscore';
import strip from 'strip';

export const conversationNotifReceivers = (
  conversation: IConversationDocument,
  currentUserId: string,
  exclude = true,
): string[] => {
  let userIds: string[] = [];
  if (conversation.assignedUserId) {
    userIds.push(conversation.assignedUserId);
  }
  if (Array.isArray(conversation.participatedUserIds)) {
    userIds = _.union(userIds, conversation.participatedUserIds);
  }
  if (
    exclude &&
    currentUserId &&
    conversation.assignedUserId !== currentUserId
  ) {
    userIds = _.without(userIds, currentUserId);
  }
  return userIds;
};
export const sendNotifications = async (
  subdomain: string,
  {
    user,
    conversations,
    type,
    mobile,
    messageContent,
  }: {
    user: IUserDocument;
    conversations: IConversationDocument[];
    type: string;
    mobile?: boolean;
    messageContent?: string;
  },
) => {
  for (const conversation of conversations) {
    if (!conversation || !conversation._id) {
      throw new Error('Error: Conversation or Conversation ID is undefined');
    }

    if (!user?._id) {
      throw new Error('Error: User or User ID is undefined');
    }

    const doc = {
      createdUser: user,
      link: `/inbox/index?_id=${conversation._id}`,
      title: 'Conversation updated',
      content: messageContent || conversation.content || 'Conversation updated',
      notifType: type,
      receivers: conversationNotifReceivers(conversation, user._id),
      action: 'updated conversation',
      contentType: 'conversation',
      contentTypeId: conversation._id,
    };
    switch (type) {
      case 'conversationAddMessage':
        doc.action = `sent you a message`;
        doc.receivers = conversationNotifReceivers(conversation, user._id);
        break;
      case 'conversationAssigneeChange':
        doc.action = 'has assigned you to conversation ';
        break;
      case 'unassign':
        doc.notifType = 'conversationAssigneeChange';
        doc.action = 'has removed you from conversation';
        break;
      case 'conversationStateChange':
        doc.action = `changed conversation status to ${(
          conversation.status || ''
        ).toUpperCase()}`;
        break;
      default:
        break;
    }

    if (mobile) {
      if (conversation.customerId) {
        try {
          const cpUser = await sendTRPCMessage({
            subdomain,
            pluginName: 'core',
            method: 'query',
            module: 'cpUsers',
            action: 'get',
            input: { erxesCustomerId: conversation.customerId },
            defaultValue: null,
          });

          if (cpUser?._id && cpUser.clientPortalId) {
            const clientPortal = await sendTRPCMessage({
              subdomain,
              pluginName: 'core',
              method: 'query',
              module: 'clientPortals',
              action: 'get',
              input: { _id: cpUser.clientPortalId },
              defaultValue: null,
            });

            await sendTRPCMessage({
              subdomain,
              pluginName: 'core',
              method: 'mutation',
              module: 'cpNotifications',
              action: 'create',
              input: {
                cpUserIds: [cpUser._id],
                clientPortalId: cpUser.clientPortalId,
                eventType: 'conversationMessage',
                data: {
                  title: clientPortal?.name || 'New chat message',
                  message: strip(doc.content) || 'You have a new message',
                  type: 'info',
                  contentType: 'conversation',
                  contentTypeId: conversation._id,
                  priority: 'high',
                  action: 'openConversation',
                  kind: 'user',
                  metadata: {
                    conversationId: conversation._id,
                    id: conversation._id,
                    type: 'messenger',
                  },
                },
              },
            });
          }
        } catch (error: unknown) {
          debugError(
            `Failed to send client portal mobile notification: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }

      if (!conversation._id) {
        debugError(
          'Skipping mobile chat notification: conversation id is unavailable',
        );
      } else {
        const data: Record<string, string> = {
          type: 'messenger',
          id: String(conversation._id),
          conversationId: String(conversation._id),
          notificationType: 'chat_message',
        };

        if (conversation.integrationId) {
          data.integrationId = String(conversation.integrationId);
        }

        if (conversation.customerId) {
          data.customerId = String(conversation.customerId);
        }

        try {
          await sendTRPCMessage({
            subdomain,
            pluginName: 'core',
            method: 'mutation',
            module: 'core',
            action: 'sendMobileNotification',
            input: {
              title: doc.title,
              body: strip(doc.content),
              receivers: conversationNotifReceivers(
                conversation,
                user._id,
                false,
              ),
              customerId: conversation.customerId,
              conversationId: conversation._id,
              data,
            },
          });
        } catch (error: unknown) {
          debugError(
            `Failed to send mobile notification: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }
    }
  }
};

export const markAutomatedReplyHumanActive = async ({
  models,
  conversation,
  userId,
}: {
  models: IModels;
  conversation: IConversationDocument;
  userId: string;
}) => {
  if (!conversation.automatedReplyControl) {
    return;
  }

  await models.Conversations.setAutomatedReplyControl(conversation._id, {
    status: AUTOMATED_REPLY_STATUS.HUMAN_ACTIVE,
    reason: AUTOMATED_REPLY_REASON.OPERATOR_REPLY,
    updatedBy: userId,
  });
};

export const completeConversationReply = async (
  { models, subdomain, user }: IContext,
  conversation: IConversationDocument,
  message: IMessageDocument,
): Promise<void> => {
  const integrationId = conversation.integrationId;
  if (!integrationId) {
    debugError('Reply conversation has no integration');
    return;
  }
  // A notification failure must not undo an accepted reply or prevent human handoff.
  const effects = [
    () =>
      publishConversationUnreadCounts({
        conversationId: conversation._id,
        integrationId,
        userIds: [],
        models,
        subdomain,
      }),
    () =>
      sendNotifications(subdomain, {
        user,
        conversations: [conversation],
        type: 'conversationAddMessage',
        mobile: true,
        messageContent: message.content,
      }),
    () =>
      markAutomatedReplyHumanActive({ models, conversation, userId: user._id }),
  ];
  for (const effect of effects) {
    try {
      await effect();
    } catch {
      debugError(
        'Reply was sent, but a conversation update could not be completed',
      );
    }
  }
};
