import gql from "graphql-tag";
import {
  mutations as ProgramsMutations,
  queries as ProgramsQueries,
  types as ProgramsTypes,
} from "./schema/programs";
import {
  mutations as CommentsMutations,
  queries as CommentsQueries,
  types as CommentsTypes,
} from "./schema/comments";
import {
  mutations as AttendancesMutations,
  queries as AttendancesQueries,
  types as AttendancesTypes,
} from "./schema/attendances";
import {
  mutations as ClassesMutations,
  queries as ClassessQueries,
  types as ClassesTypes,
} from "./schema/classes";

const typeDefs = async () => {
  return gql`
    scalar JSON
    scalar Date

    ${ProgramsTypes()}
    ${CommentsTypes()}
    ${AttendancesTypes()}
    ${ClassesTypes()}
    
    extend type Query {
      ${ProgramsQueries}
      ${CommentsQueries}
      ${AttendancesQueries}
      ${ClassessQueries}
    }
    
    extend type Mutation {
      ${ProgramsMutations}
      ${CommentsMutations}
      ${AttendancesMutations}
      ${ClassesMutations}
    }
  `;
};

export default typeDefs;
