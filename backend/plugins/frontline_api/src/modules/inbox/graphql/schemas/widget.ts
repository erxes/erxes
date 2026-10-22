export const types = `
  
    type MessengerConnectResponse {
      integrationId: String
      uiOptions: JSON
      languageCode: String
      messengerData: JSON
      ticketConfigs: JSON
      customerId: String
      visitorId: String
      sessionToken: String
      channel: Channel
      customer: Customer
    }
    type TicketTypeMessenger {
      ticketLabel: String
      ticketToggle: Boolean,
      ticketStageId: String
      ticketPipelineId: String
      ticketBoardId: String
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

export const queries = `
    widgetsConversations(integrationId: String!): [Conversation]
    widgetsConversationDetail(_id: String, integrationId: String!): ConversationDetailResponse
   
    widgetsMessages(conversationId: String): [ConversationMessage]
    widgetsUnreadCount(conversationId: String): Int
    widgetsTotalUnreadCount(integrationId: String!): Int
    widgetsMessengerSupporters(integrationId: String!): MessengerSupportersResponse
  
    widgetsTicketCustomerDetail(type: String): Customer
    widgetsGetTicketTags(configId: String,parentId: String): [Tag]
    widgetTicketCheckProgress(number: String!): Ticket
    widgetTicketComments(contentId: String!): [TicketNote]
    widgetTicketActivityLogs(contentId: String): [TicketActivity]
    widgetTicketsByCustomer: [Ticket]
    `;

export const mutations = `
    widgetsMessengerConnect(
      integrationId: String!
      email: String
      phone: String
      code: String
      isUser: Boolean
      companyData: JSON
      data: JSON
      deviceToken: String
    ): MessengerConnectResponse
  
    widgetsSaveBrowserInfo(
      browserInfo: JSON!
    ): ConversationMessage
  
    widgetsInsertMessage(
      integrationId: String!
      payload: String
      conversationId: String
      message: String,
      attachments: [AttachmentInput],
      contentType: String,
      skillId: String
    ): ConversationMessage
  
    widgetBotRequest(
      conversationId: String
      integrationId: String!,
      message: String!
      ): JSON
  
    widgetsReadConversationMessages(conversationId: String): JSON
  
    widgetChangeOperatorStatus(
      conversationId: String!
      operatorStatus: String!
    ): JSON

    widgetGetBotInitialMessage(integrationId: String): JSON
    widgetsLeadIncreaseViewCount(formId: String!): JSON
    widgetsSendTypingInfo(conversationId: String!, text: String): String
    
    widgetsTicketCustomersEdit(firstName: String, lastName: String, emails: [String], phones: [String]): Customer
 
    widgetTicketCreated(
      name: String!
      description: String
      attachments: [AttachmentInput]
      statusId: String!
      tagIds: [String!]
      propertiesData: JSON
    ): Ticket
    
    widgetTicketCommentAdd(
       contentId: String!
       content: String!
     ): TicketNote
    widgetTicketCommentRemove(_id: String!): String
  `;
