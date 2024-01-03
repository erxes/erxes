export const queries = {
  detail: `
        query imapConversationDetail($conversationId: String!) {
            imapConversationDetail(conversationId: $conversationId) {
                _id
                mailData
                createdAt
            }
        }
    `,

  logs: `
        query imapLogs {
            imapLogs
        }
    `
};

export const mutations = {};
