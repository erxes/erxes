import gql from 'graphql-tag';

import {
  mutations as configMutations,
  queries as configQueries,
  types as configTypes
} from './schema/configs';

import {
  queries as accountQueries,
  types as accountTypes
} from './schema/accounts';

import {
  mutations as transferMutations,
  types as transferTypes
} from './schema/transfer';

import {
  mutations as taxMutations,
  queries as taxQueries,
  types as taxTypes
} from './schema/taxes';

const typeDefs = async () => {
  return gql`
    scalar JSON
    scalar Date

    enum CacheControlScope {
      PUBLIC
      PRIVATE
    }
    
    directive @cacheControl(
      maxAge: Int
      scope: CacheControlScope
      inheritMaxAge: Boolean
    ) on FIELD_DEFINITION | OBJECT | INTERFACE | UNION

    extend type User @key(fields: "_id") {
      _id: String! @external
    }

    extend type Department @key(fields: "_id") {
      _id: String! @external
    }
    
    ${configTypes}
    ${accountTypes}
    ${transferTypes}
    ${taxTypes}

    type KhanbankRate {
      currency: String
      midRate: Float
      buyRate: Float
      sellRate: Float
      cashBuyRate: Float
      cashSellRate: Float
      name: String
      number: String
    }

    extend type Query {
      ${configQueries}
      ${accountQueries}
      ${taxQueries}

      khanbankRates: [KhanbankRate]
    }
    
    extend type Mutation {
      ${configMutations}
      ${transferMutations}
      ${taxMutations}
    }
  `;
};

export default typeDefs;
