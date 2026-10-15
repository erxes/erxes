import { gql } from '~/gql';

export const SCORE_CAMPAIGN_EARN_PREVIEW = gql(`
  query ScoreCampaignEarnPreview(
    $accountTypeId: String
    $table: JSON!
    $amount: Float!
  ) {
    scoreCampaignEarnPreview(
      accountTypeId: $accountTypeId
      table: $table
      amount: $amount
    ) {
      tierKey
      tierName
      total
      breakdown
    }
  }
`);
