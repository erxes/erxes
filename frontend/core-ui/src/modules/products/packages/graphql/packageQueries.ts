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

// The package's chosen products, for their names and unit prices. `products`
// returns every one of `ids`; `productsMain` refuses a page over 100.
export const GET_PACKAGE_CHOSEN_PRODUCTS = gql`
  query productPackageChosenProducts($ids: [String]) {
    products(ids: $ids) {
      _id
      name
      code
      unitPrice
    }
  }
`;
