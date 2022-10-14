import { gql } from 'apollo-server-express';

const types = `
  type ZerocodeaiConfig {
    apiKey: String
    projectName: String
  }
`;

const queries = `
  zerocodeaiGetConfig: ZerocodeaiConfig
`;

const mutations = `
  zerocodeaiSaveConfig(
    apiKey: String
    projectName: String
  ): JSON
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
