import gql from 'graphql-tag';

const types = `
  type PolarisData {
    _id: String!
    customerId: String!
    data: JSON
    createdAt: Date!
    updatedAt: Date!
  }
`;

const queries = `
  polarisGetConfigs: JSON
  polarisGetData(customerId: String!): PolarisData
`;

const params = `
  customerId: String!
`;

const mutations = `
polarisUpdateData(${params}): PolarisData
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
