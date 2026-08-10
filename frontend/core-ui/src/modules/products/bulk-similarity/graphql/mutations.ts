import { gql } from '@apollo/client';
import { SIMILARITY_FIELDS } from './queries';

export const PRODUCT_SIMILARITY_ADD = gql`
  mutation ProductBulkSimilarityAdd($doc: JSON!) {
    productBulkSimilarityAdd(doc: $doc) {
      ...SimilarityFields
    }
  }
  ${SIMILARITY_FIELDS}
`;

export const PRODUCT_SIMILARITY_EDIT = gql`
  mutation ProductBulkSimilarityEdit($_id: String!, $doc: JSON!) {
    productBulkSimilarityEdit(_id: $_id, doc: $doc) {
      ...SimilarityFields
    }
  }
  ${SIMILARITY_FIELDS}
`;

export const PRODUCT_SIMILARITY_REMOVE = gql`
  mutation ProductBulkSimilarityRemove($_id: String!) {
    productBulkSimilarityRemove(_id: $_id)
  }
`;
