import Comments from "./comments";
import Activities from "./activities";
import Classes from "./classes";
import {
  Comments as CommentsMutations,
  Activities as ActivitiesMutations,
  Classes as ClassesMutations,
  Attendances as AttendancesMutations,
} from "./mutations";
import {
  Comments as CommentsQueries,
  Activities as ActivitiesQueries,
  Classes as ClassesQueries,
  Attendances as AttendancesQueries,
} from "./queries";

const resolvers: any = async () => ({
  Mutation: {
    ...ActivitiesMutations,
    ...CommentsMutations,
    ...ClassesMutations,
    ...AttendancesMutations,
  },
  Query: {
    ...ActivitiesQueries,
    ...CommentsQueries,
    ...AttendancesQueries,
    ...ClassesQueries,
  },
  Comments,
  Activities,
  Classes,
});

export default resolvers;
