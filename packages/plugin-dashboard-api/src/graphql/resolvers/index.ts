import dashboardMutations from './dashboardMutaions';
import dashboardQueries from './dashboardQueries';
import customScalars from '@erxes/api-utils/src/customScalars';
import Dashboard from './dashboard';

const resolvers: any = {
  ...customScalars,
  Dashboard,

  Mutation: {
    ...dashboardMutations
  },
  Query: {
    ...dashboardQueries
  }
};

export default resolvers;
