export const commonPostsParams = `
  state: [ForumPostState!]
  categoryApprovalState: [AdminApprovalState!]
  categoryIncludeDescendants: Boolean
  createdById: [String!]
  createdByCpId: [String!]

  search: String

  sort: JSON
  offset: Int
  limit: Int

  customQuery: JSON

  tagIds: [ID!]
`;

const forumPostsQueryParams = `
  _id: [ID!]
  categoryId: [ID!]
  ${commonPostsParams}
`;

export const commentQParams = `
  _id: [ID!]
  postId: [ID!]
  replyToId: [ID]
  sort: JSON
  offset: Int
  limit: Int
`;

const Query = ` 
  extend type Query {
    forumCategoryByCode(code: String!): ForumCategory
    forumCategory(_id: ID!): ForumCategory
    forumCategories(_id: [ID!], parentId: [ID], code: [String!], not__id: [ID!], sort: JSON): [ForumCategory!]
    # forumCategoryQuery(query: JSON!): [ForumCategory!]
    forumCategoryPossibleParents(_id: ID): [ForumCategory!]

    forumCategoryIsUserPermitted(categoryId: ID!, permission: ForumPermission!, cpUserId: ID!): Boolean

    forumPost(_id: ID!): ForumPost
    forumPosts(${forumPostsQueryParams}): [ForumPost!]
    forumPostsCount(${forumPostsQueryParams}): Int

    forumComments(${commentQParams}): [ForumComment!]
    forumCommentsCount(${commentQParams}): Int
    forumComment(_id: ID!): ForumComment

    forumCateogryIsDescendantRelationship(ancestorId: ID!, descendantId: ID!): Boolean

    forumUserLevelValues: JSON!

    forumPermissionGroup(_id: ID!): ForumPermissionGroup
    forumPermissionGroups: [ForumPermissionGroup!]

    forumPermissionGroupCategoryPermits(
      categoryId: [ID!]
      permissionGroupId: [ID!]
      permission: [ForumPermission!]
    ): [ForumPermissionGroupCategoryPermit!]


    forumSubscriptionProduct(_id: ID!): ForumSubscriptionProduct
    forumSubscriptionProducts(sort: JSON, userType: String): [ForumSubscriptionProduct!]

    forumCpMySubscriptionOrders: [ForumSubscriptionOrder!]

    forumPages(
      code: [String!]
      customQuery: JSON
      sort: JSON
      limit: Int
      offset: Int
    ): [ForumPage!]

    forumPage(_id: ID!): ForumPage!

    forumCpMySavedPosts(limit: Int, offset: Int): [ForumSavedPost!]
    forumCpMySavedPostsCount: Int


    forumUserStatistics(_id: ID!): ForumUserStatistics

    forumLastPublishedFollowingUsers(categoryId: ID, limit: Int, offset: Int): [ClientPortalUser]
    forumMostPublishedUsers(categoryId: ID, limit: Int, offset: Int): [ClientPortalUser] @cacheControl(maxAge: 600)

    forumQuizzes(sort: JSON, offset: Int, limit: Int): [ForumQuiz!]
    forumQuiz(_id: ID!): ForumQuiz!
    forumQuizQuestion(_id: ID!): ForumQuizQuestion!

    forumCpQuiz(_id: ID!): ForumQuiz!

    """
      This query sorts quizzes by relatedness to the post in decreasing order.
      1. Quizzes that are related to the post comes first.
      2. Quizzes that are related to the post's category and tags comes second.
      3. Quizzes that are related to the post's category or tags comes third.
    """
    forumCpPostRelatedQuizzes(_id: ID!, offset: Int, limit: Int): [ForumQuiz!] @cacheControl(maxAge: 60)
    forumCpQuizzes(categoryId: ID, tagIds: [ID!], companyId: ID, postId: ID, offset: Int, limit: Int, sort: JSON): [ForumQuiz!] @cacheControl(maxAge: 60)
  }
`;

export default Query;
