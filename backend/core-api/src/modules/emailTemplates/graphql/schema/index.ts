import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

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
  emailTemplates(searchValue: String, ${GQL_CURSOR_PARAM_DEFS}): EmailTemplatesListResponse
  emailTemplateDetail(_id: String!): EmailTemplate
  emailContentPreview(content: String, contentFormat: String, replacerId: String): String
`;

export const mutations = `
  emailTemplateAdd(${templateFields}): EmailTemplate
  emailTemplateEdit(_id: String!, ${templateFields}): EmailTemplate
  emailTemplateRemove(_id: String!): JSON
`;
