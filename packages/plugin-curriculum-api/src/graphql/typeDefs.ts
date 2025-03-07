import gql from "graphql-tag";
import { mutations, queries, types } from "./schema/curriculum";

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
