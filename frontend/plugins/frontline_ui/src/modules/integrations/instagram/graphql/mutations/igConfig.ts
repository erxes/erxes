import { gql } from '@apollo/client';

export const INSTAGRAM_UPDATE_CONFIGS = gql`
  mutation InstagramUpdateConfigs($configsMap: JSON!) {
    instagramUpdateConfigs(configsMap: $configsMap)
  }
`;

export const INSTAGRAM_REPAIR = gql`
  mutation InstagramRepair($_id: String!) {
    instagramRepair(_id: $_id)
  }
`;

export const INSTAGRAM_REPLY_TO_COMMENT = gql`
  mutation InstagramReplyToComment(
    $conversationId: String
    $commentId: String
    $content: String
  ) {
    instagramReplyToComment(
      conversationId: $conversationId
      commentId: $commentId
      content: $content
    ) {
      commentId
      content
      conversationId
    }
  }
`;
