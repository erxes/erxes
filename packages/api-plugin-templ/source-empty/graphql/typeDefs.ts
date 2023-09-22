import gql from 'graphql-tag';

const types = `
  type {Name} {
    _id: String!
    name: String
  }
`;

const queries = `
  {name}s(typeId: String): [{Name}]
`;

const params = `
  name: String,
`;

const mutations = `
  {name}sAdd(${params}): {Name}
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
