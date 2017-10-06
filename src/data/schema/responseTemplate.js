export const types = `
  type ResponseTemplate {
    _id: String!
    name: String
    content: String
    brandId: String
    brand: Brand,
    files: JSON
  }
`;

export const queries = `
  responseTemplates(limit: Int): [ResponseTemplate]
  responseTemplatesTotalCount: Int
`;

export const mutations = `
  responseTemplateAdd(name: String, content: String, brandId: String, files: JSON):
    ResponseTemplate
  responseTemplateEdit(_id: String!, name: String, content: String, brandId: String, files: JSON):
    ResponseTemplate
  responseTemplateRemove(_id: String!): ResponseTemplate
`;
