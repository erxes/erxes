import dashboardMutations from './dashboardMutaions';
import dashboardQueries from './dashboardQueries';
import customScalars from '@erxes/api-utils/src/customScalars';

const resolvers: any = {
  ...customScalars,

  Mutation: {
    ...dashboardMutations
  },
  Query: {
    ...dashboardQueries
  }
};

export default resolvers;
