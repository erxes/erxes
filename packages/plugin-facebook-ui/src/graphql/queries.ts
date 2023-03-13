import { isEnabled } from '@erxes/ui/src/utils/core';

const paramDefs = `$kind: String`;
const params = `kind: $kind`;

const commentsParamDefs = `$conversationId: String!, $isResolved: Boolean, $commentId: String, $senderId: String, $skip: Int, $limit: Int`;
const commentsParams = `conversationId: $conversationId, isResolved: $isResolved, commentId: $commentId, senderId: $senderId, skip: $skip, limit: $limit`;

const commonCommentAndMessageFields = `
  content
  conversationId
`;

const commonPostAndCommentFields = `
  postId
  recipientId
  senderId
  erxesApiId
  attachments
  timestamp
  permalink_url
  content
`;

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
      ${commonCommentAndMessageFields}
      ${commonPostAndCommentFields}
      commentId
      parentId
      customer {
        _id
        firstName
        lastName
        profilePic
      }
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
      ${commonCommentAndMessageFields}
      customerId
      userId
      createdAt
      isCustomerRead

      attachments {
        url
        name
        type
        size
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
          }
        `
          : ``
      }
    }
  }
`;

const facebookConversationMessagesCount = `
  query facebookConversationMessagesCount($conversationId: String!) {
    facebookConversationMessagesCount(conversationId: $conversationId)
  }
`;

const facebookGetPost = `
  query facebookGetPost($erxesApiId: String) {
    facebookGetPost(erxesApiId: $erxesApiId) {
      _id
      ${commonPostAndCommentFields}
    }
  }
`;

const facebookHasTaggedMessages = `
  query facebookHasTaggedMessages($conversationId: String!) {
    facebookHasTaggedMessages(conversationId: $conversationId)
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
  facebookConversationMessagesCount,
  facebookGetPost,
  facebookHasTaggedMessages
};
