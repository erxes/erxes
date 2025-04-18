import { connection } from './connection';

const userDetailFields = `
  avatar
  fullName
`;

const messageFields = `
  _id
  conversationId
  customerId
  user {
    _id
    details {
      ${userDetailFields}
      description
      location
      position
      shortName
    }
  }
  content
  createdAt
  internal
  fromBot
  contentType

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
const MESSAGE_FIELDS = `
  _id
  conversationId
  customerId
  user {
    _id
    details {
      ${userDetailFields}
      description
      location
      position
      shortName
    }
  }
  content
  createdAt
  internal
  fromBot
  contentType

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
    ${userDetailFields}
    description
    location
    position
    shortName
  }
  isOnline
`;

const conversationDetailQuery = (isDailycoEnabled: boolean) => `
  query ($_id: String, $integrationId: String!) {
    widgetsConversationDetail(_id: $_id, integrationId: $integrationId) {
      _id
      messages {
        ${messageFields}
        ${
          isDailycoEnabled
            ? `
        videoCallData {
          url
          status
        }`
            : ''
        }
      }

      operatorStatus
      isOnline
      persistentMenus
      fromBot
      botData
      botGreetMessage
      getStarted
      supporters {
        _id
        details {
          ${userDetailFields}
          description
          location
          position
          shortName
        }
      }
      participatedUsers {
        _id
        details {
          ${userDetailFields}
          description
          location
          position
          shortName
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

const conversationMessageInserted = (isDailycoEnabled: boolean) => `
  subscription conversationMessageInserted($_id: String!) {
    conversationMessageInserted(_id: $_id) {
      ${messageFields}
      ${
        isDailycoEnabled
          ? `
      videoCallData {
        url
        status
      }`
          : ''
      }
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
          ${userDetailFields}
          description
          location
          position
          shortName
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

const connect = (isCloudFlareEnabled?: boolean, isTicketEnabled?: boolean) => `
  mutation connect($brandCode: String!, $email: String, $phone: String, $code: String
    $isUser: Boolean, $data: JSON,
    $companyData: JSON, $cachedCustomerId: String $visitorId: String) {

    widgetsMessengerConnect(brandCode: $brandCode, email: $email, phone: $phone, code: $code,
      isUser: $isUser, data: $data, companyData: $companyData,
      cachedCustomerId: $cachedCustomerId, visitorId: $visitorId) {
      integrationId,
      messengerData,
      ${
        isCloudFlareEnabled
          ? `
      callData {
        header
        description
        secondPageHeader
        secondPageDescription
        departments {
          _id
          name
          operators
        }
        isReceiveWebCall
      },
    `
          : ''
      }
      
      ${
        isTicketEnabled
          ? `
        ticketData
      `
          : ``
      }
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
  numOfArticles(status: "publish")
  parentCategoryId
  icon
`;

const getFaqCategoryQuery = `
  query knowledgeBaseCategoryDetail($_id: String!) {
    knowledgeBaseCategoryDetail(_id: $_id) {
      ${categoryFields}
      parentCategoryId
      articles(status: "publish") {
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
  MESSAGE_FIELDS,
};
export { MESSAGE_FIELDS };
