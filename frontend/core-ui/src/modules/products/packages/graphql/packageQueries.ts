import { gql } from '@apollo/client';

export const PACKAGE_FRAGMENT = gql`
  fragment PackageFields on Package {
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
    componentsTotal
    status
    createdAt
    updatedAt
  }
`;

export const GET_PACKAGES = gql`
  query Packages(
    $searchValue: String
    $status: String
    $cursor: String
    $limit: Int
  ) {
    packages(
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
  query PackageDetail($_id: String!) {
    packageDetail(_id: $_id) {
      ...PackageFields
    }
  }
  ${PACKAGE_FRAGMENT}
`;
