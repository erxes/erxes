import { queries as customerQueries } from 'modules/customers/graphql';
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
  $startDate: String
  $endDate: String
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
  startDate: $startDate
  endDate: $endDate
`;

const conversationList = `
  query objects(${listParamsDef}) {
    conversations(${listParamsValue}) {
      ${conversationFields}
    }
  }
`;

const sidebarConversations = `
  query conversations(${listParamsDef}) {
    conversations(${listParamsValue}) {
      _id
      content
      status
      updatedAt
      idleTime
      assignedUser {
        _id
        details {
          avatar
          fullName
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
        primaryEmail
        primaryPhone
        isUser
        avatar
        visitorContactInfo
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

const conversationDetailMarkAsRead = `
  query conversationDetail($_id: String!) {
    conversationDetail(_id: $_id) {
      _id
      readUserIds
    }
  }
`;

const conversationMessages = `
  query conversationMessages($conversationId: String!, $skip: Int, $limit: Int) {
    conversationMessages(conversationId: $conversationId, skip: $skip, limit: $limit) {
      ${messageFields}
    }
  }
`;

const conversationMessagesTotalCount = `
  query conversationMessagesTotalCount($conversationId: String!) {
    conversationMessagesTotalCount(conversationId: $conversationId)
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
  query conversationCounts(${listParamsDef}, $only: String) {
    conversationCounts(${listParamsValue}, only: $only)
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
      _id
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

const generateCustomerDetailQuery = params => {
  const {
    showProfile = false,
    showDeviceProperties = false,
    showMessengerData = false,
    showCustomFields = false,
    showCompanies = false,
    showTags = false
  } = params || {};

  let fields = `
    _id
    integration {
      kind
    }
  `;

  if (showProfile) {
    fields = `
      ${fields}
      ${customerQueries.basicFields}
    `;
  }

  if (showMessengerData) {
    fields = `
      ${fields}
      messengerData
      getMessengerCustomData
    `;
  }

  if (showCustomFields) {
    fields = `
      ${fields}
      customFieldsData
    `;
  }

  if (showDeviceProperties) {
    fields = `
      ${fields}
      location
    `;
  }

  if (showCompanies) {
    fields = `
      ${fields}
      companies {
        _id
        primaryName
        website
        customers {
          _id
          avatar
          firstName
          lastName
          primaryEmail
        }
      }
    `;
  }

  if (showTags) {
    fields = `
      ${fields}
      tagIds
      getTags {
        _id
        name
        colorCode
      }
    `;
  }

  return `
    query customerDetail($_id: String!) {
      customerDetail(_id: $_id) {
        ${fields}
      }
    }
  `;
};

export default {
  conversationList,
  sidebarConversations,
  conversationDetail,
  conversationDetailMarkAsRead,
  conversationMessages,
  conversationMessagesTotalCount,
  userList,
  channelList,
  brandList,
  tagList,
  responseTemplateList,
  conversationCounts,
  totalConversationsCount,
  unreadConversationsCount,
  lastConversation,
  generateCustomerDetailQuery
};
