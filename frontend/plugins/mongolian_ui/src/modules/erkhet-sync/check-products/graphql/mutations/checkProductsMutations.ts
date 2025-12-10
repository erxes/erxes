import { gql } from '@apollo/client';

export const checkProductsMutation = gql`
  mutation toCheckProducts($productCodes: [String]) {
    toCheckProducts(productCodes: $productCodes)
  }
`;
