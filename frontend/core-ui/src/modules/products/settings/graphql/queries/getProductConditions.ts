import { gql } from '@apollo/client';

export const PRODUCT_CONDITIONS = gql`
  query productConditions {
    productConditions {
      _id
      code
      name
      description
      productCount
    }
  }
`;
