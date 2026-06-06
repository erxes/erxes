import { gql } from '@apollo/client';

export const GET_ELEMENT_CATEGORIES = gql`
  query BmsElementCategories($parentId: String) {
    bmsElementCategories(parentId: $parentId) {
      _id
      name
      parentId
    }
  }
`;
