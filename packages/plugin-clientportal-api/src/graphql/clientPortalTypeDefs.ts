export const types = (contactAvailable, cardAvailable) => `
  ${
    contactAvailable
      ? `
      extend type Customer @key(fields: "_id") {
        _id: String! @external
      }
      extend type Company @key(fields: "_id") {
        _id: String! @external
      }
    `
      : ''
  }

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
    styles: Styles
    mobileResponsive: Boolean
    googleCredentials: JSON
    twilioAccountSid: String
    twilioAuthToken: String
    twilioFromNumber: String
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

export const queries = cardAvailable => `
  clientPortalGetConfigs(page: Int, perPage: Int): [ClientPortal]
  clientPortalGetConfig(_id: String!): ClientPortal
  clientPortalGetLast: ClientPortal
  clientPortalConfigsTotalCount: Int

  ${
    cardAvailable
      ? `
      clientPortalGetTaskStages(taskPublicPipelineId: String!): [Stage]
      clientPortalGetTasks(stageId: String!): [Task]
      clientPortalTickets(email: String!): [Ticket]
      clientPortalTask(_id: String!): Task
      clientPortalTicket(_id: String!): Ticket
      clientPortalDeal(_id: String!): Deal
      clientPortalDeals(stageId: String, conformityMainType: String, conformityMainTypeId: String, probability: String): [Deal]
     `
      : ''
  }
`;

export const mutations = (contactAvailable, cardAvailable) => `
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
    styles: StylesParams
    mobileResponsive: Boolean
    googleCredentials: JSON
    twilioAccountSid: String
    twilioAuthToken: String
    twilioFromNumber: String
    kbToggle: Boolean,
    publicTaskToggle: Boolean,
    ticketToggle: Boolean,
    taskToggle: Boolean,
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

  ${
    contactAvailable
      ? `
      clientPortalCreateCustomer(
        configId: String!
        firstName: String
        lastName: String
        email: String
        phone: String
        avatar: String
      ): Customer

      clientPortalCreateCompany(
        configId: String!
        companyName: String!
        email: String!
      ): Company

     `
      : ''
  }


`;
