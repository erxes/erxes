const detail = `
  query telegram($conversationId: String!) {
      telegramConversationDetail(conversationId: $conversationId) {
          _id
          mailData
      }
  }
`;

const accounts = `
  query telegramAccounts {
    telegramAccounts 
  }
`;

const telegramChats = `
  query telegramChats {
    telegramChats
  }
`;

export default {
  detail,
  accounts,
  telegramChats
};
