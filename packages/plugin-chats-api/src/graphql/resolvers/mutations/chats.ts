import { CHAT_TYPE } from '../../../models/definitions/chat';
import * as strip from 'strip';
import graphqlPubsub from '@erxes/api-utils/src/graphqlPubsub';
import { checkPermission } from '@erxes/api-utils/src/permissions';
import { sendCoreMessage } from '../../../messageBroker';
import { IContext } from '../../../connectionResolver';

const checkChatAdmin = async (Chats, userId) => {
  const found = await Chats.exists({
    adminIds: { $in: [userId] },
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
    let result = string.replace(regex, '');
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
        adminIds: [user._id],
      },
      user._id,
    );

    const recievers = allParticipantIds.filter((value) => user._id !== value);

    sendCoreMessage({
      subdomain: 'os',
      action: 'sendMobileNotification',
      data: {
        title: doc.title,
        body: doc.description,
        recievers,
        data: {
          type: 'chats',
          id: chat._id,
        },
      },
    });

    for (const participant of allParticipantIds) {
      if (participant !== user._id) {
        graphqlPubsub.publish(`chatInserted:${participant}`, {
          userId: participant,
        });

        graphqlPubsub.publish(`chatUnreadCountChanged:${participant}`, {
          userId: participant,
        });
      }
    }

    return chat;
  },

  chatEdit: async (_root, { _id, ...doc }, { models, user }) => {
    return models.Chats.updateChat(_id, doc, user);
  },

  chatRemove: async (_root, { _id }, { models, user }) => {
    const chat = await models.Chats.findOne({
      _id,
      participantIds: { $in: [user._id] },
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    if (chat.type === CHAT_TYPE.GROUP) {
      if (chat.participantIds.length > 1) {
        await models.Chats.updateOne(
          { _id },
          {
            $pull: {
              participantIds: { $in: user?._id },
              adminIds: { $in: user?._id },
            },
          },
        );

        return 'Success';
      }
    }

    return 'Success';
  },

  chatArchive: async (_root, { _id }, { models, user }) => {
    const chat = await models.Chats.findOne({
      _id,
      participantIds: { $in: [user._id] },
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    const archiverUser = chat && chat.archivedUserIds.includes(user._id);

    if (archiverUser) {
      await models.Chats.updateOne(
        { _id },
        { $pull: { archivedUserIds: { $in: [user._id] } } },
      );
    } else {
      await models.Chats.updateOne(
        { _id },
        { $push: { archivedUserIds: [user._id] } },
      );
    }

    return 'Success';
  },

  chatMarkAsRead: async (_root, { _id }, { models, user }) => {
    const lastMessage = await models.ChatMessages.findOne({ chatId: _id }).sort(
      {
        createdAt: -1,
      },
    );

    let seen;

    if (lastMessage) {
      const chat = await models.Chats.getChat(_id, user._id);

      const seenInfos = chat.seenInfos || [];

      let seenInfo = seenInfos.find((info) => info.userId === user._id);

      let updated = false;

      if (!seenInfo) {
        seenInfo = {
          userId: user._id,
          lastSeenMessageId: lastMessage._id,
          seenDate: new Date(),
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
      }

      if (updated) {
        await models.Chats.updateOne(
          { _id: chat._id },
          { $set: { seenInfos } },
        );
      }
    }

    return seen;
  },

  chatToggleIsPinned: async (_root, { _id }, { models, user }) => {
    const chat = await models.Chats.findOne({
      _id,
      participantIds: { $in: [user._id] },
    });

    const isPinnedUser = chat && chat.isPinnedUserIds.includes(user._id);

    if (chat) {
      if (chat.createdUser?._id) {
        graphqlPubsub.publish(`chatInserted:${chat.createdUser._id}`, {
          userId: chat.createdUser?._id,
        });
      }

      if (!isPinnedUser) {
        await models.Chats.updateOne(
          { _id },
          {
            $push: { isPinnedUserIds: [user._id] },
          },
        );
      }

      if (isPinnedUser) {
        await models.Chats.updateOne(
          { _id },
          {
            $pull: { isPinnedUserIds: { $in: [user._id] } },
          },
        );
      }

      return true;
    }
    return false;
  },

  chatToggleIsWithNotification: async (_root, { _id }, { models, user }) => {
    const chat = await models.Chats.findOne({
      _id,
      participantIds: { $in: [user._id] },
    });
    const muteUser = chat && chat.muteUserIds.includes(user._id);

    if (chat) {
      if (chat.createdUser?._id) {
        graphqlPubsub.publish(`chatInserted:${chat.createdUser._id}`, {
          userId: chat.createdUser?._id,
        });
      }

      if (!muteUser) {
        await models.Chats.updateOne(
          { _id },
          {
            $push: { muteUserIds: [user._id] },
          },
        );
      }

      if (muteUser) {
        await models.Chats.updateOne(
          { _id },
          {
            $pull: { muteUserIds: { $in: [user._id] } },
          },
        );
      }

      return true;
    }
    return false;
  },

  chatMessageAdd: async (_root, args, { models, user }) => {
    if (!args.content && args.attachments.length === 0) {
      throw new Error('Content is required');
    }

    // <img> tags wrapped inside empty <p> tag should be allowed
    const contentValid =
      args.content.indexOf('<img') !== -1 ? true : strip(args.content);

    // if there is no attachments and no content then throw content required error
    if (args?.attachments.length === 0 && !contentValid) {
      throw new Error('Content is required');
    }

    const message = await models.ChatMessages.createChatMessage(args, user._id);

    await models.Chats.updateOne(
      {
        _id: message.chatId,
      },
      {
        $set: {
          updatedAt: new Date(),
          archivedUserIds: [],
        },
      },
    );

    const chat = await models.Chats.getChat(message.chatId, user._id);

    let recievers
      chat.participantIds.filter(
      (value) => !chat.muteUserIds.includes(value),
    );

    recievers = chat.participantIds.filter((value) => user._id !== value);

    sendCoreMessage({
      subdomain: 'os',
      action: 'sendMobileNotification',
      data: {
        title: `${user?.details?.fullName || user?.fullName} sent you chat`,
        body: strip_html(args.content),
        receivers: recievers,
        data: {
          type: 'chats',
          id: chat._id,
        },
      },
    });

    for (const reciever of recievers) {
      if (reciever !== user._id) {
        graphqlPubsub.publish(`chatUnreadCountChanged:${reciever}`, {
          userId: reciever,
        });

        graphqlPubsub.publish(`chatInserted:${reciever}`, {
          userId: reciever,
        });

        graphqlPubsub.publish(`chatMessageInserted:${message.chatId}`, {
          chatMessageInserted: message,
        });
      }
    }

    return message;
  },

  chatMessageRemove: async (_root, { _id }, { models }) => {
    const chat = models.ChatMessages.removeChatMessage(_id);

    return chat;
  },

  chatMessageToggleIsPinned: async (_root, { _id }, { models }) => {
    const message = await models.ChatMessages.findOne({ _id });

    if (message) {
      graphqlPubsub.publish(`chatMessageInserted:${message.chatId}`, {
        chatId: message.chatId,
      });

      await models.ChatMessages.updateOne(
        { _id },
        { $set: { isPinned: !message.isPinned } },
      );

      return !message.isPinned;
    }
    return false;
  },

  chatAddOrRemoveMember: async (
    _root,
    { _id, userIds, type },
    { models, user },
  ) => {
    const chat = await models.Chats.getChat(_id, user._id);
    // const chat = await models.Chats.getChat(_id);

    if ((chat.participantIds || []).length === 1) {
      if (type === 'remove') {
        await models.Chats.removeChat(_id);

        return 'Chat removed';
      }
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
              adminIds: { $in: userIds },
            },
          },
    );

    return 'Success';
  },

  chatMakeOrRemoveAdmin: async (_root, { _id, userId }, { models, user }) => {
    await checkChatAdmin(models.Chats, user._id);

    const chat = await models.Chats.findOne({
      _id,
      participantIds: { $in: [userId] },
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
        : { $addToSet: { adminIds: [userId] } },
    );

    return 'Success';
  },

  async chatTypingInfo(_root, args: { chatId: string; userId?: string }) {
    graphqlPubsub.publish(`chatTypingStatusChanged:${args.chatId}`, {
      chatTypingStatusChanged: args,
    });

    return 'ok';
  },

  chatForward: async (_root, { userIds, ...args }, { user, models }) => {
    if (userIds && userIds.length > 0) {
      const participantIds = [...(userIds || [])];

      if (!participantIds.includes(user._id)) {
        participantIds.push(user._id);
      }

      let newChat = await models.Chats.findOne({
        type: 'direct',
        participantIds: {
          $all: participantIds,
          $size: participantIds.length,
        },
      });

      if (!newChat) {
        newChat = await models.Chats.createChat(
          {
            participantIds,
            type: 'direct',
          },
          user._id,
        );

        graphqlPubsub.publish(`chatInserted:${user._id}`, {
          userId: user._id,
        });

        args.chatId = newChat._id;
      }

      if (newChat) {
        args.chatId = newChat._id;
      }
    }

    const message = await models.ChatMessages.createChatMessage(args, user._id);

    await models.Chats.updateOne(
      {
        _id: message.chatId,
      },
      {
        $set: {
          updatedAt: new Date(),
        },
      },
    );

    graphqlPubsub.publish(`chatMessageInserted:${message.chatId}`, {
      chatMessageInserted: message,
    });

    const chat = await models.Chats.getChat(message.chatId, user._id);

    let recievers = chat.participantIds.filter(
      (value) => !chat.muteUserIds.includes(value),
    );

    recievers = recievers.filter((value) => user._id !== value);

    sendCoreMessage({
      subdomain: 'os',
      action: 'sendMobileNotification',
      data: {
        title: `${user?.details?.fullName || user?.fullName} sent you chat`,
        body: strip_html(args.content),
        receivers: recievers,
        data: {
          type: 'chats',
          id: chat._id,
        },
      },
    });

    for (const reciever of recievers) {
      if (reciever !== user._id) {
        graphqlPubsub.publish(`chatUnreadCountChanged:${reciever}`, {
          userId: reciever,
        });

        graphqlPubsub.publish(`chatInserted:${reciever}`, {
          userId: reciever,
        });
      }
    }

    return message;
  },

  chatMessageReactionAdd: async (_root, doc, { user, models }: IContext) => {
    const findMessageReaction = await models.ChatMessageReactions.findOne({
      userId: doc.userId || user._id,
      chatMessageId: doc.chatMessageId,
    });
    // if user already added a reaction to a message
    if (findMessageReaction) {
      return await models.ChatMessageReactions.updateChatMessageReaction(
        findMessageReaction._id,
        {
          userId: doc.userId || user._id,
          ...doc,
        },
      );
    }

    return await models.ChatMessageReactions.createChatMessageReaction({
      userId: doc.userId || user._id,
      ...doc,
    });
  },

  chatMessageReactionRemove: async (_root, { _id }, { models }: IContext) => {
    return models.ChatMessageReactions.removeChatMessageReaction(_id);
  },
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
