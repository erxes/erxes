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
