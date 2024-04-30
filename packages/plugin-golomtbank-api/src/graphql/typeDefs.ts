import gql from 'graphql-tag';

const types = `
  type Golomtbank {
    _id: String!
    title: String
    mailData: JSON
  }
`;

const queries = `
  golomtbankConversationDetail(conversationId: String!): [Golomtbank]
  golomtbankAccounts: JSON
`;

const mutations = `
  golomtbankAccountRemove(_id: String!): String
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
