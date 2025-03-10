import Comment from "./comment";
import {
  Comments as CommentsMutations,
  Programs as ProgramsMutations,
} from "./mutations";
import Program from "./program";
import {
  Comments as CommentsQueries,
  Programs as ProgramsQueries,
} from "./queries";

const resolvers: any = async () => ({
  Mutation: {
    ...ProgramsMutations,
    ...CommentsMutations,
  },
  Query: {
    ...ProgramsQueries,
    ...CommentsQueries,
  },
  Comment,
  Program,
});

export default resolvers;
