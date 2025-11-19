export const types = `
type TicketBasicFields {
    isShowName: Boolean
    isShowDescription: Boolean
    isShowAttachment: Boolean
    isShowTags: Boolean
  }

  type CompanyFields {
    isShowName: Boolean
    isShowRegistrationNumber: Boolean
    isShowAddress: Boolean
    isShowPhoneNumber: Boolean
    isShowEmail: Boolean
  }

  type CustomerFields {
    isShowFirstName: Boolean
    isShowLastName: Boolean
    isShowPhoneNumber: Boolean
    isShowEmail: Boolean
  }

  type TicketConfig {
    id: ID!
    name: String!
    selectedStatusId: String!
    pipelineId: String!
    channelId: String!
    ticketBasicFields: TicketBasicFields
    contactType: String
    company: CompanyFields
    customer: CustomerFields
    createdAt: String
    updatedAt: String
  }

  input TicketBasicFieldsInput {
    isShowName: Boolean
    isShowDescription: Boolean
    isShowAttachment: Boolean
    isShowTags: Boolean
  }

  input CompanyFieldsInput {
    isShowName: Boolean
    isShowRegistrationNumber: Boolean
    isShowAddress: Boolean
    isShowPhoneNumber: Boolean
    isShowEmail: Boolean
  }

  input CustomerFieldsInput {
    isShowFirstName: Boolean
    isShowLastName: Boolean
    isShowPhoneNumber: Boolean
    isShowEmail: Boolean
  }

  input TicketConfigInput {
    name: String!
    selectedStatusId: String!
    pipelineId: String!
    channelId: String!
    ticketBasicFields: TicketBasicFieldsInput
    contactType: String
    company: CompanyFieldsInput
    customer: CustomerFieldsInput
  } 
`;

export const queries = `
    ticketConfigs(channelId: String!): [TicketConfig]
    ticketConfigDetail(_id: String!): TicketConfig
    ticketConfig(pipelineId: String!): TicketConfig
`;

export const mutations = `
  ticketSaveConfig(input: TicketConfigInput!): TicketConfig!
  ticketRemoveConfig(_id: String!): TicketConfig
`;
