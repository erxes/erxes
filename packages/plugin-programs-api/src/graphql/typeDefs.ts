import gql from "graphql-tag";
import {
  mutations as CommentsMutations,
  queries as CommentsQueries,
  types as CommentsTypes,
} from "./schema/comments";
import {
  mutations as ProgramsMutations,
  queries as ProgramsQueries,
  types as ProgramsTypes,
} from "./schema/programs";

const typeDefs = async () => {
  return gql`
    scalar JSON
    scalar Date

    ${ProgramsTypes()}
    ${CommentsTypes()}
    
    extend type Query {
      ${ProgramsQueries}
      ${CommentsQueries}
    }
    
    extend type Mutation {
      ${ProgramsMutations}
      ${CommentsMutations}
    }
  `;
};

export default typeDefs;
