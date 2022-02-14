const chatQueries = [
  {
    name: 'chats',
    handler: async (
      _root,
      { type, limit, skip },
      { models, checkPermission, user }
    ) => {
      await checkPermission('showChats', user);
      const filter: any = { type, participantIds: { $in: [user._id] } };
      return {
        list: await models.Chats.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip || 0)
          .limit(limit || 10),
        totalCount: await models.Chats.find(filter).countDocuments()
      };
    }
  },
  {
    name: 'chatDetail',
    handler: async (_root, { _id }, { models, checkPermission, user }) => {
      await checkPermission('showChats', user);

      return models.Chats.findOne({ _id });
    }
  },
  {
    name: 'chatMessages',
    handler: async (
      _root,
      { chatId, isPinned, limit, skip },
      { models, user, checkPermission }
    ) => {
      await checkPermission('showChats', user);

      const lastMessage = await models.ChatMessages.findOne({
        chatId
      }).sort({
        createdAt: -1
      });

      if (lastMessage) {
        const chat = await models.Chats.getChat(models, chatId);

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
          // if not new message, don't update info`s
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

      const chat = await models.Chats.getChat(models, chatId);

      const seenList = [];

      for (const info of chat.seenInfos || []) {
        const user = await models.Users.findOne({ _id: info.userId });

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

      return {
        list: await models.ChatMessages.find(filter)
          .sort({ createdAt: 1 })
          .skip(skip || 0)
          .limit(limit || 20),
        seenList,
        totalCount: await models.ChatMessages.find(filter).countDocuments()
      };
    }
  },
  {
    name: 'getChatIdByUserIds',
    handler: async (_root, { userIds }, { models, checkPermission, user }) => {
      await checkPermission('showChats', user);
      const participantIds = [...(userIds || [])];

      if (!participantIds.includes(user._id)) {
        participantIds.push(user._id);
      }

      let chat = await models.Chats.findOne({
        type: 'direct',
        participantIds: { $all: participantIds, $size: participantIds.length }
      });

      if (!chat) {
        chat = await models.Chats.createChat(models, {
          name: 'Direct chat',
          participantIds,
          type: 'direct'
        });
      }

      return chat._id;
    }
  }
];

export default chatQueries;
