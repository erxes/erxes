export default `
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
