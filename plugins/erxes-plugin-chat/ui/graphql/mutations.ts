const addChatMessage = `
  mutation chatMessageAdd($chatId: String, $participantIds: [String], $content: String!) {
    chatMessageAdd(chatId: $chatId, participantIds: $participantIds, content: $content) {
      _id
    }
  }
`;

const addChat = `
  mutation chatAdd($name: String!, $type: ChatType!, $participantIds: [String]) {
    chatAdd(name: $name, type: $type, participantIds: $participantIds) {
      _id
    }
  }
`;

export default {
  addChatMessage,
  addChat
};
