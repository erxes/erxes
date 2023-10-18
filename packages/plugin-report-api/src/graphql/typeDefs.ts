import gql from 'graphql-tag';

const types = `
  type Report {
    _id: String!
    name: String
  }
`;

const queries = `
  reports(typeId: String): [Report]
`;

const params = `
  name: String,
`;

const mutations = `
  reportsAdd(${params}): Report
`;

const typeDefs = async _serviceDiscovery => {
  return gql`
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
};

export default typeDefs;
