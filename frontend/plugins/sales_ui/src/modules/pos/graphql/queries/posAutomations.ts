import { gql } from '@apollo/client';

// Filtered by trigger type on the server; the POS lives in the trigger's
// config, so the hook narrows further.
export const POS_ORDER_AUTOMATIONS = gql`
  query PosOrderAutomations($triggerTypes: [String]) {
    automations(triggerTypes: $triggerTypes) {
      _id
      name
      status
      triggers {
        id
        type
        config
      }
    }
  }
`;
