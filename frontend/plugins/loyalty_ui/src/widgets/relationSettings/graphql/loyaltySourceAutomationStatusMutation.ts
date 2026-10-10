import { gql } from '@apollo/client';

// Returning the status updates the cached automation, so every list showing
// it follows.
export const LOYALTY_SOURCE_AUTOMATION_SET_STATUS = gql`
  mutation LoyaltySourceAutomationSetStatus($_id: String, $status: String) {
    automationsEdit(_id: $_id, status: $status) {
      _id
      status
    }
  }
`;
