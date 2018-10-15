import { Model, model } from 'mongoose';
import * as strip from 'strip';
import { Conversations } from '.';
import { IMessage, IMessageDocument, messageSchema } from './definitions/conversationMessages';

interface IMessageModel extends Model<IMessageDocument> {
  createMessage(doc: IMessage): Promise<IMessageDocument>;
  addMessage(doc: IMessage, userId: string): Promise<IMessageDocument>;
  getNonAsnweredMessage(conversationId: string): Promise<IMessageDocument>;
  getAdminMessages(conversationId: string): Promise<IMessageDocument[]>;
  markSentAsReadMessages(conversationId: string): Promise<IMessageDocument>;
}

class Message {
  /**
   * Create a message
   */
  public static async createMessage(doc: IMessage) {
    const message = await Messages.create({
      internal: false,
      ...doc,
      createdAt: new Date(),
    });

    const messageCount = await Messages.find({
      conversationId: message.conversationId,
    }).count();

    await Conversations.update(
      { _id: message.conversationId },
      {
        $set: {
          messageCount,

          // updating updatedAt
          updatedAt: new Date(),
        },
      },
    );

    if (message.userId) {
      // add created user to participators
      await Conversations.addParticipatedUsers(message.conversationId, message.userId);
    }

    // add mentioned users to participators
    for (const userId of message.mentionedUserIds || []) {
      await Conversations.addParticipatedUsers(message.conversationId, userId);
    }

    return message;
  }

  /**
   * Create a conversation message
   */
  public static async addMessage(doc: IMessage, userId: string) {
    const conversation = await Conversations.findOne({
      _id: doc.conversationId,
    });

    if (!conversation) {
      throw new Error(`Conversation not found with id ${doc.conversationId}`);
    }

    // normalize content, attachments
    const content = doc.content || '';
    const attachments = doc.attachments || [];

    doc.content = content;
    doc.attachments = attachments;

    // if there is no attachments and no content then throw content required error
    if (attachments.length === 0 && !strip(content)) {
      throw new Error('Content is required');
    }

    // setting conversation's content to last message
    await Conversations.update({ _id: doc.conversationId }, { $set: { content } });

    return this.createMessage({ ...doc, userId });
  }

  /**
   * User's last non answered question
   */
  public static getNonAsnweredMessage(conversationId: string) {
    return Messages.findOne({
      conversationId,
      customerId: { $exists: true },
    }).sort({ createdAt: -1 });
  }

  /**
   * Get admin messages
   */
  public static getAdminMessages(conversationId: string) {
    return Messages.find({
      conversationId,
      userId: { $exists: true },
      isCustomerRead: false,

      // exclude internal notes
      internal: false,
    }).sort({ createdAt: 1 });
  }

  /**
   * Mark sent messages as read
   */
  public static markSentAsReadMessages(conversationId: string) {
    return Messages.update(
      {
        conversationId,
        userId: { $exists: true },
        isCustomerRead: { $exists: false },
      },
      { $set: { isCustomerRead: true } },
      { multi: true },
    );
  }
}

messageSchema.loadClass(Message);

const Messages = model<IMessageDocument, IMessageModel>('conversation_messages', messageSchema);

export default Messages;
