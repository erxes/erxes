export const types = `
  enum TagType {
    all
    customer
    conversation
    engageMessage
  }
  
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
`;

export const mutations = `
	tagsAdd(name: String!, type: TagType!, colorCode: String): Tag
	tagsEdit(_id: String!, name: String!, type: TagType!, colorCode: String): Tag
  tagsRemove(ids: [String!]!): Tag
	tagsTag(type: TagType!, targetIds: [String!]!, tagIds: [String!]!): Tag
`;
