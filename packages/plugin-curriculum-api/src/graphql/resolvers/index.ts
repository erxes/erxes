import { Curriculum as CurriculumMutations } from "./mutations";
import { Curriculum as CurriculumQueries } from "./queries";

const resolvers: any = async () => ({
  Mutation: {
    ...CurriculumMutations,
  },
  Query: {
    ...CurriculumQueries,
  },
});

export default resolvers;
