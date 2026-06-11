import { gql } from '@apollo/client';
import { SIMILARITY_FIELDS } from './queries';

export const PRODUCT_SIMILARITY_BULK_SAVE = gql`
  mutation ProductSimilarityBulkSave($_id: String, $doc: JSON!) {
    productSimilarityBulkSave(_id: $_id, doc: $doc) {
      ...SimilarityFields
    }
  }
  ${SIMILARITY_FIELDS}
`;

export const PRODUCT_SIMILARITY_REMOVE = gql`
  mutation ProductSimilarityRemove($_id: String!) {
    productSimilarityRemove(_id: $_id)
  }
`;

export const PRODUCT_SIMILARITY_SET_STAR = gql`
  mutation ProductSimilaritySetStar($_id: String!, $productId: String!) {
    productSimilaritySetStar(_id: $_id, productId: $productId) {
      _id
      starProductId
    }
  }
`;
