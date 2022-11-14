import { gql } from 'apollo-server-express';

const types = `
  type {Name} {
    _id: String!
    title: String
    mailData: JSON
  }
`;

const queries = `
  {name}ConversationDetail(conversationId: String!): [{Name}]
`;

const mutations = `
  {name}Send: String
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
