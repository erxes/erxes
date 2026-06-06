import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type TemplateCategory {
    _id: String
    name: String
    parentId: String
    parent: TemplateCategory
    order: String
    code: String
    templateCount: Int
    isRoot: Boolean

    createdAt:Date
    createdBy: User

    updatedAt:Date
    updatedBy: User
  }

  type TemplateCategoryListResponse {
    list: [TemplateCategory]
    pageInfo: PageInfo
    totalCount: Int
  }
`;

const queryParams = `
  searchValue: String

  types: [String]
  parentIds: [String]

  createdBy: String
  updatedBy: String

  dateFilters: String

  ${GQL_CURSOR_PARAM_DEFS}
`;

export const queries = `
  templatesGetTypes: JSON
  templateCategories(${queryParams}): TemplateCategoryListResponse
  templateCategory(_id: String): TemplateCategory
`;

const mutationParams = `
  name: String,
  parentId: String,
  code: String,
`;

export const mutations = `
  templateCategoryAdd(${mutationParams}): TemplateCategory
  templateCategoryEdit(_id: String!, ${mutationParams}): TemplateCategory
  templateCategoryRemove(_ids: [String!]): JSON
`;
