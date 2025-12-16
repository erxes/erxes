import { apolloCustomScalars }from 'erxes-api-shared/utils';

import { Goals as GoalMutations } from './mutations';

import { Goals as GoalQueries } from './queries';

const resolvers: any = async serviceDiscovery => ({
  ...apolloCustomScalars,
  Mutation: {
    ...GoalMutations
  },
  Query: {
    ...GoalQueries
  }
});

export default resolvers;
