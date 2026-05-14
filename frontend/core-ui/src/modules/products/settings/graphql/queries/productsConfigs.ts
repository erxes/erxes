import { gql } from '@apollo/client';

export const PRODUCTS_CONFIGS = gql`
  query ProductsConfigs {
    productsConfigs {
      _id
      code
      value
    }
  }
`;
