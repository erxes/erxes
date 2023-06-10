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

const discordChannels = `
  query discordChannels($accountId: String!) {
    discordChannels(accountId: $accountId)
  }
`;

export default {
  detail,
  accounts,
  discordChannels
};
