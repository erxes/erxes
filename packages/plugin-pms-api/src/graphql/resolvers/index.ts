import customScalars from '@erxes/api-utils/src/customScalars';
import configMutations from './mutations/configs';
import configQueries from './queries/configs';

const resolvers: any = async () => ({
  ...customScalars,
  Query: {
    ...configQueries,
  },

  Mutation: {
    ...configMutations,
  },
});

export default resolvers;
