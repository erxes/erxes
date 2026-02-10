import { gql } from '@apollo/client';

export const BUNDLE_CONDITIONS = gql`
  query BundleConditions($searchValue: String) {
    bundleConditions(searchValue: $searchValue) {
      _id
      name
      description
      code
      userId
      isDefault
      createdAt
    }
  }
`;
