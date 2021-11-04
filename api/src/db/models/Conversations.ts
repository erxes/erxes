import { Model, model } from 'mongoose';
import { ConversationMessages, Fields, Users } from '.';
import { stream } from '../../data/bulkUtils';
import { getDocument } from '../../data/resolvers/mutations/cacheUtils';
import { cleanHtml, sendToWebhook } from '../../data/utils';
import { CONVERSATION_STATUSES } from './definitions/constants';
import {
  IMessageDocument,
  IResolveAllConversationParam
} from './definitions/conversationMessages';
import {
  conversationSchema,
  IConversation,
  IConversationDocument
} from './definitions/conversations';
import { Skills } from './Skills';

export interface IConversationModel extends Model<IConversationDocument> {
  getConversation(_id: string): IConversationDocument;
  createConversation(doc: IConversation): Promise<IConversationDocument>;
  updateConversation(_id: string, doc): Promise<IConversationDocument>;
  checkExistanceConversations(ids: string[]): any;
  reopen(_id: string): Promise<IConversationDocument>;

  assignUserConversation(
    conversationIds: string[],
    assignedUserId?: string
  ): Promise<IConversationDocument[]>;

  unassignUserConversation(
    conversationIds: string[]
  ): Promise<IConversationDocument[]>;

  changeCustomerStatus(
    status: string,
    customerId: string,
    integrationId: string
  ): Promise<IMessageDocument[]>;

  changeStatusConversation(
    conversationIds: string[],
    status: string,
    userId?: string
  ): Promise<IConversationDocument>;

  markAsReadConversation(
    _id: string,
    userId: string
  ): Promise<IConversationDocument>;

  newOrOpenConversation(): IConversationDocument[];

  addParticipatedUsers(
    conversationId: string,
    userId: string
  ): Promise<IConversationDocument>;
  addManyParticipatedUsers(
    conversationId: string,
    userId: string[]
  ): Promise<IConversationDocument>;

  changeCustomer(
    newCustomerId: string,
    customerIds: string[]
  ): Promise<IConversationDocument[]>;

  removeCustomersConversations(
    customerId: string[]
  ): Promise<{ n: number; ok: number }>;
  widgetsUnreadMessagesQuery(conversations: IConversationDocument[]): any;

  removeEngageConversations(engageMessageId: string): any;

  getUserRelevance(args: { skillId: string }): Promise<string>;

  resolveAllConversation(
    query: any,
    param: IResolveAllConversationParam
  ): Promise<{ n: number; nModified: number; ok: number }>;
}

export const loadClass = () => {
  class Conversation {
    /**
     * Retreives conversation
     */
    public static async getConversation(_id: string) {
      const conversation = await Conversations.findOne({ _id });

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
      const userRelevance = await this.getUserRelevance({
        skillId: doc.skillId
      });

      const result = await Conversations.create({
        status: CONVERSATION_STATUSES.NEW,
        ...doc,
        content: cleanHtml(doc.content),
        createdAt: doc.createdAt || now,
        updatedAt: doc.createdAt || now,
        number: (await Conversations.find().countDocuments()) + 1,
        messageCount: 0,
        ...(userRelevance ? { userRelevance } : {})
      });

      await sendToWebhook('create', 'conversation', result);

      return result;
    }

    /**
     * Update a conversation
     */
    public static async updateConversation(_id, doc) {
      if (doc.content) {
        doc.content = cleanHtml(doc.content);
      }

      if (doc.customFieldsData) {
        // clean custom field values
        doc.customFieldsData = await Fields.prepareCustomFieldsData(
          doc.customFieldsData
        );
      }

      return Conversations.updateOne({ _id }, { $set: doc });
    }

    /*
     * Reopens conversation
     */
    public static async reopen(_id: string) {
      await Conversations.updateConversation(_id, {
        // reset read state
        readUserIds: [],

        // if closed, reopen
        status: CONVERSATION_STATUSES.OPEN,

        closedAt: null,
        closedUserId: null
      });

      return Conversations.findOne({ _id });
    }

    /**
     * Assign user to conversation
     */
    public static async assignUserConversation(
      conversationIds: string[],
      assignedUserId?: string
    ) {
      await this.checkExistanceConversations(conversationIds);

      if (!(await getDocument('users', { _id: assignedUserId }))) {
        throw new Error(`User not found with id ${assignedUserId}`);
      }

      await Conversations.updateMany(
        { _id: { $in: conversationIds } },
        { $set: { assignedUserId } },
        { multi: true }
      );

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
        { multi: true }
      );

      return Conversations.find({ _id: { $in: conversationIds } });
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
      integrationId: string
    ) {
      const customerConversations = await Conversations.find({
        customerId,
        integrationId,
        status: 'open'
      });

      const promises: Array<Promise<IMessageDocument>> = [];

      for (const conversationObj of customerConversations) {
        promises.push(
          ConversationMessages.addMessage({
            conversationId: conversationObj._id,
            content: `Customer has ${status}`,
            fromBot: true
          })
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
      userId: string
    ) {
      let closedAt;
      let closedUserId;

      if (status === CONVERSATION_STATUSES.CLOSED) {
        closedAt = new Date();
        closedUserId = userId;
      }

      return Conversations.updateMany(
        { _id: { $in: conversationIds } },
        { $set: { status, closedAt, closedUserId } },
        { multi: true }
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
        await Conversations.updateConversation(_id, { readUserIds: [userId] });
      }

      // if current user is not in read users list then add it
      if (!readUserIds.includes(userId)) {
        readUserIds.push(userId);
        await Conversations.updateConversation(_id, { readUserIds });
      }

      return Conversations.findOne({ _id });
    }

    /**
     * Get new or open conversation
     */
    public static async newOrOpenConversation() {
      return Conversations.find({
        status: {
          $in: [CONVERSATION_STATUSES.NEW, CONVERSATION_STATUSES.OPEN]
        },
        updatedAt: {
          $gte: new Date(new Date().getTime() - 12 * 60 * 1000)
        }
      });
    }

    /**
     * Add participated users
     */
    public static addManyParticipatedUsers(
      conversationId: string,
      userIds: string[]
    ) {
      return Conversations.updateOne(
        { _id: conversationId },
        {
          $addToSet: { participatedUserIds: { $each: userIds } }
        }
      );
    }
    /**
     * Add participated user
     */
    public static addParticipatedUsers(conversationId: string, userId: string) {
      return Conversations.updateOne(
        { _id: conversationId },
        {
          $addToSet: { participatedUserIds: userId }
        }
      );
    }

    /**
     * Transfers customers' conversations to another customer
     */
    public static async changeCustomer(
      newCustomerId: string,
      customerIds: string
    ) {
      // Updating every conversation and conversation messages of new customer
      await ConversationMessages.updateMany(
        { customerId: { $in: customerIds } },
        { $set: { customerId: newCustomerId } }
      );

      await Conversations.updateMany(
        { customerId: { $in: customerIds } },
        { $set: { customerId: newCustomerId } }
      );

      // Returning updated list of conversation of new customer
      return Conversations.find({ customerId: newCustomerId });
    }

    /**
     * Removes customers conversations
     */
    public static async removeCustomersConversations(customerIds: string[]) {
      // Finding every conversation of customer
      const conversations = await Conversations.find({
        customerId: { $in: customerIds }
      });

      // Removing conversations and conversation messages
      const conversationIds = conversations.map(conv => conv._id);

      await ConversationMessages.deleteMany({
        conversationId: { $in: conversationIds }
      });

      await Conversations.deleteMany({ _id: { $in: conversationIds } });
    }

    /**
     * Remove engage conversations
     */
    public static async removeEngageConversations(engageMessageId: string) {
      await stream(
        async chunk => {
          await ConversationMessages.deleteMany({
            conversationId: { $in: chunk }
          });
          await Conversations.deleteMany({ _id: { $in: chunk } });
        },
        (variables, root) => {
          const parentIds = variables.parentIds || [];

          parentIds.push(root.conversationId);

          variables.parentIds = parentIds;
        },
        () => {
          return ConversationMessages.find(
            {
              engageData: { $exists: true, $ne: null },
              'engageData.messageId': engageMessageId
            },
            { conversationId: 1, _id: 0 }
          ) as any;
        },
        1000
      );
    }

    public static widgetsUnreadMessagesQuery(
      conversations: IConversationDocument[]
    ) {
      const unreadMessagesSelector = {
        userId: { $exists: true },
        internal: false,
        isCustomerRead: { $ne: true }
      };

      const conversationIds = conversations.map(c => c._id);

      return {
        conversationId: { $in: conversationIds },
        ...unreadMessagesSelector
      };
    }

    /**
     * Resolve all conversation
     */
    public static resolveAllConversation(
      query: any,
      param: IResolveAllConversationParam
    ) {
      return Conversations.updateMany(query, { $set: param }, { multi: true });
    }

    public static async getUserRelevance(args: { skillId?: string }) {
      const skill = await Skills.findOne({ _id: args.skillId }).lean();

      if (!skill) {
        return;
      }

      const users =
        (await Users.find({ _id: { $in: skill.memberIds || [] } }).sort({
          createdAt: 1
        })) || [];

      if (users.length === 0) {
        return;
      }

      const type = args.skillId ? 'SS' : '';

      return users
        .map(user => user.code + type)
        .filter(code => code !== '' && code !== undefined)
        .join('|');
    }
  }

  conversationSchema.loadClass(Conversation);

  return conversationSchema;
};

loadClass();

// tslint:disable-next-line
const Conversations = model<IConversationDocument, IConversationModel>(
  'conversations',
  conversationSchema
);

export default Conversations;
