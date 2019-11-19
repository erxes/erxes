import { connection } from "./connection";

const messageFields = `
  _id
  conversationId
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
  engageData {
    content
    kind
    sentAs
    fromUser {
      details {
        fullName
        avatar
      }
    }
    messageId
    brandId
  }
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
  details {
    avatar
    fullName
    shortName
  }
`;

const conversationDetailQuery = `
  query ($_id: String, $integrationId: String!) {
    conversationDetail(_id: $_id, integrationId: $integrationId) {
      _id
      messages {
        ${messageFields}
      }

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
        }
        links {
          facebook
          twitter
          youtube
          linkedIn
          github
          website
        }
      }
    }
  }
`;

const conversationMessageInserted = `
  subscription conversationMessageInserted($_id: String!) {
    conversationMessageInserted(_id: $_id) {
      ${messageFields}
    }
  }
`;

const adminMessageInserted = `
  subscription conversationAdminMessageInserted($customerId: String!) {
    conversationAdminMessageInserted(customerId: $customerId) {
      _id
    }
  }
`;

const unreadCountQuery = `
  query unreadCount($conversationId: String) {
    unreadCount(conversationId: $conversationId)
  }
`;

const messengerSupportersQuery = `
  query messengerSupporters($integrationId: String!) {
    messengerSupporters(integrationId: $integrationId) {
      ${userFields}
    }
  }
`;

const totalUnreadCountQuery = `
  query totalUnreadCount(${connection.queryVariables}) {
    totalUnreadCount(${connection.queryParams})
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
  query allConversations(${connection.queryVariables}) {
    conversations(${connection.queryParams}) {
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

const readConversationMessages = `
  mutation readConversationMessages($conversationId: String) {
    readConversationMessages(conversationId: $conversationId)
  }
`;

const connect = `
  mutation connect($brandCode: String!, $email: String, $phone: String, $code: String
    $isUser: Boolean, $data: JSON,
    $companyData: JSON, $cachedCustomerId: String) {
    messengerConnect(brandCode: $brandCode, email: $email, phone: $phone, code: $code,
      isUser: $isUser, data: $data, companyData: $companyData,
      cachedCustomerId: $cachedCustomerId) {
      integrationId,
      messengerData,
      languageCode,
      uiOptions,
      customerId,
      brand {
        name
        description
      }
    }
  }
`;

const saveBrowserInfo = `
  mutation saveBrowserInfo($customerId: String!  $browserInfo: JSON!) {
    saveBrowserInfo(customerId: $customerId browserInfo: $browserInfo) {
      ${messageFields}
    }
  }
`;

const sendTypingInfo = `
  mutation sendTypingInfo($conversationId: String!  $text: String) {
    sendTypingInfo(conversationId: $conversationId text: $text)
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
  icon
`;

const getFaqCategoryQuery = `
  query knowledgeBaseCategoriesDetail($categoryId: String!) {
    knowledgeBaseCategoriesDetail(categoryId: $categoryId) {
      ${categoryFields}
      articles {
        ${faqFields}
      }
    }
  }
`;

const getFaqTopicQuery = `
  query knowledgeBaseTopicsDetail($topicId: String!) {
    knowledgeBaseTopicsDetail(topicId: $topicId) {
      title
      description
      categories {
        ${categoryFields}
      }
    }
  }
`;

const faqSearchArticlesQuery = `
  query knowledgeBaseArticles($topicId: String!, $searchString: String!) {
    knowledgeBaseArticles(topicId: $topicId, searchString: $searchString) {
      ${faqFields}
    }
  }
`;

// lead
const formQuery = `
  query form($formId: String) {
    form(formId: $formId) {
      title
      description
      buttonText

      fields {
        _id
        formId
        name
        type
        check
        text
        description
        options
        isRequired
        order
        validation
      }
    }
  }
`;

const formConnectMutation = `
  mutation leadConnect($brandCode: String!, $formCode: String!) {
    leadConnect(brandCode: $brandCode, formCode: $formCode) {
      form {
        _id
        title
        description
      }
      integration {
        _id
        name
        leadData
      }
    }
  }
`;

export default {
  messageFields,
  conversationDetailQuery,
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
  formQuery,
  formConnectMutation
};
