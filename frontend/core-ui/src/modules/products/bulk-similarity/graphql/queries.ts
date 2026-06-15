import { gql } from '@apollo/client';

export const SIMILARITY_FIELDS = gql`
  fragment SimilarityFields on ProductBulkSimilarity {
    _id
    status
    info
    propertiesData
    productIds
    starProductId
    products {
      _id
      code
      name
      unitPrice
      status
      propertiesData
    }
  }
`;

export const PRODUCT_SIMILARITIES = gql`
  query ProductSimilarities($page: Int, $perPage: Int, $searchValue: String) {
    productBulkSimilarities(
      page: $page
      perPage: $perPage
      searchValue: $searchValue
    ) {
      ...SimilarityFields
    }
  }
  ${SIMILARITY_FIELDS}
`;

export const PRODUCT_SIMILARITIES_TOTAL_COUNT = gql`
  query ProductSimilaritiesTotalCount($searchValue: String) {
    productBulkSimilaritiesTotalCount(searchValue: $searchValue)
  }
`;

export const PRODUCT_SIMILARITY = gql`
  query ProductSimilarity($_id: String!) {
    productBulkSimilarity(_id: $_id) {
      ...SimilarityFields
    }
  }
  ${SIMILARITY_FIELDS}
`;
