import { gql } from '@apollo/client';

// Narrowed to one source's trigger and loyalty's own action on the server;
// which scope each one runs at is read from the trigger's config.
export const LOYALTY_SOURCE_AUTOMATIONS = gql`
  query LoyaltySourceAutomations(
    $triggerTypes: [String]
    $actionTypes: [String]
  ) {
    automations(triggerTypes: $triggerTypes, actionTypes: $actionTypes) {
      _id
      name
      status
      triggers {
        id
        type
        config
      }
      actions {
        id
        type
        config
      }
    }
  }
`;
