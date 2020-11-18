export const types = `
  type MessengerConnectResponse {
    integrationId: String
    uiOptions: JSON
    languageCode: String
    messengerData: JSON
    customerId: String
    brand: Brand
  }

  type ConversationDetailResponse {
    _id: String
    messages: [ConversationMessage]
    operatorStatus: String
    participatedUsers: [User]
    isOnline: Boolean
    supporters: [User]
  }

  type FormConnectResponse {
    integration: Integration
    form: Form
  }

  type SaveFormResponse {
    status: String!
    errors: [Error]
    messageId: String
  }

  type Error {
    fieldId: String
    code: String
    text: String
  }

  type MessengerSupportersResponse {
    supporters: [User]
    isOnline: Boolean
    serverTime: String
  }

  input FieldValueInput {
    _id: String!
    type: String
    validation: String
    text: String
    value: String
  }
`;

export const queries = `
  widgetsConversations(integrationId: String!, customerId: String!): [Conversation]
  widgetsConversationDetail(_id: String, integrationId: String!): ConversationDetailResponse
  widgetsGetMessengerIntegration(brandCode: String!): Integration
  widgetsMessages(conversationId: String): [ConversationMessage]
  widgetsUnreadCount(conversationId: String): Int
  widgetsTotalUnreadCount(integrationId: String!, customerId: String!): Int
  widgetsMessengerSupporters(integrationId: String!): MessengerSupportersResponse
  widgetsKnowledgeBaseArticles(topicId: String!, searchString: String) : [KnowledgeBaseArticle]
  widgetsKnowledgeBaseTopicDetail(_id: String!): KnowledgeBaseTopic
  widgetsGetEngageMessage(customerId: String!, browserInfo: JSON!): ConversationMessage
`;

export const mutations = `
  widgetsMessengerConnect(
    brandCode: String!
    email: String
    phone: String
    code: String
    isUser: Boolean

    companyData: JSON
    data: JSON

    cachedCustomerId: String
    deviceToken: String
  ): MessengerConnectResponse

  widgetsSaveBrowserInfo(
    customerId: String!
    browserInfo: JSON!
  ): ConversationMessage

  widgetsInsertMessage(
    integrationId: String!
    customerId: String!
    conversationId: String
    message: String,
    attachments: [AttachmentInput],
    contentType: String
  ): ConversationMessage

  widgetBotRequest(
    customerId: String!
    conversationId: String!
    integrationId: String!,
    message: String!
    payload: String!
    type: String!
    ): JSON

  widgetsReadConversationMessages(conversationId: String): JSON
  widgetsSaveCustomerGetNotified(customerId: String!, type: String!, value: String!): JSON

  widgetsLeadConnect(
    brandCode: String!,
    formCode: String!,
    cachedCustomerId: String
  ): FormConnectResponse

  widgetsSaveLead(
    integrationId: String!
    formId: String!
    submissions: [FieldValueInput]
    browserInfo: JSON!
    cachedCustomerId: String
  ): SaveFormResponse

  widgetsSendEmail(
    toEmails: [String]
    fromEmail: String
    title: String
    content: String
  ): String

  widgetGetBotInitialMessage(integrationId: String, customerId: String): JSON

  widgetsKnowledgebaseIncReactionCount(articleId: String!, reactionChoice: String!): String
  widgetsLeadIncreaseViewCount(formId: String!): JSON
  widgetsSendTypingInfo(conversationId: String!, text: String): String
`;
