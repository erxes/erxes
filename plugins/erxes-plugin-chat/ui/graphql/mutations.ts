const addChatMessage = `
  mutation chatMessageAdd($chatId: String, $content: String!) {
    chatMessageAdd(chatId: $chatId, content: $content) {
      _id
    }
  }
`;

export default {
  addChatMessage
};
