import { commonPostsParams } from './Query';

export default `
  type ForumCategory @key(fields: "_id")  @cacheControl(maxAge: 30) {
    _id: ID!
    name: String!

    code: String
    thumbnail: String

    description: String

    parentId: ID

    parent: ForumCategory
    children: [ForumCategory!]
    descendants: [ForumCategory!]
    ancestors: [ForumCategory!]

    userLevelReqPostRead: ForumUserLevelsRead!
    userLevelReqPostWrite: ForumUserLevelsWrite!
  
    # userLevelReqCommentRead: ForumUserLevelsRead!
    userLevelReqCommentWrite: ForumUserLevelsWrite!

    postReadRequiresPermissionGroup: Boolean,
    postWriteRequiresPermissionGroup: Boolean,
    commentWriteRequiresPermissionGroup: Boolean,
  
    postsReqCrmApproval: Boolean!

    postsCount(
      ${commonPostsParams}
    ): Int

    posts(
      ${commonPostsParams}
    ): [ForumPost!]

    permissionGroupCategoryPermits: [ForumPermissionGroupCategoryPermit!]

    order: Float
  }
`;
