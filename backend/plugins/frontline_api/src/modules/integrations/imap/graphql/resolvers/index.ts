import { imapMutations } from './mutations';
import { imapQueries } from './queries';

const resolvers: any = {
  Mutation: {
    ...imapMutations,
  },
  Query: {
    ...imapQueries,
  },
};

export default resolvers;
