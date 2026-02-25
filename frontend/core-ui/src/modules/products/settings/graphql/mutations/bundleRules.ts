import { gql } from '@apollo/client';

export const BUNDLE_RULES_ADD = gql`
  mutation BundleRulesAdd(
    $name: String!
    $description: String
    $code: String
    $rules: [BundleRuleItemInput]
  ) {
    bundleRulesAdd(
      name: $name
      description: $description
      code: $code
      rules: $rules
    ) {
      _id
      __typename
    }
  }
`;

export const BUNDLE_RULES_EDIT = gql`
  mutation BundleRulesEdit(
    $_id: String!
    $description: String
    $code: String
    $rules: [BundleRuleItemInput]
    $name: String!
  ) {
    bundleRulesEdit(
      _id: $_id
      description: $description
      code: $code
      rules: $rules
      name: $name
    ) {
      _id
      __typename
    }
  }
`;

export const BUNDLE_RULES_REMOVE = gql`
  mutation BundleRulesRemove($_ids: [String!]) {
    bundleRulesRemove(_ids: $_ids)
  }
`;
