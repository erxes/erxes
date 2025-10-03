import { gql } from '@apollo/client';

export const ADD_TAG = gql`
  mutation TagsAdd(
    $name: String!
    $type: String!
    $colorCode: String
    $parentId: String
  ) {
    tagsAdd(
      name: $name
      type: $type
      colorCode: $colorCode
      parentId: $parentId
    ) {
      _id
    }
  }
`;

export const EDIT_TAG = gql`
  mutation TagsEdit(
    $id: String!
    $name: String!
    $type: String!
    $colorCode: String
    $parentId: String
  ) {
    tagsEdit(
      _id: $id
      name: $name
      type: $type
      colorCode: $colorCode
      parentId: $parentId
    ) {
      _id
    }
  }
`;

export const GIVE_TAGS = gql`
  mutation tagsTag(
    $type: String!
    $targetIds: [String!]!
    $tagIds: [String!]!
  ) {
    tagsTag(type: $type, targetIds: $targetIds, tagIds: $tagIds)
  }
`;

export const REMOVE_TAG = gql`
  mutation removeTag($_id: String!) {
    tagsRemove(_id: $_id)
  }
`;
