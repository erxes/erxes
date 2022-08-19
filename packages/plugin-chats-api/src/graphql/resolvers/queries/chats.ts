import { IModels } from '../../../connectionResolver';
import { getIsSeen } from '../chat';
import { graphqlPubsub } from '../../../configs';
import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IUserDocument } from '@erxes/api-utils/src/types';
import { sendCoreMessage } from '../../../messageBroker';

const chatQueries = {
  chats: async (_root, { type, limit, skip }, { models, user }) => {
    const filter: any = { participantIds: { $in: [user._id] } };

    if (type) {
      filter.type = type;
    }

    return {
      list: await models.Chats.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip || 0)
        .limit(limit || 10),
      totalCount: await models.Chats.find(filter).countDocuments()
    };
  },

  chatDetail: async (
    _root,
    { _id },
    { models, user }: { models: IModels; user: IUserDocument }
  ) => {
    const chat = models.Chats.findOne({ _id });

    graphqlPubsub.publish('chatUnreadCountChanged', {
      userId: user._id
    });

    return chat;
  },

  chatMessages: async (
    _root,
    { chatId, isPinned, limit, skip },
    {
      models,
      user,
      subdomain
    }: { models: IModels; user: IUserDocument; subdomain: string }
  ) => {
    const lastMessage = await models.ChatMessages.findOne({
      chatId
    }).sort({
      createdAt: -1
    });

    if (lastMessage) {
      const chat = await models.Chats.getChat(chatId);

      const seenInfos = chat.seenInfos || [];

      let seenInfo = seenInfos.find(info => info.userId === user._id);

      let updated = false;

      if (!seenInfo) {
        seenInfo = {
          userId: user._id,
          lastSeenMessageId: lastMessage._id,
          seenDate: new Date()
        };

        seenInfos.push(seenInfo);

        updated = true;
      } else {
        if (seenInfo.lastSeenMessageId !== lastMessage._id) {
          seenInfo.lastSeenMessageId = lastMessage._id;
          seenInfo.seenDate = new Date();

          updated = true;
        }
      }

      if (updated) {
        await models.Chats.updateOne(
          { _id: chat._id },
          { $set: { seenInfos } }
        );
      }
    }

    const chat = await models.Chats.getChat(chatId);

    if (!getIsSeen(models, chat, user)) {
      graphqlPubsub.publish('chatUnreadCountChanged', {
        userId: user._id
      });
    }

    const seenList: any[] = [];

    for (const info of chat.seenInfos || []) {
      const user = await sendCoreMessage({
        subdomain,
        action: 'users.findOne',
        data: {
          _id: info.userId
        },
        isRPC: true
      });

      if (user) {
        seenList.push({
          user,
          seenDate: info.seenDate,
          lastSeenMessageId: info.lastSeenMessageId
        });
      }
    }

    const filter: { chatId: string; isPinned?: boolean } = { chatId };

    if (isPinned !== undefined) {
      filter.isPinned = isPinned;
    }

    const list = await models.ChatMessages.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip || 0)
      .limit(limit || 20);

    for (const message of list) {
      message.seenList = seenList.filter(
        s => s.lastSeenMessageId === message._id
      );
    }

    return {
      list,
      totalCount: await models.ChatMessages.find(filter).countDocuments()
    };
  },

  chatMessageDetail: async (
    _root,
    { _id },
    { models }: { models: IModels; user: IUserDocument }
  ) => {
    const message = await models.ChatMessages.findOne({ _id });

    return message;
  },

  getChatIdByUserIds: async (
    _root,
    { userIds },
    { models, user }: { models: IModels; user: IUserDocument }
  ) => {
    const participantIds = [...(userIds || [])];

    if (!participantIds.includes(user._id)) {
      participantIds.push(user._id);
    }

    let chat = await models.Chats.findOne({
      type: 'direct',
      participantIds: { $all: participantIds, $size: participantIds.length }
    });

    if (!chat) {
      chat = await models.Chats.createChat(
        {
          participantIds,
          type: 'direct'
        },
        user._id
      );

      graphqlPubsub.publish('chatInserted', {
        userId: user._id
      });

      // graphqlPubsub.publish("chatUnreadCountChanged", {
      //   userId: user._id,
      // });
    }

    return chat._id;
  },

  getUnreadChatCount: async (_root, {}, { models, user }) => {
    const chats = await models.Chats.find({
      participantIds: { $in: user._id }
    });

    let unreadCount = 0;

    for (const chat of chats) {
      const isSeen = await getIsSeen(models, chat, user);

      if (!isSeen) {
        unreadCount++;
      }
    }

    return unreadCount;
  }
};
checkPermission(chatQueries, 'chats', 'showChats');
checkPermission(chatQueries, 'showChats', 'showChats');
checkPermission(chatQueries, 'chatMessages', 'showChats');
checkPermission(chatQueries, 'getChatIdByUserIds', 'showChats');

export default chatQueries;
