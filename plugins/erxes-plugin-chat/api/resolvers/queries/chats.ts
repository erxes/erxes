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

      const filter: { chatId: string; isPinned?: boolean } = { chatId };

      if (isPinned !== undefined) {
        filter.isPinned = isPinned;
      }

      return {
        list: await models.ChatMessages.find(filter)
          .sort({ createdAt: 1 })
          .skip(skip || 0)
          .limit(limit || 20),
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
