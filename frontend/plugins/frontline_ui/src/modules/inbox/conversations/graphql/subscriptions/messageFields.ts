export default `
  _id
  mid
  content
  attachments {
    url
    name
    size
    type
  }
  mentionedUserIds
  conversationId


  internal
  fromBot
  contentType
  customerId
  userId
  createdAt
  isCustomerRead
  formWidgetData
  messengerAppData
  botData
  extraData
  messageKind
  providerData
  replyTo
  reactions
  deliveryStatus
  expiresAt
  user {
    _id
    username
    details {
      avatar
      fullName
      position
    }
  }
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
        getTags {
          _id
          name
          colorCode
        }
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
