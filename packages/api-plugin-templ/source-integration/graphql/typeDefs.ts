import gql from 'graphql-tag';

const types = `
  type {Name} {
    _id: String!
    title: String
    mailData: JSON
  }
`;

const queries = `
  {name}ConversationDetail(conversationId: String!): [{Name}]
  {name}Accounts: JSON
`;

const mutations = `
  {name}AccountRemove(_id: String!): String
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
