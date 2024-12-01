import Active from './actives';

import { Actives as ADMutations } from './mutations';

import { Actives as ADQueries } from './queries';

const resolvers: any = async () => ({
  Active,
  Mutation: {
    ...ADMutations,
  },
  Query: {
    ...ADQueries,
  },
});

export default resolvers;
