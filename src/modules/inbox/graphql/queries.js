import conversationFields from './conversationFields';
import messageFields from './messageFields';

const listParamsDef = `
  $limit: Int
  $channelId: String
  $status: String
  $unassigned: String
  $brandId: String
  $tag: String
  $integrationType: String
  $participating: String
  $starred: String
  $ids: [String]
`;

const listParamsValue = `
  limit: $limit
  channelId: $channelId
  status: $status
  unassigned: $unassigned
  brandId: $brandId
  tag: $tag
  integrationType: $integrationType
  participating: $participating
  starred: $starred
  ids: $ids
`;

const conversationList = `
  query objects(${listParamsDef}) {
    conversations(${listParamsValue}) {
      ${conversationFields}
    }
  }
`;

const sidebarConversations = `
  query objects(${listParamsDef}) {
    conversations(${listParamsValue}) {
      _id
      content
      updatedAt
      assignedUser {
        _id
        details {
          avatar
        }
      }
      integration {
        _id
        kind
        brand {
          _id
          name
        }
        channels {
          _id
          name
        }
      }
      customer {
        _id
        firstName
        lastName
        email
        phone
      }
      tagIds
      tags {
        _id
        name
      }
      readUserIds
    }
  }
`;

const conversationDetail = `
  query conversationDetail($_id: String!) {
    conversationDetail(_id: $_id) {
      ${conversationFields}
    }
  }
`;

const conversationMessages = `
  query conversationMessages($conversationId: String!, $skip: Int) {
    conversationMessages(conversationId: $conversationId skip: $skip) {
      list {
        ${messageFields}
      }
      totalCount
    }
  }
`;

const userList = `
  query objects {
    users {
      _id
      username
      email
      details {
        avatar
        fullName
        position
        twitterUsername
      }
    }
  }
`;

const channelList = `
  query channels {
    channels {
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
  query conversationCounts(${listParamsDef}) {
    conversationCounts(${listParamsValue})
  }
`;

const totalConversationsCount = `
  query totalConversationsCount(${listParamsDef}) {
    conversationsTotalCount(${listParamsValue})
  }
`;

const unreadConversationsCount = `
  query conversationsTotalUnreadCount {
    conversationsTotalUnreadCount
  }
`;

const lastConversation = `
  query conversationsGetLast(${listParamsDef}) {
    conversationsGetLast(${listParamsValue}) {
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
  sidebarConversations,
  conversationDetail,
  conversationMessages,
  userList,
  channelList,
  brandList,
  tagList,
  responseTemplateList,
  conversationCounts,
  totalConversationsCount,
  unreadConversationsCount,
  lastConversation
};
