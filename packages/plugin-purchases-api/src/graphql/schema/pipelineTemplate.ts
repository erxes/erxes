export const types = `
  type PurchasesPipelineTemplateStage {
    _id: String!
    name: String!
    formId: String
    order: Int
  }

  input PurchasesPipelineTemplateStageInput {
    _id: String!
    name: String!
    formId: String
  }
  
  type PurchasesPipelineTemplate @key(fields: "_id") {
    _id: String!
    name: String!
    description: String
    type: String
    isDefinedByErxes: Boolean
    stages: [PurchasesPipelineTemplateStage]
    createdBy: String
    createdAt: Date
  }
`;

const commonParams = `
  name: String!
  description: String
  type: String!
  stages: [PurchasesPipelineTemplateStageInput]
`;

export const queries = `
  purchasesPipelineTemplates(type: String!): [PurchasesPipelineTemplate]
  purchasesPipelineTemplateDetail(_id: String!): PurchasesPipelineTemplate
  purchasesPipelineTemplatesTotalCount: Int
`;

export const mutations = `
  purchasesPipelineTemplatesAdd(${commonParams}): PurchasesPipelineTemplate
  purchasesPipelineTemplatesEdit(_id: String!, ${commonParams}): PurchasesPipelineTemplate
  purchasesPipelineTemplatesRemove(_id: String!): JSON
  purchasesPipelineTemplatesDuplicate(_id: String!): PurchasesPipelineTemplate
`;
