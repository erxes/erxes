const chatMessageAdd = `
  mutation chatMessageAdd($chatId: String!, $content: String!, $relatedId: String, $attachments: [JSON], $mentionedUserIds: [String]) {
    chatMessageAdd(chatId: $chatId, content: $content, relatedId: $relatedId, attachments: $attachments, mentionedUserIds: $mentionedUserIds) {
      _id
    }
  }
`;

const chatAdd = `
  mutation chatAdd($name: String, $type: ChatType!, $participantIds: [String]) {
    chatAdd(name: $name, type: $type, participantIds: $participantIds) {
      _id
    }
  }
`;

const chatRemove = `
  mutation chatRemove($id: String!) {
    chatRemove(_id: $id)
  }
`;

const chatMarkAsRead = `
  mutation chatMarkAsRead($id: String!) {
    chatMarkAsRead(_id: $id)
  }
`;

const chatMakeOrRemoveAdmin = `
  mutation chatMakeOrRemoveAdmin($id: String!, $userId: String!) {
    chatMakeOrRemoveAdmin(_id: $id, userId: $userId)
  }
`;

const chatAddOrRemoveMember = `
  mutation chatAddOrRemoveMember($id: String!, $type: ChatMemberModifyType, $userIds: [String]) {
    chatAddOrRemoveMember(_id: $id, type: $type, userIds: $userIds)
  }
`;

const chatToggleIsPinned = `
  mutation chatToggleIsPinned($id: String!) {
    chatToggleIsPinned(_id: $id)
  }
`;

export default {
  chatMessageAdd,
  chatAdd,
  chatRemove,
  chatMarkAsRead,
  chatMakeOrRemoveAdmin,
  chatAddOrRemoveMember,
  chatToggleIsPinned
};
