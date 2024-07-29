import gql from "graphql-tag";
import { mutations, queries, types } from "./schema";
import { isEnabled } from "@erxes/api-utils/src/serviceDiscovery";

const typeDefs = async () => {
  return gql`
    scalar JSON
    scalar Date

    ${types()}
    
    extend type Query {
      ${queries}
    }
    
    extend type Mutation {
      ${mutations}
    }
  `;
};

export default typeDefs;
