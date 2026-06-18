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
    tagIds
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
    $tagIds: [String]
    $cursor: String
    $limit: Int
  ) {
    productPackages(
      searchValue: $searchValue
      status: $status
      tagIds: $tagIds
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
