import conversationFields from './conversationFields';
import messageFields from './messageFields';

export const conversationList = `
  query objects($params: ConversationListParams) {
    conversations(params: $params) {
      ${conversationFields}
    }
  }
`;

export const conversationDetail = `
  query conversationDetail($_id: String!) {
    conversationDetail(_id: $_id) {
      ${conversationFields}

      messages {
        ${messageFields}
      }
    }
  }
`;

export const userList = `
  query objects {
    users {
      _id
      username
      details
      emails
    }
  }
`;

export const channelList = `
  query channels($memberIds: [String]) {
    channels(memberIds: $memberIds) {
      _id
      name
    }
  }
`;

export const brandList = `
  query brands {
    brands {
      _id
      name
    }
  }
`;

export const tagList = `
  query tags($type: String) {
    tags(type: $type) {
      _id
      name
      colorCode
    }
  }
`;

export const conversationCounts = `
  query conversationCounts($params: ConversationListParams) {
    conversationCounts(params: $params)
  }
`;

export const totalConversationsCount = `
  query totalConversationsCount($params: ConversationListParams) {
    totalConversationsCount(params: $params)
  }
`;
