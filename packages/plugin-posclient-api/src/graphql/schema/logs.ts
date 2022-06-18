export const types = `
  type Log {
    _id: String!
    text: String!
    description: String
  }
`;

export const queries = `
  logs(type: String!, typeId: String!): [Log]
`;
