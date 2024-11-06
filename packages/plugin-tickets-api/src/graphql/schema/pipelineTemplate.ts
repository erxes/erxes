export const types = `
  type TicketsPipelineTemplateStage {
    _id: String!
    name: String!
    formId: String
    order: Int
  }

  input TicketsPipelineTemplateStageInput {
    _id: String!
    name: String!
    formId: String
  }
  
  type TicketsPipelineTemplate @key(fields: "_id") {
    _id: String!
    name: String!
    description: String
    type: String
    isDefinedByErxes: Boolean
    stages: [TicketsPipelineTemplateStage]
    createdBy: String
    createdAt: Date
  }
`;

const commonParams = `
  name: String!
  description: String
  type: String!
  stages: [TicketsPipelineTemplateStageInput]
`;

export const queries = `
  ticketsPipelineTemplates(type: String!): [TicketsPipelineTemplate]
  ticketsPipelineTemplateDetail(_id: String!): TicketsPipelineTemplate
  ticketsPipelineTemplatesTotalCount: Int
`;

export const mutations = `
  ticketsPipelineTemplatesAdd(${commonParams}): TicketsPipelineTemplate
  ticketsPipelineTemplatesEdit(_id: String!, ${commonParams}): TicketsPipelineTemplate
  ticketsPipelineTemplatesRemove(_id: String!): JSON
  ticketsPipelineTemplatesDuplicate(_id: String!): TicketsPipelineTemplate
`;
