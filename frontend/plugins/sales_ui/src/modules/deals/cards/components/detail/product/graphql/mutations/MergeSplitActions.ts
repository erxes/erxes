import { gql } from '@apollo/client';

export const MERGE_DEALS = gql`
  mutation DealsMerge(
    $sourceDealIds: [ID!]!
    $targetDealId: ID!
    $name: String
    $fields: JSON
  ) {
    dealsMerge(
      sourceDealIds: $sourceDealIds
      targetDealId: $targetDealId
      name: $name
      fields: $fields
    ) {
      _id
      name
      productsData
      mergeInfo {
        mergedDealIds
      }
    }
  }
`;

export const SPLIT_DEAL = gql`
  mutation DealsSplit($dealId: ID!, $splits: [DealSplitInput!]!) {
    dealsSplit(dealId: $dealId, splits: $splits) {
      _id
      name
      stageId
      splitInfo {
        splitSourceId
      }
      productsData
    }
  }
`;
