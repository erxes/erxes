const chatMessageInserted = `
  subscription chatMessageInserted($userId: String!) {
    chatMessageInserted(userId: $userId) {
      _id
    }
  }
`;

export default {
  chatMessageInserted
};
