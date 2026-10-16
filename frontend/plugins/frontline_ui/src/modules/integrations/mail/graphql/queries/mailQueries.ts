import { gql } from '~/gql';

export const MAIL_CONVERSATION_DETAIL_QUERY = gql(`
  query mailConversationDetail($conversationId: String!, $limit: Int) {
    mailConversationDetail(conversationId: $conversationId, limit: $limit) {
      messages {
        _id
        mailData {
          messageId
          providerMessageId
          inReplyTo
          references
          type
          deliveryStatus
          deliveryError
          deliveryRetryable
          bouncedRecipients
          envelopeFrom
          senderMismatch
          from {
            name
            email
          }
          to {
            name
            email
          }
          cc {
            name
            email
          }
          bcc {
            name
            email
          }
          subject
          body
          reactionEmoji
          hasReplyTo
          newContent
          replies
          attachments {
            filename
            mimeType
            type
            size
            url
            contentId
            disposition
            error
          }
        }
        createdAt
        __typename
      }
      hasMore
      __typename
    }
  }
`);

export const MAIL_CONVERSATION_INTERNAL_NOTES_QUERY = gql(`
  query mailConversationInternalNotes(
    $conversationId: String!
    $notesSkip: Int
    $notesLimit: Int
  ) {
    mailConversationInternalNotes(
      conversationId: $conversationId
      skip: $notesSkip
      limit: $notesLimit
    ) {
      _id
      mid
      conversationId
      content
      formWidgetData
      extraData
      attachments {
        url
        name
        type
        size
        duration
      }
      createdAt
      internal
      fromBot
      userId
      customerId
      botData
      messageKind
      providerData {
        messageId
        attachmentType
        fallbackReason
        previewText
        previewUrl
        shareType
        storyUrl
      }
      replyTo {
        messageId
        content
        authorName
      }
      reactions {
        senderId
        emoji
        reaction
      }
      deliveryStatus
      expiresAt
    }
    mailConversationInternalNotesCount(conversationId: $conversationId)
  }
`);

export const MAIL_MESSAGE_INSERTED_SUBSCRIPTION = gql(`
  subscription conversationMessageInserted($_id: String!) {
    conversationMessageInserted(_id: $_id) {
      _id
      internal
    }
  }
`);

export const MAIL_CONVERSATION_DRAFTS_QUERY = gql(`
  query mailConversationDrafts($conversationId: String!) {
    mailConversationDrafts(conversationId: $conversationId) {
      _id
      sourceMessageId
      to
      subject
      body
      senderMismatch
      status
      createdAt
    }
  }
`);

export const MAIL_DRAFT_CHANGED_SUBSCRIPTION = gql(`
  subscription mailDraftChanged($conversationId: String!) {
    mailDraftChanged(conversationId: $conversationId) {
      _id
      status
    }
  }
`);
