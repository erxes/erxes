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

  type AdWislist {
    _id: String!
    cpUserId: String
    adIds: [String] 

    ads: [Ad]
  }
`;

const queries = `
  ads(perPage: Int, page: Int, priceRange: String, cpUserId: String, ${params}): [Ad]
  adDetail(_id: String): Ad
  adsTotalCount: Int
  adWishlist: AdWislist
`;

const mutations = `
  adsAdd(${params}): Ad
  adsRemove(_id: String!): JSON
  adsEdit(_id: String!, ${params}): Ad
  adWishlistAdd(_id: String!): AdWislist
  adWishlistRemove(_id: String!): AdWislist
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
