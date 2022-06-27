import { CHAT_TYPE, IChatMessage } from '../../../models/definitions/chat';
import { graphqlPubsub } from '../../../configs';
import { checkPermission } from '@erxes/api-utils/src/permissions';
import { sendCoreMessage } from '../../../messageBroker';

const checkChatAdmin = async (Chats, userId) => {
  const found = await Chats.exists({
    adminIds: { $in: [userId] }
  });

  if (!found) {
    throw new Error('Only admin can this action');
  }
};

const hasAdminLeft = (chat, userId) => {
  const found = (chat.adminIds || []).indexOf(userId) !== -1;

  if (found && (chat.adminIds || []).length === 1) {
    throw new Error('You cannot remove you. There is no admin except you.');
  }
};

const strip_html = (string: any) => {
  if (typeof string === 'undefined' || string === null) {
    return;
  } else {
    const regex = /(&nbsp;|<([^>]+)>)/gi;
    var result = string.replace(regex, '');
    result = result.replace(/&#[0-9][0-9][0-9][0-9];/gi, ' ');
    const cut = result.slice(0, 70);
    return cut;
  }
};

const chatMutations = {
  chatAdd: async (_root, { participantIds, ...doc }, { user, models }) => {
    const allParticipantIds =
      participantIds && participantIds.includes(user._id)
        ? participantIds
        : (participantIds || []).concat(user._id);

    const chat = await models.Chats.createChat(
      {
        ...doc,
        participantIds: allParticipantIds,
        adminIds: [user._id]
      },
      user._id
    );

    sendCoreMessage({
      subdomain: 'os',
      action: 'sendMobileNotification',
      data: {
        title: doc.title,
        body: doc.description,
        receivers: allParticipantIds
      }
    });

    graphqlPubsub.publish('chatInserted', {
      userId: user._id
    });

    graphqlPubsub.publish('chatUnreadCountChanged', {
      userId: user._id
    });

    return chat;
  },

  chatEdit: async (_root, { _id, ...doc }, { models, user }) => {
    return models.Chats.updateChat(_id, doc);
  },

  chatRemove: async (_root, { _id }, { models, user }) => {
    const chat = await models.Chats.findOne({ _id });

    if (!chat) {
      throw new Error('Chat not found');
    }

    if (chat.type === CHAT_TYPE.GROUP) {
      await checkChatAdmin(models.Chats, user._id);
    }

    return models.Chats.removeChat(_id);
  },

  chatMarkAsRead: async (_root, { _id }, { models, user }) => {
    const lastMessage = await models.ChatMessages.findOne({ chatId: _id }).sort(
      {
        createdAt: -1
      }
    );

    let seen;

    if (lastMessage) {
      const chat = await models.Chats.getChat(_id);

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

        seen = true;
      } else {
        const index = seenInfos.indexOf(seenInfo);
        if (index > -1) {
          seenInfos.splice(index, 1);
        }

        updated = true;

        seen = false;

        // if (seenInfo.lastSeenMessageId !== lastMessage._id) {
        //   seenInfo.lastSeenMessageId = lastMessage._id;
        //   seenInfo.seenDate = new Date();

        //   updated = true;
        // }
      }

      if (updated) {
        graphqlPubsub.publish('chatUnreadCountChanged', {
          userId: user._id
        });

        await models.Chats.updateOne(
          { _id: chat._id },
          { $set: { seenInfos } }
        );
      }
    }

    return seen;
  },

  chatMessageAdd: async (_root, args, { models, user }) => {
    if (!args.content) {
      throw new Error('Content is required');
    }

    const message = await models.ChatMessages.createChatMessage(args, user._id);

    await models.Chats.updateOne(
      { _id: message.chatId },
      { $set: { updatedAt: new Date() } }
    );

    graphqlPubsub.publish('chatMessageInserted', {
      chatMessageInserted: message
    });

    const chat = await models.Chats.getChat(message.chatId);

    const recievers = chat.participantIds.filter(i => i !== user._id);

    if (args.mentionedUserIds) {
      if (args.mentionedUserIds.includes('everyone')) {
        sendCoreMessage({
          subdomain: 'os',
          action: 'sendMobileNotification',
          data: {
            title: `${user?.details?.fullName || user?.fullName} sent you chat`,
            body: strip_html(args.content),
            receivers: recievers
          }
        });
      } else {
        sendCoreMessage({
          subdomain: 'os',
          action: 'sendMobileNotification',
          data: {
            title: `${user?.details?.fullName || user?.fullName} sent you chat`,
            body: strip_html(args.content),
            receivers: args.mentionedUserIds
          }
        });
      }
    }

    for (const reciever of recievers) {
      graphqlPubsub.publish('chatUnreadCountChanged', {
        userId: reciever
      });

      graphqlPubsub.publish('chatInserted', {
        userId: reciever
      });
    }

    return message;
  },

  chatMessageRemove: async (_root, { _id }, { models }) => {
    const chat = models.ChatMessages.removeChatMessage(_id);

    return chat;
  },

  chatMessageToggleIsPinned: async (_root, { _id }, { models }) => {
    const message = await models.ChatMessages.findOne({ _id });

    graphqlPubsub.publish('chatMessageInserted', {
      chatId: message.chatId
    });

    await models.ChatMessages.updateOne(
      { _id },
      { $set: { isPinned: !message.isPinned } }
    );

    return !message.isPinned;
  },

  chatAddOrRemoveMember: async (
    _root,
    { _id, userIds, type },
    { models, user }
  ) => {
    await checkChatAdmin(models.Chats, user._id);

    const chat = await models.Chats.getChat(_id);

    if ((chat.participantIds || []).length === 1) {
      await models.Chats.removeChat(_id);

      return 'Chat removed';
    }

    // while user is removing himself or herself
    if (type === 'remove' && (userIds || []).indexOf(user._id) !== -1) {
      hasAdminLeft(chat, user._id);
    }

    await models.Chats.updateOne(
      { _id },
      type === 'add'
        ? { $addToSet: { participantIds: userIds } }
        : {
            $pull: {
              participantIds: { $in: userIds },
              adminIds: { $in: userIds }
            }
          }
    );

    return 'Success';
  },

  chatMakeOrRemoveAdmin: async (_root, { _id, userId }, { models, user }) => {
    await checkChatAdmin(models.Chats, user._id);

    const chat = await models.Chats.findOne({
      _id,
      participantIds: { $in: [userId] }
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    const found = (chat.adminIds || []).indexOf(userId) !== -1;

    // while removing
    if (found) {
      hasAdminLeft(chat, user._id);
    }

    // if found, means remove
    // if not found, means to become admin
    await models.Chats.updateOne(
      { _id },
      found
        ? { $pull: { adminIds: { $in: [userId] } } }
        : { $addToSet: { adminIds: [userId] } }
    );

    return 'Success';
  },

  chatTypingInfo(_root, args: { chatId: string; userId?: string }) {
    graphqlPubsub.publish('chatTypingStatusChanged', {
      chatTypingStatusChanged: args
    });

    return 'ok';
  }
};

checkPermission(chatMutations, 'chatAdd', 'manageChats');
checkPermission(chatMutations, 'chatEdit', 'manageChats');
checkPermission(chatMutations, 'chatRemove', 'manageChats');
checkPermission(chatMutations, 'chatMarkAsRead', 'manageChats');
checkPermission(chatMutations, 'chatMessageAdd', 'manageChats');
checkPermission(chatMutations, 'chatMessageRemove', 'manageChats');
checkPermission(chatMutations, 'chatMessageToggleIsPinned', 'manageChats');
checkPermission(chatMutations, 'chatAddOrRemoveMember', 'manageChats');
checkPermission(chatMutations, 'chatMakeOrRemoveAdmin', 'manageChats');

export default chatMutations;
