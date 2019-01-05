export const types = `
  type Tag {
    _id: String!
    name: String
    type: String
    colorCode: String
    createdAt: Date
    objectCount: Int
  }
`;

export const queries = `
  tags(type: String): [Tag]
  tagDetail(_id: String!): Tag
`;

export const mutations = `
	tagsAdd(name: String!, type: String!, colorCode: String): Tag
	tagsEdit(_id: String!, name: String!, type: String!, colorCode: String): Tag
  tagsRemove(ids: [String!]!): JSON
	tagsTag(type: String!, targetIds: [String!]!, tagIds: [String!]!): String
`;
