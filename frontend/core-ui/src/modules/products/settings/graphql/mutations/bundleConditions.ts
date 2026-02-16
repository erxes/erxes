import { gql } from '@apollo/client';

export const BUNDLE_CONDITION_ADD = gql`
  mutation BundleConditionAdd(
    $name: String!
    $description: String
    $code: String
  ) {
    bundleConditionAdd(name: $name, description: $description, code: $code) {
      _id
      name
      description
      code
      createdAt
      userId
      __typename
    }
  }
`;

export const BUNDLE_CONDITION_EDIT = gql`
  mutation BundleConditionEdit(
    $_id: String!
    $name: String
    $description: String
    $code: String
  ) {
    bundleConditionEdit(
      _id: $_id
      name: $name
      description: $description
      code: $code
    ) {
      _id
      name
      description
      code
      createdAt
      userId
      __typename
    }
  }
`;

export const BUNDLE_CONDITION_REMOVE = gql`
  mutation BundleConditionRemove($_ids: [String!]) {
    bundleConditionRemove(_ids: $_ids)
  }
`;

export const BUNDLE_CONDITION_DEFAULT = gql`
  mutation BundleConditionDefault($_id: String!) {
    bundleConditionDefault(_id: $_id)
  }
`;
