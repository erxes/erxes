import { gql } from '@apollo/client';

export const ADD_TAG = gql`
  mutation TagsAdd(
    $name: String!
    $type: String
    $colorCode: String
    $parentId: String
    $description: String
    $isGroup: Boolean
  ) {
    tagsAdd(
      name: $name
      type: $type
      colorCode: $colorCode
      parentId: $parentId
      description: $description
      isGroup: $isGroup
    ) {
      _id
      name
      colorCode
      parentId
      relatedIds
      isGroup
      description
      type
      order
      objectCount
      totalObjectCount
      createdAt
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

export const EDIT_TAG = gql`
  mutation TagsEdit(
    $id: String!
    $name: String
    $type: String
    $colorCode: String
    $parentId: String
    $isGroup: Boolean
    $description: String
  ) {
    tagsEdit(
      _id: $id
      name: $name
      type: $type
      colorCode: $colorCode
      parentId: $parentId
      isGroup: $isGroup
      description: $description
    ) {
      _id
      name
      colorCode
      parentId
      isGroup
      description
      type
    }
  }
`;

export const REMOVE_TAG = gql`
mutation TagsRemove($id: String!) {
  tagsRemove(_id: $id)
}`;