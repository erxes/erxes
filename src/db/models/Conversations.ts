import { Model, model } from "mongoose";
import { ConversationMessages, Users } from '.';
import { CONVERSATION_STATUSES } from "./definitions/constants";
import {
  conversationSchema,
  IConversationDocument
} from "./definitions/conversations";

interface ISTATUSES {
  NEW: "new";
  OPEN: "open";
  CLOSED: "closed";
  ALL_LIST: ["new", "open", "closed"];
}

interface IConversationParams {
  conversationId?: string;
  userId?: string;
  integrationId: string;
  customerId: string;
  content: string;
}

interface IConversationModel extends Model<IConversationDocument> {
  getConversationStatuses(): ISTATUSES;
  createConversation(doc: IConversationParams): Promise<IConversationDocument>;
  checkExistanceConversations(ids: string[]): void;
  reopen(_id: string): Promise<IConversationDocument>;
  assignUserConversation(
    conversationIds: string[], assignedUserId: string
  ): Promise<IConversationDocument>;
  unassignUserConversation(conversationIds: string[]): Promise<IConversationDocument>;
  changeStatusConversation(
    conversationIds: string[], status: string, userId: string
  ): Promise<IConversationDocument>;
  markAsReadConversation(_id: string, userId: string): Promise<IConversationDocument>;
  newOrOpenConversation(): Promise<IConversationDocument>;
  addParticipatedUsers(conversationId: string, userId: string): Promise<IConversationDocument>;
  changeCustomer(newCustomerId: string, customerIds: string[]): Promise<IConversationDocument>;
  removeCustomerConversations(customerId: string): Promise<IConversationDocument>;
}

class Conversation {
  public static getConversationStatuses() {
    return CONVERSATION_STATUSES;
  }

  /**
   * Check conversations exists
   * @param  {list} ids - Ids of conversations
   * @return {object, list} selector, conversations
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
   * @param  {Object} conversationObj - Object
   * @return {Promise} Newly created conversation object
   */
  public static async createConversation(doc: IConversationParams) {
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
   * @param {String} _id - Conversation id
   * @return {Object} updated conversation
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
   * @param  {list} conversationIds
   * @param  {String} assignedUserId
   * @return {Promise} Updated conversation objects
   */
  public static async assignUserConversation(conversationIds: string[], assignedUserId: string) {
    await this.checkExistanceConversations(conversationIds);

    if (!await Users.findOne({ _id: assignedUserId })) {
      throw new Error(`User not found with id ${assignedUserId}`);
    }

    await Conversations.update(
      { _id: { $in: conversationIds } },
      { $set: { assignedUserId } },
      { multi: true },
    );

    return Conversations.find({ _id: { $in: conversationIds } });
  }

  /**
   * Unassign user from conversation
   * @param  {list} conversationIds
   * @return {Promise} Updated conversation objects
   */
  public static async unassignUserConversation(conversationIds: string[]) {
    await this.checkExistanceConversations(conversationIds);

    await Conversations.update(
      { _id: { $in: conversationIds } },
      { $unset: { assignedUserId: 1 } },
      { multi: true },
    );

    return Conversations.find({ _id: { $in: conversationIds } });
  }

  /**
   * Change conversation status
   * @param  {list} conversationIds
   * @param  {String} status
   * @return {Promise} Updated conversation id
   */
  public static changeStatusConversation(conversationIds: string[], status: string, userId: string) {
    let closedAt = null;
    let closedUserId = null;

    if (status === this.getConversationStatuses().CLOSED) {
      closedAt = new Date();
      closedUserId = userId;
    }

    return Conversations.update(
      { _id: { $in: conversationIds } },
      { $set: { status, closedAt, closedUserId} },
      { multi: true }
    );
  }

  /**
   * Mark as read conversation
   * @param  {String} _id - Id of conversation
   * @param  {String} userId
   * @return {Promise} Updated conversation object
   */
  public static async markAsReadConversation(_id: string, userId: string) {
    const conversation = await Conversations.findOne({ _id });

    if (!conversation) { throw new Error(`Conversation not found with id ${_id}`); }

    const readUserIds = conversation.readUserIds;

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
   * @return {Promise} conversations
   */
  public static newOrOpenConversation() {
    return Conversations.find({
      status: { $in: [this.getConversationStatuses().NEW, this.getConversationStatuses().OPEN] },
    });
  }

  /**
   * Add participated user
   * @param {String} conversationId
   * @param {String} userId
   * @return {Promise} updated conversation id
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
   * @param {String} newCustomerId - Customer id to set
   * @param {String[]} customerIds - Old customer ids to change
   * @return {Promise} Updated list of conversations of new customer
   */
  public static async changeCustomer(newCustomerId: string, customerIds: string) {
    for (const customerId of customerIds) {
      // Updating every conversation and conversation messages of new customer
      await ConversationMessages.updateMany(
        { customerId },
        { $set: { customerId: newCustomerId } },
      );

      await Conversations.updateMany({ customerId }, { $set: { customerId: newCustomerId } });
    }

    // Returning updated list of conversation of new customer
    return Conversations.find({ customerId: newCustomerId });
  }

  /**
   * Removes customer conversations
   * @param {String} customerId - Customer id to remove
   * @return {Promise} Result
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

const Conversations = model<IConversationDocument, IConversationModel>(
  "conversations",
  conversationSchema
);

export default Conversations;
