import customResolvers from './customResolvers';

import mutations from './mutations';
import queries from './queries';

const resolvers: any = async () => ({
  ...customResolvers,
  Mutation: {
    ...mutations,
  },
  Query: {
    ...queries,
  },
});

export default resolvers;
