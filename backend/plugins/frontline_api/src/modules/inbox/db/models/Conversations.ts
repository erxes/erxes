import { publishReportUpdate } from '@/reports/realtime';
import { IMessageDocument } from '@/inbox/@types/conversationMessages';
import {
  IConversation,
  IConversationDocument,
  TAutomatedReplyControl,
} from '@/inbox/@types/conversations';
import { CONVERSATION_STATUSES } from '@/inbox/db/definitions/constants';
import { conversationSchema } from '@/inbox/db/definitions/conversations';
import {
  cleanHtml,
  graphqlPubsub,
  sendTRPCMessage,
  stream,
} from 'erxes-api-shared/utils';
import { FilterQuery, Model } from 'mongoose';
import { conversationsChanged } from '@/inbox/meta/segments';
import { IModels } from '~/connectionResolvers';
import { getConversationAssigneeIds } from '@/inbox/utils/conversationAssignees';

export interface IConversationModel extends Model<IConversationDocument> {
  getConversation(_id: string): Promise<IConversationDocument>;
  createConversation(doc: IConversation): Promise<IConversationDocument>;
  updateConversation(_id: string, doc): Promise<IConversationDocument>;
  setAutomatedReplyControl(
    _id: string,
    doc: TAutomatedReplyControl,
  ): Promise<IConversationDocument | null>;
  checkExistanceConversations(ids: string[]): any;
  reopen(_id: string): Promise<IConversationDocument>;

  assignUserConversation(
    conversationIds: string[],
    assignedUserId?: string,
    assignedUserIds?: string[],
  ): Promise<IConversationDocument[]>;

  unassignUserConversation(
    conversationIds: string[],
  ): Promise<IConversationDocument[]>;

  changeCustomerStatus(
    status: string,
    customerId: string,
    integrationId: string,
  ): Promise<any[]>;

  changeStatusConversation(
    conversationIds: string[],
    status: string,
    userId?: string,
  ): Promise<IConversationDocument>;

  markAsReadConversation(
    _id: string,
    userId: string,
  ): Promise<IConversationDocument>;

  newOrOpenConversation(): IConversationDocument[];

  addParticipatedUsers(
    conversationId: string,
    userId: string,
  ): Promise<IConversationDocument>;
  addManyParticipatedUsers(
    conversationId: string,
    userId: string[],
  ): Promise<IConversationDocument>;

  changeCustomer(
    newCustomerId: string,
    customerIds: string[],
  ): Promise<IConversationDocument[]>;

  removeCustomersConversations(
    customerId: string[],
  ): Promise<{ n: number; ok: number }>;
  widgetsUnreadMessagesQuery(conversations: IConversationDocument[]): any;

  removeEngageConversations(engageMessageId: string): any;

  getUserRelevance(args: { skillId: string }): Promise<string>;

  resolveAllConversation(
    query: any,
    param: any,
  ): Promise<{ n: number; nModified: number; ok: number }>;
}

export const loadClass = (models: IModels, subdomain: string) => {
  class Conversation {
    /**
     * Retrieves conversation
     */
    public static async getConversation(_id: string) {
      const conversation = await models.Conversations.findOne({ _id });

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      return conversation;
    }

    /**
     * Check conversations exists
     */
    public static async checkExistanceConversations(_ids: string[]) {
      const selector = { _id: { $in: _ids } };
      const conversations = await models.Conversations.find(selector);

      if (conversations.length !== _ids.length) {
        throw new Error('Conversation not found.');
      }

      return { selector, conversations };
    }

    /**
     * Create a conversation
     */
    public static async createConversation(doc: IConversation) {
      const now = new Date();

      const result = await models.Conversations.create({
        status: CONVERSATION_STATUSES.NEW,
        ...doc,
        ...(doc.assignedUserId || doc.assignedUserIds
          ? {
              assignedUserIds: getConversationAssigneeIds(doc),
              assignedUserId: getConversationAssigneeIds(doc)[0],
            }
          : {}),
        content: await cleanHtml(doc.content),
        createdAt: doc.createdAt || now,
        updatedAt: doc.createdAt || now,
        number: (await models.Conversations.countDocuments()) + 1,
        messageCount: 0,
      });

      conversationsChanged(subdomain, [result._id]);
      await publishReportUpdate(subdomain, ['inbox']);

      return result;
    }

    /**
     * Update a conversation
     */
    public static async updateConversation(
      _id: string,
      doc: Partial<IConversation>,
    ) {
      if (doc.assignedUserIds !== undefined) {
        doc.assignedUserIds = getConversationAssigneeIds(doc);
        doc.assignedUserId = doc.assignedUserIds[0];
      } else if (Object.keys(doc).includes('assignedUserId')) {
        const current = await models.Conversations.getConversation(_id);
        // Provider updates may repeat the primary assignee without changing ownership.
        if (doc.assignedUserId !== current.assignedUserId) {
          doc.assignedUserIds = doc.assignedUserId ? [doc.assignedUserId] : [];
        } else {
          delete doc.assignedUserId;
        }
      }
      if (doc.content) {
        doc.content = await cleanHtml(doc.content);
      }

      doc.updatedAt = new Date();

      if (doc.propertiesData) {
        const validatedPropertiesData = await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'mutation',
          module: 'fields',
          action: 'validateFieldValues',
          input: { data: doc.propertiesData },
          throwOnError: true,
        });

        if (!validatedPropertiesData) {
          throw new Error('Failed to validate conversation properties');
        }

        doc.propertiesData = validatedPropertiesData;
      }

      const fields = { ...doc };
      const clearAssignment = doc.assignedUserIds?.length === 0;
      if (clearAssignment) delete fields.assignedUserId;
      const clearClosedAt =
        doc.status && doc.status !== CONVERSATION_STATUSES.CLOSED;
      if (clearClosedAt) {
        delete fields.closedAt;
        delete fields.closedUserId;
      }
      const unset = {
        ...(clearAssignment ? { assignedUserId: 1 } : {}),
        ...(clearClosedAt ? { closedAt: 1, closedUserId: 1 } : {}),
      };
      const updated = await models.Conversations.updateOne(
        { _id },
        {
          $set: fields,
          ...(Object.keys(unset).length ? { $unset: unset } : {}),
        },
      );

      conversationsChanged(subdomain, [_id], doc);
      await publishReportUpdate(subdomain, ['inbox']);

      return updated;
    }

    public static async setAutomatedReplyControl(
      _id: string,
      doc: TAutomatedReplyControl,
    ) {
      await models.Conversations.updateOne(
        { _id },
        {
          $set: {
            automatedReplyControl: {
              ...doc,
              updatedAt: new Date(),
            },
          },
        },
      );

      await graphqlPubsub.publish(`conversationChanged:${_id}`, {
        conversationChanged: {
          conversationId: _id,
          type: 'automatedReplyControlChanged',
        },
      });

      return models.Conversations.findOne({ _id });
    }

    /*
     * Reopens conversation
     */
    public static async reopen(_id: string) {
      await models.Conversations.updateConversation(_id, {
        // reset read state
        readUserIds: [],

        // if closed, reopen
        status: CONVERSATION_STATUSES.OPEN,

        closedAt: undefined,
        closedUserId: undefined,
      });

      return models.Conversations.findOne({ _id });
    }

    /**
     * Assign user to conversation
     */
    public static async assignUserConversation(
      conversationIds: string[],
      assignedUserId?: string,
      assignedUserIds?: string[],
    ) {
      await this.checkExistanceConversations(conversationIds);

      const ids = getConversationAssigneeIds({
        assignedUserId,
        assignedUserIds,
      });

      await models.Conversations.updateMany(
        { _id: { $in: conversationIds } },
        ids.length
          ? { $set: { assignedUserId: ids[0], assignedUserIds: ids } }
          : { $set: { assignedUserIds: [] }, $unset: { assignedUserId: 1 } },
      );

      conversationsChanged(subdomain, conversationIds, {
        assignedUserId: ids[0] ?? null,
        assignedUserIds: ids,
      });

      await publishReportUpdate(subdomain, ['inbox']);
      return models.Conversations.find({ _id: { $in: conversationIds } });
    }

    /**
     * Unassign user from conversation
     */
    public static async unassignUserConversation(conversationIds: string[]) {
      await this.checkExistanceConversations(conversationIds);

      await models.Conversations.updateMany(
        { _id: { $in: conversationIds } },
        { $set: { assignedUserIds: [] }, $unset: { assignedUserId: 1 } },
      );

      conversationsChanged(subdomain, conversationIds, {
        assignedUserId: null,
        assignedUserIds: [],
      });

      await publishReportUpdate(subdomain, ['inbox']);
      return models.Conversations.find({ _id: { $in: conversationIds } });
    }
    /**
     * Change customer status
     * @param status [left/join]
     * @param customerId
     * @param integrationId
     */
    public static async changeCustomerStatus(
      status: string,
      customerId: string,
      integrationId: string,
    ) {
      const customerConversations = await models.Conversations.find({
        customerId,
        integrationId,
        status: 'open',
      });

      const promises: Array<Promise<IMessageDocument>> = [];

      for (const conversationObj of customerConversations) {
        promises.push(
          models.ConversationMessages.addMessage({
            conversationId: conversationObj._id,
            content: `Customer has ${status}`,
            fromBot: true,
          }),
        );
      }

      return Promise.all(promises);
    }

    /**
     * Change conversation status
     */
    public static async changeStatusConversation(
      conversationIds: string[],
      status: string,
      userId: string,
    ) {
      let closedAt;
      let closedUserId;
      const updatedAt = new Date();

      if (status === CONVERSATION_STATUSES.CLOSED) {
        closedAt = new Date();

        closedUserId = userId;
      }

      const result = await models.Conversations.updateMany(
        { _id: { $in: conversationIds } },
        {
          $set: {
            status,
            updatedAt,
            ...(closedAt ? { closedAt, closedUserId } : {}),
          },
          ...(!closedAt ? { $unset: { closedAt: 1, closedUserId: 1 } } : {}),
        },
      );
      await publishReportUpdate(subdomain, ['inbox']);
      return result;
    }

    /**
     * Mark as read conversation
     */
    public static async markAsReadConversation(_id: string, userId: string) {
      const conversation = await models.Conversations.findOne({ _id });

      if (!conversation) {
        throw new Error(`Conversation not found with id ${_id}`);
      }

      const readUserIds = conversation.readUserIds || [];

      // Not updateConversation: that stamps `updatedAt`, which the inbox sorts
      // and shows its relative time from. Reading is not activity.
      if (!readUserIds.includes(userId)) {
        await models.Conversations.updateOne({ _id }, [
          {
            $set: {
              readUserIds: {
                $setUnion: [{ $ifNull: ['$readUserIds', []] }, [userId]],
              },
            },
          },
        ]);
      }

      graphqlPubsub.publish(`conversationChanged:${_id}`, {
        conversationChanged: {
          conversationId: _id,
          type: 'inbox:conversation',
        },
      });

      return models.Conversations.findOne({ _id });
    }

    /**
     * Get new or open conversation
     */
    public static async newOrOpenConversation() {
      return models.Conversations.find({
        status: {
          $in: [CONVERSATION_STATUSES.NEW, CONVERSATION_STATUSES.OPEN],
        },
        updatedAt: {
          $gte: new Date(new Date().getTime() - 12 * 60 * 1000),
        },
      });
    }

    /**
     * Add participated users
     */
    public static addManyParticipatedUsers(
      conversationId: string,
      userIds: string[],
    ) {
      return models.Conversations.updateOne(
        { _id: conversationId },
        {
          $addToSet: { participatedUserIds: { $each: userIds } },
        },
      );
    }
    /**
     * Add participated user
     */
    public static addParticipatedUsers(conversationId: string, userId: string) {
      return models.Conversations.updateOne(
        { _id: conversationId },
        {
          $addToSet: { participatedUserIds: userId },
        },
      );
    }

    /**
     * Transfers customers' conversations to another customer
     */
    public static async changeCustomer(
      newCustomerId: string,
      customerIds: string,
    ) {
      // Updating every conversation and conversation messages of new customer

      await models.Conversations.updateMany(
        { customerId: { $in: customerIds } },
        { $set: { customerId: newCustomerId } },
      );

      await publishReportUpdate(subdomain, ['inbox']);

      // Returning updated list of conversation of new customer
      return models.Conversations.find({ customerId: newCustomerId });
    }

    /**
     * Removes customers conversations
     */
    public static async removeCustomersConversations(customerIds: string[]) {
      // Finding every conversation of customer
      const conversations = await models.Conversations.find({
        customerId: { $in: customerIds },
      });

      // Removing conversations and conversation messages
      const conversationIds = conversations.map((conv) => conv._id);

      await models.Conversations.deleteMany({ _id: { $in: conversationIds } });
      if (conversationIds.length) await publishReportUpdate(subdomain, ['inbox', 'ticket']);
    }

    /**
     * Remove engage conversations
     */
    public static async removeEngageConversations(engageMessageId: string) {
      await stream(
        async (chunk) => {
          await models.ConversationMessages.deleteMany({
            conversationId: { $in: chunk },
          });
          await models.Conversations.deleteMany({ _id: { $in: chunk } });
          await publishReportUpdate(subdomain, ['inbox', 'ticket']);
        },
        (variables, root: any) => {
          const parentIds = variables.parentIds || [];

          parentIds.push(root.conversationId);

          variables.parentIds = parentIds;
        },
        () => {
          return models.ConversationMessages.find(
            {
              engageData: { $exists: true, $ne: null },
              'engageData.messageId': engageMessageId,
            },
            { conversationId: 1, _id: 0 },
          ) as any;
        },
        1000,
      );
    }

    public static widgetsUnreadMessagesQuery(
      conversations: IConversationDocument[],
    ) {
      const unreadMessagesSelector = {
        userId: { $exists: true },
        internal: false,
        isCustomerRead: { $ne: true },
      };

      const conversationIds = conversations.map((c) => c._id);

      return {
        conversationId: { $in: conversationIds },
        ...unreadMessagesSelector,
      };
    }

    /**
     * Resolve all conversation
     */
    public static async resolveAllConversation(
      query: FilterQuery<IConversationDocument>,
      param: Partial<IConversation>,
    ) {
      const result = await models.Conversations.updateMany(query, {
        $set: param,
      });
      await publishReportUpdate(subdomain, ['inbox']);
      return result;
    }
  }

  conversationSchema.loadClass(Conversation);

  return conversationSchema;
};
