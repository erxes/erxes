import gql from 'graphql-tag';

const mutations = `
  generateExpiredToken(apiKey: String, userName: String, password: String, tokenKey: String): JSON
  hookMessage(apiKey: String, apiToken: String, message: JSON): JSON
`;

const typeDefs = gql`
  scalar JSON
  scalar Date

  extend type Mutation {
    ${mutations}
  }
`;

export default typeDefs;
