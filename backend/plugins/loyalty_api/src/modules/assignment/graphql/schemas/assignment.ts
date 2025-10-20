export const types = `
  type Assignment {
    _id: String
    name: String
    description: String
  }
`;

export const queries = `
  getAssignment(_id: String!): Assignment
  getAssignments: [Assignment]
`;

export const mutations = `
  createAssignment(name: String!): Assignment
  updateAssignment(_id: String!, name: String!): Assignment
  removeAssignment(_id: String!): Assignment
`;
