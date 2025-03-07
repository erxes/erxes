import { Program as ProgramMutations } from "./mutations";
import { Program as ProgramQueries } from "./queries";

const resolvers: any = async () => ({
  Mutation: {
    ...ProgramMutations,
  },
  Query: {
    ...ProgramQueries,
  },
});

export default resolvers;
