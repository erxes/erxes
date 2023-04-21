import customScalars from '@erxes/api-utils/src/customScalars';

import mutations from './mutations';
import queries from './queries';
import BichilUserReport from './bichilreport';
import BichilSalaryReport from './bichilSalaryReport';

const resolvers: any = async _serviceDiscovery => ({
  ...customScalars,
  BichilUserReport,
  BichilSalaryReport,

  Mutation: {
    ...mutations
  },
  Query: {
    ...queries
  }
});

export default resolvers;
