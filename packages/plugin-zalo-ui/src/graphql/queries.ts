import { isEnabled } from '@erxes/ui/src/utils/core';

const zaloGetConfigs = `
  query zaloGetConfigs {
    zaloGetConfigs
  }
`;

const detail = `
  query zalo($conversationId: String!) {
      zaloConversationDetail(conversationId: $conversationId) {
          _id
          mailData
      }
  }
`;

const accounts = `
  query zaloGetAccounts {
    zaloGetAccounts 
  }
`;

const user = `user {
  _id
  username
  details {
    avatar
    fullName
    position
  }
}`;

const zaloConversationMessages = `
  query zaloConversationMessages(
    $conversationId: String!
    $skip: Int
    $limit: Int
    $getFirst: Boolean
  ) {
    zaloConversationMessages(
      conversationId: $conversationId,
      skip: $skip,
      limit: $limit,
      getFirst: $getFirst
    ) {
      _id
      content
      conversationId
      customerId
      userId
      createdAt
      isCustomerRead
      attachments {
        id
        thumbnail
        type
        url
        name
        description
        duration
        coordinates
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

const zaloConversationMessagesCount = `
  query zaloConversationMessagesCount($conversationId: String!) {
    zaloConversationMessagesCount(conversationId: $conversationId)
  }
`;

export default {
  zaloGetConfigs,
  detail,
  accounts,
  zaloConversationMessages,
  zaloConversationMessagesCount
};
