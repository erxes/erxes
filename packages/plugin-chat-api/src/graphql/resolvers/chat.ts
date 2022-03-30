export const getIsSeen = async (models, chat, user) => {
  const lastMessage = await models.ChatMessages.findOne({
    chatId: chat._id,
  }).sort({
    createdAt: -1,
  });

  if (!lastMessage) {
    return true;
  }

  const seenInfos = chat.seenInfos || [];

  const seenInfo = seenInfos.find((info) => info.userId === user._id);

  if (!seenInfo) {
    return false;
  }

  if (seenInfo.lastSeenMessageId.toString() !== lastMessage._id.toString()) {
    return false;
  }

  return true;
};

const Chat = {
  async lastMessage(chat, {}, { models }) {
    const user = models.ChatMessages.findOne({ chatId: chat._id }).sort({
      createdAt: -1,
    });
    return user;
  },

  async createdUser(chat, {}, { models }) {
    return models.Users.findOne({ _id: chat.createdBy });
  },

  async isSeen(chat, {}, { models, user }) {
    return getIsSeen(models, chat, user);
  },

  async participantUsers(chat, {}, { models }) {
    const users = await models.Users.find({
      _id: { $in: chat.participantIds || [] },
    }).lean();
    const user = users.map((user) => ({
      ...user,
      isAdmin: (chat.adminIds || []).includes(user._id),
    }));
    return user;
  },
};

export default Chat;
