export const types = `
  type IMap {
    _id: String!
    title: String
    mailData: JSON
    createdAt: Date
  }

  type IMapIntegration {
    inboxId: String
    host: String
    smtpHost: String
    smtpPort: String
    mainUser: String
    user: String
    password: String
  }
`;

export const queries = `
  imapConversationDetail(conversationId: String!): [IMap]
  imapGetIntegrations: [IMapIntegration]
  imapLogs: [JSON]
`;

export const mutations = `
  imapSendMail(
    integrationId: String
    conversationId: String
    subject: String!
    body: String
    to: [String]!
    cc: [String]
    bcc: [String]
    from: String!
    shouldResolve: Boolean
    shouldOpen: Boolean
    headerId: String
    replyTo: [String]
    inReplyTo: String
    threadId: String
    messageId: String
    replyToMessageId: String
    references: [String]
    attachments: [JSON]
    customerId: String
  ): JSON
`;
