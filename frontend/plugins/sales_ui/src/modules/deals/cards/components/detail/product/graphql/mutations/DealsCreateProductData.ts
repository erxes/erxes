import { gql } from '@apollo/client';

export const DEALS_CREATE_PRODUCT_DATA = gql`
  mutation DealsCreateProductsData(
    $processId: String
    $dealId: String
    $docs: JSON
  ) {
    dealsCreateProductsData(processId: $processId, dealId: $dealId, docs: $docs)
  }
`;
