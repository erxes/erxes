import { gql } from '@apollo/client';

export const GET_CATEGORIES = gql`
  query BmsTourCategories($parentId: String, $name: String) {
    bmsTourCategories(parentId: $parentId, name: $name) {
      _id
      name
      code
      parentId
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
