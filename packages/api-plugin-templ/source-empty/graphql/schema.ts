/**
 * This is for defining GraphQL schema
 */

export const types = `
  type {Name} {
    _id: String!
    name: String
  }
`;
export const queries = `
  {name}s(typeId: String): [{Name}]
`;

const params = `
  name: String,
`;

export const mutations = `
  {name}sAdd(${params}): {Name}
`;
