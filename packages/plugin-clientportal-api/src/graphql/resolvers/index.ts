import clientPortalMutations from './clientPortalMutations';
import clientPortalQueries from './clientPortalQueries';
import customScalars from '@erxes/api-utils/src/customScalars';

const resolvers: any = {
  ...customScalars,
  Mutation: {
    ...clientPortalMutations
  },
  Query: {
    ...clientPortalQueries
  }
};

export default resolvers;
