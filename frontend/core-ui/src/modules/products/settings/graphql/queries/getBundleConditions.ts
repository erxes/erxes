import { gql } from '@apollo/client';

export const BUNDLE_CONDITIONS = gql`
  query BundleConditions {
    bundleConditions {
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
