export const types = `
  type PurchasePipelineTemplateStage {
    _id: String!
    name: String!
    formId: String
    order: Int
  }

  input PurchasePipelineTemplateStageInput {
    _id: String!
    name: String!
    formId: String
  }
  
  type PurchasePipelineTemplate @key(fields: "_id") {
    _id: String!
    name: String!
    description: String
    type: String
    isDefinedByErxes: Boolean
    stages: [PurchasePipelineTemplateStage]
    createdBy: String
    createdAt: Date
  }
`;

const commonParams = `
  name: String!
  description: String
  type: String!
  stages: [PurchasePipelineTemplateStageInput]
`;

export const queries = `
  pipelineTemplates(type: String!): [PurchasePipelineTemplate]
  pipelineTemplateDetail(_id: String!): PurchasePipelineTemplate
  pipelineTemplatesTotalCount: Int
`;

export const mutations = `
  pipelineTemplatesAdd(${commonParams}): PurchasePipelineTemplate
  pipelineTemplatesEdit(_id: String!, ${commonParams}): PurchasePipelineTemplate
  pipelineTemplatesRemove(_id: String!): JSON
  pipelineTemplatesDuplicate(_id: String!): PurchasePipelineTemplate
`;
