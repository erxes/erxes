export const types = `
  type ExmCeremonyData {
    startedDate: Date
    willDate: Date
    howManyYear: Int
    year: Int
  }

  type ExmEventData {
    visibility: String
    where: String
    startDate: Date
    endDate: Date
    interestedUserIds: [String]
    goingUserIds: [String]
  }

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
    isPinned: Boolean
    images: JSON
    attachments: JSON
    recipientIds: [String]
    recipients: [User]
    createdAt: Date
    updatedAt: Date
    createdUser: User
    updatedUser: User
    customFieldsData: JSON
    ceremonyData: ExmCeremonyData
    eventData: ExmEventData
    eventGoingUsers: [User]
    eventInterestedUsers: [User]
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
    createdByMe
    admin
  }

  enum ContentType {
    event
    post
    bravo
    birthday
    workAnniversary
    publicHoliday
  }

  enum RecipientType {
    recieved
    sent
  }

  enum FilterType {
    today
    upcoming
  }

  input ExmEventDataInput {
    visibility: String
    where: String
    startDate: Date
    endDate: Date
  }

  enum ExmGoingOrInterested {
    going
    interested
  }
`;

export const queries = `
  exmFeedDetail(_id: String!): ExmFeed
  exmFeed(contentTypes: [ContentType], isPinned: Boolean, type: SourceType, recipientType: RecipientType, title: String, limit: Int, skip: Int): ExmFeedResponse
  exmThanks(limit: Int, skip: Int, type: SourceType): ExmThankResponse
  exmFeedComments(feedId: String, parentId: String, limit: Int, skip: Int): ExmFeedCommentResponse
  exmFeedLikedUsers(feedId: String!): [User]
  exmFeedCeremonies(contentType: ContentType, filterType: FilterType): ExmFeedResponse
`;

const feedCommonParams = `
  title: String!
  description: String
  contentType: ContentType!
  images: [JSON]
  attachments: [JSON]
  recipientIds: [String]
  eventData: ExmEventDataInput
  customFieldsData: JSON
  isPinned: Boolean
  createdAt: Date
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

  exmFeedToggleIsPinned(_id: String): Boolean

  exmFeedEventGoingOrInterested(_id: String!, goingOrInterested: ExmGoingOrInterested): ExmFeed
`;
