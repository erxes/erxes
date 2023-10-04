import gql from 'graphql-tag';

const types = `

`;

const queries = `
`;

const mutations = `
  generateExpiredToken(apiKey: String, userName: String, password: String, tokenKey: String): JSON
  hookMessage(apiKey: String, apiToken: String, message: JSON): JSON
`;

const typeDefs = gql`
  scalar JSON
  scalar Date

  ${types}

  extend type Query {
    ${queries}
  }

  extend type Mutation {
    ${mutations}
  }
`;

export default typeDefs;
