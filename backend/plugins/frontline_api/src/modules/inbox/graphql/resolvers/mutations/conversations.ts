import {
  IConversationMessageAdd,
  IMessageDocument,
} from '@/inbox/@types/conversationMessages';
import { IConversationDocument } from '@/inbox/@types/conversations';
import {
  AUTOMATED_REPLY_REASON,
  AUTOMATED_REPLY_STATUS,
  AUTO_BOT_MESSAGES,
  CONVERSATION_STATUSES,
} from '@/inbox/db/definitions/constants';
import { INTEGRATION_KINDS } from '@/integrations/facebook/constants';
import { handleFacebookIntegration } from '@/integrations/facebook/messageBroker';
import { sendReply } from '@/integrations/facebook/utils';
import { handleInstagramIntegration } from '@/integrations/instagram/messageBroker';
import { IUserDocument } from 'erxes-api-shared/core-types';
import {
  graphqlPubsub,
  sendTRPCMessage,
  markResolvers,
} from 'erxes-api-shared/utils';
import * as _ from 'underscore';
import { generateModels, IContext, IModels } from '~/connectionResolvers';
import { debugError } from '~/modules/inbox/utils';
import { createNotifications } from '~/utils/notifications';
import strip from 'strip';

interface DispatchConversationData {
  action: string;
  type: string;
  payload: string;
  integrationId: string;
}

const DEFAULT_HANDOFF_MESSAGE =
  'A teammate will take over shortly. Automated replies are paused.';
const DEFAULT_AUTOMATION_ACTIVE_MESSAGE = 'Automated replies are active again.';

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const buildFacebookMessengerTextPayload = ({
  recipientId,
  text,
  tag,
}: {
  recipientId: string;
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
    recipient: { id: recipientId },
    message: { text },
    messaging_type: trimmedTag ? 'MESSAGE_TAG' : 'RESPONSE',
  };

  if (trimmedTag) {
    payload.tag = trimmedTag;
  }

  return payload;
};

/**
 * conversation notrification receiver ids
 */
export const dispatchConversationToService = async (
  subdomain: string,
  serviceName: string,
  data: DispatchConversationData,
) => {
  try {
    switch (serviceName) {
      case 'facebook':
        return await handleFacebookIntegration({ subdomain, data });

      case 'instagram':
        return await handleInstagramIntegration({ subdomain, data });

      case 'calls':
        break;

      case 'mobinetSms':
        // TODO: Implement Mobinet SMS logic
        break;

      case 'messenger':
        break;

      default:
        throw new Error(`Unsupported service: ${serviceName}`);
    }
  } catch (e) {
    throw new Error(
      `Your message was not sent. Error: ${e.message}. Go to integrations list and fix it.`,
    );
  }
};

const markAutomatedReplyHumanActive = async ({
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

const getAutomatedReplyStatus = (status: string) => {
  switch (status) {
    case AUTOMATED_REPLY_STATUS.ACTIVE:
      return AUTOMATED_REPLY_STATUS.ACTIVE;
    case AUTOMATED_REPLY_STATUS.HANDOFF_REQUESTED:
      return AUTOMATED_REPLY_STATUS.HANDOFF_REQUESTED;
    case AUTOMATED_REPLY_STATUS.HUMAN_ACTIVE:
      return AUTOMATED_REPLY_STATUS.HUMAN_ACTIVE;
    default:
      throw new Error('Invalid automated reply status');
  }
};

const getAutomatedReplyReason = (reason?: string) => {
  if (!reason) {
    return AUTOMATED_REPLY_REASON.MANUAL;
  }

  switch (reason) {
    case AUTOMATED_REPLY_REASON.CUSTOMER_REQUESTED:
      return AUTOMATED_REPLY_REASON.CUSTOMER_REQUESTED;
    case AUTOMATED_REPLY_REASON.OPERATOR_REPLY:
      return AUTOMATED_REPLY_REASON.OPERATOR_REPLY;
    case AUTOMATED_REPLY_REASON.MANUAL:
      return AUTOMATED_REPLY_REASON.MANUAL;
    case AUTOMATED_REPLY_REASON.TIMEOUT_EXPIRED:
      return AUTOMATED_REPLY_REASON.TIMEOUT_EXPIRED;
    default:
      throw new Error('Invalid automated reply reason');
  }
};

const sendFacebookAutomatedReplyControlMessage = async ({
  models,
  subdomain,
  conversation,
  status,
}: {
  models: IModels;
  subdomain: string;
  conversation: IConversationDocument;
  status: string;
}) => {
  if (!conversation.integrationId) {
    throw new Error('Conversation integration is required for handoff message');
  }

  const integration = await models.Integrations.getIntegration({
    _id: conversation.integrationId,
  });

  if (integration.kind !== INTEGRATION_KINDS.MESSENGER) {
    return;
  }

  const facebookConversation =
    await models.FacebookConversations.getConversation({
      erxesApiId: conversation._id,
    });

  const bot = facebookConversation.botId
    ? await models.FacebookBots.findOne({ _id: facebookConversation.botId })
    : await models.FacebookBots.findOne({
        pageId: facebookConversation.recipientId,
      });

  if (!bot) {
    throw new Error('Facebook bot is required for handoff message');
  }

  const defaultText =
    status === AUTOMATED_REPLY_STATUS.ACTIVE
      ? DEFAULT_AUTOMATION_ACTIVE_MESSAGE
      : DEFAULT_HANDOFF_MESSAGE;
  const configuredText =
    status === AUTOMATED_REPLY_STATUS.ACTIVE
      ? bot.automationActiveMessage
      : bot.handoffMessage;
  const text = (configuredText || defaultText).trim() || defaultText;

  const sendHandoffReply = (tag?: string) =>
    sendReply(
      models,
      'me/messages',
      buildFacebookMessengerTextPayload({
        recipientId: facebookConversation.senderId,
        text,
        tag,
      }),
      facebookConversation.recipientId,
      integration._id,
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
    conversationId: facebookConversation._id,
    botId: bot._id,
    botData: [{ type: 'text', text }],
    mid: String(
      sendResult?.mid ||
        sendResult?.message_id ||
        `automation-control-${conversation._id}-${Date.now()}`,
    ),
    conversationErxesApiId: conversation._id,
  });
};

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
/**
 * Using this subscription to track conversation detail's assignee, tag, status
 * changes
 */
export const publishConversationsChanged = async (
  subdomain: string,
  _ids: string[],
  type: string,
): Promise<string[]> => {
  const models = await generateModels(subdomain);

  for (const _id of _ids) {
    await graphqlPubsub.publish(`conversationChanged:${_id}`, {
      conversationChanged: { conversationId: _id, type },
    });
  }

  return _ids;
};

/**
 * Publish admin's message
 */
export const publishMessage = async (
  models: IModels,
  message: IMessageDocument,
  customerId?: string,
) => {
  await graphqlPubsub.publish(
    `conversationMessageInserted:${message.conversationId}`,
    { conversationMessageInserted: JSON.parse(JSON.stringify(message)) },
  );
  if (customerId) {
    const unreadCount =
      await models.ConversationMessages.widgetsGetUnreadMessagesCount(
        message.conversationId,
      );

    await graphqlPubsub.publish(
      `conversationAdminMessageInserted:${customerId}`,
      {
        conversationAdminMessageInserted: {
          customerId,
          unreadCount,
        },
      },
    );
  }
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
                  title: 'New chat message',
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
        } catch (e) {
          debugError(
            `Failed to send client portal mobile notification: ${e.message}`,
          );
        }
      }

      // Navigation-critical payload: the new mobile app deep-links into the
      // existing conversation thread using `data.conversationId`. The legacy
      // `type`/`id` keys are kept for backward compatibility with older app
      // versions and other consumers. FCM requires every `data` value to be a
      // string, so optional ids are stringified and only added when present.
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
        } catch (e) {
          debugError(`Failed to send mobile notification: ${e.message}`);
        }
      }
    }
  }
};

const getConversationById = async (models: IModels, selector) => {
  const oldConversations = await models.Conversations.find(selector).lean();
  const oldConversationById = {};
  for (const conversation of oldConversations) {
    oldConversationById[conversation._id] = conversation;
  }
  return { oldConversationById, oldConversations };
};

export const conversationMutations = {
  /**
   * Create new message in conversation
   */
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
      const { content = '', internal, attachments = [], extraInfo } = doc;
      const { _id: userId } = user;

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

      // Send auto-reply email for lead forms
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
        const { conversationId, content } = response.data.data;
        if (conversationId && content) {
          await models.Conversations.updateConversation(conversationId, {
            content: content || '',
            updatedAt: new Date(),
          });
        }

        const message = await models.ConversationMessages.addMessage(
          doc,
          userId,
        );

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
      }

      //  Fallback: always save message locally if not already handled
      const message = await models.ConversationMessages.addMessage(doc, userId);
      const dbMessage = await models.ConversationMessages.getMessage(
        message._id,
      );

      if (internal) {
        // Internal message: only publish to admins
        publishMessage(models, dbMessage);
      } else {
        // Normal message: publish to both admin and client
        await markAutomatedReplyHumanActive({
          models,
          conversation,
          userId,
        });

        publishMessage(models, dbMessage, conversation.customerId);
      }

      return dbMessage;
    } catch (err) {
      throw new Error(`Failed to add message to conversation: ${err.message}`);
    }
  },

  async conversationMessageEdit(
    _root,
    { _id, ...fields }: any,
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

  /**
   * Assign employee to conversation
   */
  async conversationsAssign(
    _root,
    {
      conversationIds,
      assignedUserId,
    }: { conversationIds: string[]; assignedUserId: string },
    { user, models, subdomain }: IContext,
  ) {
    const conversations: IConversationDocument[] =
      await models.Conversations.assignUserConversation(
        conversationIds,
        assignedUserId,
      );

    // notify graphl subscription
    publishConversationsChanged(subdomain, conversationIds, 'assigneeChanged');

    await sendNotifications(subdomain, {
      user,
      conversations,
      type: 'conversationAssigneeChange',
    });

    if (assignedUserId && assignedUserId !== user?._id) {
      await createNotifications({
        contentType: 'inbox',
        contentTypeId: conversationIds?.[0],
        fromUserId: user?._id,
        subdomain,
        notificationType: 'inboxAssignee',
        userIds: [assignedUserId],
        action: 'assignee',
      });
    }
    return conversations;
  },

  /**
   * Unassign employee from conversation
   */
  async conversationsUnassign(
    _root,
    { _ids }: { _ids: string[] },
    { user, models, subdomain }: IContext,
  ) {
    const { oldConversations } = await getConversationById(models, {
      _id: { $in: _ids },
    });
    const updatedConversations =
      await models.Conversations.unassignUserConversation(_ids);

    await sendNotifications(subdomain, {
      user,
      conversations: oldConversations,
      type: 'unassign',
    });

    publishConversationsChanged(subdomain, _ids, 'assigneeChanged');

    return updatedConversations;
  },

  /**
   * Change conversation status
   */
  async conversationsChangeStatus(
    _root,
    { _ids, status }: { _ids: string[]; status: string },
    { user, models, subdomain }: IContext,
  ) {
    await models.Conversations.changeStatusConversation(_ids, status, user._id);

    publishConversationsChanged(subdomain, _ids, status);

    const updatedConversations = await models.Conversations.find({
      _id: { $in: _ids },
    });

    await sendNotifications(subdomain, {
      user,
      conversations: updatedConversations,
      type: 'conversationStateChange',
    });

    return updatedConversations;
  },
  /**
   * Resolve all conversations
   */
  async conversationsResolve(
    _root,
    params: { ids: string[] },
    { user, models }: IContext,
  ) {
    if (!params.ids?.length) {
      throw new Error('conversationIds parameter is required');
    }

    const updateFields = {
      status: CONVERSATION_STATUSES.CLOSED,
      closedUserId: user._id,
      closedAt: new Date(),
    };

    const result = await models.Conversations.updateMany(
      { _id: { $in: params.ids } },
      { $set: updateFields },
    );

    return result.modifiedCount || 0;
  },

  /**
   * Conversation mark as read
   */
  async conversationMarkAsRead(
    _root,
    { _id }: { _id: string },
    { user, models }: IContext,
  ) {
    return await models.Conversations.markAsReadConversation(_id, user._id);
  },

  async changeConversationOperator(
    _root,
    { _id, operatorStatus }: { _id: string; operatorStatus: string },
    { models }: IContext,
  ) {
    const message = await models.ConversationMessages.createMessage({
      conversationId: _id,
      botData: [
        {
          type: 'text',
          text: AUTO_BOT_MESSAGES.CHANGE_OPERATOR,
        },
      ],
      fromBot: true,
    });
    await graphqlPubsub.publish(
      `conversationMessageInserted:${message.conversationId}`,
      {
        conversationMessageInserted: message,
      },
    );

    return models.Conversations.updateOne(
      { _id },
      { $set: { operatorStatus } },
    );
  },

  async conversationSetAutomatedReplyControl(
    _root,
    {
      _id,
      status,
      reason,
      pausedUntil,
    }: { _id: string; status: string; reason?: string; pausedUntil?: Date },
    { models, subdomain, user }: IContext,
  ) {
    const conversation = await models.Conversations.getConversation(_id);

    if (!conversation.automatedReplyControl) {
      throw new Error(
        'Automated reply control is not enabled for this conversation',
      );
    }

    const automatedReplyStatus = getAutomatedReplyStatus(status);
    const automatedReplyReason = getAutomatedReplyReason(reason);
    const shouldSendHandoffMessage =
      automatedReplyStatus === AUTOMATED_REPLY_STATUS.HUMAN_ACTIVE &&
      conversation.automatedReplyControl.status ===
        AUTOMATED_REPLY_STATUS.ACTIVE;
    const shouldSendActiveMessage =
      automatedReplyStatus === AUTOMATED_REPLY_STATUS.ACTIVE &&
      conversation.automatedReplyControl.status !==
        AUTOMATED_REPLY_STATUS.ACTIVE;

    if (shouldSendHandoffMessage || shouldSendActiveMessage) {
      await sendFacebookAutomatedReplyControlMessage({
        models,
        subdomain,
        conversation,
        status: automatedReplyStatus,
      });
    }

    await models.Conversations.setAutomatedReplyControl(_id, {
      status: automatedReplyStatus,
      pausedUntil: pausedUntil ? new Date(pausedUntil) : undefined,
      reason: automatedReplyReason,
      updatedBy: user?._id,
    });

    return models.Conversations.getConversation(_id);
  },

  async conversationConvertToCard(
    _root,
    params: any,
    { user, models }: IContext,
  ) {
    const { _id } = params;

    const conversation = await models.Conversations.getConversation(_id);

    const args = {
      ...params,
      conversation,
      user,
    };
    return args;
  },

  async conversationEditCustomFields(
    _root,
    { _id, customFieldsData }: { _id: string; customFieldsData: any },
    { models }: IContext,
  ) {
    await models.Conversations.updateConversation(_id, { customFieldsData });
    return models.Conversations.getConversation(_id);
  },
};
markResolvers(conversationMutations, {
  wrapperConfig: {
    skipPermission: true,
  },
});
