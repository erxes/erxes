import customScalars from '@erxes/api-utils/src/customScalars';

import mutations from './mutations';
import queries from './queries';
import CustomResolvers from '../customResolvers';

const resolvers: any = async () => ({
  ...customScalars,

  ...CustomResolvers,

  Mutation: {
    ...mutations,
  },
  Query: {
    ...queries,
  },
});

export default resolvers;
