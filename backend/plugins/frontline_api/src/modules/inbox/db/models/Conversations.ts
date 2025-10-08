import { Model } from 'mongoose';

import { cleanHtml, sendTRPCMessage } from 'erxes-api-shared/utils';
import { CONVERSATION_STATUSES } from '~/modules/inbox/db/definitions/constants';
import { conversationSchema } from '~/modules/inbox/db/definitions/conversations';
import { IModels } from '~/connectionResolvers';
import { graphqlPubsub, stream } from 'erxes-api-shared/utils';
import {
  IConversationDocument,
  IConversation,
} from '~/modules/inbox/@types/conversations';
import { IMessageDocument } from '~/modules/inbox/@types/conversationMessages';
export interface IConversationModel extends Model<IConversationDocument> {
  getConversation(_id: string): IConversationDocument;
  createConversation(doc: IConversation): Promise<IConversationDocument>;
  updateConversation(_id: string, doc): Promise<IConversationDocument>;
  checkExistanceConversations(ids: string[]): any;
  reopen(_id: string): Promise<IConversationDocument>;

  assignUserConversation(
    conversationIds: string[],
    assignedUserId?: string,
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

export const loadClass = (models: IModels) => {
  class Conversation {
    /**
     * Retreives conversation
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
        content: await cleanHtml(doc.content),
        createdAt: doc.createdAt || now,
        updatedAt: doc.createdAt || now,
        number: (await models.Conversations.countDocuments()) + 1,
        messageCount: 0,
      });

      return result;
    }

    /**
     * Update a conversation
     */
    public static async updateConversation(_id, doc) {
      if (doc.content) {
        doc.content = await cleanHtml(doc.content);
      }

      doc.updatedAt = new Date();

      // clean custom field values

      return models.Conversations.updateOne({ _id }, { $set: doc });
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
    ) {
      await this.checkExistanceConversations(conversationIds);

      await models.Conversations.updateMany(
        { _id: { $in: conversationIds } },
        { $set: { assignedUserId } },
      );

      return models.Conversations.find({ _id: { $in: conversationIds } });
    }

    /**
     * Unassign user from conversation
     */
    public static async unassignUserConversation(conversationIds: string[]) {
      await this.checkExistanceConversations(conversationIds);

      await models.Conversations.updateMany(
        { _id: { $in: conversationIds } },
        { $unset: { assignedUserId: 1 } },
      );

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
    public static changeStatusConversation(
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

      return models.Conversations.updateMany(
        { _id: { $in: conversationIds } },
        { $set: { status, closedAt, closedUserId, updatedAt } },
      );
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
      // if current user is first one
      if (!readUserIds || readUserIds.length === 0) {
        await models.Conversations.updateConversation(_id, {
          readUserIds: [userId],
        });
      }

      // if current user is not in read users list then add it
      if (!readUserIds.includes(userId)) {
        readUserIds.push(userId);
        await models.Conversations.updateConversation(_id, { readUserIds });
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
    public static resolveAllConversation(query: any, param: any) {
      return models.Conversations.updateMany(query, { $set: param });
    }
  }

  conversationSchema.loadClass(Conversation);

  return conversationSchema;
};
