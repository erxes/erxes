import gql from "graphql-tag";

import {
  types as carTypes,
  queries as carQueries,
  mutations as carMutations
} from "./schema/car";
import { isEnabled } from "@erxes/api-utils/src/serviceDiscovery";

const typeDefs = async () => {
  return gql`
    scalar JSON
    scalar Date
    
    ${carTypes()}
    
    extend type Query {

      ${carQueries}
    }
    
    extend type Mutation {
      ${carMutations}
    }
  `;
};

export default typeDefs;
