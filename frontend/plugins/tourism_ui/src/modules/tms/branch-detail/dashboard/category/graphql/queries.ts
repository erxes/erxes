import { gql } from '@apollo/client';

export const GET_CATEGORIES = gql`
  query BmsTourCategories($parentId: String, $name: String, $branchId: String) {
    bmsTourCategories(parentId: $parentId, name: $name, branchId: $branchId) {
      _id
      name
      code
      parentId
      branchId
      order
      tourCount
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
