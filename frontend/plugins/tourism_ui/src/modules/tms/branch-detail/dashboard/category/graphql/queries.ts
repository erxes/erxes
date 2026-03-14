import { gql } from '@apollo/client';

export const GET_CATEGORIES = gql`
  query BmsTourCategories($parentId: String) {
    bmsTourCategories(parentId: $parentId) {
      _id
      name
      parentId
      order
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
