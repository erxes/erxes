import { gql } from '@apollo/client';

export const LOYALTY_SOURCE_AUTOMATION_REMOVE = gql`
  mutation LoyaltySourceAutomationRemove($automationIds: [String]) {
    automationsRemove(automationIds: $automationIds)
  }
`;
