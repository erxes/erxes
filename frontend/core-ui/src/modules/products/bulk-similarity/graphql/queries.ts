import { gql } from '@apollo/client';

export const SIMILARITY_FIELDS = gql`
  fragment SimilarityFields on ProductSimilarity {
    _id
    title
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
    productSimilarities(page: $page, perPage: $perPage, searchValue: $searchValue) {
      ...SimilarityFields
    }
  }
  ${SIMILARITY_FIELDS}
`;

export const PRODUCT_SIMILARITIES_TOTAL_COUNT = gql`
  query ProductSimilaritiesTotalCount($searchValue: String) {
    productSimilaritiesTotalCount(searchValue: $searchValue)
  }
`;

export const PRODUCT_SIMILARITY = gql`
  query ProductSimilarity($_id: String!) {
    productSimilarity(_id: $_id) {
      ...SimilarityFields
    }
  }
  ${SIMILARITY_FIELDS}
`;
