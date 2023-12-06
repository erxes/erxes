import customScalars from '@erxes/api-utils/src/customScalars';

import { Goals as GoalMutations } from './mutations';

import { Goals as GoalQueries } from './queries';

const resolvers: any = async serviceDiscovery => ({
  ...customScalars,
  Mutation: {
    ...GoalMutations
  },
  Query: {
    ...GoalQueries
  }
});

export default resolvers;
