import gql from 'graphql-tag';

const types = `
  type ZerocodeaiConfig {
    apiKey: String
    projectName: String
  }

  type ZerocodeaiTraining {
    date: Date
    file: String
  }
`;

const queries = `
  zerocodeaiGetConfig: ZerocodeaiConfig
  zerocodeaiTrainings: [ZerocodeaiTraining]
  zerocodeaiGetAnalysis(contentType: String, contentTypeId: String): String
`;

const mutations = `
  zerocodeaiSaveConfig(
    apiKey: String
    projectName: String
  ): JSON

  zerocodeaiTrain(
    file: String
  ): String
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
