import { gql } from '@apollo/client';

// Filtered by action type on the server; the campaign lives in the action's
// config, so the hook narrows further.
export const SCORE_CAMPAIGN_AUTOMATIONS = gql`
  query LoyaltyScoreCampaignAutomations($actionTypes: [String]) {
    automations(actionTypes: $actionTypes) {
      _id
      name
      status
      actions {
        id
        type
        config
      }
    }
  }
`;
