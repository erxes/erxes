export const types = `
  type ExmFeed {
    _id: String
    title: String
    description: String
    contentType: String
    commentCount: Int
    likeCount: Int
    isLiked: Boolean
    images: JSON
    attachments: JSON
    recipientIds: [String]
    recipients: [User]
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

  type ExmFeedComment {
    _id: String
    feedId: String
    parentId: String
    comment: String
    childCount: Int
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

  type ExmFeedCommentResponse {
    list: [ExmFeedComment]
    totalCount: Int
  }

  enum SourceType {
    recipient
    admin
  }

  enum ContentType {
    event
    post
    bravo
  }

  enum RecipientType {
    recieved
    sent
  }
`;

export const queries = `
  exmFeedDetail(_id: String!): ExmFeed
  exmFeed(contentType: ContentType, type: SourceType, recipientType: RecipientType, title: String, limit: Int): ExmFeedResponse
  exmThanks(limit: Int, type: SourceType): ExmThankResponse
  exmFeedComments(feedId: String, parentId: String, limit: Int): ExmFeedCommentResponse
`;

const feedCommonParams = `
  title: String!
  description: String
  contentType: ContentType!
  images: [JSON]
  attachments: [JSON]
  recipientIds: [String]
`;

const thankCommonParams = `
  description: String!
  recipientIds: [String]!
`;

const commentCommonParams = `
  feedId: String!
  parentId: String
  comment: String!
`;

export const mutations = `
  exmFeedAdd(${feedCommonParams}): ExmFeed
  exmFeedEdit(_id: String, ${feedCommonParams}): ExmFeed
  exmFeedRemove(_id: String!): JSON

  exmThankAdd(${thankCommonParams}): ExmThank
  exmThankEdit(_id: String, ${thankCommonParams}): ExmThank
  exmThankRemove(_id: String!): JSON

  exmFeedCommentAdd(${commentCommonParams}): ExmFeedComment
  exmFeedCommentEdit(_id: String, ${commentCommonParams}): ExmFeedComment
  exmFeedCommentRemove(_id: String!): JSON

  exmFeedEmojiLike(feedId: String!): String
  exmFeedEmojiUnLike(feedId: String!): String
`;
