import gql from "graphql-tag";
import {
  mutations as configMutations,
  queries as configQueries,
  types as configTypes
} from "./schema/configs";

import {
  mutations as cleanMutations,
  queries as cleanQueries,
  types as cleanTypes
} from "./schema/cleaning";
import {
  types as branchTypes,
  queries as branchQueries,
  mutations as branchMutations
} from "./schema/pmsbranch";
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

    ${configTypes}
    ${cleanTypes}
    ${branchTypes()}

    extend type Mutation {
      ${configMutations}
      ${cleanMutations}
      ${branchMutations}
    }

    extend type Query {
      ${configQueries}
      ${cleanQueries}
      ${branchQueries}
    }
  `;
};

export default typeDefs;
