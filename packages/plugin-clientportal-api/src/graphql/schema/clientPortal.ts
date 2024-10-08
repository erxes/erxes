export const types = (cardAvailable, kbAvailable, productsAvailable) => `
${
  cardAvailable
    ? `
  extend type TasksStage @key(fields: "_id") {
    _id: String! @external
  }
  extend type SalesStage @key(fields: "_id") {
    _id: String! @external
  }
    extend type TicketsStage @key(fields: "_id") {
    _id: String! @external
  }
    extend type PurchasesStage @key(fields: "_id") {
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
  input TicketsItemDate {
    month: Int
    year: Int
  }
  input SalesItemDate {
    month: Int
    year: Int
  }
  input PurchasesItemDate {
    month: Int
    year: Int
  }
  input TasksItemDate {
    month: Int
    year: Int
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

    extend type Field @key(fields: "_id") {
      _id: String! @external
    }


  type OTPConfig {
    content: String
    codeLength: Int
    smsTransporterType: String
    loginWithOTP: Boolean
    expireAfter: Int
    emailSubject: String
  }
  type TwoFactorConfig {
    content: String
    codeLength: Int
    smsTransporterType: String
    enableTwoFactor: Boolean
    expireAfter: Int
    emailSubject: String
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
    emailSubject: String
  }

  input TwoFactorConfigInput {
    content: String
    codeLength: Int
    smsTransporterType: String
    enableTwoFactor: Boolean
    expireAfter: Int
    emailSubject: String
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

  type SocialpayConfig {
    publicKey: String
    certId: String
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
    twoFactorConfig: TwoFactorConfig

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

    testUserEmail: String
    testUserPhone: String
    testUserPassword: String
    testUserOTP: String

    socialpayConfig: SocialpayConfig
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

    testUserEmail: String
    testUserPhone: String
    testUserPassword: String
    testUserOTP: String

    otpConfig: OTPConfigInput
    twoFactorConfig:TwoFactorConfigInput
    mailConfig: MailConfigInput
    manualVerificationConfig: JSON
    passwordVerificationConfig: JSON
    tokenPassMethod: TokenPassMethod
    tokenExpiration: Int
    refreshTokenExpiration: Int
    vendorParentProductCategoryId: String
    socialpayConfig: JSON
  }

  enum UserCardEnum {
    deal
    task
    ticket
    purchase
  }
  enum UserCardStatusEnum {
    participating
    invited
    left
    rejected
    won
    lost
    completed
  }
  enum UserCardPaymentEnum {
    paid
    unpaid
  }
  type ClientPortalParticipant {
    _id: String
    contentType: UserCardEnum
    contentTypeId: String
    cpUserId: String
    cpUser: ClientPortalUser
    status: UserCardStatusEnum
    paymentStatus: UserCardPaymentEnum
    paymentAmount: Float
    offeredAmount: Float
    hasVat: Boolean
    createdAt: Date
    modifiedAt: Date
  }

`;

export const queries = (cardAvailable, kbAvailable) => `
  clientPortalGetConfigs(kind:BusinessPortalKind, page: Int, perPage: Int): [ClientPortal]
  clientPortalGetConfig(_id: String!): ClientPortal
  clientPortalGetConfigByDomain(clientPortalName: String): ClientPortal
  clientPortalGetLast(kind: BusinessPortalKind): ClientPortal
  clientPortalConfigsTotalCount: Int
  clientPortalGetAllowedFields(_id: String!): [Field]
  ${
    cardAvailable
      ? `
    clientPortalGetTaskStages: [TasksStage]
    clientPortalGetTasks(stageId: String!): [TasksStage]
    clientPortalTickets(priority: [String], labelIds:[String], stageId: String, userIds: [String], closeDateType: String, date: TicketsItemDate): [Ticket]
    clientPortalDeals(priority: [String], labelIds:[String], stageId: String, userIds: [String], closeDateType: String, date: SalesItemDate): [Deal]
    clientPortalPurchases(priority: [String], labelIds:[String], stageId: String, userIds: [String], closeDateType: String, date: PurchasesItemDate): [Purchase]
    clientPortalTasks(priority: [String], labelIds:[String], stageId: String, userIds: [String], closeDateType: String, date: TasksItemDate): [TasksStage]
    clientPortalTicket(_id: String!): Ticket
    clientPortalCardUsers(contentType: String!, contentTypeId: String!, userKind: BusinessPortalKind): [ClientPortalUser]
    clientPortalUserTickets(userId: String): [Ticket]
    clientPortalUserDeals(userId: String): [Deal]
    clientPortalUserPurchases(userId: String): [Purchase]
    clientPortalUserTasks(userId: String): [TasksStage]
    clientPortalParticipantDetail(_id: String, contentType:String, contentTypeId:String, cpUserId:String): ClientPortalParticipant
    clientPortalParticipants(contentType: String!, contentTypeId: String!, userKind: BusinessPortalKind): [ClientPortalParticipant]
   `
      : ''
  }

  ${
    kbAvailable
      ? `
    clientPortalKnowledgeBaseTopicDetail(_id: String!): KnowledgeBaseTopic
    clientPortalKnowledgeBaseArticles(searchValue: String, categoryIds: [String], topicId: String, isPrivate: Boolean): 
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
      clientPortalParticipantRelationEdit(
        type: String!
        cardId: String!
        oldCpUserIds: [String]
        cpUserIds: [String]
      ): JSON
      clientPortalCommentsAdd(type: String!, typeId: String!, content: String! userType: String!): ClientPortalComment
      clientPortalCommentsRemove(_id: String!): String
      clientPortalParticipantEdit(    _id: String!,
        contentType: UserCardEnum,
        contentTypeId: String,
        cpUserId: String,
        status: UserCardStatusEnum,
        paymentStatus: UserCardPaymentEnum,
        paymentAmount: Float,
        offeredAmount: Float,
        hasVat: Boolean):ClientPortalParticipant
     `
      : ''
  }
`;
