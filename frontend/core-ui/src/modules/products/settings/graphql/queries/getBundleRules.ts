import { gql } from '@apollo/client';

export const BUNDLE_RULES = gql`
  query BundleRules {
    bundleRules {
      userId
      name
      description
      createdAt
      code
      _id
      rules {
        quantity
        productIds
        products {
          _id
          name
          __typename
        }
        priceValue
        priceType
        priceAdjustType
        priceAdjustFactor
        percent
        code
        allowSkip
        __typename
      }
      __typename
    }
  }
`;
