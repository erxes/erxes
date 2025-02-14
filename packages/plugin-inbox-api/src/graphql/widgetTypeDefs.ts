export const types = ({ products, knowledgeBase }) => `
  ${
    products
      ? `
    extend type Product @key(fields: "_id") {
      _id: String! @external
    }

    extend type ProductCategory @key(fields: "_id") {
      _id: String! @external
    }
    `
      : ""
  }

    extend type Field @key(fields: "_id") {
      _id: String! @external
    }

 

  ${
    knowledgeBase
      ? `
    extend type KnowledgeBaseArticle @key(fields: "_id") {
      _id: String! @external
    }

    extend type KnowledgeBaseTopic @key(fields: "_id") {
      _id: String! @external
    }
    `
      : ""
  }

  type MessengerConnectResponse {
    integrationId: String
    uiOptions: JSON
    languageCode: String
    messengerData: JSON
    customerId: String
    visitorId: String
    brand: Brand
  }

  type ConversationDetailResponse {
    _id: String
    messages: [ConversationMessage]
    operatorStatus: String
    participatedUsers: [User]
    readUsers: [User]
    botData:JSON
    persistentMenus:JSON
    botGreetMessage:String
    fromBot:Boolean
    getStarted:Boolean
    isOnline: Boolean
    supporters: [User]
  }



  extend type User {
    isOnline: Boolean
  }

  type MessengerSupportersResponse {
    supporters: [User]
    isOnline: Boolean
  }
`;

export const queries = ({ products, knowledgeBase }) => `
  widgetsConversations(integrationId: String!, customerId: String, visitorId: String): [Conversation]
  widgetsConversationDetail(_id: String, integrationId: String!): ConversationDetailResponse
  widgetsGetMessengerIntegration(brandCode: String!): Integration
  widgetsMessages(conversationId: String): [ConversationMessage]
  widgetsUnreadCount(conversationId: String): Int
  widgetsTotalUnreadCount(integrationId: String!, customerId: String, visitorId: String): Int
  widgetsMessengerSupporters(integrationId: String!): MessengerSupportersResponse
  widgetsGetEngageMessage(integrationId: String, customerId: String, visitorId: String, browserInfo: JSON!): ConversationMessage

  ${
    knowledgeBase
      ? `
      widgetsKnowledgeBaseArticles(topicId: String!, searchString: String) : [KnowledgeBaseArticle]
      widgetsKnowledgeBaseTopicDetail(_id: String!): KnowledgeBaseTopic
    `
      : ""
  }


  widgetsProductCategory(_id: String!): ProductCategory
`;

export const mutations = () => `
  widgetsMessengerConnect(
    brandCode: String!
    email: String
    phone: String
    code: String
    isUser: Boolean

    companyData: JSON
    data: JSON

    visitorId: String
    cachedCustomerId: String
    deviceToken: String
  ): MessengerConnectResponse

  widgetsSaveBrowserInfo(
    visitorId: String
    customerId: String
    browserInfo: JSON!
  ): ConversationMessage

  widgetsInsertMessage(
    integrationId: String!
    customerId: String
    payload: String
    visitorId: String
    conversationId: String
    message: String,
    attachments: [AttachmentInput],
    contentType: String,
    skillId: String
  ): ConversationMessage

  widgetBotRequest(
    customerId: String
    payload: String
    visitorId: String
    conversationId: String
    integrationId: String!,
    message: String!
    type: String!
    ): JSON

  widgetsReadConversationMessages(conversationId: String): JSON
  widgetsSaveCustomerGetNotified(customerId: String, visitorId: String, type: String!, value: String!): JSON

  widgetsSendEmail(
    toEmails: [String]
    fromEmail: String
    title: String
    content: String
    customerId: String
    formId: String
    attachments: [AttachmentInput]
  ): String

  widgetGetBotInitialMessage(integrationId: String): JSON

  widgetsLeadIncreaseViewCount(formId: String!): JSON
  widgetsSendTypingInfo(conversationId: String!, text: String): String
`;
