import { gql } from '@apollo/client';
import { TEAM_MEMBER_FIELDS, PRODUCT_CORE_FIELDS } from './fragments';

const PRODUCTS_PAGINATED = gql`
  ${TEAM_MEMBER_FIELDS}
  ${PRODUCT_CORE_FIELDS}
  query InsuranceProductList(
    $page: Int
    $perPage: Int
    $sortField: String
    $sortDirection: SortDirection
    $searchValue: String
  ) {
    insuranceProductList(
      page: $page
      perPage: $perPage
      sortField: $sortField
      sortDirection: $sortDirection
      searchValue: $searchValue
    ) {
      totalCount
      list {
        ...ProductCoreFields
        lastModifiedBy {
          ...TeamMemberFields
        }
      }
    }
  }
`;

const GET_PRODUCTS = gql`
  query InsuranceProducts($searchValue: String, $page: Int, $perPage: Int) {
    insuranceProducts(
      searchValue: $searchValue
      page: $page
      perPage: $perPage
    ) {
      _id
      name
    }
  }
`;

const GET_PRODUCT = gql`
  ${PRODUCT_CORE_FIELDS}
  query InsuranceProduct($_id: ID!) {
    insuranceProduct(_id: $_id) {
      ...ProductCoreFields
    }
  }
`;

export default {
  PRODUCTS_PAGINATED,
  GET_PRODUCTS,
  GET_PRODUCT
};
