import { gql } from '@apollo/client';

export const GET_CATEGORIES = gql`
  query BmsTourCategories($parentId: String) {
    bmsTourCategories(parentId: $parentId) {
      _id
      name
      code
      parentId
      order
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
