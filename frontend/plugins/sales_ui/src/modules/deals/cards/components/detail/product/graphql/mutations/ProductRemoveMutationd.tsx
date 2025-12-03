import { gql } from '@apollo/client';

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
