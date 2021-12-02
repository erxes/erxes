const addChatMessage = `
  mutation chatMessageAdd($chatId: String, $participantIds: [String], $content: String!) {
    chatMessageAdd(chatId: $chatId, participantIds: $participantIds, content: $content) {
      _id
    }
  }
`;

export default {
  addChatMessage
};
