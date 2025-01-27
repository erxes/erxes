import customScalars from '@erxes/api-utils/src/customScalars';
import configMutations from './mutations/configs';
import configQueries from './queries/configs';

import cleaningMutations from './mutations/cleaning';
import cleaningQueries from './queries/cleaning';

import branchMutations from './mutations/branch';
import branchQueries from './queries/branch';

const resolvers: any = async () => ({
  ...customScalars,
  Query: {
    ...configQueries,
    ...cleaningQueries,
    ...branchQueries
  },

  Mutation: {
    ...configMutations,
    ...cleaningMutations,
    ...branchMutations
  }
});

export default resolvers;
