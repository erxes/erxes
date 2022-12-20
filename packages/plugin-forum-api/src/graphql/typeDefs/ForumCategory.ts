import { commonPostsParams } from './Query';

export default `
  type ForumCategory @key(fields: "_id") {
    _id: ID!
    name: String!

    code: String
    thumbnail: String

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
  }
`;
