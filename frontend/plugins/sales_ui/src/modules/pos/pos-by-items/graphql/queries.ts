import { gql } from '@apollo/client';

export const POS_BY_ITEMS_QUERY = gql`
  query posProducts(
    $categoryId: String
    $searchValue: String
    $page: Int
    $perPage: Int
    $sortField: String
    $sortDirection: Int
    $search: String
    $paidStartDate: Date
    $paidEndDate: Date
    $createdStartDate: Date
    $createdEndDate: Date
    $paidDate: String
    $userId: String
    $customerId: String
    $customerType: String
    $posId: String
    $types: [String]
    $statuses: [String]
    $excludeStatuses: [String]
  ) {
    posProducts(
      categoryId: $categoryId
      searchValue: $searchValue
      page: $page
      perPage: $perPage
      sortField: $sortField
      sortDirection: $sortDirection
      search: $search
      paidStartDate: $paidStartDate
      paidEndDate: $paidEndDate
      createdStartDate: $createdStartDate
      createdEndDate: $createdEndDate
      paidDate: $paidDate
      userId: $userId
      customerId: $customerId
      customerType: $customerType
      posId: $posId
      types: $types
      statuses: $statuses
      excludeStatuses: $excludeStatuses
    ) {
      products {
        _id
        name
        type
        code
        categoryId
        unitPrice
        category {
          _id
          code
          name
          __typename
        }
        counts
        count
        amount
        __typename
      }
      totalCount
      __typename
    }
  }
`;

export const DELETE_PRODUCT_MUTATION = gql`
  mutation productsRemove($ids: [String!]!) {
    productsRemove(ids: $ids)
  }
`;

export default {
  POS_BY_ITEMS_QUERY,
  DELETE_PRODUCT_MUTATION,
};
