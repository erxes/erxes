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
  internal
  fromBot
  customerId
  userId
  createdAt
  isCustomerRead
  formWidgetData
  messengerAppData
  twitterData {
    id_str
    created_at
    isDirectMessage
    entities
    extended_entities
    extended_tweet
    in_reply_to_status_id
    in_reply_to_status_id_str
    in_reply_to_screen_name
    favorited
    retweeted
    quote_count
    reply_count
    retweet_count
    favorite_count
  }
  facebookData {
    postId
    commentId
    parentId
    messageId
    isPost
    reactions
    likeCount
    commentCount
    item
    link
    photo
    video
    photos
    senderId
    senderName
    createdTime
  }
  gmailData {
    messageId
    headerId
    from
    to
    cc
    bcc
    reply
    references
    threadId
    subject
    textPlain
    textHtml
    attachments {
      filename
      mimeType
      size
      attachmentId
    }
  }
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
    lastName
    primaryEmail
    primaryPhone
    isUser
    companies {
      _id
      primaryName
      website
    }

    getMessengerCustomData
    customFieldsData
    messengerData
    twitterData
    facebookData

    tagIds
    getTags {
      _id
      name
      colorCode
    }
  }
`;
