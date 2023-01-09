const chatMessageInserted = `
  subscription chatMessageInserted($chatId: String!) {
    chatMessageInserted(chatId: $chatId) {
      _id
    }
  }
`;

const chatInserted = `
  subscription chatInserted($userId: String!) {
    chatInserted(userId: $userId) {
      _id
    }
  }
`;

export default {
  chatMessageInserted,
  chatInserted
};
