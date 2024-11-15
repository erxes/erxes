import { isEnabled } from '@erxes/ui/src/utils/core';

const paramDefs = `$kind: String`;
const params = `kind: $kind`;

const commonCommentAndMessageFields = `
  content
  conversationId
`;

const whatsappGetConfigs = `
  query whatsappGetConfigs {
    whatsappGetConfigs
  }
`;

const whatsappGetIntegrations = `
  query whatsappGetIntegrations(${paramDefs}) {
    whatsappGetIntegrations(${params})
  }
`;

const whatsappGetIntegrationDetail = `
  query whatsappGetIntegrationDetail($erxesApiId: String) {
    whatsappGetIntegrationDetail(erxesApiId: $erxesApiId)
  }
`;

const whatsappGetNumbers = `
  query whatsappGetNumbers($accountId: String!, $kind: String!) {
    whatsappGetNumbers(accountId: $accountId, kind: $kind)
  }
`;

const whatsappGetAccounts = `
  query whatsappGetAccounts(${paramDefs}) {
    whatsappGetAccounts(${params})
  }
`;

const whatsappConversationMessages = `
  query whatsappConversationMessages(
    $conversationId: String!
    $skip: Int
    $limit: Int
    $getFirst: Boolean
  ) {
    whatsappConversationMessages(
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
    }
  }
`;

const whatsappConversationMessagesCount = `
  query whatsappConversationMessagesCount($conversationId: String!) {
    whatsappConversationMessagesCount(conversationId: $conversationId)
  }
`;

const whatsappHasTaggedMessages = `
  query whatsappHasTaggedMessages($conversationId: String!) {
    whatsappHasTaggedMessages(conversationId: $conversationId)
  }
`;

export default {
  whatsappGetConfigs,
  whatsappGetIntegrations,
  whatsappGetIntegrationDetail,
  whatsappGetNumbers,
  whatsappGetAccounts,
  whatsappConversationMessages,
  whatsappConversationMessagesCount,
  whatsappHasTaggedMessages
};
