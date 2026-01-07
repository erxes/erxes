import { gql } from '@apollo/client';

export const LOYALTY_SCORE_ADD_MUTATION = gql`
  mutation ScoreCampaignAdd(
    $title: String!
    $description: String
    $productCategory: [String]
    $product: [String]
    $tags: [String]
    $orExcludeProductCategory: [String]
    $orExcludeProduct: [String]
    $orExcludeTag: [String]
  ) {
    scoreCampaignAdd(
      title: $title
      description: $description
      productCategory: $productCategory
      product: $product
      tags: $tags
      orExcludeProductCategory: $orExcludeProductCategory
      orExcludeProduct: $orExcludeProduct
      orExcludeTag: $orExcludeTag
    ) {
      _id
      title
      description
      productCategory
      product
      tags
      orExcludeProductCategory
      orExcludeProduct
      orExcludeTag
      createdAt
      createdUserId
      __typename
    }
  }
`;
