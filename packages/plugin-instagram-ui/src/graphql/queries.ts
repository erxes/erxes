import { isEnabled } from '@erxes/ui/src/utils/core';

const paramDefs = `$kind: String`;
const params = `kind: $kind`;

const commonCommentAndMessageFields = `
  content
  conversationId
`;

const instagramGetConfigs = `
  query instagramGetConfigs {
    instagramGetConfigs
  }
`;

const instagramGetIntegrations = `
  query instagramGetIntegrations(${paramDefs}) {
    instagramGetIntegrations(${params})
  }
`;

const instagramGetIntegrationDetail = `
  query instagramGetIntegrationDetail($erxesApiId: String) {
    instagramGetIntegrationDetail(erxesApiId: $erxesApiId)
  }
`;

const instagramGetPages = `
  query instagramGetPages($accountId: String!, $kind: String!) {
    instagramGetPages(accountId: $accountId, kind: $kind)
  }
`;

const instagramGetAccounts = `
  query instagramGetAccounts(${paramDefs}) {
    instagramGetAccounts(${params})
  }
`;

const instagramConversationMessages = `
  query instagramConversationMessages(
    $conversationId: String!
    $skip: Int
    $limit: Int
    $getFirst: Boolean
  ) {
    instagramConversationMessages(
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
      internal

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

const instagramConversationMessagesCount = `
  query instagramConversationMessagesCount($conversationId: String!) {
    instagramConversationMessagesCount(conversationId: $conversationId)
  }
`;

const instagramHasTaggedMessages = `
  query instagramHasTaggedMessages($conversationId: String!) {
    instagramHasTaggedMessages(conversationId: $conversationId)
  }
`;

export default {
  instagramGetConfigs,
  instagramGetIntegrations,
  instagramGetIntegrationDetail,
  instagramGetPages,
  instagramGetAccounts,
  instagramConversationMessages,
  instagramConversationMessagesCount,
  instagramHasTaggedMessages
};
