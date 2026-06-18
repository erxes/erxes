import { gql } from '@apollo/client';

export const EM_MESSENGER_AUTOMATIONS = gql`
  query EmMessengerAutomations($triggerTypes: [String]) {
    automations(triggerTypes: $triggerTypes) {
      _id
      name
      status
    }
  }
`;
