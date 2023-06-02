const detail = `
  query discord($conversationId: String!) {
      discordConversationDetail(conversationId: $conversationId) {
          _id
          mailData
      }
  }
`;

const accounts = `
  query discordAccounts {
    discordAccounts 
  }
`;

export default {
  detail,
  accounts
};
