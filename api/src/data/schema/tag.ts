export const types = `
  type Tag {
    _id: String!
    name: String
    type: String
    colorCode: String
    createdAt: Date
    objectCount: Int
    parentId: String
    order: String
  }
`;

export const queries = `
  tags(type: String): [Tag]
  tagDetail(_id: String!): Tag
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
  tagsRemove(ids: [String!]!): JSON
	tagsTag(type: String!, targetIds: [String!]!, tagIds: [String!]!): String
`;
