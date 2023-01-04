import gql from 'graphql-tag';

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
  $order: Float
  $description: String
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
  order: $order
  description: $description
`;

export const UPDATE_CATEGORY = gql`
  mutation ForumPatchCategory(
    $id: ID!
    $parentId: String
    ${forumCreateCategoryParamsCommon}
  ) {
    forumPatchCategory(
      _id: $id
      parentId: $parentId
      ${forumCreateCategoryArgsCommon}
    ) {
      _id
    }
  }
`;

export const CREATE_CATEGORY = gql`
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

export const DELETE_CATEGORY = gql`
  mutation ForumDeleteCategory($id: ID!) {
    forumDeleteCategory(_id: $id) {
      _id
    }
  }
`;

export const CREATE_ROOT_CATEGORY = gql`
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

export const CREATE_COMMENT = gql`
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

export const DELETE_COMMENT = gql`
  mutation ForumDeleteComment($_id: ID!) {
    forumDeleteComment(_id: $_id) {
      _id
    }
  }
`;
