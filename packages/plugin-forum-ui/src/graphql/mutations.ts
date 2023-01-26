const forumCreateCategoryParamsCommon = `
  $name: String!
  $code: String
  $thumbnail: String
  $userLevelReqPostRead: String!
  $userLevelReqPostWrite: String!
  $userLevelReqCommentWrite: String!
  $postsReqCrmApproval: Boolean!
  $postReadRequiresPermissionGroup: Boolean
  $postWriteRequiresPermissionGroup: Boolean
  $commentWriteRequiresPermissionGroup: Boolean
`;

const forumCreateCategoryArgsCommon = `
  name: $name
  code: $code
  thumbnail: $thumbnail
  userLevelReqPostRead: $userLevelReqPostRead
  userLevelReqPostWrite: $userLevelReqPostWrite
  userLevelReqCommentWrite: $userLevelReqCommentWrite
  postsReqCrmApproval: $postsReqCrmApproval
  postReadRequiresPermissionGroup: $postReadRequiresPermissionGroup
  postWriteRequiresPermissionGroup: $postWriteRequiresPermissionGroup
  commentWriteRequiresPermissionGroup: $commentWriteRequiresPermissionGroup
`;

const updateCategory = `
  mutation ForumPatchCategory(
    $_id: ID!
    $parentId: String
    ${forumCreateCategoryParamsCommon}
  ) {
    forumPatchCategory(
      _id: $_id
      parentId: $parentId
      ${forumCreateCategoryArgsCommon}
    ) {
      _id
    }
  }
`;

const createCategory = `
  mutation ForumCreateCategory(
    $parentId: String
    ${forumCreateCategoryParamsCommon}
  ) {
    forumCreateCategory(
      parentId: $parentId
      ${forumCreateCategoryArgsCommon}
    ) {
      _id
    }
  }
`;

const deleteCategory = `
  mutation ForumDeleteCategory($id: ID!) {
    forumDeleteCategory(_id: $id) {
      _id
    }
  }
`;

const createRootCategory = `
  mutation ForumCreateRootCategory(
    ${forumCreateCategoryParamsCommon}
  ) {
    forumCreateCategory(
      ${forumCreateCategoryArgsCommon}
      ) {
      _id
    }
  }
`;

const createComment = `
  mutation ForumCreateComment($content: String!, $replyToId: ID, $postId: ID!) {
    forumCreateComment(
      content: $content
      replyToId: $replyToId
      postId: $postId
    ) {
      _id
    }
  }
`;

const deleteComment = `
  mutation ForumDeleteComment($_id: ID!) {
    forumDeleteComment(_id: $_id) {
      _id
    }
  }
`;

export default {
  updateCategory,
  createCategory,
  deleteCategory,
  createRootCategory,
  createComment,
  deleteComment
};
