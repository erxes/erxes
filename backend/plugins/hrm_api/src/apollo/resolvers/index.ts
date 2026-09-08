import { apolloCustomScalars } from 'erxes-api-shared/utils';
import { mutations } from './mutations';
import { queries } from './queries';

const resolvers = {
  ...apolloCustomScalars,
  Mutation: {
    ...mutations,
  },
  Query: {
    ...queries,
  },
};

export default resolvers;
