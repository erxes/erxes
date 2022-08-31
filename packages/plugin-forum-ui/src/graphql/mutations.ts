import gql from 'graphql-tag';

export const UPDATE_CATEGORY = gql`
  mutation ForumPatchCategory(
    $id: ID!
    $code: String
    $name: String
    $parentId: String
    $thumbnail: String
  ) {
    forumPatchCategory(
      _id: $id
      code: $code
      name: $name
      parentId: $parentId
      thumbnail: $thumbnail
    ) {
      _id
    }
  }
`;

export const CREATE_CATEGORY = gql`
  mutation ForumCreateCategory(
    $name: String!
    $parentId: String
    $code: String
    $thumbnail: String
  ) {
    forumCreateCategory(
      name: $name
      parentId: $parentId
      code: $code
      thumbnail: $thumbnail
    ) {
      _id
    }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation ForumDeleteCategory($id: ID!, $adopterCategoryId: ID) {
    forumDeleteCategory(_id: $id, adopterCategoryId: $adopterCategoryId) {
      _id
    }
  }
`;

export const FORCE_DELETE_CATEGORY = gql`
  mutation ForumForceDeleteCategory($id: ID!) {
    forumForceDeleteCategory(_id: $id) {
      _id
    }
  }
`;

export const CREATE_ROOT_CATEGORY = gql`
  mutation ForumCreateRootCategory(
    $name: String!
    $code: String
    $thumbnail: String
  ) {
    forumCreateCategory(name: $name, code: $code, thumbnail: $thumbnail) {
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
