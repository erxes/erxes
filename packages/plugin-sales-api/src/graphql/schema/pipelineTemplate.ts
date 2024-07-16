export const types = `
  type SalesPipelineTemplateStage {
    _id: String!
    name: String!
    formId: String
    order: Int
  }

  input SalesPipelineTemplateStageInput {
    _id: String!
    name: String!
    formId: String
  }
  
  type SalesPipelineTemplate @key(fields: "_id") {
    _id: String!
    name: String!
    description: String
    type: String
    isDefinedByErxes: Boolean
    stages: [SalesPipelineTemplateStage]
    createdBy: String
    createdAt: Date
  }
`;

const commonParams = `
  name: String!
  description: String
  type: String!
  stages: [SalesPipelineTemplateStageInput]
`;

export const queries = `
  salesPipelineTemplates(type: String!): [SalesPipelineTemplate]
  salesPipelineTemplateDetail(_id: String!): SalesPipelineTemplate
  pipelineTemplatesTotalCount: Int
`;

export const mutations = `
  salesPipelineTemplatesAdd(${commonParams}): SalesPipelineTemplate
  salesPipelineTemplatesEdit(_id: String!, ${commonParams}): SalesPipelineTemplate
  salesPipelineTemplatesRemove(_id: String!): JSON
  salesPipelineTemplatesDuplicate(_id: String!): SalesPipelineTemplate
`;
