import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type BroadcastEmailTemplate {
    _id: String!
    name: String!
    description: String
    contentJson: JSON
    createdBy: String
    createdAt: Date
    updatedAt: Date
  }

  type BroadcastEmailTemplateListResponse {
    list: [BroadcastEmailTemplate]
    pageInfo: PageInfo
    totalCount: Int
  }
`;

export const queries = `
  broadcastEmailTemplates(searchValue: String, ${GQL_CURSOR_PARAM_DEFS}): BroadcastEmailTemplateListResponse
  broadcastEmailTemplateDetail(_id: String!): BroadcastEmailTemplate
`;

export const mutations = `
  broadcastEmailTemplateAdd(name: String!, description: String, contentJson: JSON!): BroadcastEmailTemplate
  broadcastEmailTemplateEdit(_id: String!, name: String, description: String, contentJson: JSON): BroadcastEmailTemplate
  broadcastEmailTemplateRemove(_ids: [String!]!): JSON
`;
