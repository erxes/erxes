import { MESSAGE_FIELDS, USER_DETAIL_FIELD } from "./fields";

import { connection } from "../connection";
import gql from "graphql-tag";
import { messageFields } from "./mutations";

const GET_UNREAD_COUNT = gql`
  query widgetsUnreadCount($conversationId: String) {
    widgetsUnreadCount(conversationId: $conversationId)
  }
`;

const GET_CONVERSATION_DETAIL = (isDailycoEnabled: boolean) => gql`
  query ($_id: String, $integrationId: String!) {
    widgetsConversationDetail(_id: $_id, integrationId: $integrationId) {
      _id
      messages {
        ${MESSAGE_FIELDS}
        ${isDailycoEnabled
    ? `
        videoCallData {
          url
          status
        }`
    : ""
  }
      }

      operatorStatus
      isOnline
      supporters {
        _id
        details {
          ${USER_DETAIL_FIELD}
        }
      }
      participatedUsers {
        _id
        details {
          ${USER_DETAIL_FIELD}
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

const GET_WIDGET_EXPORT_MESSENGER_DATA = gql`
  query widgetExportMessengerData($_id: String, $integrationId: String!) {
    widgetExportMessengerData(_id: $_id, integrationId: $integrationId)
  }
`;

const GET_FAQ_TOPIC = gql`
  query knowledgeBaseTopicDetail($_id: String!) {
    knowledgeBaseTopicDetail(_id: $_id) {
      parentCategories {
        _id
        title
      }
    }
  }
`;

const GET_CLOUDFLARE_CALL_INTEGRATION = gql`
  query CloudflareCallsGetIntegrations {
    cloudflareCallsGetIntegrations {
      _id
      erxesApiId
      name
    }
  }
`

const TICKET_COMMENTS = gql`
query widgetsTicketComments($typeId: String!, $type: String!) {
  widgetsTicketComments(typeId: $typeId, type: $type) {
    _id
    content
    createdUser {
      _id
      email
      emails
      phone
      phones
      lastName
      firstName
      avatar
    }
    type
    userType
    createdAt
  }
}
`;

const TICKET_ACTIVITY_LOGS = gql`
  query widgetsTicketActivityLogs($contentType: String!, $contentId: String) {
    widgetsTicketActivityLogs(contentType: $contentType, contentId: $contentId) {
      _id
      action
      contentType
      createdByDetail
      content
      createdAt
    }
  }
`;

const userDetailFields = `
  avatar
  fullName
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
        ${isDailycoEnabled
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

const customerDetail = `
  query WidgetsTicketCustomerDetail($customerId: String) {
    widgetsTicketCustomerDetail(customerId: $customerId) {
      _id
      emails
      email
      phone
      phones
      lastName
      firstName
      visitorContactInfo
    }
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

export {
  GET_UNREAD_COUNT,
  GET_CONVERSATION_DETAIL,
  GET_WIDGET_EXPORT_MESSENGER_DATA,
  GET_FAQ_TOPIC,
  GET_CLOUDFLARE_CALL_INTEGRATION,
  TICKET_COMMENTS,
  TICKET_ACTIVITY_LOGS,
  conversationDetailQuery,
  widgetExportMessengerDataQuery,
  unreadCountQuery,
  totalUnreadCountQuery,
  allConversations,
  messengerSupportersQuery,
  getFaqCategoryQuery,
  getFaqTopicQuery,
  faqSearchArticlesQuery,
  integrationsFetchApi,
  getEngageMessage,
  customerDetail,
  MESSAGE_FIELDS,
};
