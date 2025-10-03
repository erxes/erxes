import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
 type Tag @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String
    name: String
    type: String
    colorCode: String
    createdAt: Date
    objectCount: Int
    totalObjectCount: Int
    parentId: String
    order: String
    relatedIds: [String]

    cursor: String
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
  tagIds: [String],
  parentId: String,
  ids: [String],
  excludeIds: Boolean,

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
  name: String!,
  type: String!,
  colorCode: String,
  parentId: String,
`;

export const mutations = `
  tagsAdd(${mutationParams}): Tag
  tagsEdit(_id: String!, ${mutationParams}): Tag
  tagsRemove(_id: String!): JSON
  tagsTag(type: String!, targetIds: [String!]!, tagIds: [String!]!): JSON
  tagsMerge(sourceId: String!, destId: String!): Tag
`;
