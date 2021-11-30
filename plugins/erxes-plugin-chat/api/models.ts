import {
  chatMessageSchema,
  chatSchema,
  IChat,
  IChatMessage
} from './definitions';

class Chat {
  /*
   * Get a chat
   */
  public static async getChat(models, _id: string) {
    const chat = await models.Chats.findOne({ _id });

    if (!chat) {
      throw new Error('Chat not found');
    }

    return chat;
  }

  public static createChat(models, doc: IChat, createdId: string) {
    return models.Chats.create({
      ...doc,
      createdAt: new Date(),
      createdId
    });
  }

  public static async updateChat(models, _id: string, doc: IChat) {
    await models.Chats.updateOne({ _id }, { $set: doc });

    return models.Chats.findOne({ _id });
  }

  public static removeChat(models, _id: string) {
    return models.Chats.deleteOne({ _id });
  }
}
class ChatMessage {
  /*
   * Get a chat message
   */
  public static async getChatMessage(models, _id: string) {
    const chatMessage = await models.ChatMessages.findOne({ _id });

    if (!chatMessage) {
      throw new Error('Chat message not found');
    }

    return chatMessage;
  }

  public static createChatMessage(models, doc: IChat, createdId: string) {
    return models.ChatMessages.create({
      ...doc,
      createdAt: new Date(),
      createdId
    });
  }

  public static async updateChatMessage(
    models,
    _id: string,
    doc: IChatMessage
  ) {
    await models.ChatMessages.updateOne({ _id }, { $set: doc });

    return models.ChatMessages.findOne({ _id });
  }

  public static removeChatMessage(models, _id: string) {
    return models.ChatMessages.deleteOne({ _id });
  }
}

export default [
  {
    name: 'Chats',
    schema: chatSchema,
    klass: Chat
  },
  {
    name: 'ChatMessages',
    schema: chatMessageSchema,
    klass: ChatMessage
  }
];
