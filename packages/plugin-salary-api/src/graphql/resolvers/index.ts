import customScalars from '@erxes/api-utils/src/customScalars';

import mutations from './mutations';
import queries from './queries';
import SalaryReport from './salaryReport';

const resolvers: any = async () => ({
  ...customScalars,
  SalaryReport,
  Mutation: {
    ...mutations,
  },
  Query: {
    ...queries,
  },
});

export default resolvers;
