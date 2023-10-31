export const types = `
  type Tag @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String!
    name: String
    type: String
    colorCode: String
    createdAt: Date
    objectCount: Int
    totalObjectCount: Int
    parentId: String
    order: String
    relatedIds: [String]
  }
`;

export const queries = `
  tagsGetTypes: [JSON]
  tags(type: String, searchValue: String, tagIds: [String], parentId: String, page: Int, perPage: Int): [Tag]
  tagDetail(_id: String!): Tag
  tagsQueryCount(type: String, searchValue: String): Int
`;

const params = `
  name: String!,
  type: String!,
  colorCode: String,
  parentId: String,
`;

export const mutations = `
  tagsAdd(${params}): Tag
  tagsEdit(_id: String!, ${params}): Tag
  tagsRemove(_id: String!): JSON
  tagsTag(type: String!, targetIds: [String!]!, tagIds: [String!]!): String
  tagsMerge(sourceId: String!, destId: String!): Tag
`;
