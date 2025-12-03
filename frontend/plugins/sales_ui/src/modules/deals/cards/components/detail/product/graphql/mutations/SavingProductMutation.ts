import { gql } from '@apollo/client';

const CREATE_PRODUCTS = gql`
  mutation DealsCreateProductsData(
    $processId: String!
    $dealId: String!
    $docs: JSON!
  ) {
    dealsCreateProductsData(processId: $processId, dealId: $dealId, docs: $docs)
  }
`;

export const SavingProductMutation = { CREATE_PRODUCTS };
