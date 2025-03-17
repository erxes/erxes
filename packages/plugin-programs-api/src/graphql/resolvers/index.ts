import Comment from "./comment";
import Program from "./program";
import Classes from "./classes";
import {
  Comments as CommentsMutations,
  Programs as ProgramsMutations,
  Classes as ClassesMutations,
  Attendances as AttendancesMutations,
} from "./mutations";
import {
  Comments as CommentsQueries,
  Programs as ProgramsQueries,
  Classes as ClassesQueries,
  Attendances as AttendancesQueries,
} from "./queries";

const resolvers: any = async () => ({
  Mutation: {
    ...ProgramsMutations,
    ...CommentsMutations,
    ...ClassesMutations,
    ...AttendancesMutations,
  },
  Query: {
    ...ProgramsQueries,
    ...CommentsQueries,
    ...AttendancesQueries,
    ...ClassesQueries,
  },
  Comment,
  Program,
  Classes,
});

export default resolvers;
