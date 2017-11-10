import conversationFields from './conversationFields';
import messageFields from './messageFields';

const conversationList = `
  query objects($params: ConversationListParams!) {
    conversations(params: $params) {
      ${conversationFields}
    }
  }
`;

const conversationDetail = `
  query conversationDetail($_id: String!) {
    conversationDetail(_id: $_id) {
      ${conversationFields}

      messages {
        ${messageFields}
      }
    }
  }
`;

const userList = `
  query objects {
    users {
      _id
      username
      email
      details
    }
  }
`;

const channelList = `
  query channels($params: JSON) {
    channels(params: $params) {
      _id
      name
    }
  }
`;

const brandList = `
  query brands {
    brands {
      _id
      name
    }
  }
`;

const tagList = `
  query tags($type: String) {
    tags(type: $type) {
      _id
      name
      colorCode
    }
  }
`;

const conversationCounts = `
  query conversationCounts($params: ConversationListParams) {
    conversationCounts(params: $params)
  }
`;

const totalConversationsCount = `
  query totalConversationsCount($params: ConversationListParams) {
    conversationsTotalCount(params: $params)
  }
`;

const currentConversation = `
  query conversationsGetCurrent($_id: String) {
    conversationsGetCurrent(_id: $_id) {
      ${conversationFields}
      messages {
        _id
        content
        userId
        customerId
      }
    }
  }
`;

const responseTemplateList = `
  query responseTemplates {
    responseTemplates {
      _id
      name
      brandId
      content
    }
  }
`;

export default {
  conversationList,
  conversationDetail,
  userList,
  channelList,
  brandList,
  tagList,
  responseTemplateList,
  conversationCounts,
  totalConversationsCount,
  currentConversation
};
