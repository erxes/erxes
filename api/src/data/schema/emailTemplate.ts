export const types = `
  type EmailTemplate {
    _id: String!
    name: String!
    content: String
    status: String
  }
`;

export const queries = `
  emailTemplates(page: Int, perPage: Int, searchValue: String, status: String): [EmailTemplate]
  emailTemplatesTotalCount: Int
`;

export const mutations = `
  emailTemplatesAdd(name: String!, content: String): EmailTemplate
  emailTemplatesEdit(_id: String!, name: String!, content: String): EmailTemplate
  emailTemplatesRemove(_id: String!): JSON
  emailTemplatesChangeStatus(_id: String!, status: String): EmailTemplate

`;
