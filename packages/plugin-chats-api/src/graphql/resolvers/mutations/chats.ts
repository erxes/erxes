import { CHAT_TYPE, IChatMessage } from "../../../models/definitions/chat";
import { graphqlPubsub } from "../../../configs";
import { checkPermission } from "@erxes/api-utils/src/permissions";
import { sendCoreMessage } from "../../../messageBroker";

const checkChatAdmin = async (Chats, userId) => {
  const found = await Chats.exists({
    adminIds: { $in: [userId] },
  });

  if (!found) {
    throw new Error("Only admin can this action");
  }
};

const hasAdminLeft = (chat, userId) => {
  const found = (chat.adminIds || []).indexOf(userId) !== -1;

  if (found && (chat.adminIds || []).length === 1) {
    throw new Error("You cannot remove you. There is no admin except you.");
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
      user._id
    );

    sendCoreMessage({
      subdomain: "os",
      action: "sendMobileNotification",
      data: {
        title: doc.title,
        body: doc.description,
        receivers: allParticipantIds,
      },
    });

    graphqlPubsub.publish("chatInserted", {
      userId: user._id,
    });

    graphqlPubsub.publish("chatUnreadCountChanged", {
      userId: user._id,
    });

    return chat;
  },

  chatEdit: async (_root, { _id, ...doc }, { models, user }) => {
    return models.Chats.updateChat(_id, doc);
  },

  chatRemove: async (_root, { _id }, { models, user }) => {
    const chat = await models.Chats.findOne({ _id });

    if (!chat) {
      throw new Error("Chat not found");
    }

    if (chat.type === CHAT_TYPE.GROUP) {
      await checkChatAdmin(models.Chats, user._id);
    }

    return models.Chats.removeChat(_id);
  },

  chatMessageAdd: async (_root, args, { models, user }) => {
    if (!args.content) {
      throw new Error("Content is required");
    }

    const created = await models.ChatMessages.createChatMessage(args, user._id);

    await models.Chats.updateOne(
      { _id: created.chatId },
      { $set: { updatedAt: new Date() } }
    );

    graphqlPubsub.publish("chatMessageInserted", {
      chatId: created.chatId,
    });

    const chat = await models.Chats.getChat(created.chatId);

    const recievers = chat.participantIds.filter((i) => i !== user._id);

    for (const reciever of recievers) {
      graphqlPubsub.publish("chatUnreadCountChanged", {
        userId: reciever,
      });

      graphqlPubsub.publish("chatInserted", {
        userId: reciever,
      });
    }

    return created;
  },

  chatMessageRemove: async (_root, { _id }, { models }) => {
    const chat = models.ChatMessages.removeChatMessage(_id);

    const chatMessage = await models.ChatMessages.findOne({ _id });

    graphqlPubsub.publish("chatMessageInserted", {
      chatId: chatMessage.chatId,
    });

    return chat;
  },

  chatMessageToggleIsPinned: async (_root, { _id }, { models }) => {
    const message = await models.ChatMessages.findOne({ _id });

    graphqlPubsub.publish("chatMessageInserted", {
      chatId: message.chatId,
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

      return "Chat removed";
    }

    // while user is removing himself or herself
    if (type === "remove" && (userIds || []).indexOf(user._id) !== -1) {
      hasAdminLeft(chat, user._id);
    }

    await models.Chats.updateOne(
      { _id },
      type === "add"
        ? { $addToSet: { participantIds: userIds } }
        : {
            $pull: {
              participantIds: { $in: userIds },
              adminIds: { $in: userIds },
            },
          }
    );

    return "Success";
  },

  chatMakeOrRemoveAdmin: async (_root, { _id, userId }, { models, user }) => {
    await checkChatAdmin(models.Chats, user._id);

    const chat = await models.Chats.findOne({
      _id,
      participantIds: { $in: [userId] },
    });

    if (!chat) {
      throw new Error("Chat not found");
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

    return "Success";
  },
};

checkPermission(chatMutations, "chatAdd", "manageChats");
checkPermission(chatMutations, "chatEdit", "manageChats");
checkPermission(chatMutations, "chatRemove", "manageChats");
checkPermission(chatMutations, "chatMessageAdd", "manageChats");
checkPermission(chatMutations, "chatMessageRemove", "manageChats");
checkPermission(chatMutations, "chatMessageToggleIsPinned", "manageChats");
checkPermission(chatMutations, "chatAddOrRemoveMember", "manageChats");
checkPermission(chatMutations, "chatMakeOrRemoveAdmin", "manageChats");

export default chatMutations;
