import { gql } from '~/gql';

export const GET_CONVERSATION_PINNED_MESSAGES = gql(`
  query FrontlineConversationPinnedMessages($conversationId: String!) {
    conversationPinnedMessages(conversationId: $conversationId) {
      _id
      conversationId
      content
      createdAt
      attachments {
        url
        name
        type
        size
      }
      extraData
      providerData {
        messageId
        attachmentType
        fallbackReason
        previewText
        previewUrl
        shareType
        storyUrl
      }
    }
  }
`);
