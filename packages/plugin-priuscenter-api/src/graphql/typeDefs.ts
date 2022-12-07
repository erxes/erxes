import { gql } from 'apollo-server-express';

const params = `
  type: String
  title: String
  description: String
  mark: String
  model: String
  color: String
  manufacturedYear: Int

  state: String
  price: Float

  attachments: [String]
  location: JSON

  authorName: String
  authorPhone: String
  authorEmail: String
`;

const types = `
  type Ad {
    _id: String!
    createdAt: Date
    cpUserId: String

    ${params}
  }
`;

const queries = `
  ads(limit: Int, skip: Int, priceRange: String, cpUserId: String, ${params}): [Ad]
  adsTotalCount: Int
`;

const mutations = `
  adsAdd(${params}): Ad
  adsRemove(_id: String!): JSON
  adsEdit(_id: String!, ${params}): Ad
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
