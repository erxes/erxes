import { sendNotification } from 'erxes-api-utils';
import { CHAT_TYPE, IChatMessage } from '../../../models/definitions/chat';
import graphqlPubsub from '../subscription/pubsub';
import { sendMobileNotification } from '../../../utils';
import { checkPermission } from '@erxes/api-utils/src/permissions';

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

const chatMutations = {
  chatAdd: async (
    _root,
    { participantIds, ...doc },
    { user, models, memoryStorage }
  ) => {
    const allParticipantIds =
      participantIds && participantIds.includes(user._id)
        ? participantIds
        : (participantIds || []).concat(user._id);

    const chat = await models.Chats.createChat(
      models,
      {
        ...doc,
        participantIds: allParticipantIds,
        adminIds: [user._id],
      },
      user._id
    );

    sendNotification(models, memoryStorage, graphqlPubsub, {
      notifType: 'plugin',
      title: doc.name || doc.description,
      content: doc.description,
      action: `${doc.type} chat created`,
      link: `/erxes-plugin-chat/home`,
      createdUser: user,
      // exclude current user
      contentType: 'chat',
      contentTypeId: chat._id,
      receivers: allParticipantIds,
    });

    sendMobileNotification(models, {
      title: doc.title,
      body: doc.description,
      receivers: allParticipantIds,
    });

    graphqlPubsub.publish('chatInserted', {
      userId: user._id,
    });

    graphqlPubsub.publish('chatUnreadCountChanged', {
      userId: user._id,
    });

    return chat;
  },

  chatEdit: async (_root, { _id, ...doc }, { models, user }) => {
    return models.Chats.updateChat(models, _id, doc);
  },
  chatRemove: async (_root, { _id }, { models, user }) => {
    const chat = await models.Chats.findOne({ _id });

    if (!chat) {
      throw new Error('Chat not found');
    }

    if (chat.type === CHAT_TYPE.GROUP) {
      await checkChatAdmin(models.Chats, user._id);
    }

    return models.Chats.removeChat(models, _id);
  },

  handchatMessageAddler: async (_root, args, { models, user }) => {
    if (!args.content) {
      throw new Error('Content is required');
    }

    const created = await models.ChatMessages.createChatMessage(
      models,
      args,
      user._id
    );

    graphqlPubsub.publish('chatMessageInserted', {
      chatId: created.chatId,
    });

    return created;
  },

  chatMessageRemove: async (_root, { _id }, { models, user }) => {
    return models.ChatMessages.removeChatMessage(models, _id);
  },

  chatMessageToggleIsPinned: async (_root, { _id }, { models, user }) => {
    const message: IChatMessage = await models.ChatMessages.findOne({ _id });

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

    const chat = await models.Chats.getChat(models, _id);

    if ((chat.participantIds || []).length === 1) {
      await models.Chats.removeChat(models, _id);

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
              adminIds: { $in: userIds },
            },
          }
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
        : { $addToSet: { adminIds: [userId] } }
    );

    return 'Success';
  },
};

checkPermission(chatMutations, 'chatAdd', 'manageChats');
checkPermission(chatMutations, 'chatEdit', 'manageChats');
checkPermission(chatMutations, 'chatRemove', 'manageChats');
checkPermission(chatMutations, 'handchatMessageAddler', 'manageChats');
checkPermission(chatMutations, 'chatMessageRemove', 'manageChats');
checkPermission(chatMutations, 'chatMessageToggleIsPinned', 'manageChats');
checkPermission(chatMutations, 'chatAddOrRemoveMember', 'manageChats');
checkPermission(chatMutations, 'chatMakeOrRemoveAdmin', 'manageChats');

export default chatMutations;
