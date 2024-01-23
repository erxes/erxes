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
  bidGetConfigs: JSON
  bidGetPolarisData(customerId: String!): PolarisData
`;

const params = `
  customerId: String!
`;

const mutations = `
  bidUpdatePolarisData(${params}): PolarisData
`;

const typeDefs = async () => {
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
