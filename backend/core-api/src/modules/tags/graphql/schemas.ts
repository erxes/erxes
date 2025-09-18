import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type Tag @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String
    name: String
    colorCode: String
    parentId: String
    relatedIds: [String]
    isGroup: Boolean
    description: String
    type: String
    
    order: String
    objectCount: Int
    totalObjectCount: Int
    
    createdAt: Date
  }

  type TagsListResponse {
    list: [Tag]
    pageInfo: PageInfo
    totalCount: Int
  }
`;

const queryParams = `
  type: String,
  searchValue: String,
  parentId: String,
  ids: [String],
  excludeIds: Boolean,
  isGroup: Boolean,
  instanceId: String,

  sortField: String,

  ${GQL_CURSOR_PARAM_DEFS}
`;

export const queries = `
  tagsGetTypes: [JSON]
  tags(${queryParams}): TagsListResponse
  tagDetail(_id: String!): Tag
  tagsQueryCount(type: String, searchValue: String): Int
`;

const mutationParams = `
  type: String,
  colorCode: String,
  parentId: String,
  isGroup: Boolean,
  description: String,
`;

export const mutations = `
  tagsAdd(name: String!, ${mutationParams}): Tag
  tagsEdit(_id: String!, name: String, ${mutationParams}): Tag
  tagsTag(type: String!, targetIds: [String!]!, tagIds: [String!]!): JSON
  tagsRemove(_id: String!): JSON
`;
