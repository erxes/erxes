import { IConversationDocument } from '@/inbox/@types/conversations';
import {
  AUTOMATED_REPLY_STATUS,
  AUTO_BOT_MESSAGES,
  CONVERSATION_STATUSES,
} from '@/inbox/db/definitions/constants';
import { convertConversation } from '@/inbox/services/conversationConvert';
import { IConversationConvert } from '@/inbox/@types/conversationConvert';
import {
  graphqlPubsub,
  markResolvers,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { getConversationAssigneeIds } from '@/inbox/utils/conversationAssignees';
import type { IContext, IModels } from '~/connectionResolvers';
import { createNotifications } from '~/utils/notifications';
import {
  getAutomatedReplyReason,
  getAutomatedReplyStatus,
  publishUnreadCountsSafely,
} from './conversationAutomation';
import { sendFacebookAutomatedReplyControlMessage } from '@/integrations/facebook/services/automatedReplyControl';
import {
  publishConversationsChanged,
  sendNotifications,
} from './conversationNotifications';
import { conversationMessageMutations } from './conversationMessageMutations';

export { dispatchConversationToService } from './conversationAutomation';
export {
  conversationNotifReceivers,
  publishConversationsChanged,
  publishMessage,
  sendNotifications,
} from './conversationNotifications';

const getConversationById = async (models: IModels, selector) => {
  const oldConversations = await models.Conversations.find(selector).lean();
  const oldConversationById = {};
  for (const conversation of oldConversations) {
    oldConversationById[conversation._id] = conversation;
  }
  return { oldConversationById, oldConversations };
};

export const conversationMutations = {
  ...conversationMessageMutations,

  async conversationsAssign(
    _root,
    {
      conversationIds,
      assignedUserId,
      assignedUserIds,
    }: {
      conversationIds: string[];
      assignedUserId?: string | null;
      assignedUserIds?: string[] | null;
    },
    { user, models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('conversationsAssign');
    if (assignedUserIds != null && assignedUserId != null) {
      throw new Error(
        'Provide either assignedUserIds or assignedUserId, not both',
      );
    }
    const ids = getConversationAssigneeIds({ assignedUserId, assignedUserIds });
    if (!conversationIds.length || conversationIds.some((id) => !id)) {
      throw new Error('Select at least one conversation');
    }
    if (assignedUserIds?.some((id) => !id.trim())) {
      throw new Error('Assignee IDs must not be empty');
    }
    const previous = await models.Conversations.find({
      _id: { $in: conversationIds },
    }).lean();
    const addedIds = ids.filter((id) =>
      previous.some(
        (conversation) =>
          !getConversationAssigneeIds(conversation).includes(id),
      ),
    );
    if (addedIds.length) {
      const users: Array<{ _id: string }> = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'users',
        method: 'query',
        action: 'find',
        input: {
          query: { _id: { $in: addedIds }, isActive: { $ne: false } },
          fields: { _id: 1 },
        },
        throwOnError: true,
      });
      if (users.length !== addedIds.length)
        throw new Error('Select active members of this workspace');
    }
    const conversations: IConversationDocument[] =
      await models.Conversations.assignUserConversation(
        conversationIds,
        undefined,
        ids,
      );

    await publishConversationsChanged(
      subdomain,
      conversationIds,
      'assigneeChanged',
    );

    await sendNotifications(subdomain, {
      user,
      conversations,
      type: 'conversationAssigneeChange',
    });

    await Promise.all(
      conversations.map(async (conversation) => {
        const old = previous.find((item) => item._id === conversation._id);
        const previousIds = getConversationAssigneeIds(old ?? {});
        const added = ids.filter(
          (id) => id !== user._id && !previousIds.includes(id),
        );
        const removed = previousIds.filter(
          (id) => id !== user._id && !ids.includes(id),
        );
        if (removed.length)
          await createNotifications({
            contentType: 'inbox',
            contentTypeId: conversation._id,
            fromUserId: user._id,
            subdomain,
            notificationType: 'inboxAssignee',
            userIds: removed,
            action: 'unassign',
          });
        if (added.length)
          await createNotifications({
            contentType: 'inbox',
            contentTypeId: conversation._id,
            fromUserId: user?._id,
            subdomain,
            notificationType: 'inboxAssignee',
            userIds: added,
            action: 'assignee',
          });
      }),
    );
    return conversations;
  },

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

  async conversationMarkAsRead(
    _root,
    { _id }: { _id: string },
    { user, models, subdomain }: IContext,
  ) {
    const conversation = await models.Conversations.markAsReadConversation(
      _id,
      user._id,
    );

    if (conversation.integrationId) {
      await publishUnreadCountsSafely({
        conversationId: _id,
        integrationId: conversation.integrationId,
        userIds: [user._id],
        models,
        subdomain,
      });
    }

    return conversation;
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
    params: IConversationConvert,
    { user, models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('conversationConvertToCard');

    return convertConversation(
      { models, subdomain, user, checkPermission },
      params,
    );
  },

  async conversationEditCustomFields(
    _root,
    {
      _id,
      propertiesData,
      customFieldsData,
    }: {
      _id: string;
      propertiesData?: Record<string, unknown>;
      customFieldsData?: Record<string, unknown>;
    },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('conversationEditCustomFields');
    if (propertiesData == null && customFieldsData == null) {
      throw new Error('propertiesData or customFieldsData is required');
    }
    await models.Conversations.updateConversation(_id, {
      propertiesData: propertiesData ?? customFieldsData,
    });
    return models.Conversations.getConversation(_id);
  },
};
markResolvers(conversationMutations, {
  wrapperConfig: {
    skipPermission: true,
  },
});
