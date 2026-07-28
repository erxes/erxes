import {
  GQL_CURSOR_PARAMS,
  GQL_CURSOR_PARAM_DEFS,
  GQL_PAGE_INFO,
} from 'erxes-ui';
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

export const SIMILARITY_SEARCH_PRODUCTS = gql`
  query SimilaritySearchProducts(
    $searchValue: String
    $categoryIds: [String]
    ${GQL_CURSOR_PARAM_DEFS}
  ) {
    productsMain(
      searchValue: $searchValue
      categoryIds: $categoryIds
      ${GQL_CURSOR_PARAMS}
    ) {
      list {
        _id
        code
        name
        unitPrice
        currency
        similarityId
      }
      totalCount
      ${GQL_PAGE_INFO}
    }
  }
`;
