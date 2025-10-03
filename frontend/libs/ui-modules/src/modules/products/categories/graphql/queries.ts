import { gql } from '@apollo/client';

const productCategories = gql`
  query ProductCategories {
    productCategories {
      _id
      parentId
      attachment {
        url
      }
      code
      name
      order
      productCount
    }
  }
`;


export const categories = {
    productCategories,
  };