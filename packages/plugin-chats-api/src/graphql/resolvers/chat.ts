import { sendCoreMessage } from '../../messageBroker';

export const getIsSeen = async (models, chat, user) => {
  const lastMessage = await models.ChatMessages.findOne({
    chatId: chat._id
  }).sort({
    createdAt: -1
  });

  if (!lastMessage) {
    return true;
  }

  const seenInfos = chat.seenInfos || [];

  const seenInfo = seenInfos.find(info => info.userId === user._id);

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
    return models.ChatMessages.findOne({ chatId: chat._id }).sort({
      createdAt: -1
    });
  },

  async createdUser(chat) {
    return (
      chat.createdBy && {
        __typename: 'User',
        _id: chat.createdBy
      }
    );
  },

  async isSeen(chat, {}, { models, user }) {
    return getIsSeen(models, chat, user);
  },

  async participantUsers(chat, {}, { subdomain }) {
    const users = await sendCoreMessage({
      subdomain,
      action: 'users.find',
      data: {
        query: {
          _id: { $in: chat.participantIds || [] }
        }
      },
      isRPC: true
    });

    return users.map(user => ({
      ...user,
      isAdmin: (chat.adminIds || []).includes(user._id)
    }));
  }
};

export default Chat;
