import { gql } from '@apollo/client';
import { PACKAGE_FRAGMENT } from './packageQueries';

const PRODUCT_INPUT = `$products: [ProductPackageInput!]`;

export const ADD_PACKAGE = gql`
  mutation productPackagesAdd(
    $name: String
    $description: String
    $coverImage: String
    ${PRODUCT_INPUT}
    $tagIds: [String]
    $price: Float
    $percent: Float
    $status: String
  ) {
    productPackagesAdd(
      name: $name
      description: $description
      coverImage: $coverImage
      products: $products
      tagIds: $tagIds
      price: $price
      percent: $percent
      status: $status
    ) {
      ...PackageFields
    }
  }
  ${PACKAGE_FRAGMENT}
`;

export const EDIT_PACKAGE = gql`
  mutation productPackagesEdit(
    $_id: String!
    $name: String
    $description: String
    $coverImage: String
    ${PRODUCT_INPUT}
    $tagIds: [String]
    $price: Float
    $percent: Float
  ) {
    productPackagesEdit(
      _id: $_id
      name: $name
      description: $description
      coverImage: $coverImage
      products: $products
      tagIds: $tagIds
      price: $price
      percent: $percent
    ) {
      ...PackageFields
    }
  }
  ${PACKAGE_FRAGMENT}
`;

export const CHANGE_PACKAGE_STATUS = gql`
  mutation productPackagesChangeStatus($_ids: [String!]!, $status: String!) {
    productPackagesChangeStatus(_ids: $_ids, status: $status) {
      ...PackageFields
    }
  }
  ${PACKAGE_FRAGMENT}
`;

export const REMOVE_PACKAGES = gql`
  mutation productPackagesRemove($_ids: [String!]!) {
    productPackagesRemove(_ids: $_ids)
  }
`;
