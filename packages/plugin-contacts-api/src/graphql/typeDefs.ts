import gql from "graphql-tag";

import {
  types as customerTypes,
  queries as CustomerQueries,
  mutations as CustomerMutations
} from "./customer";

import {
  types as companyTypes,
  queries as CompanyQueries,
  mutations as CompanyMutations
} from "./company";

import { types as contactsTypes, queries as contactQueries } from "./contacts";
import { isEnabled } from "@erxes/api-utils/src/serviceDiscovery";

const typeDefs = async () => {
  const inboxEnabled = isEnabled("inbox");

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
  

    extend type Tag @key(fields: "_id") {
      _id: String! @external
    }

    ${
      inboxEnabled
        ? `
        extend type Integration @key(fields: "_id") {
          _id: String! @external
        }
      `
        : ""
    }


    ${customerTypes(inboxEnabled)}
    ${companyTypes()}
    ${contactsTypes}
    
    extend type Query {
      ${CustomerQueries}
      ${CompanyQueries}
      ${contactQueries}
    }

    extend type Mutation {
      ${CustomerMutations}
      ${CompanyMutations}
    }
  `;
};

export default typeDefs;
