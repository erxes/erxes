import {
  attachmentType,
  attachmentInput
} from '@erxes/api-utils/src/commonTypeDefs';

export const types = () => `

  ${attachmentType}
  ${attachmentInput}

  extend type User @key(fields: "_id") {
    _id: String! @external
  }
  type Comment {
    _id: String
    contentId: String
    contentType: String
    parentId: String
    comment: String
    childCount: Int
    createdAt: Date
    updatedAt: Date
    createdUser: User
  }

  type CommentResponse {
    list: [Comment]
    totalCount: Int
  }

  enum ReactionContentType {
    exmFeed
    knowledgebase
  }
`;

const emojiQueryParams = `
  contentId: String!
  contentType: ReactionContentType!
  type: String!
`;

export const queries = `
  comments(contentId: String!, contentType: ReactionContentType!, parentId: String, limit: Int, skip: Int): CommentResponse
  commentCount(contentId: String!, contentType: ReactionContentType!): Int
  
  emojiReactedUsers(${emojiQueryParams}): [User]
  emojiCount(${emojiQueryParams}): Int
  emojiIsReacted(${emojiQueryParams}): Boolean
`;

const commentCommonParams = `
  contentId: String!
  contentType: ReactionContentType!
  comment: String!
  parentId: String
`;

export const mutations = `
  commentAdd(${commentCommonParams}): Comment
  commentEdit(_id: String, ${commentCommonParams}): Comment
  commentRemove(_id: String!): JSON

  emojiReact(contentId: String!, contentType: ReactionContentType!, type: String): String
`;
