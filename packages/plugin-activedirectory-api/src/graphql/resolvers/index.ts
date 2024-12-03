import { Actives as ADMutations } from './mutations';

import { Actives as ADQueries } from './queries';

const resolvers: any = async () => ({
  Mutation: {
    ...ADMutations,
  },
  Query: {
    ...ADQueries,
  },
});

export default resolvers;
