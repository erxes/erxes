import { gql } from '@apollo/client';

export const GET_PARENT_CATEGORIES = gql`
  query BmsTourParentCategories($branchId: String, $language: String) {
    bmsTourCategories(branchId: $branchId, language: $language) {
      _id
      name
      parentId
      attachment {
        url
        name
        type
        size
        duration
      }
    }
  }
`;

export const GET_CATEGORIES = gql`
  query BmsTourCategories(
    $parentId: String
    $name: String
    $branchId: String
    $language: String
  ) {
    bmsTourCategories(
      parentId: $parentId
      name: $name
      branchId: $branchId
      language: $language
    ) {
      _id
      name
      code
      parentId
      branchId
      order
      tourCount
      language
      translations {
        _id
        language
        name
      }
      createdAt
      modifiedAt
      attachment {
        url
        name
        type
        size
        duration
      }
    }
  }
`;
