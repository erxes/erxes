export const types = `
  scalar JSON
  scalar Date

  input ConversationListParams {
    limit: Int,
    channelId: String
    status: String
    unassigned: String
    brandId: String
    tag: String
    integrationType: String
    participating: String
    starred: String
  }

  input CustomerListParams {
    brand: String,
    integration: String,
    tag: String,
    limit: Int,
    page: String,
    segment: String,
  }

  type User {
    _id: String!
    username: String
    details: JSON
    emails: JSON
  }

  type Channel {
    _id: String!
    name: String
    description: String
    integrationIds: [String]
    memberIds: [String]
    createdAt: Date
    userId: String
    conversationCount: Int
    openConversationCount: Int
  }

  type Brand {
    _id: String!
    name: String
    description: String
    code: String
    userId: String
    createdAt: Date
    emailConfig: JSON
  }

  type Integration {
    _id: String!
    kind: String
    name: String
    code: String
    brandId: String
    formId: String
    formData: JSON
    messengerData: JSON
    twitterData: JSON
    facebookData: JSON
    uiOptions: JSON

    brand: Brand
    form: Form
    channels: [Channel]
  }

  type ResponseTemplate {
    _id: String!
    name: String
    content: String
    brandId: String
    brand: Brand,
    files: JSON
  }

  type EmailTemplate {
    _id: String!
    name: String
    content: String
  }

  type Form {
    _id: String!
    title: String
    code: String
    description: String
    createdUserId: String
    createdDate: Date

    fields: [FormField]
  }

  type FormField {
    _id: String!
    formId: String
    type: String
    validation: String
    text: String
    description: String
    options: [String]
    isRequired: Boolean
    order: Int
  }

  type EngageMessage {
    _id: String!
    kind: String
    segmentId: String
    customerIds: [String]
    title: String
    fromUserId: String
    method: String
    isDraft: Boolean
    isLive: Boolean
    stopDate: Date
    createdDate: Date
    messengerReceivedCustomerIds: [String]

    email: JSON
    messenger: JSON
    deliveryReports: JSON

    segment: Segment
    fromUser: User
  }

  type Tag {
    _id: String!
    name: String
    type: String
    colorCode: String
    createdAt: Date
    objectCount: Int
  }

  type Customer {
    _id: String!
    integrationId: String
    name: String
    email: String
    phone: String
    isUser: Boolean
    createdAt: Date
    tagIds: [String]
    internalNotes: JSON
    messengerData: JSON
    twitterData: JSON
    facebookData: JSON

    conversations: [Conversation]
    getIntegrationData: JSON
    getMessengerCustomData: JSON
    getTags: [Tag]
  }

  type Segment {
    _id: String!
    name: String
    description: String
    subOf: String
    color: String
    connector: String
    conditions: JSON

    getParentSegment: Segment
    getSubSegments: [Segment]
  }

  type Conversation {
    _id: String!
    content: String
    integrationId: String
    customerId: String
    userId: String
    assignedUserId: String
    participatedUserIds: [String]
    readUserIds: [String]
    createdAt: Date
    status: String
    messageCount: Int
    number: Int
    tagIds: [String]
    twitterData: JSON
    facebookData: JSON

    messages: [ConversationMessage]
    tags: [Tag]
    customer: Customer
    integration: Integration
    user: User
    assignedUser: User
    participatedUsers: [User]
    participatorCount: Int
  }

  type ConversationMessage {
    _id: String!
    content: String
    attachments: JSON
    mentionedUserIds: [String]
    conversationId: String
    internal: Boolean
    customerId: String
    userId: String
    createdAt: Date
    isCustomerRead: Boolean
    engageData: JSON
    formWidgetData: JSON
    facebookData: JSON

    user: User
    customer: Customer
  }

  type ConversationUpdatedResponse {
    type: String!
    message: ConversationMessage
  }
`;
export const queries = `
  type Query {
    users(limit: Int): [User]
    totalUsersCount: Int

    channels(limit: Int, memberIds: [String]): [Channel]
    totalChannelsCount: Int

    brands(limit: Int): [Brand]
    brandDetail(_id: String!): Brand
    totalBrandsCount: Int

    integrations(limit: Int, kind: String): [Integration]
    integrationDetail(_id: String!): Integration
    totalIntegrationsCount(kind: String): Int

    responseTemplates(limit: Int): [ResponseTemplate]
    totalResponseTemplatesCount: Int

    emailTemplates(limit: Int): [EmailTemplate]
    totalEmailTemplatesCount: Int

    forms(limit: Int): [Form]
    formDetail(_id: String!): Form
    totalFormsCount: Int

    engageMessages(kind: String, status: String, tag: String): [EngageMessage]
    engageMessageDetail(_id: String): EngageMessage
    engageMessageCounts(name: String!, kind: String, status: String): JSON
    totalEngageMessagesCount: Int

    tags(type: String): [Tag]

    customers(params: CustomerListParams): [Customer]
    customerCounts(params: CustomerListParams): JSON
    customerDetail(_id: String!): Customer
    customerListForSegmentPreview(segment: JSON, limit: Int): [Customer]
    totalCustomersCount: Int
    segments: [Segment]
    headSegments: [Segment]
    segmentDetail(_id: String): Segment

    conversations(params: ConversationListParams): [Conversation]
    conversationCounts(params: ConversationListParams): JSON
    conversationDetail(_id: String!): Conversation
    totalConversationsCount: Int
  }
`;

export const mutations = `
  type Mutation {
    insertMessage(messageId: String!): ConversationMessage
    changeConversationStatus(_id: String!): String
    assignConversations(_ids: [String]!): [String]
  }
`;

export const subscriptions = `
  type Subscription {
    conversationUpdated(conversationId: String!): ConversationUpdatedResponse
    conversationNotification(customerId: String!): String
  }
`;
