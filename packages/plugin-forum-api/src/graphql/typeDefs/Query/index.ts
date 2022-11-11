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
    forumCategories(_id: [ID!], parentId: [ID], code: [String!], not__id: [ID!]): [ForumCategory!]
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
    forumSubscriptionProducts(sort: JSON): [ForumSubscriptionProduct!]

    forumCpMySubscriptionOrders: [ForumSubscriptionOrder!]
  }
`;

export default Query;
