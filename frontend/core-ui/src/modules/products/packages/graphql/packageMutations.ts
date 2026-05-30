import { gql } from '@apollo/client';
import { PACKAGE_FRAGMENT } from './packageQueries';

const PRODUCT_INPUT = `$products: [PackageProductInput!]`;

export const ADD_PACKAGE = gql`
  mutation PackagesAdd(
    $name: String
    $description: String
    $coverImage: String
    ${PRODUCT_INPUT}
    $price: Float
    $percent: Float
    $status: String
  ) {
    packagesAdd(
      name: $name
      description: $description
      coverImage: $coverImage
      products: $products
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
  mutation PackagesEdit(
    $_id: String!
    $name: String
    $description: String
    $coverImage: String
    ${PRODUCT_INPUT}
    $price: Float
    $percent: Float
  ) {
    packagesEdit(
      _id: $_id
      name: $name
      description: $description
      coverImage: $coverImage
      products: $products
      price: $price
      percent: $percent
    ) {
      ...PackageFields
    }
  }
  ${PACKAGE_FRAGMENT}
`;

export const CHANGE_PACKAGE_STATUS = gql`
  mutation PackagesChangeStatus($_ids: [String!]!, $status: String!) {
    packagesChangeStatus(_ids: $_ids, status: $status) {
      ...PackageFields
    }
  }
  ${PACKAGE_FRAGMENT}
`;

export const REMOVE_PACKAGES = gql`
  mutation PackagesRemove($_ids: [String!]!) {
    packagesRemove(_ids: $_ids)
  }
`;
