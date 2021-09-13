export const types = `
  type ExmFeed {
    _id: String
    title: String
    description: String
    contentType: String
    images: JSON
    attachments: JSON
    recipientIds: [String]
    createdAt: Date
    updatedAt: Date
    createdUser: User
    updatedUser: User
  }

  type ExmThank {
    _id: String
    description: String
    recipients: [User]
    recipientIds: [String]
    createdAt: Date
    updatedAt: Date
    createdUser: User
  }

  type ExmFeedResponse {
    list: [ExmFeed]
    totalCount: Int
  }

  type ExmThankResponse {
    list: [ExmThank]
    totalCount: Int
  }

  enum ThankType {
    recipient
    admin
  }
`;

export const queries = `
  exmFeedDetail(_id: String!): ExmFeed

  exmFeed(title: String, limit: Int): ExmFeedResponse

  exmThanks(limit: Int, type: ThankType): ExmThankResponse
`;

const feedCommonParams = `
  title: String!
  description: String
  contentType: String!
  images: [JSON]
  attachments: [JSON]
  recipientIds: [String]
`;

const thankCommonParams = `
  description: String!
  recipientIds: [String]!
`;

export const mutations = `
  exmFeedAdd(${feedCommonParams}): ExmFeed
  exmFeedEdit(_id: String, ${feedCommonParams}): ExmFeed
  exmFeedRemove(_id: String!): JSON

  exmThankAdd(${thankCommonParams}): ExmThank
  exmThankEdit(_id: String, ${thankCommonParams}): ExmThank
  exmThankRemove(_id: String!): JSON
`;
