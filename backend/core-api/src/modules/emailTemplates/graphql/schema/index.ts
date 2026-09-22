const templateFields = `
  name: String!
  description: String
  content: String
  contentJson: JSON
  contentFormat: String
`;

export const types = `
  type EmailTemplate {
    _id: String!
    name: String!
    description: String
    content: String
    contentJson: JSON
    contentFormat: String
    createdBy: String!
    createdAt: Date
    updatedAt: Date
    createdUser: User
  }

  type EmailTemplatesListResponse {
    list: [EmailTemplate]
    totalCount: Float
    pageInfo: PageInfo
  }
`;

export const queries = `
  emailTemplates(page: Int, perPage: Int, searchValue: String, sortField: String, sortDirection: Int): EmailTemplatesListResponse
  emailTemplateDetail(_id: String!): EmailTemplate
  emailContentPreview(content: String, contentJson: JSON, contentFormat: String, previewText: String, payloads: JSON): String
`;

export const mutations = `
  emailTemplateAdd(${templateFields}): EmailTemplate
  emailTemplateEdit(_id: String!, ${templateFields}): EmailTemplate
  emailTemplateRemove(_id: String!): JSON
`;
