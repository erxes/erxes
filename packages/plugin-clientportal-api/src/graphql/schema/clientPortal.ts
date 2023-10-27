export const types = (
  cardAvailable,
  kbAvailable,
  formsAvailable,
  productsAvailable
) => `
${
  cardAvailable
    ? `
   extend type Stage @key(fields: "_id") {
    _id: String! @external
  }
  extend type Task @key(fields: "_id") {
    _id: String! @external
  }
  extend type Ticket @key(fields: "_id") {
    _id: String! @external
  }
  extend type Purchase @key(fields: "_id") {
    _id: String! @external
  }
  extend type Deal @key(fields: "_id") {
    _id: String! @external
  }
   `
    : ''
}

${
  kbAvailable
    ? `
   extend type KnowledgeBaseTopic @key(fields: "_id") {
    _id: String! @external
  }

   extend type KnowledgeBaseArticle @key(fields: "_id") {
    _id: String! @external
  }
   `
    : ''
}

${
  productsAvailable
    ? `
    extend type ProductCategory @key(fields: "_id") {
      _id: String! @external
    }
  `
    : ''
}

${
  formsAvailable
    ? `
    extend type Field @key(fields: "_id") {
      _id: String! @external
    }
    `
    : ''
}

  type OTPConfig {
    content: String
    codeLength: Int
    smsTransporterType: String
    loginWithOTP: Boolean
    expireAfter: Int
  }

  type MailConfig {
    subject: String
    invitationContent : String
    registrationContent : String
  }

  type ManualVerificationConfig {
    userIds: [String]
    verifyCustomer: Boolean
    verifyCompany: Boolean
  }

  type PasswordVerificationConfig {
    verifyByOTP: Boolean
    emailSubject: String
    emailContent: String
    smsContent: String
  }


  input OTPConfigInput {
    content: String
    codeLength: Int
    smsTransporterType: String
    loginWithOTP: Boolean
    expireAfter: Int
  }

  input MailConfigInput {
    subject: String
    invitationContent : String
    registrationContent : String
  }

  enum TokenPassMethod {
    cookie
    header
  }

  enum BusinessPortalKind {
    client
    vendor
  }

  type ClientPortal {
    _id: String!
    name: String!
    kind: BusinessPortalKind!
    description: String
    url: String
    logo: String
    icon: String
    headerHtml: String
    footerHtml: String

    domain: String
    dnsStatus: String
    messengerBrandCode: String
    knowledgeBaseLabel: String
    knowledgeBaseTopicId: String
    ticketLabel: String
    dealLabel: String
    purchaseLabel: String
    taskPublicBoardId: String
    taskPublicPipelineId: String
    taskPublicLabel: String
    taskLabel: String
    taskStageId: String
    taskPipelineId: String
    taskBoardId: String
    ticketStageId: String
    ticketPipelineId: String
    ticketBoardId: String
    dealStageId: String
    dealPipelineId: String
    dealBoardId: String
    purchaseStageId: String
    purchasePipelineId: String
    purchaseBoardId: String
    googleCredentials: JSON
    googleClientId: String
    googleClientSecret: String
    googleRedirectUri: String
    facebookAppId: String
    erxesAppToken: String
    styles: Styles
    mobileResponsive: Boolean
  
    otpConfig: OTPConfig
    mailConfig: MailConfig
    manualVerificationConfig: ManualVerificationConfig
    passwordVerificationConfig: PasswordVerificationConfig

    kbToggle: Boolean,
    publicTaskToggle: Boolean,
    ticketToggle: Boolean,
    taskToggle: Boolean,
    dealToggle: Boolean,
    purchaseToggle: Boolean,

    tokenExpiration: Int
    refreshTokenExpiration: Int
    tokenPassMethod: TokenPassMethod
    vendorParentProductCategoryId: String
  }

  type Styles {
    bodyColor: String
    headerColor: String
    footerColor: String
    helpColor: String
    backgroundColor: String
    activeTabColor: String
    baseColor: String
    headingColor: String
    linkColor: String
    linkHoverColor: String
    baseFont: String
    headingFont: String
    dividerColor: String
    primaryBtnColor: String
    secondaryBtnColor: String
  }

  input StylesParams {
    bodyColor: String
    headerColor: String
    footerColor: String
    helpColor: String
    backgroundColor: String
    activeTabColor: String
    baseColor: String
    headingColor: String
    linkColor: String
    linkHoverColor: String
    dividerColor: String
    primaryBtnColor: String
    secondaryBtnColor: String
    baseFont: String
    headingFont: String
  }

  input ItemDate {
    month: Int
    year: Int
  }

  input ClientPortalConfigInput {
    _id: String
    name: String!
    kind: BusinessPortalKind!
    description: String
    url: String
    logo: String
    icon: String
    headerHtml: String
    footerHtml: String

    domain: String
    dnsStatus: String
    messengerBrandCode: String
    kbToggle: Boolean,
    knowledgeBaseLabel: String
    knowledgeBaseTopicId: String
    ticketLabel: String
    dealLabel: String
    purchaseLabel: String

    taskToggle: Boolean,
    publicTaskToggle: Boolean,
    taskPublicBoardId: String
    taskPublicPipelineId: String
    taskPublicLabel: String
    taskLabel: String
    taskStageId: String
    taskPipelineId: String
    taskBoardId: String
    ticketToggle: Boolean,
    ticketStageId: String
    ticketPipelineId: String
    ticketBoardId: String
    dealToggle: Boolean,
    dealStageId: String
    dealPipelineId: String
    dealBoardId: String
    purchaseToggle: Boolean,
    purchaseStageId: String
    purchasePipelineId: String
    purchaseBoardId: String
    googleCredentials: JSON
    googleClientId: String
    googleClientSecret: String
    googleRedirectUri: String
    facebookAppId: String
    erxesAppToken: String
    styles: StylesParams
    mobileResponsive: Boolean

    otpConfig: OTPConfigInput
    mailConfig: MailConfigInput
    manualVerificationConfig: JSON
    passwordVerificationConfig: JSON
    tokenPassMethod: TokenPassMethod
    tokenExpiration: Int
    refreshTokenExpiration: Int
    vendorParentProductCategoryId: String
  }
`;

export const queries = (cardAvailable, kbAvailable, formsAvailable) => `
  clientPortalGetConfigs(kind:BusinessPortalKind, page: Int, perPage: Int): [ClientPortal]
  clientPortalGetConfig(_id: String!): ClientPortal
  clientPortalGetConfigByDomain: ClientPortal
  clientPortalGetLast(kind: BusinessPortalKind): ClientPortal
  clientPortalConfigsTotalCount: Int
  ${
    formsAvailable
      ? `
  clientPortalGetAllowedFields(_id: String!): [Field]
  `
      : ''
  }
  ${
    cardAvailable
      ? `
    clientPortalGetTaskStages: [Stage]
    clientPortalGetTasks(stageId: String!): [Task]
    clientPortalTickets(priority: [String], labelIds:[String], stageId: String, userIds: [String], closeDateType: String, date: ItemDate): [Ticket]
    clientPortalDeals(priority: [String], labelIds:[String], stageId: String, userIds: [String], closeDateType: String, date: ItemDate): [Deal]
    clientPortalPurchases(priority: [String], labelIds:[String], stageId: String, userIds: [String], closeDateType: String, date: ItemDate): [Purchase]
    clientPortalTasks(priority: [String], labelIds:[String], stageId: String, userIds: [String], closeDateType: String, date: ItemDate): [Task]
    clientPortalTicket(_id: String!): Ticket
    clientPortalCardUsers(contentType: String!, contentTypeId: String!, userKind: BusinessPortalKind): [ClientPortalUser]
    clientPortalUserTickets(userId: String): [Ticket]
    clientPortalUserDeals(userId: String): [Deal]
    clientPortalUserPurchases(userId: String): [Purchase]
    clientPortalUserTasks(userId: String): [Task]
   `
      : ''
  }

  ${
    kbAvailable
      ? `
    clientPortalKnowledgeBaseTopicDetail(_id: String!): KnowledgeBaseTopic
    clientPortalKnowledgeBaseArticles(searchValue: String, categoryIds: [String], topicId: String): 
[KnowledgeBaseArticle]
   `
      : ''
  }
`;

export const mutations = cardAvailable => `
  clientPortalConfigUpdate (
    config: ClientPortalConfigInput!
  ): ClientPortal

  clientPortalRemove (_id: String!): JSON

  ${
    cardAvailable
      ? `
      clientPortalCreateCard(
        type: String!
        stageId: String!
        subject: String!
        description: String
        priority: String,
        parentId: String,
        closeDate: Date
        startDate: Date
        attachments: [AttachmentInput]
        customFieldsData: JSON
        labelIds: [String]
        productsData: JSON
      ): JSON
      clientPortalCommentsAdd(type: String!, typeId: String!, content: String! userType: String!): ClientPortalComment
      clientPortalCommentsRemove(_id: String!): String
     `
      : ''
  }
`;
