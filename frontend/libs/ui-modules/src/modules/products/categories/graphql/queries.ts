import { gql } from '@apollo/client';

const productCategories = gql`
  query ProductCategories {
    productCategories {
      _id
      parentId
      code
      name
      order
    }
  }
`;

export const categories = {
  productCategories,
};
