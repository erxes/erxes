import { gql } from '@apollo/client';

// Filtered by trigger type on the server; which record a trigger belongs to
// is read from its config, so the hook narrows further.
export const SALES_SOURCE_AUTOMATIONS = gql`
  query SalesSourceAutomations($triggerTypes: [String]) {
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
