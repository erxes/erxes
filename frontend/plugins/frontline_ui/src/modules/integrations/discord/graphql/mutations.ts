import { gql } from '@apollo/client';

export const DISCORD_EDIT_MESSAGE = gql`
  mutation DiscordEditMessage(
    $conversationId: String!
    $messageId: String!
    $content: String!
  ) {
    discordEditMessage(
      conversationId: $conversationId
      messageId: $messageId
      content: $content
    )
  }
`;

export const DISCORD_DELETE_MESSAGE = gql`
  mutation DiscordDeleteMessage(
    $conversationId: String!
    $messageId: String!
  ) {
    discordDeleteMessage(
      conversationId: $conversationId
      messageId: $messageId
    )
  }
`;
