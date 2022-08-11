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
