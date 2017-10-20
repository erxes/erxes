export const types = `
  type EmailTemplate {
    _id: String!
    name: String!
    content: String
  }
`;

export const queries = `
  emailTemplates(limit: Int): [EmailTemplate]
  emailTemplatesTotalCount: Int
`;

export const mutations = `
  emailTemplatesAdd(name: String!, content: String): EmailTemplate
  emailTemplatesEdit(_id: String!, name: String!, content: String): EmailTemplate
  emailTemplatesRemove(_id: String!): String
`;
