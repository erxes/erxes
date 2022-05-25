export const types = (cardAvailable, kbAvailable) => `
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
   `
    : ''
}

  type OTPConfig{
    content: String
    smsTransporterType: String
    emailTransporterType: String
  }

  input OTPConfigInput {
    content: String
    smsTransporterType: String
    emailTransporterType: String
  }

  type ClientPortal {
    _id: String!
    name: String!
    description: String
    url: String
    logo: String
    icon: String
    domain: String
    dnsStatus: String
    knowledgeBaseLabel: String
    knowledgeBaseTopicId: String
    ticketLabel: String
    taskPublicBoardId: String
    taskPublicPipelineId: String
    taskLabel: String
    taskStageId: String
    taskPipelineId: String
    taskBoardId: String
    ticketStageId: String
    ticketPipelineId: String
    ticketBoardId: String
    googleCredentials: JSON
    styles: Styles
    mobileResponsive: Boolean
  
    otpConfig: OTPConfig

    kbToggle: Boolean,
    publicTaskToggle: Boolean,
    ticketToggle: Boolean,
    taskToggle: Boolean,
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
`;

export const queries = (cardAvailable, kbAvailable) => `
  clientPortalGetConfigs(page: Int, perPage: Int): [ClientPortal]
  clientPortalGetConfig(_id: String!): ClientPortal
  clientPortalGetConfigByDomain: ClientPortal
  clientPortalGetLast: ClientPortal
  clientPortalConfigsTotalCount: Int

  ${
    cardAvailable
      ? `
    clientPortalGetTaskStages: [Stage]
    clientPortalGetTasks(stageId: String!): [Task]
   `
      : ''
  }

  ${
    kbAvailable
      ? `
    clientPortalKnowledgeBaseTopicDetail(_id: String!): KnowledgeBaseTopic
   `
      : ''
  }
`;

export const mutations = cardAvailable => `
  clientPortalConfigUpdate (
    _id: String
    name: String
    description: String
    logo: String
    icon: String
    url: String
    domain: String
    knowledgeBaseLabel: String
    knowledgeBaseTopicId: String
    ticketLabel: String
    taskLabel: String
    taskPublicBoardId: String
    taskPublicPipelineId: String
    taskStageId: String
    taskPipelineId: String
    taskBoardId: String
    ticketStageId: String
    ticketPipelineId: String
    ticketBoardId: String
    googleCredentials: JSON
    styles: StylesParams
    mobileResponsive: Boolean
    kbToggle: Boolean,
    publicTaskToggle: Boolean,
    ticketToggle: Boolean,
    taskToggle: Boolean,

    otpConfig: OTPConfigInput
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
        email: String!
        priority: String
      ): Ticket
     `
      : ''
  }
`;
