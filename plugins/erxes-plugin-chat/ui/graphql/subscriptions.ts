const chatMessageInserted = `
  subscription chatMessageInserted($chatId: String!) {
    chatMessageInserted(chatId: $chatId) {
      _id
    }
  }
`;

export default {
  chatMessageInserted
};
