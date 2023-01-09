const addChatMessage = `
  mutation chatMessageAdd($chatId: String!, $content: String!) {
    chatMessageAdd(chatId: $chatId, content: $content) {
      _id
    }
  }
`;

const addChat = `
  mutation chatAdd($name: String, $type: ChatType!, $participantIds: [String]) {
    chatAdd(name: $name, type: $type, participantIds: $participantIds) {
      _id
    }
  }
`;

const removeChat = `
  mutation chatRemove($id: String!) {
    chatRemove(_id: $id)
  }
`;

const markAsReadChat = `
  mutation chatMarkAsRead($id: String!) {
    chatMarkAsRead(_id: $id)
  }
`;

const makeOrRemoveAdminChat = `
  mutation chatMakeOrRemoveAdmin($id: String!, $userId: String!) {
    chatMakeOrRemoveAdmin(_id: $id, userId: $userId)
  }
`;

const addOrRemoveMemberChat = `
  mutation chatAddOrRemoveMember($id: String!, $type: ChatMemberModifyType, $userIds: [String]) {
    chatAddOrRemoveMember(_id: $id, type: $type, userIds: $userIds)
  }
`;

export default {
  addChatMessage,
  addChat,
  removeChat,
  markAsReadChat,
  makeOrRemoveAdminChat,
  addOrRemoveMemberChat
};
