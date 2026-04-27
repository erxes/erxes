import { apolloCustomScalars } from 'erxes-api-shared/utils';
import { customResolvers } from './resolvers';
import { mutations } from './mutations';
import { queries } from './queries';
const resolvers: any = {
  Mutation: {
    ...mutations,
  },
  Query: {
    ...queries,
  },
  ...apolloCustomScalars,
  ...customResolvers,
};

export default resolvers;
