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

const createPost = `
  mutation ForumCreatePost(
    $categoryId: ID!
    $content: String!
    $title: String!
    $thumbnail: String
  ) {
    forumCreatePost(
      categoryId: $categoryId
      content: $content
      title: $title
      thumbnail: $thumbnail
    ) {
      _id
    }
  }
`;

const editPost = `
  mutation ForumPatchPost(
    $_id: ID!
    $categoryId: ID!
    $content: String
    $thumbnail: String
    $title: String
  ) {
    forumPatchPost(
      _id: $_id
      categoryId: $categoryId
      content: $content
      thumbnail: $thumbnail
      title: $title
    ) {
      _id
    }
  }
`;

const editPage = `
mutation ForumPatchPage(
  $_id: ID!
  $code: String
  $content: String
  $custom: JSON
  $customIndexed: JSON
  $description: String
  $listOrder: Float
  $thumbnail: String
  $title: String
) {
  forumPatchPage(
    _id: $_id
    code: $code
    content: $content
    custom: $custom
    customIndexed: $customIndexed
    description: $description
    listOrder: $listOrder
    thumbnail: $thumbnail
    title: $title
  ) {
    _id
  }
}
`;

const createPage = `
mutation ForumCreatePage(
  $code: String
  $content: String
  $custom: JSON
  $customIndexed: JSON
  $description: String
  $listOrder: Float
  $thumbnail: String
  $title: String
) {
  forumCreatePage(
    code: $code
    content: $content
    custom: $custom
    customIndexed: $customIndexed
    description: $description
    listOrder: $listOrder
    thumbnail: $thumbnail
    title: $title
  ) {
    _id
  }
}
`;

const deletePost = `
mutation ForumDeletePost($_id: ID!) {
  forumDeletePost(_id: $_id) {
    _id
  }
}
`;

const deletePage = `
mutation ForumDeletePage($_id: ID!) {
  forumDeletePage(_id: $_id) {
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
  deleteComment,
  createPost,
  editPost,
  editPage,
  createPage,
  deletePost,
  deletePage
};
