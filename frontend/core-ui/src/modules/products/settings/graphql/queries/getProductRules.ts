import { gql } from '@apollo/client';

export const PRODUCT_RULES = gql`
  query productRules {
    productRules {
      _id
      name
      categoryIds
      excludeCategoryIds
      productIds
      excludeProductIds
      tagIds
      excludeTagIds
      unitPrice
      bundleId
      categories {
        name
        __typename
      }
      excludeCategories {
        name
        __typename
      }
      products {
        name
        __typename
      }
      excludeProducts {
        name
        __typename
      }
      tags {
        name
        __typename
      }
      excludeTags {
        name
        __typename
      }
      __typename
    }
  }
`;
