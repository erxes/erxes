import customScalars from '@erxes/api-utils/src/customScalars';
import mutations from './mutations';
import queries from './queries';
import Schedule from './schedule';
import Absence from './absence';
import Timeclock from './timeclock';
import Report from './reports';

const resolvers: any = async serviceDiscovery => ({
  ...customScalars,
  Report,
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
