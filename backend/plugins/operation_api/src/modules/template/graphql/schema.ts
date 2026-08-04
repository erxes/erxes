
export const types = `
  type OperationTemplate {
    _id: String
    name: String
    defaults: JSON
    teamId: String
    createdBy: String
    createdAt: Date
    updatedAt: Date
  }
`;

export const queries = `
  operationTemplates(teamId: String): [OperationTemplate]
  operationTemplateDetail(_id: String): OperationTemplate
`;

export const mutations = `
  operationTemplateAdd(name: String!, defaults: JSON!, teamId: String!): OperationTemplate
  operationTemplateEdit(_id: String!, name: String, defaults: JSON): OperationTemplate
  operationTemplateRemove(_id: String!): JSON
`;
