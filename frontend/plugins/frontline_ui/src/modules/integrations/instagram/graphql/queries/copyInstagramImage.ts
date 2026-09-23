import { gql } from '@apollo/client';

export const FRONTLINE_INSTAGRAM_COPY_IMAGE = gql`
  query FrontlineInstagramCopyImage(
    $conversationId: String!
    $messageId: String!
    $url: String!
  ) {
    frontlineInstagramCopyImage(
      conversationId: $conversationId
      messageId: $messageId
      url: $url
    )
  }
`;
