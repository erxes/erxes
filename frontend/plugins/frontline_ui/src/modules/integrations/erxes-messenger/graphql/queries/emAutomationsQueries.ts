import { gql } from '~/gql';

export const EM_MESSENGER_AUTOMATIONS = gql(`
  query EmMessengerAutomations($triggerTypes: [String]) {
    automations(triggerTypes: $triggerTypes) {
      _id
      name
      status
      triggers {
        type
        config
      }
    }
  }
`);
