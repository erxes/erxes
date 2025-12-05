import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
type ResponseTemplate {
  _id: String!
  name: String
  content: String
  channelId: String
  createdAt: Date
  updatedAt: Date
  files: [String]
}

input ResponseTemplatesFilter {
  name: String
  content: String
  channelId: String
  files: [String]
  ${GQL_CURSOR_PARAM_DEFS}
  }
  type ResponseTemplateList {
    list:[ResponseTemplate]
    pageInfo: PageInfo
    totalCount:Int
  }
`;

export const queries = `
responseTemplates(
  filter: ResponseTemplatesFilter
): ResponseTemplateList
responseTemplate(
  _id: String
): ResponseTemplate
`;

export const mutations = `
  responseTemplatesAdd(
    name: String!,
    content: String,
    channelId: String!,
    files: [String]
  ): ResponseTemplate
  responseTemplatesEdit(
    _id: String,
    name: String!,
    content: String,
    channelId: String,
    files: [String]
  ): ResponseTemplate
  responseTemplatesRemove(_id: String!): ResponseTemplate
`;
