import customScalars from '@erxes/api-utils/src/customScalars';
import mutations from './mutations';
import queries from './queries';
import Schedule from './schedule';
import Absence from './absence';
import Timeclock from './timeclock';
import UserReport from './report';

const resolvers: any = async serviceDiscovery => ({
  ...customScalars,
  UserReport,
  Schedule,
  Absence,
  Timeclock,
  Mutation: {
    ...mutations
  },
  Query: {
    ...queries
  }
});

export default resolvers;
