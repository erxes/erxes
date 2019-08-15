import { Model, model } from 'mongoose';
import { ConversationMessages, Users } from '.';
import { CONVERSATION_STATUSES } from './definitions/constants';
import { IMessageDocument } from './definitions/conversationMessages';
import { conversationSchema, IConversation, IConversationDocument } from './definitions/conversations';

interface ISTATUSES {
  NEW: 'new';
  OPEN: 'open';
  CLOSED: 'closed';
  ALL_LIST: ['new', 'open', 'closed'];
}

export interface IConversationModel extends Model<IConversationDocument> {
  getConversationStatuses(): ISTATUSES;
  createConversation(doc: IConversation): Promise<IConversationDocument>;
  checkExistanceConversations(ids: string[]): any;
  reopen(_id: string): Promise<IConversationDocument>;

  assignUserConversation(conversationIds: string[], assignedUserId?: string): Promise<IConversationDocument[]>;

  unassignUserConversation(conversationIds: string[]): Promise<IConversationDocument[]>;

  changeCustomerStatus(status: string, customerId: string, integrationId: string): Promise<IMessageDocument[]>;

  changeStatusConversation(conversationIds: string[], status: string, userId?: string): Promise<IConversationDocument>;

  markAsReadConversation(_id: string, userId: string): Promise<IConversationDocument>;

  newOrOpenConversation(): IConversationDocument[];

  addParticipatedUsers(conversationId: string, userId: string): Promise<IConversationDocument>;
  addManyParticipatedUsers(conversationId: string, userId: string[]): Promise<IConversationDocument>;

  changeCustomer(newCustomerId: string, customerIds: string[]): Promise<IConversationDocument[]>;

  removeCustomerConversations(customerId: string): Promise<IConversationDocument>;
}

export const loadClass = () => {
  class Conversation {
    public static getConversationStatuses() {
      return CONVERSATION_STATUSES;
    }

    /**
     * Check conversations exists
     */
    public static async checkExistanceConversations(_ids: string[]) {
      const selector = { _id: { $in: _ids } };
      const conversations = await Conversations.find(selector);

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

      return Conversations.create({
        status: this.getConversationStatuses().NEW,
        ...doc,
        createdAt: now,
        updatedAt: now,
        number: (await Conversations.find().countDocuments()) + 1,
        messageCount: 0,
      });
    }

    /*
     * Reopens conversation
     */
    public static async reopen(_id: string) {
      await Conversations.updateOne(
        { _id },
        {
          $set: {
            // reset read state
            readUserIds: [],

            // if closed, reopen
            status: this.getConversationStatuses().OPEN,

            closedAt: null,
            closedUserId: null,
          },
        },
      );

      return Conversations.findOne({ _id });
    }

    /**
     * Assign user to conversation
     */
    public static async assignUserConversation(conversationIds: string[], assignedUserId?: string) {
      await this.checkExistanceConversations(conversationIds);

      if (!(await Users.findOne({ _id: assignedUserId }))) {
        throw new Error(`User not found with id ${assignedUserId}`);
      }

      await Conversations.updateMany({ _id: { $in: conversationIds } }, { $set: { assignedUserId } }, { multi: true });

      return Conversations.find({ _id: { $in: conversationIds } });
    }

    /**
     * Unassign user from conversation
     */
    public static async unassignUserConversation(conversationIds: string[]) {
      await this.checkExistanceConversations(conversationIds);

      await Conversations.updateMany(
        { _id: { $in: conversationIds } },
        { $unset: { assignedUserId: 1 } },
        { multi: true },
      );

      return Conversations.find({ _id: { $in: conversationIds } });
    }
    /**
     * Change customer status
     * @param status [left/join]
     * @param customerId
     * @param integrationId
     */
    public static async changeCustomerStatus(status: string, customerId: string, integrationId: string) {
      const customerConversations = await Conversations.find({
        customerId,
        integrationId,
        status: 'open',
      });

      const promises: Array<Promise<IMessageDocument>> = [];

      for (const conversationObj of customerConversations) {
        promises.push(
          ConversationMessages.addMessage({
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
    public static changeStatusConversation(conversationIds: string[], status: string, userId: string) {
      let closedAt;
      let closedUserId;

      if (status === this.getConversationStatuses().CLOSED) {
        closedAt = new Date();
        closedUserId = userId;
      }

      return Conversations.updateMany(
        { _id: { $in: conversationIds } },
        { $set: { status, closedAt, closedUserId } },
        { multi: true },
      );
    }

    /**
     * Mark as read conversation
     */
    public static async markAsReadConversation(_id: string, userId: string) {
      const conversation = await Conversations.findOne({ _id });

      if (!conversation) {
        throw new Error(`Conversation not found with id ${_id}`);
      }

      const readUserIds = conversation.readUserIds || [];

      // if current user is first one
      if (!readUserIds || readUserIds.length === 0) {
        await Conversations.updateOne({ _id }, { $set: { readUserIds: [userId] } });
      }

      // if current user is not in read users list then add it
      if (!readUserIds.includes(userId)) {
        await Conversations.updateOne({ _id }, { $push: { readUserIds: userId } });
      }

      return Conversations.findOne({ _id });
    }

    /**
     * Get new or open conversation
     */
    public static async newOrOpenConversation() {
      return Conversations.find({
        status: {
          $in: [this.getConversationStatuses().NEW, this.getConversationStatuses().OPEN],
        },
      });
    }
    /**
     * Add participated users
     */
    public static addManyParticipatedUsers(conversationId: string, userIds: string[]) {
      if (conversationId && userIds) {
        return Conversations.updateOne(
          { _id: conversationId },
          {
            $addToSet: { participatedUserIds: { $each: userIds } },
          },
        );
      }
    }
    /**
     * Add participated user
     */
    public static addParticipatedUsers(conversationId: string, userId: string) {
      if (conversationId && userId) {
        return Conversations.updateOne(
          { _id: conversationId },
          {
            $addToSet: { participatedUserIds: userId },
          },
        );
      }
    }

    /**
     * Transfers customers' conversations to another customer
     */
    public static async changeCustomer(newCustomerId: string, customerIds: string) {
      // Updating every conversation and conversation messages of new customer
      await ConversationMessages.updateMany(
        { customerId: { $in: customerIds } },
        { $set: { customerId: newCustomerId } },
      );

      await Conversations.updateMany({ customerId: { $in: customerIds } }, { $set: { customerId: newCustomerId } });

      // Returning updated list of conversation of new customer
      return Conversations.find({ customerId: newCustomerId });
    }

    /**
     * Removes customer conversations
     */
    public static async removeCustomerConversations(customerId: string) {
      // Finding every conversation of customer
      const conversations = await Conversations.find({
        customerId,
      });

      // Removing conversations and conversation messages
      const conversationIds = conversations.map(conv => conv._id);
      await ConversationMessages.deleteMany({
        conversationId: { $in: conversationIds },
      });
      await Conversations.deleteMany({ _id: { $in: conversationIds } });
    }
  }

  conversationSchema.loadClass(Conversation);

  return conversationSchema;
};

loadClass();

// tslint:disable-next-line
const Conversations = model<IConversationDocument, IConversationModel>('conversations', conversationSchema);

export default Conversations;
