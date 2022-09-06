import { Model } from 'mongoose';
import {
  chatMessageSchema,
  chatSchema,
  IChat,
  IChatMessage,
  IChatDocument,
  IChatMessageDocument,
  IUserStatusDocument,
  IUserStatus,
  userStatusSchema
} from './definitions/chat';

export interface IChatModel extends Model<IChatDocument> {
  getChat(_id: string);
  createChat(doc: IChat, createdBy: string): Promise<IChatDocument>;
  updateChat(_id: string, doc: IChat);
  removeChat(_id: string);
}
export const loadChatClass = models => {
  class Chat {
    /*
     * Get a chat
     */
    public static async getChat(_id: string) {
      const chat = await models.Chats.findOne({ _id });

      if (!chat) {
        throw new Error('Chat not found');
      }

      return chat;
    }

    public static createChat(doc: IChat, createdBy: string) {
      return models.Chats.create({
        ...doc,
        createdAt: new Date(),
        createdBy
      });
    }

    public static async updateChat(_id: string, doc: IChat) {
      await models.Chats.updateOne({ _id }, { $set: doc });

      return models.Chats.findOne({ _id });
    }

    public static async removeChat(_id: string) {
      await models.ChatMessages.deleteMany({ chatId: _id });

      return models.Chats.deleteOne({ _id });
    }
  }

  chatSchema.loadClass(Chat);

  return chatSchema;
};

export interface IChatMessageModel extends Model<IChatMessageDocument> {
  getChatMessage(_id: string);
  createChatMessage(doc: IChatMessage, createdBy: string);
  updateChatMessage(_id: string, doc: IChatMessage);
  removeChatMessage(_id: string);
}
export const loadChatMessageClass = models => {
  class ChatMessage {
    /*
     * Get a chat message
     */
    public static async getChatMessage(_id: string) {
      const chatMessage = await models.ChatMessages.findOne({ _id });

      if (!chatMessage) {
        throw new Error('Chat message not found');
      }

      return chatMessage;
    }

    public static createChatMessage(doc: IChatMessage, createdBy: string) {
      return models.ChatMessages.create({
        ...doc,
        createdAt: new Date(),
        createdBy
      });
    }

    public static async updateChatMessage(_id: string, doc: IChatMessage) {
      await models.ChatMessages.updateOne({ _id }, { $set: doc });

      return models.ChatMessages.findOne({ _id });
    }

    public static removeChatMessage(_id: string) {
      return models.ChatMessages.deleteOne({ _id });
    }
  }
  chatMessageSchema.loadClass(ChatMessage);

  return chatMessageSchema;
};

export interface IUserStatusModel extends Model<IUserStatusDocument> {
  getChat(_id: string);
  createUserStatus(doc: IUserStatus): Promise<IUserStatusDocument>;
  updateChat(_id: string, doc: IUserStatus);
}
export const loadUserStatusClass = models => {
  class UserStatus {
    /*
     * Get a UserStatus
     */
    public static async getChatUserStatus(_id: string) {
      const chat = await models.UserStatus.findOne({ _id });

      if (!chat) {
        throw new Error('UserStatus not found');
      }

      return chat;
    }

    public static async createUserStatus(doc: IUserStatus) {
      return await models.UserStatus.create({
        ...doc
      });
    }

    public static async updateUserStatusByUserId(
      userId: string,
      doc: IUserStatus
    ) {
      await models.UserStatus.updateOne({ userId }, { $set: doc });

      return models.UserStatus.findOne({ userId });
    }
  }

  userStatusSchema.loadClass(UserStatus);

  return userStatusSchema;
};
