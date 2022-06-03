export const types = `
  type {Name} {
    _id: String!
    name: String
  }
`;

export const queries = `
  {name}s: [{Name}]
  {name}sTotalCount: Int
`;

const params = `
  name: String!,
`;

export const mutations = `
  {name}sAdd(${params}): {Name}
`;
