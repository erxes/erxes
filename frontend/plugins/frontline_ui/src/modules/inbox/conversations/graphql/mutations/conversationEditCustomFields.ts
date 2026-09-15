import { gql } from '@apollo/client';

export const CONVERSATION_EDIT_CUSTOM_FIELDS = gql`
  mutation ConversationEditCustomFields($_id: String!, $propertiesData: JSON) {
    conversationEditCustomFields(_id: $_id, propertiesData: $propertiesData) {
      _id
      propertiesData
    }
  }
`;
