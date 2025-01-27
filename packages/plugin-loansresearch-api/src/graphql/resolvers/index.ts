import { LoansResearch as LRMutations } from './mutations';

import { LoansResearch as LRQueries } from './queries';

const resolvers: any = async () => ({
  Mutation: {
    ...LRMutations,
  },
  Query: {
    ...LRQueries,
  },
});

export default resolvers;
