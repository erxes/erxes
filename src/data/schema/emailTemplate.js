export const types = `
  type EmailTemplate {
    _id: String!
    name: String
    content: String
  }
`;

export const queries = `
  emailTemplates(limit: Int): [EmailTemplate]
  emailTemplatesTotalCount: Int
`;

export const mutations = `
  emailTemplateAdd(name: String, content: String): EmailTemplate
  emailTemplateEdit(_id: String!, name: String, content: String): EmailTemplate
  emailTemplateRemove(_id: String!): EmailTemplate
`;
