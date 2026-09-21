import gql from 'graphql-tag';

export const FACEBOOK_BOT_AUTOMATIONS = gql`
  query FacebookBotAutomations($triggerTypes: [String]) {
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
