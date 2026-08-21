export const types = `
  type TicketFormField {
    isShow: Boolean
    label: String
    order: Int
    placeholder: String
  }

  type TicketFormFields {
    name: TicketFormField
    description: TicketFormField
    attachment: TicketFormField
    tags: TicketFormField
  }

  input TicketFormFieldInput {
    isShow: Boolean
    label: String
    order: Int
    placeholder: String
  }

  input TicketFormFieldsInput {
    name: TicketFormFieldInput
    description: TicketFormFieldInput
    attachment: TicketFormFieldInput
    tags: TicketFormFieldInput
  }

  type TicketPropertyFieldOption {
    label: String!
    value: String!
  }

  input TicketPropertyFieldOptionInput {
    label: String!
    value: String!
  }

  type TicketPropertyField {
    fieldId: String!
    groupId: String
    label: String
    placeholder: String
    groupOrder: Int
    order: Int
    isRequired: Boolean
    type: String
    options: [TicketPropertyFieldOption]
  }

  input TicketPropertyFieldInput {
    fieldId: String!
    groupId: String
    label: String
    placeholder: String
    groupOrder: Int
    order: Int
    isRequired: Boolean
    type: String
    options: [TicketPropertyFieldOptionInput]
  }

  type TicketConfig {
    id: ID!
    name: String!
    selectedStatusId: String!
    pipelineId: String!
    channelId: String!
    createdAt: String
    updatedAt: String
    parentId: String
    formFields: TicketFormFields
    propertyFields: [TicketPropertyField]
  }

  input TicketConfigInput {
    name: String!
    selectedStatusId: String!
    pipelineId: String!
    channelId: String!
    parentId: String
    formFields: TicketFormFieldsInput
    propertyFields: [TicketPropertyFieldInput]
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
