import { gql } from '@apollo/client';

export const PACKAGE_FRAGMENT = gql`
  fragment PackageFields on ProductPackage {
    _id
    name
    description
    coverImage
    products {
      productId
      quantity
    }
    price
    percent
    totalPrice
    status
    createdAt
    updatedAt
  }
`;

export const GET_PACKAGES = gql`
  query productPackages(
    $searchValue: String
    $status: String
    $cursor: String
    $limit: Int
  ) {
    productPackages(
      searchValue: $searchValue
      status: $status
      cursor: $cursor
      limit: $limit
    ) {
      list {
        ...PackageFields
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
  ${PACKAGE_FRAGMENT}
`;

export const GET_PACKAGE_DETAIL = gql`
  query productPackageDetail($_id: String!) {
    productPackageDetail(_id: $_id) {
      ...PackageFields
    }
  }
  ${PACKAGE_FRAGMENT}
`;
