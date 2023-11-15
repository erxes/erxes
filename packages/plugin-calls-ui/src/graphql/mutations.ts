import { isEnabled } from '@erxes/ui/src/utils/core';

const callsIntegrationUpdate: string = `
mutation CallsIntegrationUpdate($configs: CallIntegrationConfigs) {
  callsIntegrationUpdate(configs: $configs)
}
`;

const customersAdd = `
  mutation CallAddCustomer($inboxIntegrationId: String, $primaryPhone: String, $direction: String, $callID: String!) {
    callAddCustomer(inboxIntegrationId: $inboxIntegrationId, primaryPhone: $primaryPhone, direction: $direction, callID: $callID) {
      conversation {
          _id
          erxesApiId
          integrationId
          senderPhoneNumber
          recipientPhoneNumber
          callId
        }
      customer {
        _id
        avatar
        code
        createdAt
        getTags {
          _id
          name
          type
          colorCode
          createdAt
          objectCount
          totalObjectCount
          parentId
          order
          relatedIds
        }
        email
        primaryPhone
        tagIds
        lastName
        firstName
      }
  }
}
`;

const messageFields = `
  _id
  content
  attachments {
    url
    name
    size
    type
  }
  mentionedUserIds
  conversationId
  videoCallData {
    url
    status
    recordingLinks
  }
  internal
  fromBot
  contentType
  customerId
  userId
  createdAt
  isCustomerRead
  formWidgetData
  bookingWidgetData
  messengerAppData
  botData
  user {
    _id
    username
    details {
      avatar
      fullName
      position
    }
  }
  ${
    isEnabled('contacts')
      ? `
      customer {
        _id
        avatar
        firstName
        middleName
        lastName
        primaryEmail
        primaryPhone
        state
        companies {
          _id
          primaryName
          website
        }

        customFieldsData

        tagIds
        ${
          isEnabled('tags')
            ? `
            getTags {
              _id
              name
              colorCode
            }
          `
            : ``
        }
      }
    `
      : ``
  }
  mailData {
    messageId
    threadId
    subject
    body
    integrationEmail
    to {
      email
    } 
    from {
      email
    }
    cc {
      email
    } 
    bcc {
      email
    }
    accountId
    replyToMessageId
    replyTo
    references
    inReplyTo
    headerId
    attachments {
      id
      content_type
      filename
      mimeType
      size
      attachmentId
    }
  }
`;

const conversationMessageAdd = `
  mutation conversationMessageAdd(
    $conversationId: String,
    $content: String,
    $contentType: String,
    $mentionedUserIds: [String],
    $internal: Boolean,
    $attachments: [AttachmentInput],
    $extraInfo: JSON
  ) {
    conversationMessageAdd(
      conversationId: $conversationId,
      content: $content,
      contentType: $contentType,
      mentionedUserIds: $mentionedUserIds,
      internal: $internal,
      attachments: $attachments,
      extraInfo: $extraInfo
    ) {
      ${messageFields}
    }
  }
`;

export default {
  callsIntegrationUpdate,
  customersAdd,
  conversationMessageAdd
};
