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

export const DEALS_EDIT_PRODUCT_DATA = gql`
  mutation DealsEditProductData($processId: String, $dealId: String, $dataId: String, $doc: JSON) {
    dealsEditProductData(processId: $processId, dealId: $dealId, dataId: $dataId, doc: $doc)
  }
`;

export const productRemove = gql`
  mutation DealsDeleteProductData(
    $processId: String
    $dealId: String
    $dataIds: [String]
  ) {
    dealsDeleteProductData(
      processId: $processId
      dealId: $dealId
      dataIds: $dataIds
    )
  }
`;

