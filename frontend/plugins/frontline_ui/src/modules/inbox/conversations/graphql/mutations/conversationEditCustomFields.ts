import { gql } from '~/gql';

export const CONVERSATION_EDIT_CUSTOM_FIELDS = gql(`
  mutation ConversationEditCustomFields($_id: String!, $propertiesData: JSON) {
    conversationEditCustomFields(_id: $_id, propertiesData: $propertiesData) {
      __typename
      _id
      propertiesData
    }
  }
`);
