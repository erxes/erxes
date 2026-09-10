import { gql } from '@apollo/client';

export const CONVERSATION_MESSAGE_REACT = gql`
  mutation FrontlineConversationMessageReact(
    $conversationId: String!
    $messageId: String!
    $reaction: String
    $remove: Boolean
  ) {
    conversationMessageReact(
      conversationId: $conversationId
      messageId: $messageId
      reaction: $reaction
      remove: $remove
    )
  }
`;

export const CONVERSATION_MESSAGE_PIN = gql`
  mutation FrontlineConversationMessagePin(
    $conversationId: String!
    $messageId: String!
    $remove: Boolean
  ) {
    conversationMessagePin(
      conversationId: $conversationId
      messageId: $messageId
      remove: $remove
    )
  }
`;
