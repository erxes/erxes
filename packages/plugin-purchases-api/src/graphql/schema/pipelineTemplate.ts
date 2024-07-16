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
  purchasesPipelineTemplates(type: String!): [PurchasePipelineTemplate]
  purchasesPipelineTemplateDetail(_id: String!): PurchasePipelineTemplate
  purchasesPipelineTemplatesTotalCount: Int
`;

export const mutations = `
  purchasesPipelineTemplatesAdd(${commonParams}): PurchasePipelineTemplate
  purchasesPipelineTemplatesEdit(_id: String!, ${commonParams}): PurchasePipelineTemplate
  purchasesPipelineTemplatesRemove(_id: String!): JSON
  purchasesPipelineTemplatesDuplicate(_id: String!): PurchasePipelineTemplate
`;
