const paramDefs = `$kind: String`;
const params = `kind: $kind`;

const commentsParamDefs = `$conversationId: String!, $isResolved: Boolean, $commentId: String, $senderId: String, $skip: Int, $limit: Int`;
const commentsParams = `conversationId: $conversationId, isResolved: $isResolved, commentId: $commentId, senderId: $senderId, skip: $skip, limit: $limit`;

const facebookGetConfigs = `
  query facebookGetConfigs {
    facebookGetConfigs
  }
`;

const facebookGetIntegrations = `
  query facebookGetIntegrations(${paramDefs}) {
    facebookGetIntegrations(${params})
  }
`;

const facebookGetIntegrationDetail = `
  query facebookGetIntegrationDetail($erxesApiId: String) {
    facebookGetIntegrationDetail(erxesApiId: $erxesApiId)
  }
`;

const facebookGetComments = `
  query facebookGetComments(${commentsParamDefs}) {
    facebookGetComments(${commentsParams}) {
      conversationId
      commentId
      postId
      parentId
      recipientId
      senderId
      permalink_url
      attachments
      content
      erxesApiId
      timestamp
      customer
      commentCount
      isResolved
    }
  }
`;

const facebookGetCommentCount = `
  query facebookGetCommentCount($conversationId: String!, $isResolved: Boolean) {
    facebookGetCommentCount(conversationId: $conversationId, isResolved: $isResolved)
  }
`;

const facebookGetPages = `
  query facebookGetPages($accountId: String!, $kind: String!) {
    facebookGetPages(accountId: $accountId, kind: $kind)
  }
`;

const facebookGetAccounts = `
  query facebookGetAccounts(${paramDefs}) {
    facebookGetAccounts(${params})
  }
`;

const facebookConversationMessages = `
  query facebookConversationMessages(
    $conversationId: String!
    $skip: Int
    $limit: Int
    $getFirst: Boolean
  ) {
    facebookConversationMessages(
      conversationId: $conversationId,
      skip: $skip,
      limit: $limit,
      getFirst: $getFirst
    ) {
      _id
      content
      conversationId
      fromBot
      botData
      customerId
      userId
      createdAt
      isCustomerRead
      mid
    }
  }
`;

const facebookConversationMessagesCount = `
  query facebookConversationMessagesCount($conversationId: String!) {
    facebookConversationMessagesCount(conversationId: $conversationId)
  }
`;

export default {
  facebookGetConfigs,
  facebookGetIntegrations,
  facebookGetIntegrationDetail,
  facebookGetComments,
  facebookGetCommentCount,
  facebookGetPages,
  facebookGetAccounts,
  facebookConversationMessages,
  facebookConversationMessagesCount
};
