export const types = `
  type TasksPipelineTemplateStage {
    _id: String!
    name: String!
    formId: String
    order: Int
  }

  input TasksPipelineTemplateStageInput {
    _id: String!
    name: String!
    formId: String
  }
  
  type TasksPipelineTemplate @key(fields: "_id") {
    _id: String!
    name: String!
    description: String
    type: String
    isDefinedByErxes: Boolean
    stages: [TasksPipelineTemplateStage]
    createdBy: String
    createdAt: Date
  }
`;

const commonParams = `
  name: String!
  description: String
  type: String!
  stages: [TasksPipelineTemplateStageInput]
`;

export const queries = `
  tasksPipelineTemplates(type: String!): [TasksPipelineTemplate]
  tasksPipelineTemplateDetail(_id: String!): TasksPipelineTemplate
  tasksPipelineTemplatesTotalCount: Int
`;

export const mutations = `
  tasksPipelineTemplatesAdd(${commonParams}): TasksPipelineTemplate
  tasksPipelineTemplatesEdit(_id: String!, ${commonParams}): TasksPipelineTemplate
  tasksPipelineTemplatesRemove(_id: String!): JSON
  tasksPipelineTemplatesDuplicate(_id: String!): TasksPipelineTemplate
`;
