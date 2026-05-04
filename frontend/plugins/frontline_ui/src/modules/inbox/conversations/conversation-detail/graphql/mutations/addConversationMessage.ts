import { gql } from '@apollo/client';

export const ADD_CONVERSATION_MESSAGE = gql`
  mutation ConversationMessageAdd(
    $conversationId: String
    $content: String
    $mentionedUserIds: [String]
    $internal: Boolean
    $attachments: [AttachmentInput]
    $contentType: String
    $extraInfo: JSON
    $responseTemplateId: String
  ) {
    conversationMessageAdd(
      conversationId: $conversationId
      content: $content
      mentionedUserIds: $mentionedUserIds
      internal: $internal
      attachments: $attachments
      contentType: $contentType
      extraInfo: $extraInfo
      responseTemplateId: $responseTemplateId
    ) {
      _id
    }
  }
`;
