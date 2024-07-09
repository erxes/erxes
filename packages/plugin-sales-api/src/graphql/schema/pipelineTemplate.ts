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
    stages: [PipelineTemplateStage]
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
  pipelineTemplates(type: String!): [SalesPipelineTemplate]
  pipelineTemplateDetail(_id: String!): SalesPipelineTemplate
  pipelineTemplatesTotalCount: Int
`;

export const mutations = `
  pipelineTemplatesAdd(${commonParams}): SalesPipelineTemplate
  pipelineTemplatesEdit(_id: String!, ${commonParams}): SalesPipelineTemplate
  pipelineTemplatesRemove(_id: String!): JSON
  pipelineTemplatesDuplicate(_id: String!): SalesPipelineTemplate
`;
