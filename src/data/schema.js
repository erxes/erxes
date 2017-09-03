export const types = `
  scalar JSON
  scalar Date

  type User {
    _id: String!
    username: String
    details: JSON
    emails: JSON
  }

  type Channel {
    _id: String!
    name: String
    description: String
    integrationIds: [String]
    memberIds: [String]
    createdAt: Date
    userId: String
    conversationCount: Int
    openConversationCount: Int
  }

  type Brand {
    _id: String!
    name: String
    description: String
    code: String
    userId: String
    createdAt: Date
    emailConfig: JSON
  }

  type ResponseTemplate {
    _id: String!
    name: String
    content: String
    brandId: String
    brand: Brand,
    files: JSON
  }

  type EmailTemplate {
    _id: String!
    name: String
    content: String
  }

  type Form {
    _id: String!
    title: String
    code: String
    description: String
    createdUserId: String
    createdDate: Date
  }
`;

export const queries = `
  type Query {
    users(limit: Int!): [User]
    totalUsersCount: Int

    channels(limit: Int!): [Channel]
    totalChannelsCount: Int

    brands(limit: Int!): [Brand]
    totalBrandsCount: Int

    responseTemplates(limit: Int!): [ResponseTemplate]
    totalResponseTemplatesCount: Int

    emailTemplates(limit: Int!): [EmailTemplate]
    totalEmailTemplatesCount: Int

    forms(limit: Int!): [Form]
    totalFormsCount: Int
  }
`;

export const mutations = `
`;

export const subscriptions = `
`;
