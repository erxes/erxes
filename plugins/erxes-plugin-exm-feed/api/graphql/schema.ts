export const types = `
  type ExmFeed {
    _id: String
    title: String
    description: String
    contentType: String
    visibility: String
    where: String
    startDate: Date
    endDate: Date
    commentCount: Int
    likeCount: Int
    heartCount: Int
    isHearted: Boolean
    isLiked: Boolean
    images: JSON
    attachments: JSON
    recipientIds: [String]
    recipients: [User]
    createdAt: Date
    updatedAt: Date
    createdUser: User
    updatedUser: User
    customFieldsData: JSON
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

  enum Visibility {
    Public
    Private
  }
`;

export const queries = `
  exmFeedDetail(_id: String!): ExmFeed
  exmFeed(contentType: ContentType, type: SourceType, recipientType: RecipientType, title: String, limit: Int): ExmFeedResponse
  exmThanks(limit: Int, type: SourceType): ExmThankResponse
  exmFeedComments(feedId: String, parentId: String, limit: Int, skip: Int): ExmFeedCommentResponse
  exmFeedLikedUsers(feedId: String!): [User]
`;

const feedCommonParams = `
  title: String!
  description: String
  contentType: ContentType!
  images: [JSON]
  attachments: [JSON]
  recipientIds: [String]
  visibility: Visibility
  where: String
  startDate: Date
  endDate: Date
  customFieldsData: JSON
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

  exmFeedEmojiReact(feedId: String!, type: String): String
`;
