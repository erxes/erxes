import { connection } from "./connection";

const messageFields = `
  _id
  conversationId
  customerId
  user {
    _id
    details {
      avatar
      fullName
    }
  }
  content
  createdAt
  internal
  fromBot
  contentType
  videoCallData {
    url
    status
  }
  engageData {
    content
    kind
    sentAs
    messageId
    brandId
  }
  botData
  messengerAppData
  attachments {
    url
    name
    size
    type
  }
`;

const userFields = `
  _id
  isActive
  details {
    avatar
    fullName
    shortName
  }
`;

const conversationDetailQuery = `
  query ($_id: String, $integrationId: String!) {
    widgetsConversationDetail(_id: $_id, integrationId: $integrationId) {
      _id
      messages {
        ${messageFields}
      }

      operatorStatus
      isOnline
      supporters {
        _id
        details {
          avatar
          fullName
        }
      }
      participatedUsers {
        _id
        details {
          avatar
          fullName
          shortName
          description
          position
          location
        }
        links
      }
    }
  }
`;

const widgetExportMessengerDataQuery = `
  query widgetExportMessengerData($_id: String, $integrationId: String!) {
    widgetExportMessengerData(_id: $_id, integrationId:$integrationId)
  }
`;

const conversationMessageInserted = `
  subscription conversationMessageInserted($_id: String!) {
    conversationMessageInserted(_id: $_id) {
      ${messageFields}
    }
  }
`;

const conversationBotTypingStatus = `
  subscription conversationBotTypingStatus($_id: String!) {
    conversationBotTypingStatus(_id: $_id)
  }
`;

const adminMessageInserted = `
  subscription conversationAdminMessageInserted($customerId: String) {
    conversationAdminMessageInserted(customerId: $customerId) {
      unreadCount
    }
  }
`;

const unreadCountQuery = `
  query widgetsUnreadCount($conversationId: String) {
    widgetsUnreadCount(conversationId: $conversationId)
  }
`;

const messengerSupportersQuery = `
  query widgetsMessengerSupporters($integrationId: String!) {
    widgetsMessengerSupporters(integrationId: $integrationId) {
      supporters {
        ${userFields}
      }
      isOnline
      serverTime
    }
  }
`;

const totalUnreadCountQuery = `
  query widgetsTotalUnreadCount(${connection.queryVariables}) {
    widgetsTotalUnreadCount(${connection.queryParams})
  }
`;

const conversationChanged = `
  subscription conversationChanged($_id: String!) {
    conversationChanged(_id: $_id) {
      type
    }
  }
`;

const allConversations = `
  query widgetsConversations(${connection.queryVariables}) {
    widgetsConversations(${connection.queryParams}) {
      _id
      content
      createdAt
      participatedUsers {
        details {
          fullName
          avatar
        }
      }
    }
  }
`;

const getEngageMessage = `
  query widgetsGetEngageMessage($integrationId: String $customerId: String $visitorId: String $browserInfo: JSON!) {
    widgetsGetEngageMessage(integrationId: $integrationId customerId: $customerId visitorId: $visitorId browserInfo: $browserInfo) {
      ${messageFields}
    }
  }
`;

const readConversationMessages = `
  mutation widgetsReadConversationMessages($conversationId: String) {
    widgetsReadConversationMessages(conversationId: $conversationId)
  }
`;

const connect = `
  mutation connect($brandCode: String!, $email: String, $phone: String, $code: String
    $isUser: Boolean, $data: JSON,
    $companyData: JSON, $cachedCustomerId: String $visitorId: String) {

    widgetsMessengerConnect(brandCode: $brandCode, email: $email, phone: $phone, code: $code,
      isUser: $isUser, data: $data, companyData: $companyData,
      cachedCustomerId: $cachedCustomerId, visitorId: $visitorId) {
      integrationId,
      messengerData,
      languageCode,
      uiOptions,
      customerId,
      visitorId,
      brand {
        name
        description
      }
    }
  }
`;

const saveBrowserInfo = `
  mutation widgetsSaveBrowserInfo($customerId: String $visitorId: String $browserInfo: JSON!) {
    widgetsSaveBrowserInfo(customerId: $customerId visitorId: $visitorId browserInfo: $browserInfo) {
      ${messageFields}
    }
  }
`;

const sendTypingInfo = `
  mutation widgetsSendTypingInfo($conversationId: String!  $text: String) {
    widgetsSendTypingInfo(conversationId: $conversationId text: $text)
  }
`;

// faq

const faqFields = `
  _id
  title
  summary
  content
  createdDate
`;

const categoryFields = `
  _id
  title
  description
  numOfArticles
  parentCategoryId
  icon
`;

const getFaqCategoryQuery = `
  query knowledgeBaseCategoryDetail($_id: String!) {
    knowledgeBaseCategoryDetail(_id: $_id) {
      ${categoryFields}
      parentCategoryId
      articles {
        ${faqFields}
      }
    }
  }
`;

const getFaqTopicQuery = `
  query knowledgeBaseTopicDetail($_id: String!) {
    knowledgeBaseTopicDetail(_id: $_id) {
      title
      description
      categories {
        ${categoryFields}
      }
      parentCategories {
        ${categoryFields}
      }
    }
  }
`;

const faqSearchArticlesQuery = `
  query widgetsKnowledgeBaseArticles($topicId: String!, $searchString: String!) {
    widgetsKnowledgeBaseArticles(topicId: $topicId, searchString: $searchString) {
      ${faqFields}
    }
  }
`;

const integrationsFetchApi = `
  query integrationsFetchApi($path: String!, $params: JSON!) {
    integrationsFetchApi(path: $path, params: $params)
  }
`;

export default {
  messageFields,
  conversationDetailQuery,
  widgetExportMessengerDataQuery,
  unreadCountQuery,
  totalUnreadCountQuery,
  conversationMessageInserted,
  adminMessageInserted,
  conversationChanged,
  allConversations,
  connect,
  saveBrowserInfo,
  sendTypingInfo,
  readConversationMessages,
  messengerSupportersQuery,
  getFaqCategoryQuery,
  getFaqTopicQuery,
  faqSearchArticlesQuery,
  integrationsFetchApi,
  conversationBotTypingStatus,
  getEngageMessage,
};
