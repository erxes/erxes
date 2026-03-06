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
