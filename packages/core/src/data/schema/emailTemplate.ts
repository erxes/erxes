export const types = `
  type EmailTemplate @cacheControl(maxAge: 3) {
    _id: String!
    name: String!
    content: String
    status: String
    createdBy: String
    createdAt: Date
    modifiedAt: Date
    createdUser: User
  }
`;

export const queries = `
  emailTemplates(page: Int, perPage: Int, searchValue: String, status: String): [EmailTemplate]
  emailTemplatesTotalCount(searchValue: String): Int
  emailTemplate(_id:String): EmailTemplate
`;

export const mutations = `
  emailTemplatesAdd(name: String!, content: String): EmailTemplate
  emailTemplatesEdit(_id: String!, name: String!, content: String): EmailTemplate
  emailTemplatesRemove(_id: String!): JSON
  emailTemplatesChangeStatus(_id: String!, status: String): EmailTemplate
  emailTemplatesDuplicate(_id: String!): EmailTemplate
`;
