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
`;
