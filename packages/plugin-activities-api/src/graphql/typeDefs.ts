import gql from "graphql-tag";
import {
  mutations as ActivitiesMutations,
  queries as ActivitiesQueries,
  types as ActivitiesTypes,
} from "./schema/activities";
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

    ${ActivitiesTypes()}
    ${CommentsTypes()}
    ${AttendancesTypes()}
    ${ClassesTypes()}
    
    extend type Query {
      ${ActivitiesQueries}
      ${CommentsQueries}
      ${AttendancesQueries}
      ${ClassessQueries}
    }
    
    extend type Mutation {
      ${ActivitiesMutations}
      ${CommentsMutations}
      ${AttendancesMutations}
      ${ClassesMutations}
    }
  `;
};

export default typeDefs;
