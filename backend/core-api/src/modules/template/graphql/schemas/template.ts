import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type Template {
    _id: String!
    name: String
    description: String
    contentType: String
    content: String

    categoryIds: [String]
    categories: [TemplateCategory]

    createdAt: Date
    createdBy: User

    updatedAt: Date
    updatedBy: User
  }

  type TemplateListResponse {
    list: [Template]
    pageInfo: PageInfo
    totalCount: Int
  }
`;

const queryParams = `
  searchValue: String
  contentType: [String]
  categoryIds: [String]

  createdBy: String
  updatedBy: String

  dateFilters: String

  ${GQL_CURSOR_PARAM_DEFS}
`;

export const queries = `
  templateList(${queryParams}): TemplateListResponse
  templateDetail(_id: String!): Template
`;

const mutationParams = `
  name: String,
  description: String,
  contentId: String,
  contentType: String,
  categoryIds: [String]
`;

export const mutations = `
  templateAdd(${mutationParams}): Template
  templateEdit(_id: String!, ${mutationParams}): Template
  templateRemove(_ids: [String!]): JSON

  templateUse(_id: String!): JSON
`;
