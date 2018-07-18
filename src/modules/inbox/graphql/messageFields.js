export default `
  _id
  content
  attachments
  mentionedUserIds
  conversationId
  internal
  customerId
  userId
  createdAt
  isCustomerRead
  formWidgetData
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
    item
    photoId
    videoId
    link
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
    firstName
    lastName
    email
    phone
    isUser
    companies {
      _id
      displayName
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
