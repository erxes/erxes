export const types = ({ tags }) => `
  extend type User @key(fields: "_id") {
    _id: String! @external
  }

  ${
    tags
      ? `extend type Tag @key(fields: "_id") {
          _id: String! @external
        }`
      : ''
  }

  type EmailTemplate @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String!
    name: String!
    content: String
    status: String
    createdBy: String
    createdAt: Date
    modifiedAt: Date
    createdUser: User
    tagIds: [String]
    ${tags ? 'tags: [Tag]' : ''}
  }
`;

export const queries = `
  emailTemplates(page: Int, perPage: Int, searchValue: String, tag: String, status: String): [EmailTemplate]
  emailTemplateCountsByTags(type: String): JSON
  emailTemplatesTotalCount(searchValue: String): Int
`;

export const mutations = `
  emailTemplatesAdd(name: String!, content: String): EmailTemplate
  emailTemplatesEdit(_id: String!, name: String!, content: String): EmailTemplate
  emailTemplatesRemove(_id: String!): JSON
  emailTemplatesChangeStatus(_id: String!, status: String): EmailTemplate
  emailTemplatesDuplicate(_id: String!): EmailTemplate
`;
