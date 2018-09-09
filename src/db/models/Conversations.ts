import { Model, model } from 'mongoose';
import { ConversationMessages, Users } from '.';
import { CONVERSATION_STATUSES } from './definitions/constants';
import { conversationSchema, IConversation, IConversationDocument } from './definitions/conversations';

interface ISTATUSES {
  NEW: 'new';
  OPEN: 'open';
  CLOSED: 'closed';
  ALL_LIST: ['new', 'open', 'closed'];
}

interface IConversationModel extends Model<IConversationDocument> {
  getConversationStatuses(): ISTATUSES;
  createConversation(doc: IConversation): Promise<IConversationDocument>;
  checkExistanceConversations(ids: string[]): any;
  reopen(_id: string): Promise<IConversationDocument>;

  assignUserConversation(conversationIds: string[], assignedUserId?: string): Promise<IConversationDocument[]>;

  unassignUserConversation(conversationIds: string[]): Promise<IConversationDocument>;

  changeStatusConversation(conversationIds: string[], status: string, userId?: string): Promise<IConversationDocument>;

  markAsReadConversation(_id: string, userId: string): Promise<IConversationDocument>;

  newOrOpenConversation(): IConversationDocument[];

  addParticipatedUsers(conversationId: string, userId: string): Promise<IConversationDocument>;

  changeCustomer(newCustomerId: string, customerIds: string[]): Promise<IConversationDocument[]>;

  removeCustomerConversations(customerId: string): Promise<IConversationDocument>;
}

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
      number: (await Conversations.find().count()) + 1,
      messageCount: 0,
    });
  }

  /*
   * Reopens conversation
   */
  public static async reopen(_id: string) {
    await Conversations.update(
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

    await Conversations.update({ _id: { $in: conversationIds } }, { $set: { assignedUserId } }, { multi: true });

    return Conversations.find({ _id: { $in: conversationIds } });
  }

  /**
   * Unassign user from conversation
   */
  public static async unassignUserConversation(conversationIds: string[]) {
    await this.checkExistanceConversations(conversationIds);

    await Conversations.update({ _id: { $in: conversationIds } }, { $unset: { assignedUserId: 1 } }, { multi: true });

    return Conversations.find({ _id: { $in: conversationIds } });
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

    return Conversations.update(
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
      await Conversations.update({ _id }, { $set: { readUserIds: [userId] } });
    }

    // if current user is not in read users list then add it
    if (!readUserIds.includes(userId)) {
      await Conversations.update({ _id }, { $push: { readUserIds: userId } });
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
   * Add participated user
   */
  public static addParticipatedUsers(conversationId: string, userId: string) {
    if (conversationId && userId) {
      return Conversations.update(
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
    for (const customerId of customerIds) {
      // Updating every conversation and conversation messages of new customer
      await ConversationMessages.updateMany({ customerId }, { $set: { customerId: newCustomerId } });

      await Conversations.updateMany({ customerId }, { $set: { customerId: newCustomerId } });
    }

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
    for (const conversation of conversations) {
      // Removing conversation message of conversation
      await ConversationMessages.remove({ conversationId: conversation._id });
      await Conversations.remove({ _id: conversation._id });
    }
  }
}

conversationSchema.loadClass(Conversation);

const Conversations = model<IConversationDocument, IConversationModel>('conversations', conversationSchema);

export default Conversations;
