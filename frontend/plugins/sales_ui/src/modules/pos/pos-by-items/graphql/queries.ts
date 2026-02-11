import { gql } from '@apollo/client';

export const POS_BY_ITEMS_QUERY = gql`
  query PosProducts(
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
    $posToken: String
    $types: [String]
    $statuses: [String]
    $excludeStatuses: [String]
    $hasPaidDate: Boolean
    $brandId: String
    $categoryId: String
    $searchValue: String
  ) {
    posProducts(
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
      posToken: $posToken
      types: $types
      statuses: $statuses
      excludeStatuses: $excludeStatuses
      hasPaidDate: $hasPaidDate
      brandId: $brandId
      categoryId: $categoryId
      searchValue: $searchValue
    ) {
      products {
        _id
        name
        code
        type
        uom
        unitPrice
        categoryId
        createdAt
        counts
        count
        amount
        category {
          _id
          name
          description
          meta
          parentId
          code
          order
          scopeBrandIds
          status
          isRoot
          productCount
          maskType
          mask
          isSimilarity
          similarities
        }
      }
      totalCount
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
