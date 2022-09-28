/**
 * This is for defining GraphQL schema
 */

export const types = `
  type Plugin {
    _id: String!
    name: String
  }
`;
export const queries = `
  plugins(typeId: String): [Plugin]
`;

const params = `
  name: String,
`;

export const mutations = `
  pluginsAdd(${params}): Plugin
`;
