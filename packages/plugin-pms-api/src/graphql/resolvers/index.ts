import customScalars from '@erxes/api-utils/src/customScalars';
import configMutations from './mutations/configs';
import configQueries from './queries/configs';

import cleaningMutations from './mutations/cleaning';
import cleaningQueries from './queries/cleaning';

const resolvers: any = async () => ({
  ...customScalars,
  Query: {
    ...configQueries,
    ...cleaningQueries,
  },

  Mutation: {
    ...configMutations,
    ...cleaningMutations,
  },
});

export default resolvers;
