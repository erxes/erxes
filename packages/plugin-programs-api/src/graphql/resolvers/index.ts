import { Programs as ProgramsMutations } from "./mutations";
import { Programs as ProgramsQueries } from "./queries";

const resolvers: any = async () => ({
  Mutation: {
    ...ProgramsMutations,
  },
  Query: {
    ...ProgramsQueries,
  },
});

export default resolvers;
